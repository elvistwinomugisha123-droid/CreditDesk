"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addPayment } from "@/lib/actions/payments";
import { Loader2 } from "lucide-react";

export function AddPaymentForm({
  ledgerEntryId,
  outstanding,
}: {
  ledgerEntryId: string;
  outstanding: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await addPayment(ledgerEntryId, formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Payment logged!");
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();

    // Check if the outstanding will reach 0
    const amount = Number(formData.get("amount"));
    if (amount >= outstanding) {
      toast("Outstanding balance is now zero. Mark as settled?", {
        action: {
          label: "Settle",
          onClick: () => {
            window.location.href = `/entry/${ledgerEntryId}?settle=true`;
          },
        },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payment-amount">Amount (UGX)</Label>
        <Input
          id="payment-amount"
          name="amount"
          type="number"
          placeholder="0"
          min="1"
          required
          inputMode="numeric"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment-notes">Note (optional)</Label>
        <Textarea
          id="payment-notes"
          name="notes"
          placeholder="Payment note..."
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment-date">Date</Label>
        <Input
          id="payment-date"
          name="paidAt"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log Payment
      </Button>
    </form>
  );
}
