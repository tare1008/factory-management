import { afterEach, beforeEach, describe, expect, test } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUser, resetUserPassword, updateUserRole } from "@/lib/users";
import { resetDatabase } from "@/lib/test-helpers";

beforeEach(resetDatabase);
afterEach(resetDatabase);

describe("createUser", () => {
  test("creates a user with a hashed password", async () => {
    const user = await createUser({
      username: "storekeeper1",
      password: "secret123",
      name: "Ravi",
      role: "STOREKEEPER",
    });

    expect(user.username).toBe("storekeeper1");
    expect(user.passwordHash).not.toBe("secret123");
    await expect(bcrypt.compare("secret123", user.passwordHash)).resolves.toBe(true);
  });

  test("rejects a duplicate username", async () => {
    await createUser({ username: "storekeeper1", password: "secret123", name: "Ravi", role: "STOREKEEPER" });
    await expect(
      createUser({ username: "storekeeper1", password: "other", name: "Someone Else", role: "ADMIN" })
    ).rejects.toThrow("A user with this username already exists");
  });

  test("rejects creating an OWNER through this function", async () => {
    await expect(
      // @ts-expect-error - intentionally passing a disallowed role
      createUser({ username: "sneaky", password: "secret123", name: "Sneaky", role: "OWNER" })
    ).rejects.toThrow("Can only create ADMIN or STOREKEEPER accounts");
  });
});

describe("updateUserRole", () => {
  test("changes a user's role between ADMIN and STOREKEEPER", async () => {
    const user = await createUser({ username: "u1", password: "secret123", name: "U1", role: "STOREKEEPER" });
    const updated = await updateUserRole(user.id, "ADMIN");
    expect(updated.role).toBe("ADMIN");
  });

  test("refuses to set a role other than ADMIN or STOREKEEPER", async () => {
    const user = await createUser({ username: "u1", password: "secret123", name: "U1", role: "STOREKEEPER" });
    await expect(
      // @ts-expect-error - intentionally passing a disallowed role
      updateUserRole(user.id, "OWNER")
    ).rejects.toThrow("Can only assign ADMIN or STOREKEEPER");
  });
});

describe("resetUserPassword", () => {
  test("updates the user's password hash", async () => {
    const user = await createUser({ username: "u1", password: "secret123", name: "U1", role: "STOREKEEPER" });
    await resetUserPassword(user.id, "newpassword456");

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    await expect(bcrypt.compare("newpassword456", updated.passwordHash)).resolves.toBe(true);
  });
});
