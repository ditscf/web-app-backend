import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OriginGuard } from "./guards/origin.guard";
import { APP_GUARD } from "@nestjs/core";

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

describe("AuthController", () => {
  let app: INestApplication<App>;
  const authService = {
    requestLogin: vi.fn(),
    verifyLogin: vi.fn(),
    revokeSession: vi.fn(),
    resolveActor: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: authConfig },
        { provide: APP_GUARD, useClass: OriginGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("sets an httpOnly session cookie and does not return the token", async () => {
    authService.verifyLogin.mockResolvedValue({
      token: "session-token",
      actor: { accountId: "account-1", personId: "person-1" },
    });

    const response = await request(app.getHttpServer())
      .post("/api/v1/auth/login/verify")
      .set("Origin", "http://localhost:3000")
      .send({ email: "member@example.com", code: "123456" })
      .expect(201);

    expect(response.body).not.toHaveProperty("token");
    const cookie = response.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toContain("ditscf.session=session-token");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("secure");
    expect(cookie.toLowerCase()).toContain("samesite=none");
  });

  it("rejects a login request from an unknown origin", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "https://evil.example")
      .send({ email: "member@example.com" })
      .expect(403);

    expect(authService.requestLogin).not.toHaveBeenCalled();
  });

  it("rejects a login request before the service when the email is invalid", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "not-an-email" })
      .expect(400);

    expect(authService.requestLogin).not.toHaveBeenCalled();
  });
});
