import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActorProfile } from "../actor";
import type { AuthenticatedRequest } from "../guards/auth.guard";

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActorProfile => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.actor;
  },
);
