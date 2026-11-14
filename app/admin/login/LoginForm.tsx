"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-charcoal-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
          className="mt-1.5 min-h-11 w-full rounded-sm border border-charcoal/25 bg-white px-3 text-[16px] focus:border-bt-green focus:outline-none"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || disabled}
        className="min-h-11 w-full rounded-sm bg-bt-green px-5 text-sm font-semibold tracking-wide text-bt-cream hover:bg-bt-green-deep disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
