"use client";

import { useActionState } from "react";
import { createUserAction, type UserFormState } from "@/app/users/actions";

const initialState: UserFormState = {};

export function AddUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-col gap-3 mat-card p-4"
    >
      <h2 className="mat-label text-sm">Add User</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
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
          <label htmlFor="username" className="mat-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            className="mat-input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="mat-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mat-input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="mat-label">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            className="mat-input"
          >
            <option value="STOREKEEPER">Storekeeper</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brick-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary self-start"
      >
        {isPending ? "Adding…" : "Add User"}
      </button>
    </form>
  );
}
