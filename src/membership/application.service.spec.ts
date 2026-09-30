import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
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
import { DatabaseService } from "../database/database.service";
import { ApplicationService } from "./application.service";

const openYear = {
  id: "year-1",
  label: "2026/2027",
  status: FellowshipYearStatus.OPEN,
  operativeSlot: 1,
  lastIssuedMemberNumber: 0,
};

const registration = {
  email: "Ada@Example.com",
  firstName: "Ada",
  lastName: "Applicant",
  phone: "0712000000",
  studyClass: "OD24",
  course: "Computer Science",
  yearOfStudy: "2",
  dateOfBirth: "2000-12-16",
};

describe("ApplicationService", () => {
  const database = {
    fellowshipYear: { findFirst: vi.fn(), update: vi.fn() },
    person: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    application: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    applicationDecision: { create: vi.fn() },
    membership: { create: vi.fn() },
    account: { create: vi.fn() },
    authEmail: { create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  };
  const emailSender = { sendLoginCode: vi.fn(), sendActivation: vi.fn() };

  let service: ApplicationService;

  beforeEach(async () => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(
      async (callback: (tx: typeof database) => unknown) => callback(database),
    );
    database.fellowshipYear.findFirst.mockResolvedValue(openYear);
    database.fellowshipYear.update.mockResolvedValue({
      ...openYear,
      lastIssuedMemberNumber: 1,
    });
    database.application.updateMany.mockResolvedValue({ count: 0 });
    database.person.findUnique.mockResolvedValue(null);
    database.person.create.mockResolvedValue({ id: "person-1" });
    database.person.update.mockResolvedValue({ id: "person-1" });
    database.application.create.mockImplementation(
      async ({ data }: { data: { submittedAt: Date; expiresAt: Date } }) => ({
        id: "application-1",
        ...data,
      }),
    );
    database.applicationDecision.create.mockResolvedValue({ id: "decision-1" });
    database.membership.create.mockResolvedValue({ id: "membership-1" });
    database.account.create.mockResolvedValue({ id: "account-new" });
    database.application.update.mockResolvedValue({});
    database.authEmail.create.mockResolvedValue({ id: "email-1" });
    database.authEmail.update.mockResolvedValue({});
    emailSender.sendActivation.mockResolvedValue("provider-1");

    const moduleRef = await Test.createTestingModule({
      providers: [
        ApplicationService,
        AuthorizationService,
        { provide: DatabaseService, useValue: database },
        { provide: AuthEmailSender, useValue: emailSender },
      ],
    }).compile();
    service = moduleRef.get(ApplicationService);
  });

  it("creates a pending application for 48 hours and does not create an account", async () => {
    const result = await service.register(registration);

    expect(result.status).toBe(ApplicationStatus.PENDING);
    expect(result.expiresAt.getTime() - result.submittedAt.getTime()).toBe(
      48 * 60 * 60 * 1000,
    );
    expect(database.person.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "ada@example.com",
        studyClass: "OD24",
        dateOfBirth: new Date("2000-12-16T00:00:00.000Z"),
      }),
    });
    expect(database.account.create).not.toHaveBeenCalled();
    expect(database.membership.create).not.toHaveBeenCalled();
  });

  it("rejects registration when there is no operative year", async () => {
    database.fellowshipYear.findFirst.mockResolvedValue(null);

    await expect(service.register(registration)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(database.person.create).not.toHaveBeenCalled();
  });

  it("rejects a second registration while the first is still pending", async () => {
    database.person.findUnique.mockResolvedValue({
      id: "person-1",
      membership: null,
      applications: [
        {
          id: "application-1",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      ],
    });

    await expect(service.register(registration)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(database.application.create).not.toHaveBeenCalled();
  });

  it("lets an expired applicant register again without a new person", async () => {
    database.person.findUnique.mockResolvedValue({
      id: "person-1",
      membership: null,
      applications: [],
    });

    await service.register(registration);

    expect(database.person.update).toHaveBeenCalled();
    expect(database.person.create).not.toHaveBeenCalled();
    expect(database.application.create).toHaveBeenCalled();
  });

  it("rejects registration for an email that already has a membership", async () => {
    database.person.findUnique.mockResolvedValue({
      id: "person-1",
      membership: { id: "membership-1" },
      applications: [],
    });

    await expect(service.register(registration)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(database.application.create).not.toHaveBeenCalled();
  });

  it("records only the General Secretary step and does not issue a Fellowship ID", async () => {
    database.application.findUnique.mockResolvedValue(pendingApplication());

    const result = await service.approve(
      officer(FellowshipOffice.GENERAL_SECRETARY),
      "application-1",
    );

    expect(result).toEqual({
      applicationId: "application-1",
      status: ApplicationStatus.PENDING,
      fellowshipId: null,
    });
    expect(database.applicationDecision.create).toHaveBeenCalledWith({
      data: {
        applicationId: "application-1",
        step: ApprovalStep.GENERAL_SECRETARY,
        approverPersonId: "officer-1",
      },
    });
    expect(database.membership.create).not.toHaveBeenCalled();
    expect(emailSender.sendActivation).not.toHaveBeenCalled();
  });

  it("refuses the Vice General Secretary until the General Secretary has recorded their step", async () => {
    database.application.findUnique.mockResolvedValue(pendingApplication());

    await expect(
      service.approve(
        officer(FellowshipOffice.VICE_GENERAL_SECRETARY),
        "application-1",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(database.membership.create).not.toHaveBeenCalled();
  });

  it("completes approval with a Fellowship ID, an account, and an activation email", async () => {
    database.application.findUnique.mockResolvedValue(
      pendingApplication([
        {
          step: ApprovalStep.GENERAL_SECRETARY,
          approverPersonId: "gs-1",
        },
      ]),
    );

    const result = await service.approve(
      officer(FellowshipOffice.VICE_GENERAL_SECRETARY, "vgs-1"),
      "application-1",
    );

    expect(result).toEqual({
      applicationId: "application-1",
      status: ApplicationStatus.APPROVED,
      fellowshipId: "26160001",
    });
    expect(database.membership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fellowshipId: "26160001",
        status: MembershipStatus.ACTIVE,
      }),
    });
    expect(database.account.create).toHaveBeenCalledWith({
      data: {
        personId: "person-1",
        status: AccountStatus.ACTIVE,
      },
    });
    expect(database.authEmail.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: AuthEmailType.ACTIVATION,
        status: AuthEmailStatus.PENDING,
        toEmail: "ada@example.com",
      }),
    });
    expect(emailSender.sendActivation).toHaveBeenCalledWith({
      to: "ada@example.com",
      firstName: "Ada",
      fellowshipId: "26160001",
      idempotencyKey: "activation/email-1",
    });
    expect(emailSender.sendActivation.mock.calls[0][0]).not.toHaveProperty(
      "code",
    );
  });

  it("keeps the membership when the activation email fails", async () => {
    database.application.findUnique.mockResolvedValue(
      pendingApplication([
        {
          step: ApprovalStep.GENERAL_SECRETARY,
          approverPersonId: "gs-1",
        },
      ]),
    );
    emailSender.sendActivation.mockRejectedValue(new Error("provider down"));

    const result = await service.approve(
      officer(FellowshipOffice.VICE_GENERAL_SECRETARY, "vgs-1"),
      "application-1",
    );

    expect(result.fellowshipId).toBe("26160001");
    expect(database.authEmail.update).toHaveBeenCalledWith({
      where: { id: "email-1" },
      data: { status: AuthEmailStatus.FAILED },
    });
  });

  it("does not let the same person record both steps", async () => {
    database.application.findUnique.mockResolvedValue(
      pendingApplication([
        {
          step: ApprovalStep.GENERAL_SECRETARY,
          approverPersonId: "officer-1",
        },
      ]),
    );

    await expect(
      service.approve(
        officer(FellowshipOffice.VICE_GENERAL_SECRETARY),
        "application-1",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(database.membership.create).not.toHaveBeenCalled();
  });

  it("refuses a chairman and does not reveal the application", async () => {
    await expect(
      service.approve(officer(FellowshipOffice.CHAIRMAN), "application-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(database.application.findUnique).not.toHaveBeenCalled();
  });

  it("expires a registration that is past 48 hours instead of approving it", async () => {
    database.application.findUnique.mockResolvedValue(
      pendingApplication([], new Date(Date.now() - 1000)),
    );

    await expect(
      service.approve(
        officer(FellowshipOffice.GENERAL_SECRETARY),
        "application-1",
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(database.application.update).toHaveBeenCalledWith({
      where: { id: "application-1" },
      data: expect.objectContaining({ status: ApplicationStatus.EXPIRED }),
    });
    expect(database.applicationDecision.create).not.toHaveBeenCalled();
  });
});

function officer(
  office: FellowshipOffice,
  personId = "officer-1",
): ActorProfile {
  return {
    accountId: "account-officer",
    personId,
    email: "officer@example.com",
    firstName: "Officer",
    lastName: "Holder",
    membershipStatus: MembershipStatus.ACTIVE,
    fellowshipId: "26010001",
    onboardingCompleted: true,
    offices: [office],
    ministryIds: [],
    eventRoles: [],
  };
}

function pendingApplication(
  decisions: { step: ApprovalStep; approverPersonId: string }[] = [],
  expiresAt = new Date(Date.now() + 60 * 60 * 1000),
) {
  return {
    id: "application-1",
    personId: "person-1",
    status: ApplicationStatus.PENDING,
    submittedAt: new Date("2026-09-01T00:00:00.000Z"),
    expiresAt,
    person: {
      id: "person-1",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Applicant",
      phone: "0712000000",
      studyClass: "OD24",
      course: "Computer Science",
      yearOfStudy: "2",
      dateOfBirth: new Date("2000-12-16T00:00:00.000Z"),
    },
    decisions,
  };
}
