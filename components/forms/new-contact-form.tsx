"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContact } from "@/lib/actions/contacts";
import { Loader2 } from "lucide-react";

export function NewContactForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createContact(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Contact added!");
    setLoading(false);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" name="name" placeholder="Contact name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input id="contact-phone" name="phone" type="tel" placeholder="+256..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email (optional)</Label>
        <Input id="contact-email" name="email" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-notes">Notes (optional)</Label>
        <Textarea id="contact-notes" name="notes" placeholder="Any notes..." rows={2} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Contact
      </Button>
    </form>
  );
}
