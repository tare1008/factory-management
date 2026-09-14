"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-guard";
import { createUser, resetUserPassword, updateUserRole } from "@/lib/users";

const createUserSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required"),
  role: z.enum(["ADMIN", "STOREKEEPER"]),
});

export interface UserFormState {
  error?: string;
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  requireRole(await auth(), ["OWNER"]);

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createUser(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong" };
  }

  revalidatePath("/users");
  return {};
}

export async function updateUserRoleAction(formData: FormData) {
  requireRole(await auth(), ["OWNER"]);
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (role === "ADMIN" || role === "STOREKEEPER") {
    await updateUserRole(userId, role);
  }

  revalidatePath("/users");
}

export async function resetPasswordAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  requireRole(await auth(), ["OWNER"]);
  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  const parsed = z.string().min(6, "Password must be at least 6 characters").safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  await resetUserPassword(userId, parsed.data);
  revalidatePath("/users");
  return {};
}
