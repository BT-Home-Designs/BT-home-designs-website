import type { DefaultSession } from "next-auth";

// Extends next-auth's built-in types with the fields Phase 2 adds to the
// session/JWT (id, role) — see lib/auth/options.ts callbacks.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "STAFF";
  }
}
