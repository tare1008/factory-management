import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface SupplierInput {
  name: string;
  contactInfo?: string;
  address?: string;
  materialNames?: string[];
}

async function getOrCreateItemsByName(names: string[]) {
  const items = [];
  for (const name of names) {
    const item = await prisma.item.upsert({
      where: { name },
      create: { name, unit: "unit", lowStockThreshold: 0 },
      update: {},
    });
    items.push(item);
  }
  return items;
}

export async function createSupplier(input: SupplierInput) {
  const { materialNames, ...fields } = input;
  const materials = materialNames ? await getOrCreateItemsByName(materialNames) : undefined;

  try {
    return await prisma.supplier.create({
      data: {
        ...fields,
        ...(materials && { materials: { connect: materials.map((m) => ({ id: m.id })) } }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A supplier with this name already exists");
    }
    throw error;
  }
}

export async function updateSupplier(id: string, input: SupplierInput) {
  const { materialNames, ...fields } = input;
  const materials = materialNames ? await getOrCreateItemsByName(materialNames) : undefined;

  try {
    return await prisma.supplier.update({
      where: { id },
      data: {
        ...fields,
        ...(materials && { materials: { set: materials.map((m) => ({ id: m.id })) } }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A supplier with this name already exists");
    }
    throw error;
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Cannot delete a supplier that has recorded entries");
    }
    throw error;
  }
}

export async function getSupplierBusinessVolumes(): Promise<Map<string, number>> {
  const entries = await prisma.inboundEntry.findMany({
    select: { supplierId: true, quantity: true, rate: true },
  });

  const volumes = new Map<string, number>();
  for (const entry of entries) {
    const value = Number(entry.quantity) * Number(entry.rate);
    volumes.set(entry.supplierId, (volumes.get(entry.supplierId) ?? 0) + value);
  }
  return volumes;
}
