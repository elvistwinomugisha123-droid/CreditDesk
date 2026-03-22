"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { settleEntry, cancelEntry } from "@/lib/actions/entries";
import { CheckCircle, XCircle } from "lucide-react";

export function EntryActions({ entryId }: { entryId: string }) {
  const router = useRouter();

  async function handleSettle() {
    const result = await settleEntry(entryId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Entry marked as settled");
    router.refresh();
  }

  async function handleCancel() {
    const result = await cancelEntry(entryId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Entry cancelled");
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
        onClick={handleSettle}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Mark Settled
      </Button>
      <Button
        variant="outline"
        className="flex-1 text-gray-500 border-gray-200 hover:bg-gray-50"
        onClick={handleCancel}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
