# Build order

Sign-in is already implemented. The next work follows this order.

1. Fellowship ID allocation and the authorization policy.
2. Registration and the two approval steps. `POST /api/v1/applications/new` creates a pending application. `GET /api/v1/applications/list` is the review queue for the General Secretary and the Vice General Secretary. `POST /api/v1/applications/:applicationId/approval` records the caller's step. The second step creates the membership, allocates the Fellowship ID, creates the account, and sends the activation email.
3. Predefined ministries and first-login onboarding. `npm run seed:ministries` loads the ministries. `GET /api/v1/ministries/list` lists them. `POST /api/v1/onboarding/complete` saves the member's one-time selection. See `docs/design/onboarding.md`.
4. The operator script for a fellowship year and its five officers: `npm run open-year -- <file>`. See `docs/design/handover.md`. It runs with dummy data today. Real officer data is still needed for production.
5. Member profile access beyond `/auth/me`: a member reads and edits only their own profile fields.
6. Ministry leader appointment and leader changes to ministry membership, then events. Each module calls the authorization policy and adds spec tests beside the code, plus a few full-database checks in `test/` for the critical path.

A super admin screen can replace the open-year script later. It is not part of this delivery.

## Local scripts

- `npm run clear-db` empties every table except the migration history. It refuses to run when `NODE_ENV` is `production`. Run `npm run seed:ministries` afterward.
- `npm run seed:ministries` adds missing predefined ministries. It can be run again safely.
- `npm run open-year -- scripts/data/first-year.example.json` opens the first year with the dummy officers.
