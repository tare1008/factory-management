import { TopBar } from "@/components/TopBar";
import { prisma } from "@/lib/prisma";
import { InboundEntryForm } from "@/app/inbound/new/InboundEntryForm";

export default async function NewInboundEntryPage() {
  const [items, suppliers] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, unit: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">
          Inbound Entry
        </h1>
        {items.length === 0 || suppliers.length === 0 ? (
          <p className="text-sm italic text-brand-violet">
            You need at least one item and one supplier before logging an
            inbound entry.
          </p>
        ) : (
          <InboundEntryForm items={items} suppliers={suppliers} />
        )}
      </main>
    </div>
  );
}
