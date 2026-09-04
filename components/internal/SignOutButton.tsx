"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/internal/login" })}
      className="text-[13px] font-medium text-charcoal-soft transition-colors hover:text-charcoal"
    >
      Sign out
    </button>
  );
}
