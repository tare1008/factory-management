"use client";

import { useActionState } from "react";
import { createItemAction, type ItemFormState } from "@/app/items/actions";

const initialState: ItemFormState = {};

export function AddItemForm() {
  const [state, formAction, isPending] = useActionState(createItemAction, initialState);

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-col gap-3 mat-card p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="mat-label">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mat-input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="unit" className="mat-label">
          Unit
        </label>
        <input
          id="unit"
          name="unit"
          placeholder="kg, pcs…"
          required
          className="mat-input w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="lowStockThreshold" className="mat-label">
          Low-stock at
        </label>
        <input
          id="lowStockThreshold"
          name="lowStockThreshold"
          type="number"
          step="0.001"
          min="0"
          required
          className="mat-input w-32"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? "Adding…" : "Add Item"}
      </button>
      {state.error && (
        <p className="text-sm font-medium text-brick-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
