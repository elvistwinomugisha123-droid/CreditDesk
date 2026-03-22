"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DashboardHeader({ userName }: { userName: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 safe-top">
      <div className="flex items-center justify-between px-5 h-16">
        <div>
          <p className="text-xs text-gray-400 font-medium">{greeting}</p>
          <h2 className="text-lg font-semibold text-gray-900 -mt-0.5">{userName}</h2>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors rounded-xl px-3 py-2 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
