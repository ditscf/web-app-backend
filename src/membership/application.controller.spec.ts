import { INestApplication, ValidationPipe } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { AUTH_CONFIG, type AuthConfig } from "../auth/auth.config";
import { AuthService } from "../auth/auth.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { OriginGuard } from "../auth/guards/origin.guard";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";

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

const registration = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Applicant",
  phone: "0712000000",
  class: "OD24",
  course: "Computer Science",
  yearOfStudy: "2",
  dateOfBirth: "2000-12-16",
};

describe("ApplicationController", () => {
  let app: INestApplication<App>;
  const applications = {
    register: vi.fn(),
    listPending: vi.fn(),
    approve: vi.fn(),
  };
  const authService = { resolveActor: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        { provide: ApplicationService, useValue: applications },
        { provide: AuthService, useValue: authService },
        { provide: AUTH_CONFIG, useValue: authConfig },
        AuthGuard,
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

  it("rejects a registration that includes a password", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/applications/new")
      .set("Origin", "http://localhost:3000")
      .send({ ...registration, password: "secret" })
      .expect(400);

    expect(applications.register).not.toHaveBeenCalled();
  });

  it("rejects a registration from an unknown origin", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/applications/new")
      .set("Origin", "https://evil.example")
      .send(registration)
      .expect(403);

    expect(applications.register).not.toHaveBeenCalled();
  });

  it("requires a session before an approval", async () => {
    await request(app.getHttpServer())
      .post(
        "/api/v1/applications/018f1c3a-7b2a-7c3d-8e4f-123456789abc/approval",
      )
      .set("Origin", "http://localhost:3000")
      .expect(401);

    expect(applications.approve).not.toHaveBeenCalled();
  });

  it("keeps an officer out of the review queue until onboarding is finished", async () => {
    authService.resolveActor.mockResolvedValue({
      accountId: "account-1",
      personId: "person-1",
      onboardingCompleted: false,
      offices: ["GENERAL_SECRETARY"],
    });

    await request(app.getHttpServer())
      .get("/api/v1/applications/list")
      .set("Cookie", "ditscf.session=session-token")
      .expect(403);

    expect(applications.listPending).not.toHaveBeenCalled();
  });

  it("opens the review queue after onboarding", async () => {
    authService.resolveActor.mockResolvedValue({
      accountId: "account-1",
      personId: "person-1",
      onboardingCompleted: true,
      offices: ["GENERAL_SECRETARY"],
    });
    applications.listPending.mockResolvedValue({ applications: [] });

    await request(app.getHttpServer())
      .get("/api/v1/applications/list")
      .set("Cookie", "ditscf.session=session-token")
      .expect(200, { applications: [] });
  });
});
