"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { paymentSchema } from "@/lib/validations";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function addPayment(ledgerEntryId: string, formData: FormData) {
  const userId = await getUserId();

  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    notes: formData.get("notes") || null,
    paidAt: formData.get("paidAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify entry belongs to user
  const entry = await prisma.ledgerEntry.findFirst({
    where: { id: ledgerEntryId, userId },
  });
  if (!entry) {
    return { error: "Entry not found" };
  }

  try {
    await prisma.payment.create({
      data: {
        ledgerEntryId,
        amount: parsed.data.amount,
        notes: parsed.data.notes,
        paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date(),
      },
    });
    revalidatePath(`/entry/${ledgerEntryId}`);
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    return { success: true };
  } catch {
    return { error: "Failed to add payment" };
  }
}

export async function deletePayment(paymentId: string, ledgerEntryId: string) {
  const userId = await getUserId();

  // Verify entry belongs to user
  const entry = await prisma.ledgerEntry.findFirst({
    where: { id: ledgerEntryId, userId },
  });
  if (!entry) {
    return { error: "Entry not found" };
  }

  try {
    await prisma.payment.delete({
      where: { id: paymentId },
    });
    revalidatePath(`/entry/${ledgerEntryId}`);
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    return { success: true };
  } catch {
    return { error: "Failed to delete payment" };
  }
}
