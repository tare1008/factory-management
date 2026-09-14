import { redirect } from "next/navigation";
import { CalendarDateInput } from "@/components/CalendarDateInput";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getEntries } from "@/lib/entries-report";
import { formatDateIndian } from "@/lib/format";
import { DownloadPdfButton } from "@/app/(app)/entries/DownloadPdfButton";

interface EntriesSearchParams {
  itemId?: string;
  supplierId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<EntriesSearchParams>;
}) {
  const session = await auth();
  if (!session || !hasRole(session.user.role, ["OWNER", "ADMIN"])) {
    redirect("/");
  }

  const params = await searchParams;

  const [items, suppliers, rows] = await Promise.all([
    prisma.item.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getEntries({
      itemId: params.itemId || undefined,
      supplierId: params.supplierId || undefined,
      type: params.type === "INBOUND" || params.type === "OUTBOUND" ? params.type : undefined,
      dateFrom: params.dateFrom ? new Date(params.dateFrom) : undefined,
      dateTo: params.dateTo ? new Date(params.dateTo) : undefined,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
            Reports &amp; Search
          </h1>
          <DownloadPdfButton rows={rows} />
        </div>

        <form
          method="get"
          className="mb-6 grid grid-cols-2 gap-3 mat-card p-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="itemId" className="mat-label">
              Item
            </label>
            <select
              id="itemId"
              name="itemId"
              defaultValue={params.itemId ?? ""}
              className="mat-input px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="supplierId" className="mat-label">
              Supplier
            </label>
            <select
              id="supplierId"
              name="supplierId"
              defaultValue={params.supplierId ?? ""}
              className="mat-input px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="mat-label">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={params.type ?? ""}
              className="mat-input px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="INBOUND">Inbound</option>
              <option value="OUTBOUND">Outbound</option>
            </select>
          </div>

          <CalendarDateInput name="dateFrom" label="From" defaultValue={params.dateFrom} />

          <CalendarDateInput name="dateTo" label="To" defaultValue={params.dateTo} />

          <div className="col-span-2 flex items-end gap-2 sm:col-span-3 lg:col-span-5">
            <button
              type="submit"
              className="btn-primary px-4 py-1.5"
            >
              Filter
            </button>
            <a href="/entries" className="text-sm italic text-brand-violet underline">
              Clear
            </a>
          </div>
        </form>

        {rows.length === 0 ? (
          <p className="text-sm italic text-brand-violet">No entries match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="mat-card w-full border-collapse overflow-hidden text-left text-sm">
              <thead className="bg-brand-violet/10 text-brand-violet">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Quantity</th>
                  <th className="px-4 py-2 font-medium">Supplier / Purpose</th>
                  <th className="px-4 py-2 font-medium">Rate</th>
                  <th className="px-4 py-2 font-medium">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.type}-${row.id}`} className="border-t border-brand-lavender/15">
                    <td className="px-4 py-2">{formatDateIndian(row.date)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          row.type === "INBOUND"
                            ? "badge-success"
                            : "badge-outbound"
                        }
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{row.itemName}</td>
                    <td className="px-4 py-2">
                      {row.quantity} {row.unit}
                    </td>
                    <td className="px-4 py-2">{row.supplierName ?? row.purpose}</td>
                    <td className="px-4 py-2">{row.rate !== null ? `₹${row.rate}` : "—"}</td>
                    <td className="px-4 py-2">{row.recordedByUsername}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
  );
}
