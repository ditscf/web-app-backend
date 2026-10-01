import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guard";
import { MinistryService } from "./ministry.service";

@Controller("api/v1/ministries")
export class MinistryController {
  constructor(private readonly ministries: MinistryService) { }

  @Get("/list")
  @UseGuards(AuthGuard)
  list() {
    return this.ministries.list();
  }
}
