import { describe, expect, test } from "vitest";
import {
  hasRole,
  requireRole,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/auth-guard";
import type { Session } from "next-auth";

describe("hasRole", () => {
  test("returns true when the user's role is in the allowed list", () => {
    expect(hasRole("ADMIN", ["OWNER", "ADMIN"])).toBe(true);
  });

  test("returns false when the user's role is not in the allowed list", () => {
    expect(hasRole("STOREKEEPER", ["OWNER", "ADMIN"])).toBe(false);
  });
});

function makeSession(role: Session["user"]["role"]): Session {
  return {
    user: { id: "u1", username: "owner1", role, name: null, email: null, image: null },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

describe("requireRole", () => {
  test("returns the session when there is no session (throws instead)", () => {
    expect(() => requireRole(null, ["OWNER"])).toThrow(UnauthorizedError);
  });

  test("throws ForbiddenError when the session's role is not allowed", () => {
    expect(() => requireRole(makeSession("STOREKEEPER"), ["OWNER"])).toThrow(
      ForbiddenError
    );
  });

  test("returns the session when the role is allowed", () => {
    const session = makeSession("OWNER");
    expect(requireRole(session, ["OWNER", "ADMIN"])).toBe(session);
  });
});
