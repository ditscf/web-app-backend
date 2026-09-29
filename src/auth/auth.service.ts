import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AccountStatus,
  AuthEmailStatus,
  AuthEmailType,
  MembershipStatus,
  Prisma,
} from "../../generated/prisma/client";
import { DatabaseService } from "../database/database.service";
import { ActorProfile } from "./actor";
import {
  AUTH_CONFIG,
  INVALID_CODE_MESSAGE,
  LOGIN_CODE_PATTERN,
  LOGIN_REQUEST_MESSAGE,
  type AuthConfig,
} from "./auth.config";
import { AuthEmailSender } from "./utils/auth-email.sender";
import {
  generateLoginCode,
  generateSessionToken,
  hashSecret,
} from "./utils/auth-secrets";
import { LoginRequestContext } from "./interfaces/interface";

const personWithAccess = {
  include: {
    account: true,
    membership: true,
  },
} satisfies Prisma.PersonDefaultArgs;

type PersonWithAccess = Prisma.PersonGetPayload<typeof personWithAccess>;

interface EligiblePerson extends PersonWithAccess {
  account: NonNullable<PersonWithAccess["account"]> & {
    status: typeof AccountStatus.ACTIVE;
  };
  membership: NonNullable<PersonWithAccess["membership"]> & {
    status: typeof MembershipStatus.ACTIVE;
  };
}

const accountWithActor = {
  include: {
    person: {
      include: {
        membership: true,
        officeAssignments: {
          where: {
            effectiveTo: null,
            fellowshipYear: { operativeSlot: 1 },
          },
          select: { office: true },
        },
        ministryLeadership: {
          where: { effectiveTo: null },
          select: { ministryId: true },
        },
        eventRoleAssignments: {
          where: { effectiveTo: null },
          select: { eventId: true, role: true },
        },
      },
    },
  },
} satisfies Prisma.AccountDefaultArgs;

type AccountWithActor = Prisma.AccountGetPayload<typeof accountWithActor>;

export interface VerifiedLogin {
  token: string;
  actor: ActorProfile;
}



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly emailSender: AuthEmailSender,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async requestLogin(email: string): Promise<{ message: string }> {
    const normalized = normalizeEmail(email);
    if (!isEmailAddress(normalized)) {
      throw new BadRequestException("Enter a valid email address.");
    }

    const person = await this.findPerson(normalized);
    if (!isEligible(person)) {
      return { message: LOGIN_REQUEST_MESSAGE };
    }

    const recentCount = await this.database.loginCode.count({
      where: {
        accountId: person.account.id,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentCount >= this.config.maxLoginCodesPerHour) {
      return { message: LOGIN_REQUEST_MESSAGE };
    }

    const code = generateLoginCode();
    const expiresAt = new Date(
      Date.now() + this.config.loginCodeTtlSeconds * 1000,
    );
    const authEmail = await this.database.$transaction(async (tx) => {
      await tx.loginCode.updateMany({
        where: { accountId: person.account.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      await tx.loginCode.create({
        data: {
          accountId: person.account.id,
          codeHash: hashSecret(code, this.config.pepper),
          expiresAt,
        },
      });
      return tx.authEmail.create({
        data: {
          personId: person.id,
          accountId: person.account.id,
          type: AuthEmailType.LOGIN_CODE,
          toEmail: normalized,
          status: AuthEmailStatus.PENDING,
        },
      });
    });

    try {
      const providerMessageId = await this.emailSender.sendLoginCode({
        to: normalized,
        code,
        expiresInMinutes: Math.max(
          1,
          Math.round(this.config.loginCodeTtlSeconds / 60),
        ),
        idempotencyKey: `login-code/${authEmail.id}`,
      });
      await this.database.authEmail.update({
        where: { id: authEmail.id },
        data: {
          status: AuthEmailStatus.SENT,
          sentAt: new Date(),
          providerMessageId,
        },
      });
    } catch (error: unknown) {
      this.logger.warn(`Login code email ${authEmail.id} was not sent.`);
      if (error instanceof Error) {
        this.logger.warn(error.message);
      }
      await this.database.authEmail.update({
        where: { id: authEmail.id },
        data: { status: AuthEmailStatus.FAILED },
      });
    }

    return { message: LOGIN_REQUEST_MESSAGE };
  }

  async verifyLogin(
    email: string,
    code: string,
    context: LoginRequestContext,
  ): Promise<VerifiedLogin> {
    const normalized = normalizeEmail(email);
    const submittedCode = code.trim();
    if (
      !isEmailAddress(normalized) ||
      !LOGIN_CODE_PATTERN.test(submittedCode)
    ) {
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    const person = await this.findPerson(normalized);
    if (!isEligible(person)) {
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    const now = new Date();
    const loginCode = await this.database.loginCode.findUnique({
      where: { codeHash: hashSecret(submittedCode, this.config.pepper) },
    });
    const matchesAccount = loginCode?.accountId === person.account.id;
    const isUsable =
      matchesAccount &&
      loginCode.consumedAt === null &&
      loginCode.expiresAt > now &&
      loginCode.attemptCount < this.config.maxCodeAttempts;

    if (!loginCode || !isUsable) {
      await this.registerFailedAttempt(person.account.id, now);
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }

    const token = generateSessionToken();
    const expiresAt = new Date(
      Date.now() + this.config.sessionTtlSeconds * 1000,
    );
    await this.database.$transaction(async (tx) => {
      const consumed = await tx.loginCode.updateMany({
        where: {
          id: loginCode.id,
          consumedAt: null,
          attemptCount: { lt: this.config.maxCodeAttempts },
        },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) {
        throw new UnauthorizedException(INVALID_CODE_MESSAGE);
      }
      await tx.session.create({
        data: {
          accountId: person.account.id,
          tokenHash: hashSecret(token, this.config.pepper),
          expiresAt,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent?.slice(0, 512),
        },
      });
    });

    const actor = await this.loadActor(person.account.id);
    if (!actor) {
      throw new UnauthorizedException(INVALID_CODE_MESSAGE);
    }
    return { token, actor };
  }

  async revokeSession(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }
    await this.database.session.updateMany({
      where: {
        tokenHash: hashSecret(token, this.config.pepper),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async resolveActor(token: string): Promise<ActorProfile | null> {
    const session = await this.database.session.findUnique({
      where: { tokenHash: hashSecret(token, this.config.pepper) },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }

    const actor = await this.loadActor(session.accountId);
    if (!actor) {
      await this.database.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return null;
    }

    await this.database.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
    return actor;
  }

  private async findPerson(email: string): Promise<PersonWithAccess | null> {
    return this.database.person.findUnique({
      where: { email },
      include: personWithAccess.include,
    });
  }

  private async loadActor(accountId: string): Promise<ActorProfile | null> {
    const account = await this.database.account.findUnique({
      where: { id: accountId },
      include: accountWithActor.include,
    });
    return toActor(account);
  }

  private async registerFailedAttempt(
    accountId: string,
    now: Date,
  ): Promise<void> {
    const loginCode = await this.database.loginCode.findFirst({
      where: {
        accountId,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!loginCode) {
      return;
    }

    const nextAttemptCount = loginCode.attemptCount + 1;
    await this.database.loginCode.update({
      where: { id: loginCode.id },
      data: {
        attemptCount: { increment: 1 },
        consumedAt:
          nextAttemptCount >= this.config.maxCodeAttempts ? now : undefined,
      },
    });
  }
}

function toActor(account: AccountWithActor | null): ActorProfile | null {
  const membership = account?.person.membership;
  if (
    !account ||
    account.status !== AccountStatus.ACTIVE ||
    membership?.status !== MembershipStatus.ACTIVE
  ) {
    return null;
  }

  return {
    accountId: account.id,
    personId: account.person.id,
    email: account.person.email,
    firstName: account.person.firstName,
    lastName: account.person.lastName,
    membershipStatus: membership.status,
    fellowshipId: membership.fellowshipId,
    offices: account.person.officeAssignments.map(
      (assignment) => assignment.office,
    ),
    ministryIds: account.person.ministryLeadership.map(
      (assignment) => assignment.ministryId,
    ),
    eventRoles: account.person.eventRoleAssignments.map((assignment) => ({
      eventId: assignment.eventId,
      role: assignment.role,
    })),
  };
}

function isEligible(person: PersonWithAccess | null): person is EligiblePerson {
  return (
    person?.account?.status === AccountStatus.ACTIVE &&
    person.membership?.status === MembershipStatus.ACTIVE
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
