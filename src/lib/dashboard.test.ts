import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { getDashboardItems, getDashboardSummary } from "@/lib/dashboard";
import {
  createTestItem,
  createTestSupplier,
  createTestUser,
  resetDatabase,
} from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("getDashboardItems", () => {
  test("reports stock, last rate, rate trend, and low-stock status per item", async () => {
    const item = await createTestItem(100);
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 500,
        rate: 60,
        date: new Date("2026-01-01"),
        recordedByUserId: user.id,
      },
    });
    await prisma.inboundEntry.create({
      data: {
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 40,
        rate: 68,
        date: new Date("2026-02-01"),
        recordedByUserId: user.id,
      },
    });
    await prisma.outboundEntry.create({
      data: {
        itemId: item.id,
        quantity: 480,
        purpose: "Production",
        date: new Date("2026-02-15"),
        recordedByUserId: user.id,
      },
    });

    const rows = await getDashboardItems();
    const row = rows.find((r) => r.id === item.id);

    expect(row).toEqual({
      id: item.id,
      name: item.name,
      unit: "kg",
      stock: 60,
      lastRate: 68,
      trend: "up",
      isLowStock: true,
      isOutOfStock: false,
    });
  });

  test("flags an item with zero or negative stock as out of stock", async () => {
    const item = await createTestItem(50);
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 20, rate: 10, date: new Date(), recordedByUserId: user.id },
    });
    await prisma.outboundEntry.create({
      data: { itemId: item.id, quantity: 20, purpose: "Production", date: new Date(), recordedByUserId: user.id },
    });

    const rows = await getDashboardItems();
    const row = rows.find((r) => r.id === item.id);

    expect(row?.stock).toBe(0);
    expect(row?.isLowStock).toBe(true);
    expect(row?.isOutOfStock).toBe(true);
  });
});

describe("getDashboardSummary", () => {
  test("counts items in stock, low-stock alerts, and this month's entries", async () => {
    const inStockItem = await createTestItem(10);
    const lowStockItem = await createTestItem(1000);
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    const now = new Date();

    await prisma.inboundEntry.create({
      data: {
        itemId: inStockItem.id,
        supplierId: supplier.id,
        quantity: 50,
        rate: 10,
        date: now,
        recordedByUserId: user.id,
      },
    });
    await prisma.inboundEntry.create({
      data: {
        itemId: lowStockItem.id,
        supplierId: supplier.id,
        quantity: 5,
        rate: 10,
        date: now,
        recordedByUserId: user.id,
      },
    });
    await prisma.outboundEntry.create({
      data: {
        itemId: inStockItem.id,
        quantity: 1,
        purpose: "Production",
        date: now,
        recordedByUserId: user.id,
      },
    });

    const summary = await getDashboardSummary();

    expect(summary).toEqual({
      itemsInStock: 2,
      lowStockAlerts: 1,
      inboundThisMonth: 2,
      outboundThisMonth: 1,
    });
  });
});
