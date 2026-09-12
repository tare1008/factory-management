"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { createSupplier, deleteSupplier, updateSupplier } from "@/lib/suppliers";

const supplierSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  contactInfo: z.string().trim().optional(),
  address: z.string().trim().optional(),
  materialNames: z.array(z.string().trim().min(1)).optional(),
});

export interface SupplierFormState {
  error?: string;
}

function parseSupplierForm(formData: FormData) {
  return supplierSchema.safeParse({
    name: formData.get("name"),
    contactInfo: formData.get("contactInfo") || undefined,
    address: formData.get("address") || undefined,
    materialNames: formData.getAll("materials").map(String),
  });
}

export async function createSupplierAction(
  _prevState: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> {
  requireRole(await auth(), ["OWNER", "ADMIN"]);

  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createSupplier(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  revalidatePath("/suppliers");
  return {};
}

export async function updateSupplierAction(
  supplierId: string,
  _prevState: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> {
  requireRole(await auth(), ["OWNER", "ADMIN"]);

  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateSupplier(supplierId, parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  redirect("/suppliers");
}

export async function deleteSupplierAction(formData: FormData) {
  requireRole(await auth(), ["OWNER", "ADMIN"]);
  const supplierId = formData.get("supplierId") as string;

  try {
    await deleteSupplier(supplierId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete supplier";
    revalidatePath("/suppliers");
    redirect(`/suppliers?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/suppliers");
}
