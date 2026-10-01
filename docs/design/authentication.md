# Authentication

Technical decision for DITSCF-MS V1 sign-in. Business rules stay in `docs/analysis/requirements-analysis.md`. This document does not change those rules.

## Problem

Active Members must sign in to a separate Next.js application. Applicants are not members yet. Associates remain in the system and do not sign in during V1. Offices, ministry leadership, and event roles change, and those changes must affect authorization immediately.

## Options considered

- A PostgreSQL session identified by an `httpOnly` cookie.
- A bearer JWT that embeds roles.
- A short access JWT plus a rotating refresh token.
- An opaque bearer token stored in the browser.
- A session that exists only in the Next.js application.

Embedding roles in a token would keep a removed Chairman, a closed event role, or a graduated member authorized until the token expired. A frontend-only session would make the separate backend unable to authenticate the caller.

## Selected approach

Sign-in is passwordless.

1. An approved member enters an email address.
2. The system checks that an account exists, the account is enabled, and membership is Active.
3. Resend sends a one-time login code to that email.
4. A correct code creates a server session.
5. The API sets an `httpOnly` cookie. The cookie value identifies the session. The session identifies the account. It does not contain roles or permissions.

Registration collects profile fields only. It does not create an account and does not collect a secret. The account is created when General Secretary and Vice General Secretary approval both succeed. Resend then sends an activation notice. That notice does not create a session. The member signs in afterward with a login code.

There is no password, password hash, password reset, or password recovery.

The frontend and the API are different origins. The production cookie is `Secure` and `SameSite=None`, is host-only on the API, and is not readable by frontend JavaScript. CORS allows the configured frontend origin with credentials. Cookie-authenticated unsafe requests must present an `Origin` that matches that frontend. `SameSite`, `Secure`, and the frontend origin are environment settings.

Login codes and session ids are stored as hashes. The code hash is an HMAC using a server-side pepper. The plaintext code exists only in the email and in the verification request.

The public login response is the same when the email is unknown, the application is still pending, or the member is an Associate.

## Security implications

- A database copy does not reveal usable session ids or login codes.
- Short code lifetime and a small attempt limit limit guessing.
- Disabling an account revokes the ability to sign in. Existing sessions are revoked when the account is disabled.
- `RESEND_API_KEY`, the sender address, and the code pepper stay in the environment.
- Resend is used for the login code and the activation notice only. Fellowship announcements are not part of this decision.

## Domain implications

Pending applicants and Associates cannot authenticate. An office, ministry leadership, or an event role does not grant sign-in. Sign-in requires Active membership and an enabled account.

## Consequences

Every authorized request reads current membership and assignments from the database. That is acceptable for one fellowship. A later non-browser client can use another session type for the same account. That credential still must not carry roles.

Sign-in is implemented in `src/auth`.

- `POST /api/v1/auth/login` accepts an email and, when that account can sign in, sends a 6-digit code through Resend. The response is the same when the email cannot sign in.
- `POST /api/v1/auth/login/verify` checks the code, stores a hashed session, and sets the `httpOnly` cookie. The token is not in the response body.
- `POST /api/v1/auth/logout` revokes that session and clears the cookie.
- `GET /api/v1/auth/me` returns the current person, membership, and current assignments. It does not grant those assignments by itself.

Unsafe requests must send an `Origin` equal to `FRONTEND_ORIGIN`. CORS allows that origin with credentials. Names and defaults are in `.env.example`. The activation email is sent when the Vice General Secretary completes approval. That email does not create a session.

## Effect on later modules

Member approval creates the account and records the activation email. Graduation to Associate disables the account. Member Access, ministry leadership, and event roles all resolve the caller from the session, then apply their own authorization rules.
