"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { createInboundEntry } from "@/lib/entries";

const schema = z.object({
  itemId: z.string().min(1, "Select an item"),
  supplierId: z.string().min(1, "Select a supplier"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  rate: z.coerce.number().positive("Rate must be greater than zero"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export interface InboundEntryFormState {
  error?: string;
}

export async function submitInboundEntry(
  _prevState: InboundEntryFormState,
  formData: FormData
): Promise<InboundEntryFormState> {
  const session = requireRole(await auth(), ["OWNER", "ADMIN", "STOREKEEPER"]);

  const parsed = schema.safeParse({
    itemId: formData.get("itemId"),
    supplierId: formData.get("supplierId"),
    quantity: formData.get("quantity"),
    rate: formData.get("rate"),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createInboundEntry({
      ...parsed.data,
      recordedByUserId: session.user.id,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  redirect("/");
}
