"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createEntry } from "@/lib/actions/entries";
import { Loader2 } from "lucide-react";

type Contact = {
  id: string;
  name: string;
};

export function NewEntryForm({
  contacts,
  onSuccess,
}: {
  contacts: Contact[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showInterest, setShowInterest] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createEntry(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Entry created!");
    setLoading(false);
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entry-contact">Contact</Label>
        <Select id="entry-contact" name="contactId" required>
          <option value="">Select a contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-type">Type</Label>
        <Select id="entry-type" name="type" required>
          <option value="RECEIVABLE">They owe me</option>
          <option value="PAYABLE">I owe them</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-amount">Amount (UGX)</Label>
        <Input
          id="entry-amount"
          name="principalAmount"
          type="number"
          placeholder="0"
          min="1"
          required
          inputMode="numeric"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-description">Description (optional)</Label>
        <Textarea
          id="entry-description"
          name="description"
          placeholder="What is this for?"
          rows={2}
          maxLength={300}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-dueDate">Due Date (optional)</Label>
        <Input id="entry-dueDate" name="dueDate" type="date" />
      </div>

      <button
        type="button"
        onClick={() => setShowInterest(!showInterest)}
        className="text-sm text-brand-green font-medium hover:underline"
      >
        {showInterest ? "Hide interest options" : "Add interest?"}
      </button>

      {showInterest && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-2">
            <Label htmlFor="entry-interestRate">Interest Rate (%)</Label>
            <Input
              id="entry-interestRate"
              name="interestRate"
              type="number"
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry-interestType">Interest Type</Label>
            <Select id="entry-interestType" name="interestType">
              <option value="">None</option>
              <option value="FLAT">Flat (one-time)</option>
              <option value="MONTHLY">Monthly (simple interest)</option>
            </Select>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Entry
      </Button>
    </form>
  );
}
