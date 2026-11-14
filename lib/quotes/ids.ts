import { randomBytes, randomUUID } from "crypto";

/** 192-bit random token for private customer links. */
export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export function newId(): string {
  return randomUUID();
}

export function isTokenShaped(value: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(value);
}

export function isIdShaped(value: string): boolean {
  return /^[0-9a-f-]{36}$/.test(value);
}
