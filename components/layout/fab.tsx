"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewEntryForm } from "@/components/forms/new-entry-form";

type Contact = {
  id: string;
  name: string;
};

export function FAB({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 bg-brand-green text-white rounded-2xl shadow-lg hover:bg-brand-green-dark transition-all hover:shadow-xl flex items-center justify-center active:scale-95"
        aria-label="Add new entry"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
          </DialogHeader>
          <NewEntryForm
            contacts={contacts}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
