import {
  EventRole,
  EventStatus,
  FellowshipOffice,
  FellowshipYearStatus,
  MembershipStatus,
} from "../../generated/prisma/client";
import {
  decide,
  type AuthorizationActor,
  type AuthorizationSubject,
} from "./authorization.policy";

const openYear: AuthorizationSubject = {
  yearStatus: FellowshipYearStatus.OPEN,
};

describe("authorization policy", () => {
  it("lets only the General Secretary record the first approval", () => {
    expect(
      decide(
        officer(FellowshipOffice.GENERAL_SECRETARY),
        "member.approveAsGs",
        openYear,
      ).allowed,
    ).toBe(true);
    expect(
      decide(
        officer(FellowshipOffice.VICE_GENERAL_SECRETARY),
        "member.approveAsGs",
        openYear,
      ).allowed,
    ).toBe(false);
    expect(
      decide(
        officer(FellowshipOffice.GENERAL_SECRETARY),
        "member.approveAsGs",
        {
          yearStatus: FellowshipYearStatus.ARCHIVED,
        },
      ).allowed,
    ).toBe(false);
  });

  it("requires the General Secretary step before the Vice General Secretary step", () => {
    const vgs = officer(FellowshipOffice.VICE_GENERAL_SECRETARY);
    expect(decide(vgs, "member.approveAsVgs", openYear).allowed).toBe(false);
    expect(
      decide(vgs, "member.approveAsVgs", {
        ...openYear,
        gsApprovalRecorded: true,
      }).allowed,
    ).toBe(true);
  });

  it("lets a member complete only their own onboarding, and only once", () => {
    const member = officer();
    expect(
      decide(member, "member.completeOnboarding", {
        yearStatus: null,
        resourcePersonId: member.personId,
        onboardingCompleted: false,
      }).allowed,
    ).toBe(true);
    expect(
      decide(member, "member.completeOnboarding", {
        yearStatus: null,
        resourcePersonId: member.personId,
        onboardingCompleted: true,
      }).allowed,
    ).toBe(false);
    expect(
      decide(member, "member.completeOnboarding", {
        yearStatus: null,
        resourcePersonId: "someone-else",
        onboardingCompleted: false,
      }).allowed,
    ).toBe(false);
  });

  it("lets the General Secretary and the Vice General Secretary review registrations while the year is open or closed", () => {
    expect(
      decide(
        officer(FellowshipOffice.GENERAL_SECRETARY),
        "member.reviewApplications",
        openYear,
      ).allowed,
    ).toBe(true);
    expect(
      decide(
        officer(FellowshipOffice.VICE_GENERAL_SECRETARY),
        "member.reviewApplications",
        { yearStatus: FellowshipYearStatus.CLOSED },
      ).allowed,
    ).toBe(true);
    expect(
      decide(
        officer(FellowshipOffice.CHAIRMAN),
        "member.reviewApplications",
        openYear,
      ).allowed,
    ).toBe(false);
    expect(
      decide(
        officer(FellowshipOffice.GENERAL_SECRETARY),
        "member.reviewApplications",
        { yearStatus: FellowshipYearStatus.ARCHIVED },
      ).allowed,
    ).toBe(false);
  });

  it("lets an Active Member open only their own profile", () => {
    const member = officer();
    expect(
      decide(member, "member.editOwnProfile", {
        ...openYear,
        resourcePersonId: member.personId,
      }).allowed,
    ).toBe(true);
    expect(
      decide(member, "member.editOwnProfile", {
        ...openYear,
        resourcePersonId: "someone-else",
      }).allowed,
    ).toBe(false);
  });

  it("keeps Chairman powers inside the year state", () => {
    const chairman = officer(FellowshipOffice.CHAIRMAN);
    expect(decide(chairman, "event.create", openYear).allowed).toBe(true);
    expect(
      decide(chairman, "fellowshipYear.correctClosed", {
        yearStatus: FellowshipYearStatus.CLOSED,
      }).allowed,
    ).toBe(true);
    expect(
      decide(chairman, "event.correctClosed", {
        ...openYear,
        eventStatus: EventStatus.CLOSED,
      }).allowed,
    ).toBe(false);
    expect(
      decide(chairman, "fellowshipYear.archive", {
        yearStatus: FellowshipYearStatus.ARCHIVED,
      }).allowed,
    ).toBe(false);
  });

  it("lets only the Vice Chairman correct a closed event", () => {
    const subject: AuthorizationSubject = {
      yearStatus: FellowshipYearStatus.OPEN,
      eventStatus: EventStatus.CLOSED,
      eventId: "event-1",
    };
    expect(
      decide(
        officer(FellowshipOffice.VICE_CHAIRMAN),
        "event.correctClosed",
        subject,
      ).allowed,
    ).toBe(true);
    expect(
      decide(
        eventLeader(EventRole.EVENT_CHAIRMAN),
        "event.correctClosed",
        subject,
      ).allowed,
    ).toBe(false);
  });

  it("stops event leaders when the year is closed even if the event is active", () => {
    const subject: AuthorizationSubject = {
      yearStatus: FellowshipYearStatus.CLOSED,
      eventStatus: EventStatus.ACTIVE,
      eventId: "event-1",
    };
    expect(
      decide(eventLeader(EventRole.EVENT_CHAIRMAN), "event.close", subject)
        .allowed,
    ).toBe(false);
  });

  it("gives the Treasurer no extra permission", () => {
    expect(
      decide(officer(FellowshipOffice.TREASURER), "event.create", openYear)
        .allowed,
    ).toBe(false);
  });
});

function officer(...offices: FellowshipOffice[]): AuthorizationActor {
  return {
    personId: "person-1",
    membershipStatus: MembershipStatus.ACTIVE,
    offices,
    ministryIds: [],
    eventRoles: [],
  };
}

function eventLeader(role: EventRole): AuthorizationActor {
  return {
    ...officer(),
    eventRoles: [{ eventId: "event-1", role }],
  };
}
