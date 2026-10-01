import { Injectable } from "@nestjs/common";
import {
  decide,
  type AuthorizationAction,
  type AuthorizationActor,
  type AuthorizationDecision,
  type AuthorizationSubject,
} from "./authorization.policy";

@Injectable()
export class AuthorizationService {
  decide(
    actor: AuthorizationActor,
    action: AuthorizationAction,
    subject: AuthorizationSubject,
  ): AuthorizationDecision {
    return decide(actor, action, subject);
  }
}
