"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function createContact(formData: FormData) {
  const userId = await getUserId();

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        userId,
        ...parsed.data,
      },
    });
    revalidatePath("/contacts");
    return { success: true, contact };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { error: "A contact with this phone number already exists" };
    }
    return { error: "Failed to create contact" };
  }
}

export async function updateContact(id: string, formData: FormData) {
  const userId = await getUserId();

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.contact.update({
      where: { id, userId },
      data: parsed.data,
    });
    revalidatePath("/contacts");
    return { success: true };
  } catch {
    return { error: "Failed to update contact" };
  }
}

export async function deleteContact(id: string) {
  const userId = await getUserId();

  try {
    await prisma.contact.delete({
      where: { id, userId },
    });
    revalidatePath("/contacts");
    return { success: true };
  } catch {
    return { error: "Failed to delete contact" };
  }
}
