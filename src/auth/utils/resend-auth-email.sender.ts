import { Inject, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";
import { AUTH_CONFIG, type AuthConfig } from "../auth.config";
import { AuthEmailSender, type LoginCodeEmail } from "./auth-email.sender";

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
}
