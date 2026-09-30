import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  AccountStatus,
  AuthEmailStatus,
  AuthEmailType,
  MembershipStatus,
} from "../../generated/prisma/client";
import { DatabaseService } from "../database/database.service";
import {
  AUTH_CONFIG,
  INVALID_CODE_MESSAGE,
  LOGIN_REQUEST_MESSAGE,
  type AuthConfig,
} from "./auth.config";
import { AuthEmailSender } from "./utils/auth-email.sender";
import { hashSecret } from "./utils/auth-secrets";
import { AuthService } from "./auth.service";

const pepper = "test-pepper-that-is-at-least-32-characters";

const authConfig: AuthConfig = {
  pepper,
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

describe("AuthService", () => {
  const database = {
    person: { findUnique: vi.fn() },
    account: { findUnique: vi.fn() },
    loginCode: {
      count: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    authEmail: { create: vi.fn(), update: vi.fn() },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  const emailSender = { sendLoginCode: vi.fn() };

  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(
      async (callback: (tx: typeof database) => unknown) => callback(database),
    );
    database.loginCode.count.mockResolvedValue(0);
    database.loginCode.updateMany.mockResolvedValue({ count: 1 });
    database.loginCode.create.mockImplementation(
      async ({ data }: { data: { codeHash: string } }) => ({
        id: "code-1",
        ...data,
      }),
    );
    database.authEmail.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => ({
        id: "email-1",
        ...data,
      }),
    );
    database.authEmail.update.mockResolvedValue({});
    database.session.create.mockResolvedValue({ id: "session-1" });
    emailSender.sendLoginCode.mockResolvedValue("provider-message-1");

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: database },
        { provide: AuthEmailSender, useValue: emailSender },
        { provide: AUTH_CONFIG, useValue: authConfig },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it("does not send a code when the email cannot sign in", async () => {
    database.person.findUnique.mockResolvedValue(null);

    const result = await service.requestLogin("missing@example.com");

    expect(result).toEqual({ message: LOGIN_REQUEST_MESSAGE });
    expect(emailSender.sendLoginCode).not.toHaveBeenCalled();
    expect(database.loginCode.create).not.toHaveBeenCalled();
  });

  it("refuses sign-in for an Associate", async () => {
    database.person.findUnique.mockResolvedValue(
      person({
        membershipStatus: MembershipStatus.ASSOCIATE,
        accountStatus: AccountStatus.DISABLED,
      }),
    );

    await expect(
      service.verifyLogin("member@example.com", "123456", {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(database.session.create).not.toHaveBeenCalled();
  });

  it("stores only the login code hash and still answers the same way if email sending fails", async () => {
    database.person.findUnique.mockResolvedValue(activePerson());
    emailSender.sendLoginCode.mockRejectedValue(
      new Error("Resend unavailable"),
    );

    const result = await service.requestLogin(" Member@Example.com ");

    expect(result).toEqual({ message: LOGIN_REQUEST_MESSAGE });
    const createdCode = database.loginCode.create.mock.calls[0][0].data as {
      codeHash: string;
    };
    expect(createdCode.codeHash).toHaveLength(64);
    expect(
      JSON.stringify(database.loginCode.create.mock.calls[0][0]),
    ).not.toContain("Member@Example.com");
    expect(database.authEmail.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        toEmail: "member@example.com",
        type: AuthEmailType.LOGIN_CODE,
        status: AuthEmailStatus.PENDING,
      }),
    });
    expect(database.authEmail.update).toHaveBeenCalledWith({
      where: { id: "email-1" },
      data: { status: AuthEmailStatus.FAILED },
    });
  });

  it("does not send another code after the hourly limit", async () => {
    database.person.findUnique.mockResolvedValue(activePerson());
    database.loginCode.count.mockResolvedValue(5);

    await service.requestLogin("member@example.com");

    expect(emailSender.sendLoginCode).not.toHaveBeenCalled();
  });

  it("increments attempts when the code is wrong", async () => {
    database.person.findUnique.mockResolvedValue(activePerson());
    database.loginCode.findUnique.mockResolvedValue(null);
    database.loginCode.findFirst.mockResolvedValue({
      id: "code-1",
      attemptCount: 1,
      consumedAt: null,
    });

    await expect(
      service.verifyLogin("member@example.com", "000000", {}),
    ).rejects.toThrow(INVALID_CODE_MESSAGE);
    expect(database.loginCode.update).toHaveBeenCalledWith({
      where: { id: "code-1" },
      data: { attemptCount: { increment: 1 }, consumedAt: undefined },
    });
  });

  it("creates a session from a valid code without returning the stored hash", async () => {
    const code = "123456";
    database.person.findUnique.mockResolvedValue(activePerson());
    database.account.findUnique.mockResolvedValue(actorAccount());
    database.loginCode.findUnique.mockResolvedValue({
      id: "code-1",
      accountId: "account-1",
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      attemptCount: 0,
      codeHash: hashSecret(code, pepper),
    });

    const result = await service.verifyLogin("member@example.com", code, {
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(result.token).not.toBe(hashSecret(result.token, pepper));
    expect(database.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountId: "account-1",
        tokenHash: hashSecret(result.token, pepper),
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      }),
    });
    expect(result.actor).toEqual(
      expect.objectContaining({
        accountId: "account-1",
        personId: "person-1",
        fellowshipId: "DIT-1",
        onboardingCompleted: false,
        offices: ["CHAIRMAN"],
      }),
    );
  });

  it("revokes a session when the member can no longer sign in", async () => {
    database.session.findUnique.mockResolvedValue({
      id: "session-1",
      accountId: "account-1",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    database.account.findUnique.mockResolvedValue(
      actorAccount({
        accountStatus: AccountStatus.DISABLED,
        membershipStatus: MembershipStatus.ASSOCIATE,
      }),
    );

    await expect(service.resolveActor("raw-session-token")).resolves.toBeNull();
    expect(database.session.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

function activePerson() {
  return person({
    accountStatus: AccountStatus.ACTIVE,
    membershipStatus: MembershipStatus.ACTIVE,
  });
}

function person(input: {
  accountStatus: AccountStatus;
  membershipStatus: MembershipStatus;
}) {
  return {
    id: "person-1",
    email: "member@example.com",
    account: { id: "account-1", status: input.accountStatus },
    membership: {
      id: "membership-1",
      status: input.membershipStatus,
      fellowshipId: "DIT-1",
    },
  };
}

function actorAccount(
  input: {
    accountStatus: AccountStatus;
    membershipStatus: MembershipStatus;
  } = {
    accountStatus: AccountStatus.ACTIVE,
    membershipStatus: MembershipStatus.ACTIVE,
  },
) {
  return {
    id: "account-1",
    status: input.accountStatus,
    person: {
      id: "person-1",
      email: "member@example.com",
      firstName: "Asha",
      lastName: "Mollel",
      membership: {
        status: input.membershipStatus,
        fellowshipId: "DIT-1",
        onboardedAt: null,
      },
      officeAssignments: [{ office: "CHAIRMAN" }],
      ministryLeadership: [{ ministryId: "ministry-1" }],
      eventRoleAssignments: [{ eventId: "event-1", role: "EVENT_CHAIRMAN" }],
    },
  };
}
