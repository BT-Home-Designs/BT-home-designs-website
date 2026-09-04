"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    window.location.assign(result.url ?? callbackUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-charcoal/20 bg-warm-white px-4 py-3 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-sm border border-charcoal/20 bg-warm-white px-4 py-3 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark"
        />
      </div>
      {error && (
        <p role="alert" aria-live="assertive" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-matte-black px-4 py-3 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
