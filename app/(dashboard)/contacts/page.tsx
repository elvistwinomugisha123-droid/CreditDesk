"use client";

import { useState, useEffect } from "react";
import { Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewContactForm } from "@/components/forms/new-contact-form";
import { cn } from "@/lib/utils";

type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  _count: { ledgerEntries: number };
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchContacts() {
    const res = await fetch("/api/contacts");
    if (res.ok) {
      const data = await res.json();
      setContacts(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="px-5 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Contacts</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No contacts yet</p>
          <p className="text-gray-300 text-xs mt-1">
            Add your first contact to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center">
                <span className="text-brand-green font-semibold text-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                {contact.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </p>
                )}
              </div>
              <div className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                contact._count.ledgerEntries > 0
                  ? "bg-brand-green-light text-brand-green"
                  : "bg-gray-100 text-gray-400"
              )}>
                {contact._count.ledgerEntries} entries
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent onClose={() => setShowForm(false)}>
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
          </DialogHeader>
          <NewContactForm onSuccess={() => { setShowForm(false); fetchContacts(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
