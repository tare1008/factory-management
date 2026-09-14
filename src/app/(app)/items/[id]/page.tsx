import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getCurrentStock } from "@/lib/inventory";
import { formatDateIndian } from "@/lib/format";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const canManage = !!session && hasRole(session.user.role, ["OWNER", "ADMIN"]);

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) notFound();

  const [stock, rateHistory] = await Promise.all([
    getCurrentStock(id),
    prisma.inboundEntry.findMany({
      where: { itemId: id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { supplier: true },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy">{item.name}</h1>
            <p className="text-sm italic text-brand-violet">
              {stock} {item.unit} in stock · low-stock below {String(item.lowStockThreshold)} {item.unit}
            </p>
          </div>
          {canManage && (
            <Link
              href={`/items/${item.id}/edit`}
              className="rounded-lg bg-brand-lavender/15 px-3 py-1.5 text-sm font-medium text-brand-indigo hover:bg-brand-lavender/25"
            >
              Edit
            </Link>
          )}
        </div>

        <h2 className="mb-2 mat-label text-sm">
          Inbound rate history
        </h2>
        {rateHistory.length === 0 ? (
          <p className="text-sm italic text-brand-violet">No inbound entries yet.</p>
        ) : (
          <table className="mat-card w-full border-collapse overflow-hidden text-left text-sm">
            <thead className="bg-brand-violet/10 text-brand-violet">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Supplier</th>
                <th className="px-4 py-2 font-medium">Quantity</th>
                <th className="px-4 py-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rateHistory.map((entry) => (
                <tr key={entry.id} className="border-t border-brand-lavender/15">
                  <td className="px-4 py-2">{formatDateIndian(entry.date)}</td>
                  <td className="px-4 py-2">{entry.supplier.name}</td>
                  <td className="px-4 py-2">
                    {String(entry.quantity)} {item.unit}
                  </td>
                  <td className="px-4 py-2">₹{String(entry.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
  );
}
