"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ledgerEntrySchema } from "@/lib/validations";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function createEntry(formData: FormData) {
  const userId = await getUserId();

  const parsed = ledgerEntrySchema.safeParse({
    contactId: formData.get("contactId"),
    type: formData.get("type"),
    description: formData.get("description") || null,
    principalAmount: formData.get("principalAmount"),
    interestRate: formData.get("interestRate") || null,
    interestType: formData.get("interestType") || null,
    dueDate: formData.get("dueDate") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify contact belongs to user
  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, userId },
  });
  if (!contact) {
    return { error: "Contact not found" };
  }

  try {
    const entry = await prisma.ledgerEntry.create({
      data: {
        userId,
        contactId: parsed.data.contactId,
        type: parsed.data.type,
        description: parsed.data.description,
        principalAmount: parsed.data.principalAmount,
        interestRate: parsed.data.interestRate,
        interestType: parsed.data.interestType,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    return { success: true, entry };
  } catch {
    return { error: "Failed to create entry" };
  }
}

export async function updateEntry(id: string, formData: FormData) {
  const userId = await getUserId();

  const parsed = ledgerEntrySchema.safeParse({
    contactId: formData.get("contactId"),
    type: formData.get("type"),
    description: formData.get("description") || null,
    principalAmount: formData.get("principalAmount"),
    interestRate: formData.get("interestRate") || null,
    interestType: formData.get("interestType") || null,
    dueDate: formData.get("dueDate") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.ledgerEntry.update({
      where: { id, userId },
      data: {
        contactId: parsed.data.contactId,
        type: parsed.data.type,
        description: parsed.data.description,
        principalAmount: parsed.data.principalAmount,
        interestRate: parsed.data.interestRate,
        interestType: parsed.data.interestType,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    revalidatePath(`/entry/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update entry" };
  }
}

export async function settleEntry(id: string) {
  const userId = await getUserId();

  try {
    await prisma.ledgerEntry.update({
      where: { id, userId },
      data: { status: "SETTLED" },
    });
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    revalidatePath(`/entry/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to settle entry" };
  }
}

export async function cancelEntry(id: string) {
  const userId = await getUserId();

  try {
    await prisma.ledgerEntry.update({
      where: { id, userId },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/dashboard");
    revalidatePath("/receivables");
    revalidatePath("/payables");
    revalidatePath(`/entry/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to cancel entry" };
  }
}
