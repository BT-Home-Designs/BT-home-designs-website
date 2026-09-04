import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export class UnauthenticatedError extends Error {
  constructor() {
    super("An authenticated internal user is required.");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Every server action and server-side data read/write touching
 * Customer/Quote/QuoteLineItem/PricingSnapshot must call this first. The
 * (dashboard) layout already redirects logged-out page loads to
 * /internal/login, but a Server Action is a separate entry point that
 * does not automatically re-run that layout check — so each action
 * verifies the session for itself too, rather than relying on the UI
 * (buttons/forms being hidden) or on middleware alone.
 */
export async function requireInternalUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }
  return session.user;
}
