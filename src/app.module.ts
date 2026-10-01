import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import { AuthModule } from "./auth/auth.module";
import { AuthorizationModule } from "./authorization/authorization.module";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { MembershipModule } from "./membership/membership.module";
import { MinistryModule } from "./ministries/ministry.module";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? "YOUR_APP_KEY",
      appSecret: process.env.OBSERVE_APP_SECRET ?? "YOUR_APP_SECRET",
      serviceId: process.env.OBSERVE_SERVICE_ID ?? "YOUR_SERVICE_ID",
    }),
    DatabaseModule,
    AuthModule,
    AuthorizationModule,
    MembershipModule,
    MinistryModule,
    HealthModule,
  ],
})
export class AppModule { }
