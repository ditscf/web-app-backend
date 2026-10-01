import {
  EventRole,
  EventStatus,
  FellowshipOffice,
  FellowshipYearStatus,
  MembershipStatus,
} from "../../generated/prisma/client";

export type AuthorizationAction =
  | "member.reviewApplications"
  | "member.approveAsGs"
  | "member.approveAsVgs"
  | "member.viewOwn"
  | "member.editOwnProfile"
  | "member.completeOnboarding"
  | "fellowshipYear.requestClosure"
  | "fellowshipYear.confirmClosure"
  | "fellowshipYear.correctClosed"
  | "fellowshipYear.archive"
  | "ministry.appointLeader"
  | "ministry.manageMembership"
  | "event.create"
  | "event.appointCommittee"
  | "event.manageOperations"
  | "event.manageFinances"
  | "event.manageAdministration"
  | "event.close"
  | "event.correctClosed"
  | "event.archive"
  | "graduation.request"
  | "graduation.confirm";

export interface AuthorizationActor {
  personId: string;
  membershipStatus: MembershipStatus;
  offices: FellowshipOffice[];
  ministryIds: string[];
  eventRoles: { eventId: string; role: EventRole }[];
}

export interface AuthorizationSubject {
  yearStatus: FellowshipYearStatus | null;
  eventStatus?: EventStatus | null;
  eventId?: string;
  resourcePersonId?: string;
  gsApprovalRecorded?: boolean;
  onboardingCompleted?: boolean;
}

export type AuthorizationDecision =
  { allowed: true } | { allowed: false; reason: string };

export function decide(
  actor: AuthorizationActor,
  action: AuthorizationAction,
  subject: AuthorizationSubject,
): AuthorizationDecision {
  // A later super admin is checked here, before office rules.
  // That account is not a fellowship office and is not part of this delivery.
  if (action === "member.viewOwn" || action === "member.editOwnProfile") {
    return ownMemberAccess(actor, action, subject);
  }
  if (action === "member.reviewApplications") {
    return reviewApplications(actor, subject);
  }
  if (action === "member.completeOnboarding") {
    return completeOnboarding(actor, subject);
  }

  if (subject.yearStatus === FellowshipYearStatus.ARCHIVED) {
    return deny("An archived fellowship year cannot be changed.");
  }
  if (subject.eventStatus === EventStatus.ARCHIVED) {
    return deny("An archived event cannot be changed.");
  }

  switch (action) {
    case "member.approveAsGs":
      return yearAllowsApproval(subject) &&
        holds(actor, FellowshipOffice.GENERAL_SECRETARY)
        ? allow()
        : deny(
          "Only the General Secretary can record that approval, and only while the year is open or closed.",
        );
    case "member.approveAsVgs":
      if (!subject.gsApprovalRecorded) {
        return deny("The General Secretary records their approval first.");
      }
      return yearAllowsApproval(subject) &&
        holds(actor, FellowshipOffice.VICE_GENERAL_SECRETARY)
        ? allow()
        : deny(
          "Only the Vice General Secretary can record the second approval.",
        );
    case "fellowshipYear.requestClosure":
      return subject.yearStatus === FellowshipYearStatus.OPEN &&
        holds(actor, FellowshipOffice.GENERAL_SECRETARY)
        ? allow()
        : deny(
          "Only the General Secretary can request closure of an open year.",
        );
    case "fellowshipYear.confirmClosure":
      return subject.yearStatus === FellowshipYearStatus.OPEN &&
        holds(actor, FellowshipOffice.CHAIRMAN)
        ? allow()
        : deny("Only the Chairman can confirm closure of an open year.");
    case "fellowshipYear.correctClosed":
      return subject.yearStatus === FellowshipYearStatus.CLOSED &&
        holds(actor, FellowshipOffice.CHAIRMAN)
        ? allow()
        : deny("Only the Chairman can correct a closed year.");
    case "fellowshipYear.archive":
      return subject.yearStatus === FellowshipYearStatus.CLOSED &&
        holds(actor, FellowshipOffice.CHAIRMAN)
        ? allow()
        : deny("Only the Chairman can archive a closed year.");
    case "ministry.appointLeader":
    case "event.create":
    case "event.appointCommittee":
      return openYearChairman(actor, subject);
    case "ministry.manageMembership":
      return subject.yearStatus === FellowshipYearStatus.OPEN &&
        (holds(actor, FellowshipOffice.CHAIRMAN) ||
          actor.ministryIds.length > 0)
        ? allow()
        : deny(
          "Ministry membership can be changed by the Chairman or a Ministry Leader while the year is open.",
        );
    case "event.manageOperations":
    case "event.close":
      return activeEventRole(actor, subject, EventRole.EVENT_CHAIRMAN);
    case "event.manageFinances":
      return activeEventRole(actor, subject, EventRole.EVENT_TREASURER);
    case "event.manageAdministration":
      return activeEventRole(actor, subject, EventRole.EVENT_SECRETARY);
    case "event.correctClosed":
    case "event.archive":
      return subject.eventStatus === EventStatus.CLOSED &&
        holds(actor, FellowshipOffice.VICE_CHAIRMAN)
        ? allow()
        : deny("Only the Vice Chairman can correct or archive a closed event.");
    case "graduation.request":
      return activeEventRole(actor, subject, EventRole.EVENT_CHAIRMAN);
    case "graduation.confirm":
      return subject.yearStatus !== null &&
        holds(actor, FellowshipOffice.CHAIRMAN)
        ? allow()
        : deny("Only the Chairman can confirm graduation.");
    default:
      return deny("That action is not allowed.");
  }
}

function ownMemberAccess(
  actor: AuthorizationActor,
  _action: "member.viewOwn" | "member.editOwnProfile",
  subject: AuthorizationSubject,
): AuthorizationDecision {
  if (actor.membershipStatus !== MembershipStatus.ACTIVE) {
    return deny("Only an Active Member can open a member profile.");
  }
  if (actor.personId !== subject.resourcePersonId) {
    return deny("A member can open only their own profile.");
  }
  return allow();
}

function completeOnboarding(
  actor: AuthorizationActor,
  subject: AuthorizationSubject,
): AuthorizationDecision {
  if (actor.membershipStatus !== MembershipStatus.ACTIVE) {
    return deny("Only an Active Member can complete onboarding.");
  }
  if (actor.personId !== subject.resourcePersonId) {
    return deny("A member can complete only their own onboarding.");
  }
  if (subject.onboardingCompleted) {
    return deny("Onboarding is already complete.");
  }
  return allow();
}

function reviewApplications(
  actor: AuthorizationActor,
  subject: AuthorizationSubject,
): AuthorizationDecision {
  return yearAllowsApproval(subject) &&
    (holds(actor, FellowshipOffice.GENERAL_SECRETARY) ||
      holds(actor, FellowshipOffice.VICE_GENERAL_SECRETARY))
    ? allow()
    : deny(
      "Only the General Secretary or the Vice General Secretary can review registrations, and only while the year is open or closed.",
    );
}

function yearAllowsApproval(subject: AuthorizationSubject): boolean {
  return (
    subject.yearStatus === FellowshipYearStatus.OPEN ||
    subject.yearStatus === FellowshipYearStatus.CLOSED
  );
}

function openYearChairman(
  actor: AuthorizationActor,
  subject: AuthorizationSubject,
): AuthorizationDecision {
  return subject.yearStatus === FellowshipYearStatus.OPEN &&
    holds(actor, FellowshipOffice.CHAIRMAN)
    ? allow()
    : deny("Only the Chairman can do that while the year is open.");
}

function activeEventRole(
  actor: AuthorizationActor,
  subject: AuthorizationSubject,
  role: EventRole,
): AuthorizationDecision {
  const hasRole = actor.eventRoles.some(
    (assignment) =>
      assignment.eventId === subject.eventId && assignment.role === role,
  );
  return subject.yearStatus === FellowshipYearStatus.OPEN &&
    subject.eventStatus === EventStatus.ACTIVE &&
    hasRole
    ? allow()
    : deny(
      "That event action is allowed only for the assigned event leader while the year is open and the event is active.",
    );
}

function holds(actor: AuthorizationActor, office: FellowshipOffice): boolean {
  return actor.offices.includes(office);
}

function allow(): AuthorizationDecision {
  return { allowed: true };
}

function deny(reason: string): AuthorizationDecision {
  return { allowed: false, reason };
}
