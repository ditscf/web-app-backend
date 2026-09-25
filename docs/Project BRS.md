# DITSCF Management System — Business Requirements Specification

This is the current business requirements specification for the DITSCF Management System.

The system shall provide one source of truth for fellowship membership, ministries, leadership, events, and member access, and shall preserve history.

## 1. Membership

The system shall:

- Register an applicant with email (primary unique identifier), first name, last name, phone number, class, course, year of study, and date of birth.
- Set the application to Pending.
- Require both the General Secretary and the Vice General Secretary to take part before approval is complete.
- Generate a Fellowship ID when approval is complete, and set the person to Active Member.
- Expire a Pending application 48 hours after submission if approval is not complete. The person must register again.
- Allow registration and approval while a fellowship year is OPEN or CLOSED.
- Allow only the member to change their own profile fields after approval.
- Keep membership history. Do not delete the person.

## 2. Graduation and Associate status

The system shall:

- Let an Event Chairman submit a graduation request to the Chairman.
- Change the member to Associate only after the Chairman confirms.
- Keep the Associate in the system.
- Remove the Associate from ministries and events.
- Not provide Associate sign-in in the first version.

## 3. Leadership and roles

The system shall support these offices:

- Chairman, Vice Chairman, General Secretary, Vice General Secretary, Treasurer.
- Ministry Leader, one per ministry, appointed by the Chairman.
- Event Chairman, Event Treasurer, and Event Secretary, appointed by the Chairman for one event.

While a fellowship year is OPEN, the Chairman may start the year, create events, appoint Ministry Leaders and event committees, and manage ministry membership and event records.

The Treasurer has no operational responsibility in the first version.

The Vice Chairman has no additional OPEN-year duty. The Vice Chairman may correct a CLOSED event and archive it.

The Vice General Secretary’s defined duty is joint approval with the General Secretary.

## 4. Ministry management

The system shall:

- Use ministries that already exist. Do not create or delete ministries in the first version.
- Let a member select one or more ministries during onboarding.
- Prevent the member from changing ministry membership after onboarding.
- Let a Ministry Leader add or remove a member, including a member who did not ask to join.
- Let a Ministry Leader see and manage membership in other ministries.

Ministry attendance, engagement scoring, and advanced ministry tools are out of the first version.

## 5. Event management

The system shall:

- Let the Chairman create an event and appoint the event committee.
- Treat participant and attendee as one list.
- Allow only an Active Member or an Associate to be added.
- While the event is ACTIVE, let the Event Chairman manage participants, venue, and event operations.
- Let the Event Treasurer manage that event’s contributions and event financial records, not fellowship-wide finance.
- Let the Event Secretary handle day-to-day event administration, including activities and event reporting.

Event lifecycle:

- ACTIVE: event leaders may operate the event, subject to the fellowship year being OPEN.
- CLOSED: set by the Event Chairman. Only the Vice Chairman may correct the event.
- ARCHIVED: set by the Vice Chairman. Nobody may change the event.

## 6. Fellowship year, closure, and preservation

The system shall:

- Let the Chairman start a fellowship year.
- Keep a holiday period between years. Do not open the next year immediately.
- Let the General Secretary request closure.
- Keep that request pending for 12 hours. If the Chairman does not confirm it, expire the request. Do not close the year automatically.
- Let the Chairman move the year to CLOSED, and later to ARCHIVED.

When the year is CLOSED:

- Ministry Leaders and Event Leaders cannot continue operational changes.
- The Chairman may correct CLOSED year records.
- Members may view CLOSED records.
- Registration and joint approval continue.

When the year is ARCHIVED, nobody may change the data, including the Chairman. A member may still view archived history.

## 7. Member access

The system shall give an Active Member an account from which they can view:

- their profile
- their Fellowship ID
- their ministries
- the events they belong to
- records from CLOSED and ARCHIVED fellowship years

The member may edit only their own profile fields. They shall not edit ministry membership, event membership, leadership records, closure records, or another member’s records.

## 8. First version

The first version shall implement:

1. Member Management
2. Ministry Management
3. Leadership and Roles
4. Event Management
5. Member Access

It shall also implement fellowship-year governance, closure and preservation, and the role boundaries in this document.

The first version shall not implement attendance and engagement, fellowship-wide financial management, reporting and analytics, communication, or advanced ministry-specific tools.

## 9. Success

The first version is ready for detailed module design when the rules in this document are implemented for the five modules and the cross-cutting year, closure, and access rules.
