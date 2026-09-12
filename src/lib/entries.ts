import { prisma } from "@/lib/prisma";
import { getCurrentStock } from "@/lib/inventory";

export interface CreateInboundEntryInput {
  itemId: string;
  supplierId: string;
  quantity: number;
  rate: number;
  date: Date;
  recordedByUserId: string;
  notes?: string;
}

export async function createInboundEntry(input: CreateInboundEntryInput) {
  if (input.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (input.rate <= 0) {
    throw new Error("Rate must be greater than zero");
  }

  return prisma.inboundEntry.create({ data: input });
}

export interface CreateOutboundEntryInput {
  itemId: string;
  quantity: number;
  purpose: string;
  date: Date;
  recordedByUserId: string;
  notes?: string;
}

export async function createOutboundEntry(input: CreateOutboundEntryInput) {
  if (input.quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }
  if (!input.purpose.trim()) {
    throw new Error("Purpose is required");
  }

  const currentStock = await getCurrentStock(input.itemId);
  if (input.quantity > currentStock) {
    throw new Error("Cannot issue more than current stock");
  }

  return prisma.outboundEntry.create({ data: input });
}
