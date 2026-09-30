import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ActorProfile } from "../auth/actor";
import { CurrentActor } from "../auth/decorators/current-actor.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { OnboardedGuard } from "../auth/guards/onboarded.guard";
import { ApplicationService } from "./application.service";
import { RegisterApplicationDto } from "./dto/register-application.dto";

@Controller("api/v1/applications")
export class ApplicationController {
  constructor(private readonly applications: ApplicationService) {}

  @Post("/new")
  register(@Body() body: RegisterApplicationDto) {
    return this.applications.register({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      studyClass: body.class,
      course: body.course,
      yearOfStudy: body.yearOfStudy,
      dateOfBirth: body.dateOfBirth,
    });
  }

  @Get("/list")
  @UseGuards(AuthGuard, OnboardedGuard)
  list(@CurrentActor() actor: ActorProfile) {
    return this.applications.listPending(actor);
  }

  @Post(":applicationId/approval")
  @UseGuards(AuthGuard, OnboardedGuard)
  approve(
    @CurrentActor() actor: ActorProfile,
    @Param("applicationId", ParseUUIDPipe) applicationId: string,
  ) {
    return this.applications.approve(actor, applicationId);
  }
}
