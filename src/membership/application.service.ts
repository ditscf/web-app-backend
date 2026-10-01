import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountStatus,
  ApplicationStatus,
  ApprovalStep,
  AuthEmailStatus,
  AuthEmailType,
  FellowshipOffice,
  FellowshipYearStatus,
  MembershipStatus,
} from "../../generated/prisma/client";
import { ActorProfile } from "../auth/actor";
import { AuthEmailSender } from "../auth/utils/auth-email.sender";
import { AuthorizationService } from "../authorization/authorization.service";
import type { AuthorizationActor } from "../authorization/authorization.policy";
import { DatabaseService } from "../database/database.service";
import {
  birthDay,
  formatFellowshipId,
  fellowshipYearStart,
} from "./fellowship-id";
import type { RegistrationInput, PendingApplicationView } from "./interfaces/interface";

const PENDING_WINDOW_MS = 48 * 60 * 60 * 1000;

export interface RegistrationResult {
  applicationId: string;
  status: typeof ApplicationStatus.PENDING;
  submittedAt: Date;
  expiresAt: Date;
}

export interface ApprovalResult {
  applicationId: string;
  status: typeof ApplicationStatus.PENDING | typeof ApplicationStatus.APPROVED;
  fellowshipId: string | null;
}

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly authorization: AuthorizationService,
    private readonly emailSender: AuthEmailSender,
  ) { }

  async register(input: RegistrationInput): Promise<RegistrationResult> {
    const now = new Date();
    const email = normalizeEmail(input.email);
    if (!isEmailAddress(email)) {
      throw new BadRequestException("Enter a valid email address.");
    }
    const profile = {
      firstName: requiredText(input.firstName, "First name"),
      lastName: requiredText(input.lastName, "Last name"),
      phone: requiredText(input.phone, "Phone"),
      studyClass: requiredText(input.studyClass, "Class"),
      course: requiredText(input.course, "Course"),
      yearOfStudy: requiredText(input.yearOfStudy, "Year of study"),
      dateOfBirth: parseDateOfBirth(input.dateOfBirth, now),
    };

    const year = await this.operativeYear();
    if (!year || !yearAcceptsApplications(year.status)) {
      throw new ConflictException("Registration is not open.");
    }

    await this.expireDueApplications(now);

    try {
      return await this.database.$transaction(async (tx) => {
        const existing = await tx.person.findUnique({
          where: { email },
          include: {
            membership: { select: { id: true } },
            applications: {
              where: { status: ApplicationStatus.PENDING },
              select: { id: true, expiresAt: true },
            },
          },
        });
        if (existing?.membership) {
          throw new ConflictException(
            "This email already belongs to a member.",
          );
        }

        const pending = existing?.applications[0];
        if (pending && pending.expiresAt > now) {
          throw new ConflictException(
            "A registration for this email is already waiting for approval.",
          );
        }
        if (pending) {
          await tx.application.update({
            where: { id: pending.id },
            data: { status: ApplicationStatus.EXPIRED, expiredAt: now },
          });
        }

        const person = existing
          ? await tx.person.update({
            where: { id: existing.id },
            data: profile,
          })
          : await tx.person.create({
            data: { email, ...profile },
          });

        const application = await tx.application.create({
          data: {
            personId: person.id,
            status: ApplicationStatus.PENDING,
            submittedAt: now,
            expiresAt: new Date(now.getTime() + PENDING_WINDOW_MS),
          },
        });
        return {
          applicationId: application.id,
          status: ApplicationStatus.PENDING,
          submittedAt: application.submittedAt,
          expiresAt: application.expiresAt,
        };
      });
    } catch (error: unknown) {
      if (isUniqueConflict(error)) {
        throw new ConflictException(
          "A registration for this email is already waiting for approval.",
        );
      }
      throw error;
    }
  }

  async listPending(
    actor: ActorProfile,
  ): Promise<{ applications: PendingApplicationView[] }> {
    const now = new Date();
    const year = await this.operativeYear();
    const decision = this.authorization.decide(
      toAuthorizationActor(actor),
      "member.reviewApplications",
      { yearStatus: year?.status ?? null },
    );
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }

    await this.expireDueApplications(now);
    const applications = await this.database.application.findMany({
      where: {
        status: ApplicationStatus.PENDING,
        expiresAt: { gt: now },
      },
      orderBy: { submittedAt: "asc" },
      take: 100,
      include: {
        person: true,
        decisions: { select: { step: true } },
      },
    });

    return {
      applications: applications.map((application) => ({
        applicationId: application.id,
        submittedAt: application.submittedAt,
        expiresAt: application.expiresAt,
        gsApprovalRecorded: application.decisions.some(
          (item) => item.step === ApprovalStep.GENERAL_SECRETARY,
        ),
        applicant: {
          email: application.person.email,
          firstName: application.person.firstName,
          lastName: application.person.lastName,
          phone: application.person.phone,
          class: application.person.studyClass,
          course: application.person.course,
          yearOfStudy: application.person.yearOfStudy,
          dateOfBirth: application.person.dateOfBirth
            .toISOString()
            .slice(0, 10),
        },
      })),
    };
  }

  async approve(
    actor: ActorProfile,
    applicationId: string,
  ): Promise<ApprovalResult> {
    const now = new Date();
    await this.expireDueApplications(now);
    const year = await this.operativeYear();
    const authorizationActor = toAuthorizationActor(actor);
    const isGs = actor.offices.includes(FellowshipOffice.GENERAL_SECRETARY);
    const isVgs = actor.offices.includes(
      FellowshipOffice.VICE_GENERAL_SECRETARY,
    );

    if (isGs && isVgs) {
      throw new ForbiddenException(
        "The same person cannot record both approval steps.",
      );
    }
    if (!isGs && !isVgs) {
      const decision = this.authorization.decide(
        authorizationActor,
        "member.approveAsGs",
        { yearStatus: year?.status ?? null },
      );
      throw new ForbiddenException(
        decision.allowed
          ? "Only the General Secretary can record that approval, and only while the year is open or closed."
          : decision.reason,
      );
    }

    const application = await this.database.application.findUnique({
      where: { id: applicationId },
      include: { person: true, decisions: true },
    });
    if (!application) {
      throw new NotFoundException("Registration not found.");
    }
    if (
      application.status === ApplicationStatus.EXPIRED ||
      (application.status === ApplicationStatus.PENDING &&
        application.expiresAt <= now)
    ) {
      if (application.status === ApplicationStatus.PENDING) {
        await this.database.application.update({
          where: { id: application.id },
          data: { status: ApplicationStatus.EXPIRED, expiredAt: now },
        });
      }
      throw new ConflictException(
        "This registration has expired. The person must register again.",
      );
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException(
        "This registration is not waiting for approval.",
      );
    }

    const gsDecision = application.decisions.find(
      (decision) => decision.step === ApprovalStep.GENERAL_SECRETARY,
    );

    if (isGs && !gsDecision) {
      this.assertAllowed(
        authorizationActor,
        "member.approveAsGs",
        year?.status ?? null,
        false,
      );
      await this.recordDecision(
        application.id,
        ApprovalStep.GENERAL_SECRETARY,
        actor.personId,
      );
      return {
        applicationId: application.id,
        status: ApplicationStatus.PENDING,
        fellowshipId: null,
      };
    }

    if (isGs && gsDecision) {
      throw new ConflictException(
        "The General Secretary has already recorded this approval.",
      );
    }

    if (gsDecision?.approverPersonId === actor.personId) {
      throw new ForbiddenException(
        "The same person cannot record both approval steps.",
      );
    }
    this.assertAllowed(
      authorizationActor,
      "member.approveAsVgs",
      year?.status ?? null,
      gsDecision !== undefined,
    );

    const completed = await this.completeApproval(
      application.id,
      actor.personId,
      now,
    );
    await this.sendActivation(completed);
    return {
      applicationId: application.id,
      status: ApplicationStatus.APPROVED,
      fellowshipId: completed.fellowshipId,
    };
  }

  private async completeApproval(
    applicationId: string,
    approverPersonId: string,
    now: Date,
  ): Promise<{
    fellowshipId: string;
    authEmailId: string;
    toEmail: string;
    firstName: string;
  }> {
    try {
      return await this.database.$transaction(async (tx) => {
        const current = await tx.application.findUnique({
          where: { id: applicationId },
          include: { person: true, decisions: true },
        });
        if (
          !current ||
          current.status !== ApplicationStatus.PENDING ||
          current.expiresAt <= now
        ) {
          throw new ConflictException(
            "This registration is not waiting for approval.",
          );
        }

        const gsDecision = current.decisions.find(
          (decision) => decision.step === ApprovalStep.GENERAL_SECRETARY,
        );
        if (!gsDecision) {
          throw new ForbiddenException(
            "The General Secretary records their approval first.",
          );
        }
        if (gsDecision.approverPersonId === approverPersonId) {
          throw new ForbiddenException(
            "The same person cannot record both approval steps.",
          );
        }

        await tx.applicationDecision.create({
          data: {
            applicationId: current.id,
            step: ApprovalStep.VICE_GENERAL_SECRETARY,
            approverPersonId,
          },
        });

        const updatedYear = await tx.fellowshipYear.update({
          where: { operativeSlot: 1 },
          data: { lastIssuedMemberNumber: { increment: 1 } },
        });
        if (!yearAcceptsApplications(updatedYear.status)) {
          throw new ForbiddenException(
            "Only the Vice General Secretary can record the second approval, and only while the year is open or closed.",
          );
        }

        const fellowshipId = formatFellowshipId(
          fellowshipYearStart(updatedYear.label),
          birthDay(current.person.dateOfBirth),
          updatedYear.lastIssuedMemberNumber,
        );
        await tx.membership.create({
          data: {
            personId: current.personId,
            applicationId: current.id,
            status: MembershipStatus.ACTIVE,
            fellowshipId,
            activatedAt: now,
          },
        });
        const account = await tx.account.create({
          data: {
            personId: current.personId,
            status: AccountStatus.ACTIVE,
          },
        });
        await tx.application.update({
          where: { id: current.id },
          data: {
            status: ApplicationStatus.APPROVED,
            approvedAt: now,
          },
        });
        const authEmail = await tx.authEmail.create({
          data: {
            personId: current.personId,
            accountId: account.id,
            type: AuthEmailType.ACTIVATION,
            toEmail: current.person.email,
            status: AuthEmailStatus.PENDING,
          },
        });

        return {
          fellowshipId,
          authEmailId: authEmail.id,
          toEmail: current.person.email,
          firstName: current.person.firstName,
        };
      });
    } catch (error: unknown) {
      if (isUniqueConflict(error)) {
        throw new ConflictException("This approval step is already recorded.");
      }
      throw error;
    }
  }

  private async sendActivation(completed: {
    fellowshipId: string;
    authEmailId: string;
    toEmail: string;
    firstName: string;
  }): Promise<void> {
    try {
      const providerMessageId = await this.emailSender.sendActivation({
        to: completed.toEmail,
        firstName: completed.firstName,
        fellowshipId: completed.fellowshipId,
        idempotencyKey: `activation/${completed.authEmailId}`,
      });
      await this.database.authEmail.update({
        where: { id: completed.authEmailId },
        data: {
          status: AuthEmailStatus.SENT,
          sentAt: new Date(),
          providerMessageId,
        },
      });
    } catch (error: unknown) {
      this.logger.warn(
        `Activation email ${completed.authEmailId} was not sent.`,
      );
      if (error instanceof Error) {
        this.logger.warn(error.message);
      }
      await this.database.authEmail.update({
        where: { id: completed.authEmailId },
        data: { status: AuthEmailStatus.FAILED },
      });
    }
  }

  private async recordDecision(
    applicationId: string,
    step: ApprovalStep,
    approverPersonId: string,
  ): Promise<void> {
    try {
      await this.database.applicationDecision.create({
        data: { applicationId, step, approverPersonId },
      });
    } catch (error: unknown) {
      if (isUniqueConflict(error)) {
        throw new ConflictException("This approval step is already recorded.");
      }
      throw error;
    }
  }

  private assertAllowed(
    actor: AuthorizationActor,
    action: "member.approveAsGs" | "member.approveAsVgs",
    yearStatus: FellowshipYearStatus | null,
    gsApprovalRecorded: boolean,
  ): void {
    const decision = this.authorization.decide(actor, action, {
      yearStatus,
      gsApprovalRecorded,
    });
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }
  }

  private operativeYear() {
    return this.database.fellowshipYear.findFirst({
      where: { operativeSlot: 1 },
    });
  }

  private async expireDueApplications(now: Date): Promise<void> {
    await this.database.application.updateMany({
      where: {
        status: ApplicationStatus.PENDING,
        expiresAt: { lte: now },
      },
      data: {
        status: ApplicationStatus.EXPIRED,
        expiredAt: now,
      },
    });
  }
}

function toAuthorizationActor(actor: ActorProfile): AuthorizationActor {
  return {
    personId: actor.personId,
    membershipStatus: actor.membershipStatus,
    offices: actor.offices,
    ministryIds: actor.ministryIds,
    eventRoles: actor.eventRoles,
  };
}

function yearAcceptsApplications(status: FellowshipYearStatus): boolean {
  return (
    status === FellowshipYearStatus.OPEN ||
    status === FellowshipYearStatus.CLOSED
  );
}

function requiredText(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new BadRequestException(`${label} is required.`);
  }
  return trimmed;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseDateOfBirth(value: string, now: Date): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new BadRequestException("Enter a date of birth as YYYY-MM-DD.");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException("Enter a real date of birth.");
  }
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  if (date > today) {
    throw new BadRequestException("Date of birth cannot be in the future.");
  }
  return date;
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
