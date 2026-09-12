import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentStock, getLastRate, getRateTrendForItem } from "@/lib/inventory";
import {
  createTestItem,
  createTestSupplier,
  createTestUser,
  resetDatabase,
} from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("getCurrentStock", () => {
  test("is the sum of inbound quantities minus the sum of outbound quantities", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 100,
        rate: 50,
        date: new Date("2026-01-01"),
        recordedByUserId: user.id,
      },
    });
    await prisma.outboundEntry.create({
      data: {
        itemId: item.id,
        quantity: 30,
        purpose: "Production",
        date: new Date("2026-01-02"),
        recordedByUserId: user.id,
      },
    });

    await expect(getCurrentStock(item.id)).resolves.toBe(70);
  });
});

describe("getLastRate", () => {
  test("is the rate from the most recent inbound entry by date", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 100,
        rate: 60,
        date: new Date("2026-01-01"),
        recordedByUserId: user.id,
      },
    });
    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 50,
        rate: 68,
        date: new Date("2026-02-01"),
        recordedByUserId: user.id,
      },
    });

    await expect(getLastRate(item.id)).resolves.toBe(68);
  });
});

describe("getRateTrendForItem", () => {
  test("compares the two most recent inbound rates by date", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 100,
        rate: 60,
        date: new Date("2026-01-01"),
        recordedByUserId: user.id,
      },
    });
    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 50,
        rate: 68,
        date: new Date("2026-02-01"),
        recordedByUserId: user.id,
      },
    });

    await expect(getRateTrendForItem(item.id)).resolves.toBe("up");
  });
});
