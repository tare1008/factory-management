import { TopBar } from "@/components/TopBar";
import { prisma } from "@/lib/prisma";
import { OutboundEntryForm } from "@/app/outbound/new/OutboundEntryForm";

export default async function NewOutboundEntryPage() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">
          Outbound Entry
        </h1>
        {items.length === 0 ? (
          <p className="text-sm italic text-brand-violet">
            You need at least one item before logging an outbound entry.
          </p>
        ) : (
          <OutboundEntryForm items={items} />
        )}
      </main>
    </div>
  );
}
