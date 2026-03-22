import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { calculateOutstanding, formatCurrency } from "@/lib/calculations";
import { LedgerEntryCard } from "@/components/dashboard/ledger-entry-card";

export default async function PayablesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: user.id, type: "PAYABLE" },
    include: {
      contact: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOutstanding = entries
    .filter((e) => e.status === "ACTIVE")
    .reduce((sum, e) => sum + calculateOutstanding(e), 0);

  const activeCount = entries.filter((e) => e.status === "ACTIVE").length;

  return (
    <div className="px-5 py-5 space-y-5">
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpRight className="h-5 w-5" />
          <p className="text-sm font-medium text-white/80">Money You Owe</p>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
        <p className="text-xs text-white/60 mt-1">{activeCount} active records</p>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No payables yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Add an entry when you owe someone money
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <LedgerEntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
