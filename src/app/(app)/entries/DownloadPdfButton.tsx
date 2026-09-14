"use client";

import { useState } from "react";
import { formatDateIndian } from "@/lib/format";
import type { EntryRow } from "@/lib/entries-report";

export function DownloadPdfButton({ rows }: { rows: EntryRow[] }) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Material & Operations Management — Entries Report", 14, 16);
      doc.setFontSize(9);
      doc.text(`Generated ${formatDateIndian(new Date())}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [["Date", "Type", "Item", "Quantity", "Supplier / Purpose", "Rate", "Recorded By"]],
        body: rows.map((row) => [
          formatDateIndian(row.date),
          row.type,
          row.itemName,
          `${row.quantity} ${row.unit}`,
          row.supplierName ?? row.purpose ?? "",
          row.rate !== null ? `Rs. ${row.rate}` : "-",
          row.recordedByUsername,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [3, 83, 164] },
      });

      doc.save(`entries-report-${formatDateIndian(new Date()).replaceAll("/", "-")}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating || rows.length === 0}
      className="btn-secondary"
    >
      {isGenerating ? "Preparing PDF…" : "Download PDF"}
    </button>
  );
}
