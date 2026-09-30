# Decisions made while preparing delivery

These decisions sit on top of `docs/analysis/requirements-analysis.md` and the identity model. They came out of the handover and Fellowship ID discussion. They are the rules to build against.

## Officers are people who already exist

The five office titles are fixed: Chairman, Vice Chairman, General Secretary, Vice General Secretary, and Treasurer. The people change each fellowship year.

A person who was Vice General Secretary last year and Chairman this year keeps the same person record, the same account, and the same Fellowship ID. The new year adds one office assignment. Last year's assignment stays as history.

Reserved number ranges for leaders are not used. The Fellowship ID does not encode an office. Leaders are not left out of the member sequence. They are members, and they sign in the same way as other Active Members.

## Who opens a year

This delivery has no in-app super admin. Sign-in still requires an Active Member. A later super admin is a separate account, not a sixth fellowship office and not a special Fellowship ID. When that account is added, the authorization policy gains an explicit check before the office rules. It does not replace the Chairman, and it does not get its powers by holding every office.

The first year and its five officers are created by an operator script. The predefined ministries are loaded separately by `npx prisma db seed`, described in `docs/design/onboarding.md`, so they exist before anyone signs in. Those first officers must include a General Secretary and a Vice General Secretary who are different people, because nobody else can approve members yet.

After a year is archived, the same kind of script opens the next year. It looks up five existing Active Members by email and attaches them to the five offices. It does not insert a second person when the email already exists. That script is the handover. It is not re-run on every application start, and it is not an election module.

Once the year is open, fellowship duties belong to those officers. The operator script does not approve members, edit profiles, or change events.

## Approval order

Both officers are still required, and they must be different people. The General Secretary records their step first. The Vice General Secretary's step is accepted only after that. Neither step alone makes the applicant an Active Member.

## What is still data, not a design choice

The script cannot be filled in until the current year label and the five officers' registration details are supplied: email, first name, last name, phone, class, course, year of study, and date of birth.
