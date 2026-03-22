import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  calculateOutstanding,
  calculateInterest,
  calculateTotalPaid,
  calculatePaymentProgress,
  formatCurrency,
} from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaymentForm } from "@/components/forms/add-payment-form";
import { EntryActions } from "./entry-actions";
import { cn } from "@/lib/utils";

const statusVariant = {
  ACTIVE: "active",
  SETTLED: "settled",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entry = await prisma.ledgerEntry.findFirst({
    where: { id, userId: user.id },
    include: {
      contact: true,
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!entry) notFound();

  const outstanding = calculateOutstanding(entry);
  const interest = calculateInterest(entry);
  const totalPaid = calculateTotalPaid(entry);
  const progress = calculatePaymentProgress(entry);
  const isReceivable = entry.type === "RECEIVABLE";

  return (
    <div className="px-5 py-5 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold",
              isReceivable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {entry.contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">{entry.contact.name}</h2>
            <p className="text-sm text-gray-400">
              {isReceivable ? "Owes you" : "You owe"} &middot;{" "}
              {format(entry.createdAt, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
      </div>

      {/* Description */}
      {entry.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
          {entry.description}
        </p>
      )}

      {/* Financial Summary */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Principal</span>
            <span className="font-medium">{formatCurrency(Number(entry.principalAmount))}</span>
          </div>
          {interest > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Interest ({entry.interestType === "FLAT" ? "Flat" : "Monthly"} @{" "}
                {Number(entry.interestRate)}%)
              </span>
              <span className="font-medium">{formatCurrency(interest)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-medium text-green-600">-{formatCurrency(totalPaid)}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Outstanding</span>
            <span
              className={cn(
                "font-bold text-lg",
                isReceivable ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(outstanding)}
            </span>
          </div>
          {entry.status === "ACTIVE" && (
            <div>
              <Progress value={progress} />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {Math.round(progress)}% paid
              </p>
            </div>
          )}
          {entry.dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due Date</span>
              <span className={cn(
                "font-medium",
                entry.dueDate < new Date() && entry.status === "ACTIVE" ? "text-red-600" : "text-gray-900"
              )}>
                {format(entry.dueDate, "MMM d, yyyy")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {entry.status === "ACTIVE" && (
        <EntryActions entryId={entry.id} />
      )}

      {/* Add Payment */}
      {entry.status === "ACTIVE" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <AddPaymentForm
              ledgerEntryId={entry.id}
              outstanding={outstanding}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Payment History ({entry.payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entry.payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No payments recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {entry.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-400">{payment.notes}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {format(payment.paidAt, "MMM d, yyyy")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
