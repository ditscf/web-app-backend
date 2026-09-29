# Authorization

Technical decision for how V1 permissions are evaluated. The duties themselves are the confirmed rules in `docs/analysis/requirements-analysis.md`.

## Problem

A person can be an Active Member, hold a fellowship office for one year, lead a ministry, and hold an event role at the same time. Several duties exist only while a fellowship year or an event is in a particular state. A single role flag on the account would hide those scopes and would treat the Chairman as a superuser.

## Options considered

- One role enum on the account.
- Role-based checks that ignore record state.
- Scoped assignments plus an explicit action policy.
- A generic permission product with a large stored permission matrix.

The confirmed duties are a short list, and many of them depend on year state, event state, and resource ownership. A stored permission matrix would duplicate rules that are easier to test as policy code.

## Selected approach

Authorization uses three separate inputs:

1. The authenticated person, taken from the session's account.
2. Current assignments: fellowship office for the operative year, ministry leadership, and event role.
3. The resource and its state.

Membership status is an input. It is not an assignment. Active Member and Associate describe the person. Chairman, Ministry Leader, and Event Treasurer describe responsibilities.

The policy is called by application services. Controllers validate and forward the actor. An authentication guard only establishes who is signed in. Archived immutability is also protected by the persistence model once those workflows exist, so a missed service check is not the only barrier.

### State precedence

- An archived fellowship year or an archived event cannot be mutated.
- A closed event can be corrected only by the Vice Chairman, who also archives it. An open year does not return edit rights to the event committee.
- A closed fellowship year stops ministry-leader and event-leader operations. The Chairman may correct closed year records. Registration and dual approval continue. Members may read.
- An open year allows the Chairman's confirmed operational duties, and allows event duties only while that event is active.

### Actions that must not be collapsed

- General Secretary approval and Vice General Secretary approval are different actions. Both are required. The same person cannot record both.
- The General Secretary requests fellowship-year closure. The Chairman confirms it. The year does not close by itself.
- The Event Chairman requests graduation. The Chairman confirms it. Confirmation is what changes an Active Member to an Associate.

The Chairman's open-year duties do not include a general finance module. The Treasurer office is stored and grants no extra V1 permission. Event Treasurer authority is limited to the assigned event.

## Security implications

The backend decision is authoritative. A client-supplied person id is never treated as "me"; the session supplies that id. Every read or write names an action and a resource, which is what prevents one member from opening another member's profile by changing an id.

## Domain implications

Fellowship offices belong to one fellowship year and are kept after the year is archived. Ministry leadership belongs to a ministry. Event roles belong to one event. Current authorization uses the single operative year, the year that is `OPEN` or `CLOSED`.

Officers are elected outside the system. V1 stores the result. It does not implement an election.

## Consequences

Adding a module means adding actions to the policy, not adding a new concept of "user role." Combined responsibilities stay possible: a person may hold a fellowship office and an event role together. The same person may hold more than one fellowship office in a year, except General Secretary and Vice General Secretary.

## Effect on later modules

Member Management owns registration, the two approval steps, profile edits, and graduation confirmation, and calls this policy. Ministry Management and Event Management use the assignment tables already reserved for them. They do not introduce a second role store.

Policy tests, when those modules are built, should cover the authorized actor, the wrong actor, combined assignments, own record versus another member, and `OPEN`, `CLOSED`, and `ARCHIVED`.
