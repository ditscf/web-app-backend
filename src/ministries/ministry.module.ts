import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MinistryController } from "./ministry.controller";
import { MinistryService } from "./ministry.service";

@Module({
  imports: [AuthModule],
  controllers: [MinistryController],
  providers: [MinistryService],
})
export class MinistryModule {}
