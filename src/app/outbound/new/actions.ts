"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { createOutboundEntry } from "@/lib/entries";

const schema = z.object({
  itemId: z.string().min(1, "Select an item"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  purpose: z.string().trim().min(1, "Purpose is required"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export interface OutboundEntryFormState {
  error?: string;
}

export async function submitOutboundEntry(
  _prevState: OutboundEntryFormState,
  formData: FormData
): Promise<OutboundEntryFormState> {
  const session = requireRole(await auth(), ["OWNER", "ADMIN", "STOREKEEPER"]);

  const parsed = schema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    purpose: formData.get("purpose"),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createOutboundEntry({
      ...parsed.data,
      recordedByUserId: session.user.id,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  redirect("/");
}
