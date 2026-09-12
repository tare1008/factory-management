import { prisma } from "@/lib/prisma";
import { computeCurrentStock, computeRateTrend, type RateTrend } from "@/lib/stock";

export interface DashboardItemRow {
  id: string;
  name: string;
  unit: string;
  stock: number;
  lastRate: number | null;
  trend: RateTrend | null;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export async function getDashboardItems(): Promise<DashboardItemRow[]> {
  const [items, inboundSums, outboundSums, recentInbound] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    prisma.inboundEntry.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
    }),
    prisma.outboundEntry.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
    }),
    prisma.inboundEntry.findMany({
      orderBy: [{ itemId: "asc" }, { date: "desc" }, { createdAt: "desc" }],
      select: { itemId: true, rate: true },
    }),
  ]);

  const inboundByItem = new Map(
    inboundSums.map((row) => [row.itemId, Number(row._sum.quantity ?? 0)])
  );
  const outboundByItem = new Map(
    outboundSums.map((row) => [row.itemId, Number(row._sum.quantity ?? 0)])
  );

  const recentRatesByItem = new Map<string, number[]>();
  for (const entry of recentInbound) {
    const rates = recentRatesByItem.get(entry.itemId) ?? [];
    if (rates.length < 2) {
      rates.push(Number(entry.rate));
      recentRatesByItem.set(entry.itemId, rates);
    }
  }

  return items.map((item) => {
    const totalInbound = inboundByItem.get(item.id) ?? 0;
    const totalOutbound = outboundByItem.get(item.id) ?? 0;
    const stock = computeCurrentStock(totalInbound, totalOutbound);

    const recentRatesLatestFirst = recentRatesByItem.get(item.id) ?? [];
    const lastRate = recentRatesLatestFirst[0] ?? null;
    const trend =
      recentRatesLatestFirst.length === 2
        ? computeRateTrend([...recentRatesLatestFirst].reverse())
        : null;

    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      stock,
      lastRate,
      trend,
      isLowStock: stock < Number(item.lowStockThreshold),
      isOutOfStock: stock <= 0,
    };
  });
}

export interface DashboardSummary {
  itemsInStock: number;
  lowStockAlerts: number;
  inboundThisMonth: number;
  outboundThisMonth: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [items, inboundThisMonth, outboundThisMonth] = await Promise.all([
    getDashboardItems(),
    prisma.inboundEntry.count({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.outboundEntry.count({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
    }),
  ]);

  return {
    itemsInStock: items.filter((item) => item.stock > 0).length,
    lowStockAlerts: items.filter((item) => item.isLowStock).length,
    inboundThisMonth,
    outboundThisMonth,
  };
}
