import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "./auth.guard";

/** Runs after AuthGuard. Keeps member routes closed until first-login onboarding is submitted. */
@Injectable()
export class OnboardedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.actor?.onboardingCompleted) {
      throw new ForbiddenException("Finish onboarding first.");
    }
    return true;
  }
}
