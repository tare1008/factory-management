"use client";

import { useActionState } from "react";
import { createSupplierAction, type SupplierFormState } from "@/app/suppliers/actions";
import { MaterialsMultiSelect } from "@/components/MaterialsMultiSelect";

const initialState: SupplierFormState = {};

export function AddSupplierForm({
  existingItems,
}: {
  existingItems: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createSupplierAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 mat-card p-4">
      <h2 className="mat-label text-sm">Add Supplier</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="mat-label">
            Name
          </label>
          <input id="name" name="name" required className="mat-input" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="contactInfo" className="mat-label">
            Contact info (optional)
          </label>
          <input id="contactInfo" name="contactInfo" className="mat-input" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="mat-label">
          Address (optional)
        </label>
        <textarea id="address" name="address" rows={2} className="mat-input resize-none" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="mat-label">Materials Supplied (optional)</label>
        <MaterialsMultiSelect fieldName="materials" existingItems={existingItems} />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brick-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? "Adding…" : "Add Supplier"}
      </button>
    </form>
  );
}
