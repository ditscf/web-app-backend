import { BadRequestException, ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MembershipStatus } from "../../generated/prisma/client";
import { ActorProfile } from "../auth/actor";
import { AuthorizationService } from "../authorization/authorization.service";
import { DatabaseService } from "../database/database.service";
import { OnboardingService } from "./onboarding.service";

const praise = { id: "ministry-praise", name: "Praise Team" };
const media = { id: "ministry-media", name: "Media Team" };

describe("OnboardingService", () => {
  const database = {
    ministry: { findMany: vi.fn() },
    membership: { updateMany: vi.fn() },
    ministryMembership: { createMany: vi.fn() },
    $transaction: vi.fn(),
  };

  let service: OnboardingService;

  beforeEach(async () => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(
      async (callback: (tx: typeof database) => unknown) => callback(database),
    );
    database.ministry.findMany.mockResolvedValue([media, praise]);
    database.membership.updateMany.mockResolvedValue({ count: 1 });
    database.ministryMembership.createMany.mockResolvedValue({ count: 2 });

    const moduleRef = await Test.createTestingModule({
      providers: [
        OnboardingService,
        AuthorizationService,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();
    service = moduleRef.get(OnboardingService);
  });

  it("records the chosen ministries and marks onboarding complete", async () => {
    const result = await service.complete(member(), [praise.id, media.id]);

    expect(result).toEqual({
      onboardingCompleted: true,
      ministries: [media, praise],
    });
    expect(database.membership.updateMany).toHaveBeenCalledWith({
      where: {
        personId: "person-1",
        status: MembershipStatus.ACTIVE,
        onboardedAt: null,
      },
      data: { onboardedAt: expect.any(Date) },
    });
    expect(database.ministryMembership.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ personId: "person-1", ministryId: media.id }),
        expect.objectContaining({
          personId: "person-1",
          ministryId: praise.id,
        }),
      ],
    });
  });

  it("refuses a second onboarding, so the selection stays final", async () => {
    await expect(
      service.complete(member({ onboardingCompleted: true }), [praise.id]),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(database.ministryMembership.createMany).not.toHaveBeenCalled();
  });

  it("refuses a ministry that is not in the list", async () => {
    database.ministry.findMany.mockResolvedValue([praise]);

    await expect(
      service.complete(member(), [praise.id, "not-a-ministry"]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(database.membership.updateMany).not.toHaveBeenCalled();
  });

  it("writes nothing when two onboarding submissions race", async () => {
    database.ministry.findMany.mockResolvedValue([praise]);
    database.membership.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.complete(member(), [praise.id]),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(database.ministryMembership.createMany).not.toHaveBeenCalled();
  });
});

function member(overrides: Partial<ActorProfile> = {}): ActorProfile {
  return {
    accountId: "account-1",
    personId: "person-1",
    email: "member@example.com",
    firstName: "Ada",
    lastName: "Member",
    membershipStatus: MembershipStatus.ACTIVE,
    fellowshipId: "26160001",
    onboardingCompleted: false,
    offices: [],
    ministryIds: [],
    eventRoles: [],
    ...overrides,
  };
}
