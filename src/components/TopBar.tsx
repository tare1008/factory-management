import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { Logo } from "@/components/Logo";
import { NavLinkHint } from "@/components/NavLinkHint";

export async function TopBar() {
  const session = await auth();
  const canSeeReports = !!session && hasRole(session.user.role, ["OWNER", "ADMIN"]);

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/items", label: "Items" },
    { href: "/suppliers", label: "Suppliers" },
    ...(canSeeReports ? [{ href: "/entries", label: "Reports" }] : []),
  ];

  return (
    <header className="bg-gradient-to-r from-deep-space-blue-950 via-deep-space-blue-800 to-steel-blue-700 shadow-[var(--shadow-elevation-2)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-3.5 md:flex-row">
        <div className="flex shrink-0 justify-center md:justify-start">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo theme="light" size="compact" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-1 md:flex-nowrap">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-steel-blue-200 transition-colors hover:text-papaya-whip-400"
            >
              {link.label}
              <NavLinkHint />
            </Link>
          ))}
          {session?.user.role === "OWNER" && (
            <Link
              href="/users"
              className="whitespace-nowrap text-sm font-medium text-steel-blue-200 transition-colors hover:text-papaya-whip-400"
            >
              Users
              <NavLinkHint />
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 text-sm text-steel-blue-200 md:justify-end">
          <span className="whitespace-nowrap italic">
            {session?.user.username}{" "}
            <span className="font-semibold not-italic text-white">
              ({session?.user.role})
            </span>
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition-colors hover:bg-white/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
