import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthorizationModule } from "../authorization/authorization.module";
import { ApplicationController } from "./application.controller";
import { ApplicationService } from "./application.service";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [ApplicationController, OnboardingController],
  providers: [ApplicationService, OnboardingService],
})
export class MembershipModule {}
