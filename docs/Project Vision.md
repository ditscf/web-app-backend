# DITSCF Management System — Project Vision

This is the current project vision for the DITSCF Management System.

The system is a fellowship management platform for DITSCF. It is a single source of truth for membership, ministries, leadership, events, and member access. Attendance, fellowship-wide finance, reporting, and communication remain later work.

## Person-centric membership

A person stays in the system across membership stages. History is not deleted.

1. An applicant registers and becomes Pending.
2. The General Secretary and the Vice General Secretary both take part in approval. One of them acting alone does not complete it.
3. Approval creates a Fellowship ID and the person becomes an Active Member.
4. If approval is not completed within 48 hours of submission, the application expires. The person must register again.
5. Graduation: an Event Chairman sends a graduation request to the Chairman. The person becomes an Associate only after the Chairman confirms.
6. An Associate remains in the system and does not belong to ministries or events. Associates do not sign in during the first version.

Registration requires email (the primary unique identifier), first name, last name, phone number, class, course, year of study, and date of birth. After approval, only the member may change those fields.

Applications and approvals continue while a fellowship year is CLOSED.

## Leadership

Fellowship offices: Chairman, Vice Chairman, General Secretary, Vice General Secretary, and Treasurer.

The Treasurer is an official role and has no operational work in the first version, because fellowship-wide finance is later work.

While a fellowship year is OPEN, the Chairman starts the year, creates events, appoints Ministry Leaders and event committees, and manages ministry membership and event records.

The Vice Chairman has no additional duties defined while a year is OPEN. The Vice Chairman corrects a CLOSED event and archives that event.

The Vice General Secretary’s defined duty is joint membership approval with the General Secretary.

## Ministries

Ministries already exist. They are not created or deleted in the first version. A member selects one or more during onboarding and cannot change that selection afterward.

The Chairman appoints each Ministry Leader. A Ministry Leader may add or remove a member, including a member who did not ask to join, and may see and manage membership in other ministries.

Ministry attendance and engagement scoring are later work.

## Events

Events are not hardcoded. The Chairman creates each event and appoints an Event Chairman, Event Treasurer, and Event Secretary. Those roles last for that event and are separate from fellowship offices.

Participant and attendee are the same list. Only an Active Member or an Associate may be added.

While an event is ACTIVE:

- The Event Chairman manages participants, venue, and event operations.
- The Event Treasurer manages that event’s contributions and event financial records, not fellowship-wide finance.
- The Event Secretary handles day-to-day event administration, including activities and event reporting.

Event lifecycle:

`ACTIVE → CLOSED → ARCHIVED`

The Event Chairman closes the event. While it is CLOSED, only the Vice Chairman may correct it. The Vice Chairman archives it. After that, nobody may change it.

## Fellowship year

Lifecycle:

`OPEN → CLOSED → ARCHIVED`

The Chairman starts a year. A new year does not begin immediately, because a holiday normally sits between years.

The General Secretary requests closure. The request stays pending for 12 hours. If the Chairman does not confirm it, the request expires and must be submitted again. The year does not close by itself.

The Chairman confirms CLOSED and later moves the year to ARCHIVED.

- OPEN: authorized work for the roles defined above.
- CLOSED: Ministry Leaders and Event Leaders stop operational changes. The Chairman may still correct year records. Members may view them. Registration and approval continue.
- ARCHIVED: nobody may change the data, including the Chairman. Viewing history does not allow changes.

The earlier statement that a closed year is immediately immutable is replaced by this lifecycle.

## Member access

An Active Member can view their profile, Fellowship ID, ministries, events they belong to, and records from CLOSED and ARCHIVED years. They can edit their own profile fields only.

## First version and later work

The first version is Member Management, Ministry Management, Leadership and Roles, Event Management, and Member Access, plus fellowship-year governance, closure rules, and role-based access.

Later work: attendance and engagement, fellowship-wide finance, reporting and analytics, communication, advanced ministry tools, Associate sign-in, and any further Vice Chairman or Vice General Secretary duties.
