import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create user record
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={dbUser.fullName} />
      <main className="pb-20 animate-fade-in">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
