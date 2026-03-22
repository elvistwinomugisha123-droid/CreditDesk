import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  notes: z.string().max(500).optional().nullable(),
});

export const ledgerEntrySchema = z.object({
  contactId: z.string().uuid("Please select a contact"),
  type: z.enum(["RECEIVABLE", "PAYABLE"]),
  description: z.string().max(300).optional().nullable(),
  principalAmount: z.coerce.number().positive("Amount must be greater than 0"),
  interestRate: z.coerce.number().min(0).max(100).optional().nullable(),
  interestType: z.enum(["FLAT", "MONTHLY"]).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  notes: z.string().max(300).optional().nullable(),
  paidAt: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type LedgerEntryInput = z.infer<typeof ledgerEntrySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
