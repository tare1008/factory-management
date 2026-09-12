import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.SEED_OWNER_USERNAME ?? "owner";
  const password = process.env.SEED_OWNER_PASSWORD ?? "changeme123";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      passwordHash,
      name: "Owner",
      role: "OWNER",
    },
  });

  console.log(`Created OWNER account "${username}".`);
  if (!process.env.SEED_OWNER_PASSWORD) {
    console.log(`Default password: ${password} (change this after first login).`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
