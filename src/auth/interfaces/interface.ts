export interface LoginRequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginCodeEmail {
  to: string;
  code: string;
  expiresInMinutes: number;
  idempotencyKey: string;
}

export interface ActivationEmail {
  to: string;
  firstName: string;
  fellowshipId: string;
  idempotencyKey: string;
}