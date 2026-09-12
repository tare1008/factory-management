import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import { createItem, updateItem, deleteItem } from "@/lib/items";
import { createTestItem, createTestSupplier, createTestUser, resetDatabase } from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("createItem", () => {
  test("creates an item with the given fields", async () => {
    const item = await createItem({ name: "Steel Rod", unit: "kg", lowStockThreshold: 50 });
    expect(item.name).toBe("Steel Rod");
    expect(item.unit).toBe("kg");
    expect(Number(item.lowStockThreshold)).toBe(50);
  });

  test("rejects a negative low-stock threshold", async () => {
    await expect(
      createItem({ name: "Steel Rod", unit: "kg", lowStockThreshold: -5 })
    ).rejects.toThrow("Low-stock threshold cannot be negative");
  });

  test("rejects a duplicate item name", async () => {
    await createItem({ name: "Steel Rod", unit: "kg", lowStockThreshold: 50 });
    await expect(
      createItem({ name: "Steel Rod", unit: "pcs", lowStockThreshold: 10 })
    ).rejects.toThrow("An item with this name already exists");
  });
});

describe("updateItem", () => {
  test("updates the item's fields", async () => {
    const item = await createTestItem();
    const updated = await updateItem(item.id, { name: "Renamed", unit: "pcs", lowStockThreshold: 20 });
    expect(updated.name).toBe("Renamed");
    expect(updated.unit).toBe("pcs");
    expect(Number(updated.lowStockThreshold)).toBe(20);
  });
});

describe("deleteItem", () => {
  test("deletes an item with no entries", async () => {
    const item = await createTestItem();
    await deleteItem(item.id);
    await expect(prisma.item.findUnique({ where: { id: item.id } })).resolves.toBeNull();
  });

  test("refuses to delete an item that has entries", async () => {
    const item = await createTestItem();
    const supplier = await createTestSupplier();
    const user = await createTestUser();
    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 10, rate: 5, date: new Date(), recordedByUserId: user.id },
    });

    await expect(deleteItem(item.id)).rejects.toThrow(
      "Cannot delete an item that has recorded entries"
    );
  });
});
