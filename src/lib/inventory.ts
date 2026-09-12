import { prisma } from "@/lib/prisma";
import { computeCurrentStock, computeRateTrend, type RateTrend } from "@/lib/stock";

export async function getCurrentStock(itemId: string): Promise<number> {
  const [inbound, outbound] = await Promise.all([
    prisma.inboundEntry.aggregate({
      where: { itemId },
      _sum: { quantity: true },
    }),
    prisma.outboundEntry.aggregate({
      where: { itemId },
      _sum: { quantity: true },
    }),
  ]);

  return computeCurrentStock(
    Number(inbound._sum.quantity ?? 0),
    Number(outbound._sum.quantity ?? 0)
  );
}

export async function getLastRate(itemId: string): Promise<number | null> {
  const latest = await prisma.inboundEntry.findFirst({
    where: { itemId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: { rate: true },
  });

  return latest ? Number(latest.rate) : null;
}

export async function getRateTrendForItem(
  itemId: string
): Promise<RateTrend | null> {
  const lastTwo = await prisma.inboundEntry.findMany({
    where: { itemId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 2,
    select: { rate: true },
  });

  const ratesOldestFirst = lastTwo.map((entry) => Number(entry.rate)).reverse();
  return computeRateTrend(ratesOldestFirst);
}
