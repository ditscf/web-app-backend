import { ConfigService } from "@nestjs/config";

export const AUTH_CONFIG = Symbol("AUTH_CONFIG");

export type CookieSameSite = "lax" | "strict" | "none";

export interface AuthConfig {
  pepper: string;
  sessionTtlSeconds: number;
  loginCodeTtlSeconds: number;
  maxLoginCodesPerHour: number;
  maxCodeAttempts: number;
  cookieName: string;
  cookieSecure: boolean;
  cookieSameSite: CookieSameSite;
  frontendOrigin: string;
  emailFrom: string;
  resendApiKey: string;
}

const LOGIN_CODE_LENGTH = 6;

export const LOGIN_CODE_PATTERN = new RegExp(`^\\d{${LOGIN_CODE_LENGTH}}$`);

export const LOGIN_REQUEST_MESSAGE =
  "If this email can sign in, a login code has been sent.";

export const INVALID_CODE_MESSAGE = "The login code is invalid or has expired.";

export function loadAuthConfig(configService: ConfigService): AuthConfig {
  const pepper = required(configService, "AUTH_CODE_PEPPER");
  if (pepper.length < 32) {
    throw new Error("AUTH_CODE_PEPPER must be at least 32 characters.");
  }

  const cookieSameSite = readSameSite(
    configService.get<string>("COOKIE_SAME_SITE"),
  );
  const cookieSecure = readBoolean(
    configService.get<string>("COOKIE_SECURE"),
    true,
    "COOKIE_SECURE",
  );
  if (cookieSameSite === "none" && !cookieSecure) {
    throw new Error(
      "COOKIE_SECURE must be true when COOKIE_SAME_SITE is none.",
    );
  }

  return {
    pepper,
    sessionTtlSeconds: readPositiveInt(
      configService.get<string>("SESSION_TTL_SECONDS"),
      60 * 60 * 24 * 7,
      "SESSION_TTL_SECONDS",
    ),
    loginCodeTtlSeconds: readPositiveInt(
      configService.get<string>("LOGIN_CODE_TTL_SECONDS"),
      10 * 60,
      "LOGIN_CODE_TTL_SECONDS",
    ),
    maxLoginCodesPerHour: readPositiveInt(
      configService.get<string>("MAX_LOGIN_CODES_PER_HOUR"),
      5,
      "MAX_LOGIN_CODES_PER_HOUR",
    ),
    maxCodeAttempts: readPositiveInt(
      configService.get<string>("MAX_CODE_ATTEMPTS"),
      5,
      "MAX_CODE_ATTEMPTS",
    ),
    cookieName:
      configService.get<string>("COOKIE_NAME")?.trim() || "ditscf.session",
    cookieSecure,
    cookieSameSite,
    frontendOrigin: readOrigin(required(configService, "FRONTEND_ORIGIN")),
    emailFrom: required(configService, "AUTH_EMAIL_FROM"),
    resendApiKey: required(configService, "RESEND_API_KEY"),
  };
}

function required(configService: ConfigService, name: string): string {
  const value = configService.get<string>(name)?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function readOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("FRONTEND_ORIGIN must be an absolute origin.");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("FRONTEND_ORIGIN must be an origin without a path.");
  }
  return url.origin;
}

function readSameSite(value: string | undefined): CookieSameSite {
  const sameSite = (value ?? "none").toLowerCase();
  if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
    return sameSite;
  }
  throw new Error("COOKIE_SAME_SITE must be lax, strict, or none.");
}

function readBoolean(
  value: string | undefined,
  fallback: boolean,
  name: string,
): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`${name} must be true or false.`);
}

function readPositiveInt(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}
