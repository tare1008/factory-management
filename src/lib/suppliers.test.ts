import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierBusinessVolumes,
} from "@/lib/suppliers";
import { createTestItem, createTestSupplier, createTestUser, resetDatabase } from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("createSupplier", () => {
  test("creates a supplier with the given fields", async () => {
    const supplier = await createSupplier({ name: "ABC Metals", contactInfo: "9999999999" });
    expect(supplier.name).toBe("ABC Metals");
    expect(supplier.contactInfo).toBe("9999999999");
  });

  test("rejects a duplicate supplier name", async () => {
    await createSupplier({ name: "ABC Metals" });
    await expect(createSupplier({ name: "ABC Metals" })).rejects.toThrow(
      "A supplier with this name already exists"
    );
  });
});

describe("updateSupplier", () => {
  test("updates the supplier's fields", async () => {
    const supplier = await createTestSupplier();
    const updated = await updateSupplier(supplier.id, { name: "Renamed", contactInfo: "123" });
    expect(updated.name).toBe("Renamed");
    expect(updated.contactInfo).toBe("123");
  });

  test("stores the supplier's address", async () => {
    const supplier = await createTestSupplier();
    const updated = await updateSupplier(supplier.id, {
      name: supplier.name,
      address: "12 Industrial Estate, Pune",
    });
    expect(updated.address).toBe("12 Industrial Estate, Pune");
  });
});

describe("materials (get-or-create by name)", () => {
  test("connects existing items by name without creating duplicates", async () => {
    const item = await createTestItem();
    const supplier = await createSupplier({
      name: "Metals Co",
      materialNames: [item.name],
    });

    const withMaterials = await prisma.supplier.findUniqueOrThrow({
      where: { id: supplier.id },
      include: { materials: true },
    });
    expect(withMaterials.materials).toHaveLength(1);
    expect(withMaterials.materials[0].id).toBe(item.id);

    const allItems = await prisma.item.findMany({ where: { name: item.name } });
    expect(allItems).toHaveLength(1);
  });

  test("creates a new item automatically when the material name doesn't exist", async () => {
    const supplier = await createSupplier({
      name: "Metals Co",
      materialNames: ["Brand New Alloy"],
    });

    const created = await prisma.item.findUnique({ where: { name: "Brand New Alloy" } });
    expect(created).not.toBeNull();

    const withMaterials = await prisma.supplier.findUniqueOrThrow({
      where: { id: supplier.id },
      include: { materials: true },
    });
    expect(withMaterials.materials.map((m) => m.name)).toEqual(["Brand New Alloy"]);
  });

  test("updateSupplier replaces the materials list, not appends to it", async () => {
    const itemA = await createTestItem();
    const itemB = await createTestItem();
    const supplier = await createSupplier({ name: "Metals Co", materialNames: [itemA.name] });

    await updateSupplier(supplier.id, { name: "Metals Co", materialNames: [itemB.name] });

    const withMaterials = await prisma.supplier.findUniqueOrThrow({
      where: { id: supplier.id },
      include: { materials: true },
    });
    expect(withMaterials.materials.map((m) => m.id)).toEqual([itemB.id]);
  });
});

describe("getSupplierBusinessVolumes", () => {
  test("sums quantity * rate of inbound entries per supplier", async () => {
    const supplierA = await createTestSupplier();
    const supplierB = await createTestSupplier();
    const item = await createTestItem();
    const user = await createTestUser();

    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplierA.id, quantity: 10, rate: 5, date: new Date(), recordedByUserId: user.id },
    });
    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplierA.id, quantity: 4, rate: 2, date: new Date(), recordedByUserId: user.id },
    });
    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplierB.id, quantity: 100, rate: 1, date: new Date(), recordedByUserId: user.id },
    });

    const volumes = await getSupplierBusinessVolumes();

    expect(volumes.get(supplierA.id)).toBe(58);
    expect(volumes.get(supplierB.id)).toBe(100);
  });

  test("suppliers with no entries are absent from the result", async () => {
    const supplier = await createTestSupplier();
    const volumes = await getSupplierBusinessVolumes();
    expect(volumes.get(supplier.id)).toBeUndefined();
  });
});

describe("deleteSupplier", () => {
  test("deletes a supplier with no entries", async () => {
    const supplier = await createTestSupplier();
    await deleteSupplier(supplier.id);
    await expect(prisma.supplier.findUnique({ where: { id: supplier.id } })).resolves.toBeNull();
  });

  test("refuses to delete a supplier that has entries", async () => {
    const supplier = await createTestSupplier();
    const item = await createTestItem();
    const user = await createTestUser();
    await prisma.inboundEntry.create({
      data: { itemId: item.id, supplierId: supplier.id, quantity: 10, rate: 5, date: new Date(), recordedByUserId: user.id },
    });

    await expect(deleteSupplier(supplier.id)).rejects.toThrow(
      "Cannot delete a supplier that has recorded entries"
    );
  });
});
