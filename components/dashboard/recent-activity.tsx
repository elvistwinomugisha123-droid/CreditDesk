import { LedgerEntryCard } from "./ledger-entry-card";
import type { Decimal } from "@prisma/client/runtime/library";

type RecentEntry = {
  id: string;
  contact: { name: string };
  type: "RECEIVABLE" | "PAYABLE";
  description: string | null;
  principalAmount: Decimal;
  interestRate: Decimal | null;
  interestType: "FLAT" | "MONTHLY" | null;
  status: "ACTIVE" | "SETTLED" | "OVERDUE" | "CANCELLED";
  createdAt: Date;
  dueDate: Date | null;
  payments: { amount: Decimal }[];
};

export function RecentActivity({ entries }: { entries: RecentEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-400 text-sm">No entries yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Tap the + button to add your first debt or credit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <LedgerEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
