import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { AUTH_CONFIG, type AuthConfig } from "../auth.config";
import {
  type ActivationEmail,
  type LoginCodeEmail,
} from "../interfaces/interface";
import { AuthEmailSender } from "./auth-email.sender";

@Injectable()
export class ResendAuthEmailSender extends AuthEmailSender {
  private readonly logger = new Logger(ResendAuthEmailSender.name);
  private readonly resend: Resend;

  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {
    super();
    this.resend = new Resend(config.resendApiKey);
  }

  async sendLoginCode(email: LoginCodeEmail): Promise<string> {
    const { data, error } = await this.resend.emails.send(
      {
        from: this.config.emailFrom,
        to: [email.to],
        subject: "Your DITSCF sign-in code",
        text: [
          `Your DITSCF sign-in code is ${email.code}.`,
          `It expires in ${email.expiresInMinutes} minutes.`,
          "If you did not request this code, you can ignore this email.",
        ].join("\n"),
      },
      { idempotencyKey: email.idempotencyKey },
    );

    if (error || !data) {
      this.logger.warn(
        `Resend rejected a login code email: ${error?.message ?? "no message id"}`,
      );
      throw new Error("Login code email was not accepted.");
    }

    return data.id;
  }

  async sendActivation(email: ActivationEmail): Promise<string> {
    const { data, error } = await this.resend.emails.send(
      {
        from: this.config.emailFrom,
        to: [email.to],
        subject: "Your DITSCF membership is active",
        text: [
          `Hello ${email.firstName},`,
          "",
          "Your DITSCF membership is active.",
          `Your Fellowship ID is ${email.fellowshipId}.`,
          "",
          "Sign in with this email address to receive a login code.",
          "This message does not sign you in.",
        ].join("\n"),
      },
      { idempotencyKey: email.idempotencyKey },
    );

    if (error || !data) {
      this.logger.warn(
        `Resend rejected an activation email: ${error?.message ?? "no message id"}`,
      );
      throw new Error("Activation email was not accepted.");
    }

    return data.id;
  }
}
