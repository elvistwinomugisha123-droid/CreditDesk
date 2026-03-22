import { differenceInMonths } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

type LedgerEntryForCalc = {
  principalAmount: Decimal | number;
  interestRate: Decimal | number | null;
  interestType: "FLAT" | "MONTHLY" | null;
  createdAt: Date;
  payments: { amount: Decimal | number }[];
};

function toNumber(val: Decimal | number): number {
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

export function calculateInterest(entry: LedgerEntryForCalc): number {
  const principal = toNumber(entry.principalAmount);
  const rate = entry.interestRate ? toNumber(entry.interestRate) : 0;

  if (!rate || !entry.interestType) return 0;

  if (entry.interestType === "FLAT") {
    return principal * rate / 100;
  }

  if (entry.interestType === "MONTHLY") {
    const monthsElapsed = Math.max(0, differenceInMonths(new Date(), entry.createdAt));
    return principal * rate * monthsElapsed / 100;
  }

  return 0;
}

export function calculateTotalPaid(entry: LedgerEntryForCalc): number {
  return entry.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
}

export function calculateOutstanding(entry: LedgerEntryForCalc): number {
  const principal = toNumber(entry.principalAmount);
  const interest = calculateInterest(entry);
  const totalPaid = calculateTotalPaid(entry);
  return Math.max(0, principal + interest - totalPaid);
}

export function calculatePaymentProgress(entry: LedgerEntryForCalc): number {
  const principal = toNumber(entry.principalAmount);
  const interest = calculateInterest(entry);
  const totalOwed = principal + interest;
  if (totalOwed === 0) return 100;
  const totalPaid = calculateTotalPaid(entry);
  return Math.min(100, (totalPaid / totalOwed) * 100);
}

type DashboardEntry = LedgerEntryForCalc & {
  type: "RECEIVABLE" | "PAYABLE";
  status: "ACTIVE" | "SETTLED" | "OVERDUE" | "CANCELLED";
  dueDate: Date | null;
};

export type DashboardSummary = {
  totalReceivable: number;
  totalPayable: number;
  netPosition: number;
  overdueCount: number;
  activeCount: number;
  settledCount: number;
};

export function calculateDashboardSummary(entries: DashboardEntry[]): DashboardSummary {
  let totalReceivable = 0;
  let totalPayable = 0;
  let overdueCount = 0;
  let activeCount = 0;
  let settledCount = 0;

  const now = new Date();

  for (const entry of entries) {
    const outstanding = calculateOutstanding(entry);

    if (entry.type === "RECEIVABLE") {
      totalReceivable += outstanding;
    } else {
      totalPayable += outstanding;
    }

    if (entry.status === "ACTIVE") {
      activeCount++;
      if (entry.dueDate && entry.dueDate < now && outstanding > 0) {
        overdueCount++;
      }
    } else if (entry.status === "SETTLED") {
      settledCount++;
    }
  }

  return {
    totalReceivable,
    totalPayable,
    netPosition: totalReceivable - totalPayable,
    overdueCount,
    activeCount,
    settledCount,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
