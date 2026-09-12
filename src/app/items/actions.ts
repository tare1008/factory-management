"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { createItem, deleteItem, updateItem } from "@/lib/items";

const itemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number().min(0, "Low-stock threshold cannot be negative"),
});

export interface ItemFormState {
  error?: string;
}

export async function createItemAction(
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  requireRole(await auth(), ["OWNER", "ADMIN"]);

  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    lowStockThreshold: formData.get("lowStockThreshold"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createItem(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  revalidatePath("/items");
  return {};
}

export async function updateItemAction(
  itemId: string,
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  requireRole(await auth(), ["OWNER", "ADMIN"]);

  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    lowStockThreshold: formData.get("lowStockThreshold"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateItem(itemId, parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  redirect(`/items/${itemId}`);
}

export async function deleteItemAction(formData: FormData) {
  requireRole(await auth(), ["OWNER", "ADMIN"]);
  const itemId = formData.get("itemId") as string;

  try {
    await deleteItem(itemId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete item";
    revalidatePath("/items");
    redirect(`/items?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/items");
}
