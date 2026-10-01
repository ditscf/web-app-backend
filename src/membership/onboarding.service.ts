import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { MembershipStatus } from "../../generated/prisma/client";
import { ActorProfile } from "../auth/actor";
import { AuthorizationService } from "../authorization/authorization.service";
import { DatabaseService } from "../database/database.service";
import { OnboardingResult } from "./interfaces/interface";


@Injectable()
export class OnboardingService {
  constructor(
    private readonly database: DatabaseService,
    private readonly authorization: AuthorizationService,
  ) {}

  async complete(
    actor: ActorProfile,
    ministryIds: string[],
  ): Promise<OnboardingResult> {
    if (actor.onboardingCompleted) {
      throw new ConflictException("Onboarding is already complete.");
    }
    const decision = this.authorization.decide(
      actor,
      "member.completeOnboarding",
      {
        yearStatus: null,
        resourcePersonId: actor.personId,
        onboardingCompleted: actor.onboardingCompleted,
      },
    );
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason);
    }

    const selectedIds = [...new Set(ministryIds)];
    if (selectedIds.length === 0) {
      throw new BadRequestException("Choose at least one ministry.");
    }
    const ministries = await this.database.ministry.findMany({
      where: { id: { in: selectedIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    if (ministries.length !== selectedIds.length) {
      throw new BadRequestException("Choose ministries from the list.");
    }

    const now = new Date();
    await this.database.$transaction(async (tx) => {
      const marked = await tx.membership.updateMany({
        where: {
          personId: actor.personId,
          status: MembershipStatus.ACTIVE,
          onboardedAt: null,
        },
        data: { onboardedAt: now },
      });
      if (marked.count !== 1) {
        throw new ConflictException("Onboarding is already complete.");
      }
      await tx.ministryMembership.createMany({
        data: ministries.map((ministry) => ({
          personId: actor.personId,
          ministryId: ministry.id,
          effectiveFrom: now,
        })),
      });
    });

    return { onboardingCompleted: true, ministries };
  }
}
