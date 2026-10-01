import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "../database/database.module";
import { AUTH_CONFIG, loadAuthConfig } from "./auth.config";
import { AuthController } from "./auth.controller";
import { AuthEmailSender } from "./utils/auth-email.sender";
import { AuthService } from "./auth.service";
import { OriginGuard } from "./guards/origin.guard";
import { ResendAuthEmailSender } from "./utils/resend-auth-email.sender";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_CONFIG,
      inject: [ConfigService],
      useFactory: loadAuthConfig,
    },
    {
      provide: AuthEmailSender,
      useClass: ResendAuthEmailSender,
    },
    {
      provide: APP_GUARD,
      useClass: OriginGuard,
    },
  ],
  exports: [AuthService, AUTH_CONFIG, AuthEmailSender],
})
export class AuthModule {}
