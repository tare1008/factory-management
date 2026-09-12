export function computeCurrentStock(
  totalInbound: number,
  totalOutbound: number
): number {
  return totalInbound - totalOutbound;
}

export type RateTrend = "up" | "down" | "flat";

export function computeRateTrend(
  ratesOldestFirst: number[]
): RateTrend | null {
  if (ratesOldestFirst.length < 2) return null;

  const [previous, latest] = ratesOldestFirst.slice(-2);
  if (latest > previous) return "up";
  if (latest < previous) return "down";
  return "flat";
}
