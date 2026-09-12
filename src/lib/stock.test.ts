import { describe, expect, test } from "vitest";
import { computeCurrentStock, computeRateTrend } from "@/lib/stock";

describe("computeCurrentStock", () => {
  test("subtracts total outbound from total inbound", () => {
    expect(computeCurrentStock(540, 290)).toBe(250);
  });
});

describe("computeRateTrend", () => {
  test("returns 'up' when the latest rate is higher than the previous one", () => {
    expect(computeRateTrend([60, 68])).toBe("up");
  });

  test("returns 'down' when the latest rate is lower than the previous one", () => {
    expect(computeRateTrend([92, 88])).toBe("down");
  });

  test("returns 'flat' when the latest rate equals the previous one", () => {
    expect(computeRateTrend([74, 74])).toBe("flat");
  });

  test("returns null when there are fewer than two rates", () => {
    expect(computeRateTrend([74])).toBe(null);
    expect(computeRateTrend([])).toBe(null);
  });
});
