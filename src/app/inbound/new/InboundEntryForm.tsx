"use client";

import { useActionState } from "react";
import { submitInboundEntry, type InboundEntryFormState } from "@/app/inbound/new/actions";
import { IndianDateInput } from "@/components/IndianDateInput";

const initialState: InboundEntryFormState = {};

export function InboundEntryForm({
  items,
  suppliers,
}: {
  items: { id: string; name: string; unit: string }[];
  suppliers: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    submitInboundEntry,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="itemId" className="mat-label">
          Item
        </label>
        <select
          id="itemId"
          name="itemId"
          required
          className="mat-input"
        >
          <option value="">Select an item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
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
          required
          className="mat-input"
        >
          <option value="">Select a supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity" className="mat-label">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          step="0.001"
          min="0"
          required
          className="mat-input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rate" className="mat-label">
          Rate (per unit)
        </label>
        <input
          id="rate"
          name="rate"
          type="number"
          step="0.01"
          min="0"
          required
          className="mat-input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="mat-label">Date</label>
        <IndianDateInput name="date" required />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="mat-label">
          Notes (optional)
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          className="mat-input"
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
        className="btn-success mt-2"
      >
        {isPending ? "Saving…" : "Log Inbound Entry"}
      </button>
    </form>
  );
}
