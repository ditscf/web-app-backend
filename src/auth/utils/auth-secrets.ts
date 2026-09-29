import { createHmac, randomBytes, randomInt } from "node:crypto";

export function hashSecret(value: string, pepper: string): string {
  return createHmac("sha256", pepper).update(value).digest("hex");
}

export function generateLoginCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}
