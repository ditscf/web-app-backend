import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { ActorProfile } from "../actor";
import { readCookie } from "../utils/auth-cookie";
import { AUTH_CONFIG, type AuthConfig } from "../auth.config";
import { AuthService } from "../auth.service";

export interface AuthenticatedRequest extends Request {
  actor: ActorProfile;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readCookie(request.headers.cookie, this.config.cookieName);
    const actor = token ? await this.authService.resolveActor(token) : null;
    if (!actor) {
      throw new UnauthorizedException();
    }
    request.actor = actor;
    return true;
  }
}
