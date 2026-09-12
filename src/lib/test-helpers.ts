import { prisma } from "@/lib/prisma";

export async function resetDatabase() {
  await prisma.outboundEntry.deleteMany();
  await prisma.inboundEntry.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser() {
  return prisma.user.create({
    data: {
      username: `user-${crypto.randomUUID()}`,
      passwordHash: "not-used-in-tests",
      name: "Test User",
      role: "OWNER",
    },
  });
}

export async function createTestItem(lowStockThreshold = 10) {
  return prisma.item.create({
    data: {
      name: `Item-${crypto.randomUUID()}`,
      unit: "kg",
      lowStockThreshold,
    },
  });
}

export async function createTestSupplier() {
  return prisma.supplier.create({
    data: { name: `Supplier-${crypto.randomUUID()}` },
  });
}
