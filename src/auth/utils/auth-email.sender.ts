export interface LoginCodeEmail {
  to: string;
  code: string;
  expiresInMinutes: number;
  idempotencyKey: string;
}

export abstract class AuthEmailSender {
  abstract sendLoginCode(email: LoginCodeEmail): Promise<string>;
}
