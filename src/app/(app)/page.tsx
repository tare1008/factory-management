import Link from "next/link";
import { FactoryIllustration } from "@/components/FactoryIllustration";
import { NavLinkHint } from "@/components/NavLinkHint";
import { auth } from "@/lib/auth";
import { getDashboardItems, getDashboardSummary } from "@/lib/dashboard";
import type { RateTrend } from "@/lib/stock";

function RateTrendIndicator({ trend }: { trend: RateTrend | null }) {
  if (trend === "up") return <span className="font-bold text-emerald-600">▲</span>;
  if (trend === "down") return <span className="font-bold text-brick-red-600">▼</span>;
  if (trend === "flat") return <span className="text-brand-lavender">–</span>;
  return <span className="text-brand-lavender/50">–</span>;
}

const TILE_ACCENTS = {
  deepSpaceBlue: "border-t-deep-space-blue-600",
  steelBlue: "border-t-steel-blue-500",
  papayaWhip: "border-t-papaya-whip-500",
  danger: "border-t-brick-red-500",
} as const;

function StockStatusBadge({
  isOutOfStock,
  isLowStock,
}: {
  isOutOfStock: boolean;
  isLowStock: boolean;
}) {
  if (isOutOfStock) return <span className="badge-critical">OUT OF STOCK</span>;
  if (isLowStock) return <span className="badge-danger">LOW STOCK</span>;
  return null;
}

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: keyof typeof TILE_ACCENTS;
}) {
  return (
    <div className={`mat-card-interactive border-t-4 p-5 ${TILE_ACCENTS[accent]}`}>
      <p className="text-3xl font-bold tracking-tight text-brand-navy">{value}</p>
      <p className="mat-label mt-1">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const isStorekeeper = session?.user.role === "STOREKEEPER";

  const [items, summary] = await Promise.all([
    getDashboardItems(),
    getDashboardSummary(),
  ]);

  return (
    <>
      <div className="relative overflow-hidden">
        <FactoryIllustration className="absolute inset-0 h-full w-full scale-105 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-space-blue-950/90 via-deep-space-blue-900/85 to-steel-blue-800/80" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-6">
          <p className="text-sm italic text-steel-blue-200">Welcome back,</p>
          <h1 className="text-xl font-bold text-white">
            {session?.user.username} <span className="font-normal text-steel-blue-200">({session?.user.role})</span>
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/inbound/new" className="btn-success flex-1 py-3 text-base">
            Inbound Entry
            <NavLinkHint />
          </Link>
          <Link href="/outbound/new" className="btn-danger flex-1 py-3 text-base">
            Outbound Entry
            <NavLinkHint />
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryTile label="Items in Stock" value={summary.itemsInStock} accent="deepSpaceBlue" />
          <SummaryTile label="Low Stock Alerts" value={summary.lowStockAlerts} accent="danger" />
          <SummaryTile label="Inbound This Month" value={summary.inboundThisMonth} accent="steelBlue" />
          <SummaryTile label="Outbound This Month" value={summary.outboundThisMonth} accent="papayaWhip" />
        </div>

        {items.length === 0 ? (
          <p className="text-sm italic text-brand-violet">
            No items yet.{" "}
            <Link href="/items" className="font-medium text-brand-indigo underline">
              Add your first item
            </Link>
            .
          </p>
        ) : (
          <>
            {/* Table view: laptop / tablet widths */}
            <table className="mat-card hidden w-full border-collapse overflow-hidden text-left text-sm md:table">
              <thead className="bg-brand-violet/10 text-brand-violet">
                <tr>
                  <th className="mat-label px-4 py-3 font-semibold">Item</th>
                  <th className="mat-label px-4 py-3 font-semibold">Stock</th>
                  <th className="mat-label px-4 py-3 font-semibold">Last Rate</th>
                  {!isStorekeeper && (
                    <th className="mat-label px-4 py-3 font-semibold">Trend</th>
                  )}
                  <th className="mat-label px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-brand-lavender/15 transition-colors hover:bg-brand-surface"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/items/${item.id}`}
                        className="font-medium text-brand-indigo hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      {item.stock} <span className="font-normal text-brand-violet">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      {item.lastRate !== null ? `₹${item.lastRate}` : "—"}
                    </td>
                    {!isStorekeeper && (
                      <td className="px-4 py-3">
                        <RateTrendIndicator trend={item.trend} />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <StockStatusBadge isOutOfStock={item.isOutOfStock} isLowStock={item.isLowStock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card view: phone widths */}
            <ul className="flex flex-col gap-3 md:hidden">
              {items.map((item) => (
                <li key={item.id} className="mat-card p-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/items/${item.id}`}
                      className="font-semibold text-brand-indigo hover:underline"
                    >
                      {item.name}
                    </Link>
                    <StockStatusBadge isOutOfStock={item.isOutOfStock} isLowStock={item.isLowStock} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-brand-navy">
                      {item.stock} <span className="font-normal text-brand-violet">{item.unit}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-brand-navy">
                      {item.lastRate !== null ? `₹${item.lastRate}` : "—"}
                      {!isStorekeeper && <RateTrendIndicator trend={item.trend} />}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
