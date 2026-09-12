import { prisma } from "@/lib/prisma";

export interface EntryFilter {
  itemId?: string;
  supplierId?: string;
  recordedByUserId?: string;
  type?: "INBOUND" | "OUTBOUND";
  dateFrom?: Date;
  dateTo?: Date;
}

export interface EntryRow {
  id: string;
  type: "INBOUND" | "OUTBOUND";
  date: Date;
  itemName: string;
  unit: string;
  supplierName: string | null;
  quantity: number;
  rate: number | null;
  purpose: string | null;
  recordedByUsername: string;
}

function dateWhere(filter: EntryFilter) {
  if (!filter.dateFrom && !filter.dateTo) return undefined;
  return {
    ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
    ...(filter.dateTo ? { lte: filter.dateTo } : {}),
  };
}

export async function getEntries(filter: EntryFilter): Promise<EntryRow[]> {
  const includeInbound = filter.type !== "OUTBOUND";
  const includeOutbound = filter.type !== "INBOUND" && !filter.supplierId;

  const [inbound, outbound] = await Promise.all([
    includeInbound
      ? prisma.inboundEntry.findMany({
          where: {
            itemId: filter.itemId,
            supplierId: filter.supplierId,
            recordedByUserId: filter.recordedByUserId,
            date: dateWhere(filter),
          },
          include: { item: true, supplier: true, recordedBy: true },
        })
      : Promise.resolve([]),
    includeOutbound
      ? prisma.outboundEntry.findMany({
          where: {
            itemId: filter.itemId,
            recordedByUserId: filter.recordedByUserId,
            date: dateWhere(filter),
          },
          include: { item: true, recordedBy: true },
        })
      : Promise.resolve([]),
  ]);

  const rows: EntryRow[] = [
    ...inbound.map((entry) => ({
      id: entry.id,
      type: "INBOUND" as const,
      date: entry.date,
      itemName: entry.item.name,
      unit: entry.item.unit,
      supplierName: entry.supplier.name,
      quantity: Number(entry.quantity),
      rate: Number(entry.rate),
      purpose: null,
      recordedByUsername: entry.recordedBy.username,
    })),
    ...outbound.map((entry) => ({
      id: entry.id,
      type: "OUTBOUND" as const,
      date: entry.date,
      itemName: entry.item.name,
      unit: entry.item.unit,
      supplierName: null,
      quantity: Number(entry.quantity),
      rate: null,
      purpose: entry.purpose,
      recordedByUsername: entry.recordedBy.username,
    })),
  ];

  rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  return rows;
}
