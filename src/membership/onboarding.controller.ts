import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ActorProfile } from "../auth/actor";
import { CurrentActor } from "../auth/decorators/current-actor.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";
import { OnboardingService } from "./onboarding.service";

@Controller("api/v1/onboarding")
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post("/complete")
  @UseGuards(AuthGuard)
  complete(
    @CurrentActor() actor: ActorProfile,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.onboarding.complete(actor, body.ministryIds);
  }
}
