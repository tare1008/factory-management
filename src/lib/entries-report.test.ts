import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { getEntries } from "@/lib/entries-report";
import {
  createTestItem,
  createTestSupplier,
  createTestUser,
  resetDatabase,
} from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("getEntries", () => {
  test("returns inbound and outbound entries merged and sorted by date desc", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date("2026-01-01"), recordedByUserId: user.id },
    });
    await prisma.outboundEntry.create({
      data: { itemId: item.id, quantity: 20, purpose: "Production", date: new Date("2026-01-05"), recordedByUserId: user.id },
    });

    const rows = await getEntries({});

    expect(rows).toHaveLength(2);
    expect(rows[0].type).toBe("OUTBOUND");
    expect(rows[0].date.toISOString().slice(0, 10)).toBe("2026-01-05");
    expect(rows[1].type).toBe("INBOUND");
    expect(rows[1].supplierName).toBe(supplier.name);
  });

  test("filters by itemId", async () => {
    const item1 = await createTestItem();
    const item2 = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item1.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date(), recordedByUserId: user.id },
    });
    await prisma.inboundEntry.create({
      data: { itemId: item2.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date(), recordedByUserId: user.id },
    });

    const rows = await getEntries({ itemId: item1.id });

    expect(rows).toHaveLength(1);
    expect(rows[0].itemName).toBe(item1.name);
  });

  test("filters by type", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date(), recordedByUserId: user.id },
    });
    await prisma.outboundEntry.create({
      data: { itemId: item.id, quantity: 20, purpose: "Production", date: new Date(), recordedByUserId: user.id },
    });

    const rows = await getEntries({ type: "OUTBOUND" });

    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("OUTBOUND");
  });

  test("filters by date range", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date("2026-01-01"), recordedByUserId: user.id },
    });
    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 100, rate: 50, date: new Date("2026-03-01"), recordedByUserId: user.id },
    });

    const rows = await getEntries({ dateFrom: new Date("2026-02-01"), dateTo: new Date("2026-04-01") });

    expect(rows).toHaveLength(1);
    expect(rows[0].date.toISOString().slice(0, 10)).toBe("2026-03-01");
  });
});
