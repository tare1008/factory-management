import { notFound, redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EditSupplierForm } from "@/app/suppliers/[id]/edit/EditSupplierForm";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session || !hasRole(session.user.role, ["OWNER", "ADMIN"])) {
    redirect("/suppliers");
  }

  const [supplier, items] = await Promise.all([
    prisma.supplier.findUnique({ where: { id }, include: { materials: true } }),
    prisma.item.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!supplier) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">Edit Supplier</h1>
        <EditSupplierForm supplier={supplier} existingItems={items} />
      </main>
    </div>
  );
}
