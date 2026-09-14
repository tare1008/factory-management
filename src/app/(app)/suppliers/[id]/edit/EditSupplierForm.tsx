"use client";

import { useActionState } from "react";
import { updateSupplierAction, type SupplierFormState } from "@/app/(app)/suppliers/actions";
import { MaterialsMultiSelect } from "@/components/MaterialsMultiSelect";

const initialState: SupplierFormState = {};

export function EditSupplierForm({
  supplier,
  existingItems,
}: {
  supplier: {
    id: string;
    name: string;
    contactInfo: string | null;
    address: string | null;
    materials: { id: string; name: string }[];
  };
  existingItems: { id: string; name: string }[];
}) {
  const boundAction = updateSupplierAction.bind(null, supplier.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="mat-label">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={supplier.name}
          required
          className="mat-input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="contactInfo" className="mat-label">
          Contact info
        </label>
        <input
          id="contactInfo"
          name="contactInfo"
          defaultValue={supplier.contactInfo ?? ""}
          className="mat-input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="mat-label">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          defaultValue={supplier.address ?? ""}
          rows={2}
          className="mat-input resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="mat-label">Materials Supplied</label>
        <MaterialsMultiSelect
          fieldName="materials"
          existingItems={existingItems}
          defaultSelected={supplier.materials.map((m) => m.name)}
        />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brick-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary mt-2"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
