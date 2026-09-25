The two documents agree on a person-centric fellowship platform with strict closure and history rules. They differ on what belongs in the first version, especially communication and ministry management.

The sections below record what those documents say. Team decisions made after that reading are in [Confirmed team decisions](#confirmed-team-decisions-v1). Where a decision supersedes a document, the decision is the current rule and the document conflict is identified there.

Sources used: `docs/Project Vision.md` (project overview) and `docs/Project BRS.md` (business requirements). The Vision document is the detailed narrative. The BRS is a shorter list of “shall” statements and success criteria. Where they disagree, both are recorded below. Nothing here is a technical decision.

---

## 1. System purpose and problem being solved

**Explicitly stated**

DITSCF Management System is a Fellowship Management System. Its purpose is to digitize and centralize fellowship operations so leadership can manage membership, attendance, events, finances, communication, and reporting from one source of truth.

The BRS states the same objective in operational terms: improve administration, accountability, communication, reporting, and historical record keeping, and reduce dependence on manual records, spreadsheets, paper, and fragmented communication.

Current practice, as described in the Vision document, is a mix of WhatsApp groups, paper records, spreadsheets, Google Forms, and manual follow-up. The stated problems are scattered information, weak attendance trends, manual member verification, limited engagement visibility, weak tracking of event contributions and pledges, missing history across leadership changes, and slow reporting and follow-up.

The longer-term aim is an institutional record: preserve fellowship history, improve accountability, reduce administrative work, and give leadership accurate data. The current phase is system design, governance rules, and requirements gathering, before implementation.

Stated benefits and success criteria match that aim: centralized records, digitized leadership workflows, operational attendance, finance, and events, available reporting, preserved history, and effective use by leadership and members.

**Reasonable interpretation**

The platform is meant to become the operational system of record for fellowship administration. Existing channels are the problem being replaced in those workflows. The documents do not say those channels must be shut down.

**Unknown / needs clarification**

- What “DITSCF” stands for, and the organizational boundary of the fellowship, are not defined.
- Scale is unknown: members, sessions per week, events per year, number of leaders.
- There is no statement of whether non-fellowship people (visitors, guests, partner churches) are in scope.
- Success criteria are qualitative. No measurable acceptance thresholds are defined.

---

## 2. Actors and their responsibilities

**Explicitly stated**

| Actor                              | Stated responsibility                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicant / prospective member     | Registers. Status becomes Pending.                                                                                                                   |
| General Secretary                  | Reviews and approves membership (with Vice General Secretary).                                                                                       |
| Vice General Secretary             | Same approval authority as the General Secretary.                                                                                                    |
| Treasurer                          | Manages financial records.                                                                                                                           |
| Chairman                           | Oversees fellowship governance and fellowship year closure.                                                                                          |
| Vice Chairman                      | Named as a primary leadership role. No duty is specified.                                                                                            |
| Event Chairman / Event Chairperson | Owns the event. Full responsibility for execution and completion. Vision: the only authority required to close the event.                            |
| Event Treasurer                    | Named event-committee role. No separate duty beyond shared event-leader duties.                                                                      |
| Event Secretary                    | Named event-committee role. Same limitation.                                                                                                         |
| Event leaders (as a group)         | Manage event attendance, contributions and pledges, committee records, and event reports.                                                            |
| Member                             | Has an individual account. Can view own membership, attendance, contributions and pledges, and fellowship identification. May receive announcements. |
| Leaders (unspecified which)        | Mark attendance using a present-only model. Use engagement information for follow-up.                                                                |

Primary leadership roles are Chairman, Vice Chairman, General Secretary, Vice General Secretary, and Treasurer. They have administrative access based on their responsibilities.

Event committee roles are separate from main fellowship leadership and exist only for the duration of that event. Examples given: Event Chairman, Event Treasurer, Event Secretary.

The system records who performed approvals, financial updates, and event closures.

**Reasonable interpretation**

“Event Chairperson” in the BRS and “Event Chairman” in the Vision document are the same role. The plural in the BRS means every event has such a role, not that one event has several chairpersons.

“Leaders mark attendance” most naturally means fellowship or event leaders, not members marking themselves. The documents do not say that explicitly.

**Unknown / needs clarification**

- Vice Chairman duties and permissions.
- Who creates events, appoints event committees, assigns ministries, records weekly offerings, changes a member to Associate, and closes a fellowship year. The Chairman “oversees” year closure. Exclusive authority is explicit only for event closure.
- Whether an applicant has an account before approval.
- Whether associates, visitors, or non-members are actors.
- Whether event finance is handled only by the Event Treasurer, only by the fellowship Treasurer, or by both.
- Who performs pastoral follow-up, and whether that is a system actor or an offline use of reports.

---

## 3. Major business capabilities / modules

**Explicitly stated**

The BRS lists these as modules the system shall implement:

1. Membership Management
2. Leadership and Governance
3. Ministry Management
4. Attendance and Engagement
5. Financial Management
6. Event Management
7. Event Governance
8. Member Access
9. Communication
10. Reporting
11. Data Preservation

The Vision document’s first version is narrower:

- Membership Management
- Attendance and Engagement Tracking
- Financial Records Management
- Event Management
- Reporting and Analytics
- Leadership Governance

The Vision document defers “advanced communication features” and “future ministry-specific tools” to later phases. It still describes ministry membership and a communication module in the body of the overview.

Ministries named as examples: Praise Team, Media Team, Dancers, Evangelists, Teachers of the Word, Instrumentalists. Members may belong to one or more.

**Reasonable interpretation**

Event Governance in the BRS is the closure, lock, and archive rule set, not a separate business area from Event Management. Data Preservation is the cross-cutting immutability and history rule, not a user-facing module.

Ministry membership tracking and “ministry-specific tools” may be different things. The documents do not define that split.

**Conflict**

Communication and ministry are in the BRS as required behavior (“the system shall”). The Vision document places advanced communication and future ministry-specific tools outside the first version, and it describes communication as a future module with “potential” use cases. Member access to announcements is also hedged in the Vision document (“may be able to”) and mandatory in the BRS (“shall”).

**Unknown / needs clarification**

Which document governs scope if they disagree, and whether ministry membership tracking is in the first version even if ministry-specific tools are not.

---

## 4. Core business workflows

**Explicitly stated**

**Membership**

1. Applicant registers.
2. Status becomes Pending.
3. General Secretary or Vice General Secretary reviews the application.
4. If approved, the person becomes an Active Member and a Fellowship ID is generated automatically.
5. After graduation, the member becomes Associate. Historical participation stays.

No member history is deleted.

**Attendance**

Leaders record attendance for activities such as daily prayer, mini and full overnights, special sessions, and prayer camps. Only people who attended are marked. The system derives engagement and classifies it.

**Finance**

Weekly fellowship offerings are recorded over time. For events, the system tracks pledges, actual payments, partial payments, and outstanding balances.

**Events**

Leadership can introduce events. Events are not hardcoded. Examples: Gospel Outreach (Missions), Together in Praise and Worship. Each event can have its own committee. Event leaders manage attendance, contributions and pledges, committee records, and event reports.

**Event closure**

Event Chairman marks the event CLOSED. Event data locks immediately. The system then moves the event to ARCHIVED.

**Fellowship year**

A year can be closed, with the example 2026 → 2027. Associated data becomes immutable and the year is archived.

**Member use**

A member signs in to a personal account and views personal fellowship, attendance, contribution, and identification records, and can receive announcements.

**Reporting**

The platform produces monthly engagement summaries, attendance rankings, fellowship growth statistics, event financial reports, ministry participation insights, and associate member statistics. The BRS also requires attendance, engagement, financial, and event reports in support of leadership decisions.

**Communication (Vision: potential / future; BRS: required)**

Membership approval notifications, event announcements, committee reminders, ministry-specific messages, contribution reminders, and fellowship-wide broadcasts, using structured member data so messages can be targeted.

**Reasonable interpretation**

Registration, approval, attendance marking, offering entry, pledge and payment entry, event setup, event close, and year close are the operational workflows. Reporting and member viewing are read-only uses of those records.

**Unknown / needs clarification**

- Rejection, withdrawal, correction, and appeal paths are absent. Only approval is described.
- Who triggers the Active → Associate change, and what “graduation” means in the system.
- How a session is opened, who is expected to attend, and how a present-only mark is stored.
- Whether offerings are per person, anonymous totals, or both.
- Pledge creation, payment against a pledge, and how an outstanding balance is calculated.
- Event creation, committee appointment, and report submission steps.
- Whether year closure is one action that freezes the year, or a checklist.
- Whether communication is send-only, and whether replies or delivery status matter. The documents do not say.

---

## 5. Important business rules and constraints

**Explicitly stated**

- The model is person-centric. A person remains in the system across membership stages.
- Member history is kept. Nothing in that history is deleted.
- Fellowship ID is generated automatically when membership is approved.
- Approval authority for membership is the General Secretary or the Vice General Secretary.
- A member may belong to more than one ministry.
- Attendance is present-only.
- Engagement is classified. The Vision document names High, Medium, and Low Engagement.
- Events are configurable. They are not fixed in advance.
- Event roles last only for that event and are separate from fellowship offices.
- The Event Chairman is the only authority required to close an event.
- On event close: no edits, additions, or deletions. Attendance, financial, and committee records become final. Archive follows automatically.
- On fellowship year close: all associated data across the system becomes fully immutable. No modifications are permitted under any circumstance. The year is archived.
- Closed events and closed fellowship years stay immutable for integrity, audit, and historical accuracy.
- Critical actions are auditable: approvals, financial updates, and event closures.
- Members see their own records. Member privacy and data must be protected.
- Administrative access follows leadership responsibility.

**Reasonable interpretation**

“Present-only” means absence is not stored as its own mark. Engagement is computed from marks that exist.

“The only authority required” plus “marked as CLOSED by the Event Chairman” means other roles cannot close the event. The BRS only says event chairpersons are allowed to close events. It does not repeat the exclusivity sentence.

**Unknown / needs clarification**

- Thresholds, time window, and which activities count for High, Medium, and Low.
- Whether a closed event can be corrected by anyone, including the Chairman.
- What “all associated data” includes when a fellowship year closes: that year’s records only, or also open events, member status, and new registrations.
- Whether “under any circumstance” forbids error correction after year close.
- The business difference between CLOSED and ARCHIVED if both are immutable.
- Rules for anonymous offerings, refunds, overpayment, write-off, and currency.
- Whether associates keep ministry membership, attendance, pledges, and accounts.
- Eligibility to register, and whether graduation is the only path to Associate.

---

## 6. Lifecycle states and transitions

**Explicitly stated**

**Person / membership**

| From            | To            | Trigger stated                                                                       |
| --------------- | ------------- | ------------------------------------------------------------------------------------ |
| (new applicant) | Pending       | Registration                                                                         |
| Pending         | Active Member | Approval by General Secretary or Vice General Secretary. Fellowship ID is generated. |
| Active Member   | Associate     | After graduation. History remains.                                                   |

**Event**

| State    | Rule                                                            |
| -------- | --------------------------------------------------------------- |
| ACTIVE   | Event is in progress. Implied as the working state.             |
| CLOSED   | Set by the Event Chairman. All event data locks immediately.    |
| ARCHIVED | Entered automatically after closure, for history and reporting. |

**Fellowship year**

A year moves from open operation to closed and archived. The only example is 2026 → 2027. Named states comparable to the event model are not listed.

**Event roles**

They exist only while that event exists. No start or end action is specified beyond the event’s life.

**Reasonable interpretation**

CLOSED is the lock point. ARCHIVED is the historical state after that lock. If the transition is automatic, CLOSED may be brief. The documents do not say there is a waiting period.

A fellowship year has an implicit open state before closure. That state is not named.

**Unknown / needs clarification**

- Rejected, withdrawn, suspended, inactive, or returned-from-associate states.
- Whether an application can stay Pending indefinitely.
- Whether ACTIVE is a formal initial state or only the word used before closure.
- Whether archive is immediate.
- Whether a fellowship year has states other than open and archived.
- Leadership terms: appointment, handover, and end of office are not a defined lifecycle, even though continuity across leadership changes is a stated benefit.
- Whether closing a year changes member or event states, or only freezes records.

---

## 7. Data and entities implied by the requirements

These are business concepts the documents require the system to remember. They are not a data model.

**Explicitly stated or directly required**

- **Person** — stable identity across stages.
- **Membership record** — current status and preserved history.
- **Membership status** — Pending, Active Member, Associate, plus status history.
- **Application / registration** — the act that creates Pending.
- **Fellowship ID** — created at approval.
- **Fellowship leadership assignment** — Chairman, Vice Chairman, General Secretary, Vice General Secretary, Treasurer.
- **Audit record** — actor and critical action (approval, financial update, event closure).
- **Fellowship year** — can be closed and archived. Example years 2026 and 2027.
- **Ministry** — named groups, open-ended list (“including”).
- **Ministry participation** — a person in one or more ministries, kept as participation history.
- **Attendance mark** — present-only, against a fellowship activity.
- **Activity** — daily prayer, mini overnight, full overnight, special session, prayer camp, and similar.
- **Engagement level** — High, Medium, Low, derived from attendance.
- **Offering** — weekly fellowship offering, tracked over time.
- **Event** — created by leadership, not fixed in a list.
- **Event contribution** — pledge, actual payment, partial payment, outstanding balance, and contribution history.
- **Event committee and committee records.**
- **Event role** — Event Chairman, Event Treasurer, Event Secretary.
- **Event report.**
- **User account** — individual, secure, used to view personal records.
- **Communication / announcement / notification** — fellowship-wide, ministry, event, and member-targeted. Scope differs between the two documents.
- **Reports** — attendance, engagement, rankings, growth, event finance, ministry participation, associate statistics, financial summaries.

**Reasonable interpretation**

A person, a membership, and a user account are related but not the same thing: the Vision document separates the person from membership stage, and both documents separate member access through an account. The documents never say these are three stored entities.

Outstanding balance is derived from pledges and payments. The calculation rule is not stated.

**Unknown / needs clarification**

- Registration fields (name, contact, course, year of study, gender, photo, and so on) are not listed.
- Fellowship ID format, uniqueness, and whether it changes when status changes.
- What a committee record contains.
- Whether an offering is linked to a person.
- Whether attendance is linked to a dated session instance or only to an activity type.
- Whether engagement is stored or only calculated.
- Guest or visitor attendance.
- Leadership term dates and history of who held an office.

---

## 8. Roles, permissions, and access boundaries

**Explicitly stated**

- Access is role-based and aligned to the existing leadership structure.
- Administrative access depends on responsibility.
- General Secretary and Vice General Secretary approve members.
- Treasurer manages financial records.
- Chairman oversees governance and fellowship year closure.
- Event Chairman closes the event. Vision document: that is the only authority required.
- Event leaders manage that event’s attendance, contributions, committee records, and reports.
- Event roles do not extend past that event and are not the same as fellowship offices.
- Members view their own membership, attendance, contributions, pledges, and fellowship identification.
- Member privacy and data must be protected.
- Approvals, financial updates, and event closures are audited.

**Reasonable interpretation**

Members are restricted to their own records. Leadership follow-up and rankings imply that some leaders can see other people’s attendance and engagement. The documents do not name which leaders, or whether contribution amounts of other members are visible.

“Administrative access based on their responsibilities” can mean either a shared admin capability limited by duty, or five different permission sets. Both readings fit the sentence.

**Unknown / needs clarification**

- A permission matrix is not defined for view, create, update, approve, close, archive, or report.
- Whether the Chairman, Vice Chairman, or Treasurer can approve members.
- Whether fellowship leaders can edit an event before the Event Chairman closes it.
- Whether the fellowship Treasurer can change event finances that an Event Treasurer records.
- Whether members can see ministry lists, other members, or only themselves.
- Associate and applicant access.
- Whether a leader who leaves office loses access immediately.
- Who can read audit history.

---

## 9. Requirements that may affect future architecture

No technology is selected here. These are business constraints a later architecture would have to satisfy.

**Explicitly stated**

- One source of truth for membership, attendance, events, finance, communication, and reporting.
- Identity survives status change. History is retained, not deleted.
- Fellowship IDs are produced by the system at approval.
- Two immutability boundaries: event closure locks that event; fellowship year closure makes associated data unchangeable under any circumstance.
- Event close moves automatically to archive.
- Critical actions must be attributable to a person.
- Two kinds of authority exist at once: enduring fellowship offices, and event offices that end with the event.
- Attendance stores presence only. Engagement and rankings are derived.
- Events and, by the examples, ministries can be added as fellowship life changes. They are not a fixed catalog.
- A person can be in several ministries.
- Members authenticate to private personal records.
- Targeted communication depends on structured membership, ministry, and event data. Delivery of that module is in conflict between the documents, as noted above.
- Reporting spans attendance, engagement, money, growth, events, ministries, and associates.
- The Vision document expects phased delivery. The BRS states a single “shall” list.

**Reasonable interpretation**

Year-level immutability is the strongest constraint in the material. It affects correction, late entry, and whether a new registration or offering can be recorded after the year is closed.

Present-only attendance affects every engagement and ranking report, because the documents never define the population those marks are compared against.

Auditability plus “no modifications under any circumstance” means later design has to keep a historical record that cannot be rewritten after close.

**Unknown / needs clarification**

- Whether immutability is absolute, or whether a governed correction process is allowed. The year-closure rule, as written, does not allow one.
- How far “associated data” reaches.
- Which reports are operational during the year and which are historical after archive.
- Non-functional qualities are absent: who may host or operate the system, retention beyond archive, backup, availability, language, devices, or concurrent users. Those are not requirements until the team states them.

---

## 10. Ambiguities, gaps, conflicts, and decisions

This section records conflicts found in the source documents. Ministry scope and year-close immutability are no longer open. See [Confirmed team decisions](#confirmed-team-decisions-v1).

**Conflicts between the documents**

1. **Communication.** Vision: a future module, outside the first version, with potential use cases. Member receipt of announcements is “may.” BRS: the system shall support fellowship-wide, ministry, event, leadership, and member notifications.
2. **Ministry scope.** Vision: ministry participation is described in the overview, ministry-specific tools are later, and ministry management is not in the first-version list. BRS: ministry membership, participation records, and ministry communication and reporting are required.
3. **Normative strength of member access.** Vision hedges (“may be able to”). BRS requires accounts and personal views.
4. **Who may close an event.** Vision: only the Event Chairman is required, and that person marks it closed. BRS: event chairpersons are allowed to close events, without saying others are excluded.
5. **Document role.** The Vision document invites feedback before a formal specification. The BRS already reads as that specification, but it omits rules the Vision document states in detail (present-only attendance, engagement labels, person-centric lifecycle, exclusive event-chairman closure, year-closure wording).

**Gaps**

- Rejection and other exits from Pending.
- Definition and operator of graduation and the Associate transition.
- Eligibility to apply.
- Vice Chairman responsibilities.
- Permission boundaries among fellowship Treasurer, Event Treasurer, and event close.
- Engagement formula and the denominator for a present-only model.
- Contents of registration, committee records, offerings, and the Fellowship ID.
- Leadership appointment and handover, despite continuity across leadership change being a stated benefit.
- What remains possible for an Associate member.
- Error correction after close.
- Measurable success criteria.

**Wording in the source documents that the team has since decided**

Year close is not immediately immutable. Event close is not an immediate lock for everyone. See the confirmed decisions below.

**Wording that was open in the source documents**

- “All associated data across the system” at year close.
- “No modifications are permitted under any circumstance.”
- “Administrative access based on their responsibilities.”
- “The only authority required to close the event.”
- “Leaders mark only members who attended.”
- CLOSED versus ARCHIVED if both are locked.

---

## Confirmed team decisions (V1) — current

The list below is the current V1 rule set. It replaces the earlier open questions. It is not a technology design.

**V1 primary modules**

1. Member Management
2. Ministry Management
3. Leadership & Roles
4. Event Management
5. Member Access

**Cross-cutting, not a sixth module:** fellowship year lifecycle, closure and preservation, role-based permissions.

**Out of V1:** Attendance & Engagement, Financial Management, Reporting & Analytics, Communication, advanced ministry-specific functionality.

**Roles**

- Fellowship leadership: Chairman, Vice Chairman, General Secretary, Vice General Secretary, Treasurer.
- Event leadership, separate from fellowship offices: Event Chairman, Event Treasurer, Event Secretary.
- Ministry Leaders, appointed by the Chairman. Each ministry has its own Ministry Leader.
- Active Member and Associate. An Associate is a graduated member who remains in the system. Members are not deleted after graduation.
- The Treasurer has no operational responsibility in V1.

**Approval and profile**

- Applicant → Pending → Active Member → Associate.
- Pending expires 48 hours after submission if approval is not completed. The person must register again.
- Both the General Secretary and the Vice General Secretary must take part. One of them acting alone does not complete approval. Approval creates the Fellowship ID.
- Applications may be submitted and approved while the year is OPEN or CLOSED. The 48-hour expiry continues while CLOSED.
- Required registration fields: email (primary unique identifier), first name, last name, phone, class, course, year of study, date of birth.
- After approval, only the member may change those profile fields.

**Ministry**

- Ministries are predefined. V1 does not create or delete ministries.
- During onboarding a member selects one or more ministries.
- After onboarding the member cannot change ministry membership.
- A Ministry Leader can add or remove a member, including a member who did not ask to join, and can see and manage membership in other ministries.

**Events**

- The Chairman creates the event and appoints the committee.
- Participant and attendee are the same list.
- Only an Active Member or an Associate may be added. Visitors are not in V1.
- While the event is ACTIVE: the Event Chairman may add or remove participants, set or change the venue, and manage event operations. The Event Treasurer manages that event’s contributions and other event financial records, not fellowship-wide finance. The Event Secretary handles day-to-day event administration, including activities and event reporting.
- Lifecycle: ACTIVE → CLOSED → ARCHIVED.
- The Event Chairman closes the event. While CLOSED, only the Vice Chairman may correct it. The Vice Chairman archives it. ARCHIVED cannot be changed by anyone.

**Fellowship year**

- The Chairman starts the year. A holiday normally sits between years, so a new year does not start immediately.
- The General Secretary requests closure. The request stays pending for 12 hours. If the Chairman does not confirm, the request expires and must be submitted again. The year does not close by itself.
- The Chairman confirms CLOSED, and later archives the year.
- CLOSED: Ministry Leader and Event Leader operations stop. The Chairman may correct CLOSED year records. Members may view them. Registration and GS/VGS approval continue.
- ARCHIVED: nobody can change the data, including the Chairman. Member viewing of ARCHIVED history does not grant permission to change it.

**While the year is OPEN**

- The Chairman may start the year, create events, appoint Ministry Leaders and event committees, and manage ministry membership and event records. This does not extend to future modules.
- The Vice Chairman has no additional OPEN-year duties defined.
- The Vice General Secretary’s defined duty is taking part in approval, together with the General Secretary.

**Member Access**

- An Active Member can view their profile, Fellowship ID, ministries, events they belong to, and records from CLOSED and ARCHIVED years.
- An Active Member can edit their own profile fields only. They cannot edit ministry membership, event membership, leadership records, closure records, or other members’ records.
- Associates do not sign in during V1.

**Graduation**

- An Event Chairman marks the member as a graduation candidate and sends that request to the Chairman.
- The member becomes an Associate only after the Chairman confirms.
- After that, the Associate does not belong to ministries or events. The person remains in the system.

**Superseded source-document wording**

- Ministry Management is V1. Advanced ministry tools are not.
- A CLOSED year is not immediately immutable. The Chairman can still correct it. Immutability starts at ARCHIVED.
- An event is not locked for everyone when the Event Chairman closes it. Only the Vice Chairman can correct a CLOSED event.

## Remaining V1 blockers

None. The five modules can move into detailed design.

## Deferred

- Additional Vice Chairman duties while a year is OPEN.
- Additional Vice General Secretary duties beyond joint approval.
- Associate sign-in and other Associate operations.
- Attendance, engagement, fellowship-wide finance, reporting and analytics, communication, and advanced ministry tools.

## Original document conflicts kept for reference

- Communication is later work in the Vision and required in the BRS. V1 excludes it.
- The Vision says members may view records. The BRS requires member accounts. V1 includes Member Access for Active Members, with the visibility rules above. Associates do not sign in during V1.
- The BRS allows event chairpersons to close events. The team decision is that the Event Chairman closes the event.
- The Vision and BRS describe attendance, finance, and reporting. Those stay out of V1. Event Treasurer records are limited to that event.

