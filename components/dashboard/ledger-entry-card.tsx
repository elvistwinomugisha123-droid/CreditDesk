import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, calculateOutstanding, calculatePaymentProgress } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Decimal } from "@prisma/client/runtime/library";

type EntryCardProps = {
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

const statusVariant = {
  ACTIVE: "active",
  SETTLED: "settled",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export function LedgerEntryCard({ entry }: { entry: EntryCardProps }) {
  const outstanding = calculateOutstanding(entry);
  const progress = calculatePaymentProgress(entry);
  const isReceivable = entry.type === "RECEIVABLE";

  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow animate-slide-up">
        <div className="flex items-start justify-between gap-3">
          {/* Left: avatar + info */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                isReceivable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {entry.contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{entry.contact.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {entry.description || (isReceivable ? "Owes you" : "You owe")}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                {format(entry.createdAt, "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Right: amount + status */}
          <div className="text-right shrink-0">
            <p
              className={cn(
                "font-semibold text-sm",
                isReceivable ? "text-green-600" : "text-red-600"
              )}
            >
              {isReceivable ? "+" : "-"}{formatCurrency(outstanding)}
            </p>
            <Badge variant={statusVariant[entry.status]} className="mt-1">
              {entry.status}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        {entry.status === "ACTIVE" && entry.payments.length > 0 && (
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {Math.round(progress)}% paid
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
