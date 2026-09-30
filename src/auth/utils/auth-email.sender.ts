import type { LoginCodeEmail, ActivationEmail } from "../interfaces/interface";

export abstract class AuthEmailSender {
  abstract sendLoginCode(email: LoginCodeEmail): Promise<string>;
  abstract sendActivation(email: ActivationEmail): Promise<string>;
}
