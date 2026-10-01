# Decisions made while preparing delivery

These decisions sit on top of `docs/analysis/requirements-analysis.md` and the identity model. They came out of the handover and Fellowship ID discussion. They are the rules to build against.

## Officers are people who already exist

The five office titles are fixed: Chairman, Vice Chairman, General Secretary, Vice General Secretary, and Treasurer. The people change each fellowship year.

A person who was Vice General Secretary last year and Chairman this year keeps the same person record, the same account, and the same Fellowship ID. The new year adds one office assignment. Last year's assignment stays as history.

Reserved number ranges for leaders are not used. The Fellowship ID does not encode an office. Leaders are not left out of the member sequence. They are members, and they sign in the same way as other Active Members.

## Who opens a year

This delivery has no in-app super admin. Sign-in still requires an Active Member. A later super admin is a separate account, not a sixth fellowship office and not a special Fellowship ID. When that account is added, the authorization policy gains an explicit check before the office rules. It does not replace the Chairman, and it does not get its powers by holding every office.

The first year and its five officers are created by the operator script `npm run open-year -- <file>`. The predefined ministries are loaded separately by `npm run seed:ministries`, described in `docs/design/onboarding.md`, so they exist before anyone signs in. Those first officers must include a General Secretary and a Vice General Secretary who are different people, because nobody else can approve members yet.

After a year is archived, the same script opens the next year. It looks up five existing Active Members by email and attaches them to the five offices. It does not insert a second person when the email already exists. That script is the handover. It is not re-run on every application start, and it is not an election module.

## The open-year script

Input is a JSON file with `year_label` and exactly five `officers`. Each officer has an `office` (`CHAIRMAN`, `VICE_CHAIRMAN`, `GENERAL_SECRETARY`, `VICE_GENERAL_SECRETARY`, or `TREASURER`) and the registration fields `email`, `first_name`, `last_name`, `phone`, `class`, `course`, `year_of_study`, and `date_of_birth` (`YYYY-MM-DD`). `scripts/data/first-year.example.json` holds dummy data. Real officer files are named `*.local.json` in that folder and are not committed.

The script works in one transaction. It refuses to run when:

- a fellowship year is still `OPEN` or `CLOSED`, or a year with the same label exists;
- an office is missing or listed twice, or two officers share an email;
- an existing email is not an Active Member with an enabled account;
- a later year names someone who is not a member yet.

In the first year only, an officer who does not exist yet is created as an Active Member with an enabled account and a Fellowship ID from the new year's sequence. Their application is stored as `APPROVED` with no approval decision rows, because no General Secretary or Vice General Secretary existed to approve them. An approved application with no decisions therefore means an officer created by this script.

The script does not send activation emails. Officers sign in with a login code, then complete onboarding like every other member.

Running it again after success is refused, because the year it opened is still operative.

Once the year is open, fellowship duties belong to those officers. The operator script does not approve members, edit profiles, or change events.

## Approval order

Both officers are still required, and they must be different people. The General Secretary records their step first. The Vice General Secretary's step is accepted only after that. Neither step alone makes the applicant an Active Member.

## What is still data, not a design choice

The example file uses dummy officers and assigns offices in the order they were supplied. The real year label, the real five officers, and who holds which office must be supplied in a `*.local.json` file before production use.
