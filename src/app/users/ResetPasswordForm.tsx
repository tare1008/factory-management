"use client";

import { useActionState } from "react";
import { resetPasswordAction, type UserFormState } from "@/app/users/actions";

const initialState: UserFormState = {};

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="password"
        name="newPassword"
        placeholder="New password"
        minLength={6}
        required
        className="mat-input px-2 py-1 text-sm"
      />
      <button type="submit" disabled={isPending} className="btn-ghost">
        {isPending ? "Saving…" : "Reset Password"}
      </button>
      {state.error && (
        <span className="text-xs font-medium text-brick-red-600">{state.error}</span>
      )}
    </form>
  );
}
