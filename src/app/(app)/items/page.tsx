import Link from "next/link";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getDashboardItems } from "@/lib/dashboard";
import { AddItemForm } from "@/app/(app)/items/AddItemForm";
import { deleteItemAction } from "@/app/(app)/items/actions";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  const canManage = !!session && hasRole(session.user.role, ["OWNER", "ADMIN"]);

  const [items, stockRows] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" } }),
    getDashboardItems(),
  ]);
  const stockById = new Map(stockRows.map((row) => [row.id, row]));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">Items</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-brick-red-50 px-3 py-2 text-sm font-medium text-brick-red-700 shadow-sm">
            {error}
          </p>
        )}

        {canManage && <AddItemForm />}

        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const stock = stockById.get(item.id);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 mat-card p-4"
              >
                <div>
                  <Link href={`/items/${item.id}`} className="font-semibold text-brand-indigo hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm italic text-brand-violet">
                    {stock?.stock ?? 0} {item.unit} in stock · low-stock below {String(item.lowStockThreshold)} {item.unit}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/items/${item.id}/edit`}
                      className="rounded-lg bg-brand-lavender/15 px-3 py-1.5 text-sm font-medium text-brand-indigo hover:bg-brand-lavender/25"
                    >
                      Edit
                    </Link>
                    <form action={deleteItemAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-brick-red-50 px-3 py-1.5 text-sm font-medium text-brick-red-700 hover:bg-brick-red-100"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {items.length === 0 && (
          <p className="text-sm italic text-brand-violet">No items yet.</p>
        )}
      </main>
  );
}
