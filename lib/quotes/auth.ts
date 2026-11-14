import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionValue } from "./session";
import { QuoteError } from "./service";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(ADMIN_COOKIE)?.value);
}

/** Every admin server action and admin API route calls this first. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new QuoteError("Not signed in.", 401);
}
