"use client";

import { useState } from "react";
import { AddSupplierForm } from "@/app/(app)/suppliers/AddSupplierForm";

export function AddSupplierToggle({
  existingItems,
}: {
  existingItems: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn-primary mb-6">
        + Add Supplier
      </button>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-2">
      <AddSupplierForm existingItems={existingItems} />
      <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost self-start">
        Cancel
      </button>
    </div>
  );
}
