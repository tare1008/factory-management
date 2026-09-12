"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/login/actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="mat-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="mat-input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="mat-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mat-input"
        />
      </div>

      {errorMessage && (
        <p className="text-sm font-medium text-brick-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary mt-2 w-full"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
