import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { createInboundEntry, createOutboundEntry } from "@/lib/entries";
import {
  createTestItem,
  createTestSupplier,
  createTestUser,
  resetDatabase,
} from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("createInboundEntry", () => {
  test("creates an inbound entry with the given data", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await createInboundEntry({
      itemId: item.id,
      supplierId: supplier.id,
      quantity: 100,
      rate: 50,
      date: new Date("2026-01-01"),
      recordedByUserId: user.id,
    });

    const stored = await prisma.inboundEntry.findFirst({ where: { itemId: item.id } });
    expect(stored).not.toBeNull();
    expect(Number(stored!.quantity)).toBe(100);
    expect(Number(stored!.rate)).toBe(50);
  });

  test("rejects a quantity of zero or less", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await expect(
      createInboundEntry({
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 0,
        rate: 50,
        date: new Date(),
        recordedByUserId: user.id,
      })
    ).rejects.toThrow("Quantity must be greater than zero");
  });

  test("rejects a rate of zero or less", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await expect(
      createInboundEntry({
        itemId: item.id,
        supplierId: supplier.id,
        quantity: 10,
        rate: 0,
        date: new Date(),
        recordedByUserId: user.id,
      })
    ).rejects.toThrow("Rate must be greater than zero");
  });
});

describe("createOutboundEntry", () => {
  test("creates an outbound entry when there is enough stock", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await createInboundEntry({
      itemId: item.id,
      supplierId: supplier.id,
      quantity: 100,
      rate: 50,
      date: new Date("2026-01-01"),
      recordedByUserId: user.id,
    });

    await createOutboundEntry({
      itemId: item.id,
      quantity: 30,
      purpose: "Production - Job 1",
      date: new Date("2026-01-02"),
      recordedByUserId: user.id,
    });

    const stored = await prisma.outboundEntry.findFirst({ where: { itemId: item.id } });
    expect(Number(stored!.quantity)).toBe(30);
  });

  test("rejects issuing more than the current stock", async () => {
    const item = await createTestItem();
    const user = await createTestUser();

    await expect(
      createOutboundEntry({
        itemId: item.id,
        quantity: 10,
        purpose: "Production",
        date: new Date(),
        recordedByUserId: user.id,
      })
    ).rejects.toThrow("Cannot issue more than current stock");
  });

  test("rejects a blank purpose", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await createInboundEntry({
      itemId: item.id,
      supplierId: supplier.id,
      quantity: 100,
      rate: 50,
      date: new Date("2026-01-01"),
      recordedByUserId: user.id,
    });

    await expect(
      createOutboundEntry({
        itemId: item.id,
        quantity: 10,
        purpose: "   ",
        date: new Date(),
        recordedByUserId: user.id,
      })
    ).rejects.toThrow("Purpose is required");
  });
});
