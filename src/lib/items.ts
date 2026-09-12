import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface ItemInput {
  name: string;
  unit: string;
  lowStockThreshold: number;
}

function assertValid(input: ItemInput) {
  if (input.lowStockThreshold < 0) {
    throw new Error("Low-stock threshold cannot be negative");
  }
}

export async function createItem(input: ItemInput) {
  assertValid(input);
  try {
    return await prisma.item.create({ data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("An item with this name already exists");
    }
    throw error;
  }
}

export async function updateItem(id: string, input: ItemInput) {
  assertValid(input);
  try {
    return await prisma.item.update({ where: { id }, data: input });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("An item with this name already exists");
    }
    throw error;
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Cannot delete an item that has recorded entries");
    }
    throw error;
  }
}
