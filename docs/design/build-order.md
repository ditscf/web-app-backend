# Build order

Sign-in is already implemented. The next work follows this order.

1. Fellowship ID allocation and the authorization policy.
2. Registration and the two approval steps. `POST /api/v1/applications` creates a pending application. `GET /api/v1/applications` is the review queue for the General Secretary and the Vice General Secretary. `POST /api/v1/applications/:id/approval` records the caller's step. The second step creates the membership, allocates the Fellowship ID, creates the account, and sends the activation email.
3. Predefined ministries and first-login onboarding. `npx prisma db seed` loads the ministries. `GET /api/v1/ministries` lists them. `POST /api/v1/onboarding` saves the member's one-time selection. See `docs/design/onboarding.md`.
4. The operator script for the first fellowship year and the five officers. This waits on the real year label and the five people's details.
5. Member profile access beyond `/auth/me`: a member reads and edits only their own profile fields.
6. Ministry leader appointment and leader changes to ministry membership, then events. Each module calls the authorization policy and adds spec tests beside the code, plus a few full-database checks in `test/` for the critical path.

The operator script for a later year is the same tool as step 4, pointed at existing emails. A super admin screen can replace that script later. It is not part of this delivery.
