"use client";

import { useActionState } from "react";
import { updateItemAction, type ItemFormState } from "@/app/(app)/items/actions";

const initialState: ItemFormState = {};

export function EditItemForm({
  item,
}: {
  item: { id: string; name: string; unit: string; lowStockThreshold: string };
}) {
  const boundAction = updateItemAction.bind(null, item.id);
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
          defaultValue={item.name}
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
          defaultValue={item.unit}
          required
          className="mat-input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="lowStockThreshold" className="mat-label">
          Low-stock threshold
        </label>
        <input
          id="lowStockThreshold"
          name="lowStockThreshold"
          type="number"
          step="0.001"
          min="0"
          defaultValue={item.lowStockThreshold}
          required
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
        className="btn-primary mt-2"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
