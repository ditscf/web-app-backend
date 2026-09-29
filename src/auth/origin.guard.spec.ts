import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { AuthConfig } from "./auth.config";
import { OriginGuard } from "./guards/origin.guard";

const authConfig: AuthConfig = {
  pepper: "test-pepper-that-is-at-least-32-characters",
  sessionTtlSeconds: 3600,
  loginCodeTtlSeconds: 600,
  maxLoginCodesPerHour: 5,
  maxCodeAttempts: 5,
  cookieName: "ditscf.session",
  cookieSecure: true,
  cookieSameSite: "none",
  frontendOrigin: "http://localhost:3000",
  emailFrom: "DITSCF <login@example.com>",
  resendApiKey: "re_test",
};

describe("OriginGuard", () => {
  const guard = new OriginGuard(authConfig);

  it("allows a safe request without an origin", () => {
    expect(guard.canActivate(context("GET", undefined))).toBe(true);
  });

  it("allows a mutation from the configured frontend", () => {
    expect(guard.canActivate(context("POST", "http://localhost:3000"))).toBe(
      true,
    );
  });

  it("rejects a mutation from another origin", () => {
    expect(() =>
      guard.canActivate(context("POST", "https://evil.example")),
    ).toThrow(ForbiddenException);
  });

  it("rejects a mutation with no origin", () => {
    expect(() => guard.canActivate(context("POST", undefined))).toThrow(
      ForbiddenException,
    );
  });
});

function context(method: string, origin: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, headers: { origin } }),
    }),
  } as ExecutionContext;
}
