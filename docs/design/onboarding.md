# First-login onboarding

Business rule, from `docs/analysis/requirements-analysis.md`: during onboarding a member selects one or more ministries, and after onboarding the member cannot change ministry membership. Ministries are predefined. V1 does not create or delete them through the product.

## Decisions

- Onboarding asks one question in V1: which ministries the member will serve in. More questions are added only when they are written down.
- The frontend may show onboarding as several steps. The backend accepts one final submission, because the selection is final once saved.
- The rest of the member area stays closed until onboarding is submitted. `GET /api/v1/auth/me` and the ministry list stay open so the frontend can show the onboarding screen.
- The first five officers go through the same onboarding after their first sign-in.

## Ministries that exist before anyone signs in

The predefined ministries are reference data, loaded by `npm run seed:ministries` (`scripts/seed-ministries.ts`). The seed can be run again safely. It adds missing names and does not change or remove existing rows. It does not wait for the officers' details.

V1 list:

- Praise Team
- Media Team
- Dancers
- Evangelists
- Teachers of the Word
- Instrumentalists

A new ministry is added by changing the seed list and running it again. There is no create or delete screen in V1.

## Flow

```text
Member signs in with a login code
        ↓
GET /api/v1/auth/me returns onboardingCompleted: false
        ↓
GET /api/v1/ministries/list fills the dropdown
        ↓
POST /api/v1/onboarding/complete { "ministryIds": [...] }
        ↓
Ministry memberships are saved, Membership.onboardedAt is set
        ↓
Member routes open. Later ministry changes belong to a Ministry Leader or the Chairman.
```

The submission must contain at least one ministry, each one only once, and every id must be in the list. Saving the memberships and setting `onboardedAt` happen in one transaction. A second submission is refused.

## Assumption

Onboarding is not tied to fellowship-year state. A member approved while the year is `CLOSED` can still complete it. Leader changes to ministry membership still follow the year rules in `docs/design/authorization.md`.
