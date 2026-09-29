import type {
  EventRole,
  FellowshipOffice,
  MembershipStatus,
} from "../../generated/prisma/client";

export interface ActorEventRole {
  eventId: string;
  role: EventRole;
}

export interface ActorProfile {
  accountId: string;
  personId: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipStatus: MembershipStatus;
  fellowshipId: string;
  offices: FellowshipOffice[];
  ministryIds: string[];
  eventRoles: ActorEventRole[];
}
