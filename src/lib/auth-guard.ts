import type { Session } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

export function hasRole(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Insufficient role");
    this.name = "ForbiddenError";
  }
}

export function requireRole(
  session: Session | null,
  allowed: Role[]
): Session {
  if (!session?.user) throw new UnauthorizedError();
  if (!hasRole(session.user.role, allowed)) throw new ForbiddenError();
  return session;
}
