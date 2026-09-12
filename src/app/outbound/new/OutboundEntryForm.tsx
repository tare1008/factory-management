"use client";

import { useActionState } from "react";
import { submitOutboundEntry, type OutboundEntryFormState } from "@/app/outbound/new/actions";
import { IndianDateInput } from "@/components/IndianDateInput";

const initialState: OutboundEntryFormState = {};

export function OutboundEntryForm({
  items,
}: {
  items: { id: string; name: string; unit: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    submitOutboundEntry,
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
        <label htmlFor="purpose" className="mat-label">
          Purpose / Recipient
        </label>
        <input
          id="purpose"
          name="purpose"
          type="text"
          placeholder="e.g. Production - Job 12, or customer name"
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
        className="btn-danger mt-2"
      >
        {isPending ? "Saving…" : "Log Outbound Entry"}
      </button>
    </form>
  );
}
