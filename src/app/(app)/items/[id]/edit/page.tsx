import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EditItemForm } from "@/app/(app)/items/[id]/edit/EditItemForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session || !hasRole(session.user.role, ["OWNER", "ADMIN"])) {
    redirect(`/items/${id}`);
  }

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">Edit Item</h1>
        <EditItemForm
          item={{
            id: item.id,
            name: item.name,
            unit: item.unit,
            lowStockThreshold: String(item.lowStockThreshold),
          }}
        />
      </main>
  );
}
