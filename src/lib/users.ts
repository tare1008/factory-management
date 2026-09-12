import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ManagedRole = "ADMIN" | "STOREKEEPER";

export interface CreateUserInput {
  username: string;
  password: string;
  name: string;
  role: ManagedRole;
}

export async function createUser(input: CreateUserInput) {
  if (input.role !== "ADMIN" && input.role !== "STOREKEEPER") {
    throw new Error("Can only create ADMIN or STOREKEEPER accounts");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    return await prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        name: input.name,
        role: input.role,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A user with this username already exists");
    }
    throw error;
  }
}

export async function updateUserRole(userId: string, role: ManagedRole) {
  if (role !== "ADMIN" && role !== "STOREKEEPER") {
    throw new Error("Can only assign ADMIN or STOREKEEPER");
  }

  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
