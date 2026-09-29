import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ActorProfile } from "./actor";
import { readCookie, sessionCookieOptions } from "./utils/auth-cookie";
import { AUTH_CONFIG, type AuthConfig } from "./auth.config";
import { CurrentActor } from "./decorators/current-actor.decorator";
import { RequestLoginDto, VerifyLoginDto } from "./dto/auth.dto";
import { AuthGuard } from "./guards/auth.guard";
import { AuthService } from "./auth.service";

@Controller("api/v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Post("login")
  requestLogin(@Body() body: RequestLoginDto): Promise<{ message: string }> {
    return this.authService.requestLogin(body.email);
  }

  @Post("login/verify")
  async verifyLogin(
    @Body() body: VerifyLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ActorProfile> {
    const verified = await this.authService.verifyLogin(body.email, body.code, {
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
    });
    response.cookie(
      this.config.cookieName,
      verified.token,
      sessionCookieOptions(this.config),
    );
    return verified.actor;
  }

  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.revokeSession(
      readCookie(request.headers.cookie, this.config.cookieName),
    );
    response.clearCookie(
      this.config.cookieName,
      sessionCookieOptions(this.config),
    );
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentActor() actor: ActorProfile): ActorProfile {
    return actor;
  }
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
