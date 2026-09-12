import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getSupplierBusinessVolumes } from "@/lib/suppliers";
import { AddSupplierToggle } from "@/app/suppliers/AddSupplierToggle";
import { deleteSupplierAction } from "@/app/suppliers/actions";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  const canManage = !!session && hasRole(session.user.role, ["OWNER", "ADMIN"]);
  const isOwner = session?.user.role === "OWNER";

  const [suppliers, items, businessVolumes] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" }, include: { materials: true } }),
    prisma.item.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    isOwner ? getSupplierBusinessVolumes() : Promise.resolve(new Map<string, number>()),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">Suppliers</h1>

        {error && (
          <p className="mb-4 rounded-lg bg-brick-red-50 px-3 py-2 text-sm font-medium text-brick-red-700 shadow-sm">
            {error}
          </p>
        )}

        {canManage && <AddSupplierToggle existingItems={items} />}

        <ul className="flex flex-col gap-2">
          {suppliers.map((supplier) => (
            <li key={supplier.id} className="mat-card flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-brand-navy">{supplier.name}</p>
                  {supplier.contactInfo && (
                    <p className="text-sm italic text-brand-violet">{supplier.contactInfo}</p>
                  )}
                  {supplier.address && (
                    <p className="mt-0.5 text-sm text-steel-blue-600">{supplier.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <span className="badge-info">
                      Inbound: ₹{(businessVolumes.get(supplier.id) ?? 0).toLocaleString("en-IN")}
                    </span>
                  )}
                  {canManage && (
                    <>
                      <Link
                        href={`/suppliers/${supplier.id}/edit`}
                        className="rounded-lg bg-steel-blue-50 px-3 py-1.5 text-sm font-medium text-brand-indigo hover:bg-steel-blue-100"
                      >
                        Edit
                      </Link>
                      <form action={deleteSupplierAction}>
                        <input type="hidden" name="supplierId" value={supplier.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-brick-red-50 px-3 py-1.5 text-sm font-medium text-brick-red-700 hover:bg-brick-red-100"
                        >
                          Delete
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {supplier.materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {supplier.materials.map((material) => (
                    <span key={material.id} className="badge-info">
                      {material.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {suppliers.length === 0 && (
          <p className="text-sm italic text-brand-violet">No suppliers yet.</p>
        )}
      </main>
    </div>
  );
}
