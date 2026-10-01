import {
  AccountStatus,
  ApplicationStatus,
  FellowshipOffice,
  FellowshipYearStatus,
  MembershipStatus,
  type PrismaClient,
} from "../../generated/prisma/client";
import { parseDateOfBirth } from "../membership/application.service";
import {
  birthDay,
  fellowshipYearStart,
  formatFellowshipId,
} from "../membership/fellowship-id";

const OFFICES = Object.values(FellowshipOffice);

interface OfficerProfile {
  office: FellowshipOffice;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  studyClass: string;
  course: string;
  yearOfStudy: string;
  dateOfBirth: Date;
}

export interface OpenYearInput {
  yearLabel: string;
  officers: OfficerProfile[];
}

export interface OpenedOfficer {
  office: FellowshipOffice;
  email: string;
  fellowshipId: string;
  created: boolean;
}

export interface OpenYearResult {
  yearLabel: string;
  officers: OpenedOfficer[];
}

/** Reads the operator file: { year_label, officers: [{ office, email, first_name, ... }] }. */
export function parseOpenYearInput(raw: unknown, now: Date): OpenYearInput {
  const file = asRecord(raw, "The file");
  const yearLabel = text(file.year_label, "year_label");
  fellowshipYearStart(yearLabel);

  if (
    !Array.isArray(file.officers) ||
    file.officers.length !== OFFICES.length
  ) {
    throw new Error(`officers must list exactly ${OFFICES.length} people.`);
  }

  const officers = file.officers.map((item: unknown, index: number) => {
    const row = asRecord(item, `officers[${index}]`);
    const office = text(row.office, `officers[${index}].office`);
    if (!isOffice(office)) {
      throw new Error(
        `officers[${index}].office must be one of ${OFFICES.join(", ")}.`,
      );
    }
    const email = text(row.email, `officers[${index}].email`).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`officers[${index}].email is not a valid email address.`);
    }
    return {
      office,
      email,
      firstName: text(row.first_name, `officers[${index}].first_name`),
      lastName: text(row.last_name, `officers[${index}].last_name`),
      phone: text(row.phone, `officers[${index}].phone`),
      studyClass: text(row.class, `officers[${index}].class`),
      course: text(row.course, `officers[${index}].course`),
      yearOfStudy: text(row.year_of_study, `officers[${index}].year_of_study`),
      dateOfBirth: parseDateOfBirth(
        text(row.date_of_birth, `officers[${index}].date_of_birth`),
        now,
      ),
    };
  });

  for (const office of OFFICES) {
    if (officers.filter((officer) => officer.office === office).length !== 1) {
      throw new Error(`Exactly one officer must hold ${office}.`);
    }
  }
  if (
    new Set(officers.map((officer) => officer.email)).size !== officers.length
  ) {
    throw new Error("Each officer must have a different email.");
  }

  return { yearLabel, officers };
}

/**
 * Opens a fellowship year and records its five office holders.
 * First year: officers who are not members yet are created as Active Members.
 * Later years: every officer must already be an Active Member and keeps their Fellowship ID.
 */
export async function openFellowshipYear(
  database: PrismaClient,
  input: OpenYearInput,
  now = new Date(),
): Promise<OpenYearResult> {
  const startYear = fellowshipYearStart(input.yearLabel);

  return database.$transaction(async (tx) => {
    const operative = await tx.fellowshipYear.findFirst({
      where: { operativeSlot: 1 },
      select: { label: true },
    });
    if (operative) {
      throw new Error(
        `Fellowship year ${operative.label} is still open or closed. Archive it before opening another year.`,
      );
    }
    const sameLabel = await tx.fellowshipYear.findUnique({
      where: { label: input.yearLabel },
      select: { id: true },
    });
    if (sameLabel) {
      throw new Error(`Fellowship year ${input.yearLabel} already exists.`);
    }
    const isFirstYear = (await tx.fellowshipYear.count()) === 0;

    const existing = await tx.person.findMany({
      where: { email: { in: input.officers.map((officer) => officer.email) } },
      include: { membership: true, account: true },
    });
    const byEmail = new Map(existing.map((person) => [person.email, person]));

    const plans = input.officers.map((officer) => {
      const person = byEmail.get(officer.email);
      if (person) {
        if (
          person.membership?.status !== MembershipStatus.ACTIVE ||
          person.account?.status !== AccountStatus.ACTIVE
        ) {
          throw new Error(
            `${officer.email} exists but is not an Active Member with an enabled account.`,
          );
        }
        return {
          officer,
          personId: person.id,
          fellowshipId: person.membership.fellowshipId,
        };
      }
      if (!isFirstYear) {
        throw new Error(
          `${officer.email} is not a member. After the first year, every officer must already be an Active Member.`,
        );
      }
      return { officer, personId: null, fellowshipId: null };
    });

    const newOfficers = plans.filter((plan) => plan.personId === null).length;
    const year = await tx.fellowshipYear.create({
      data: {
        label: input.yearLabel,
        status: FellowshipYearStatus.OPEN,
        operativeSlot: 1,
        startedAt: now,
        lastIssuedMemberNumber: newOfficers,
      },
    });

    let sequence = 0;
    const opened: OpenedOfficer[] = [];
    for (const plan of plans) {
      const { officer } = plan;
      let personId = plan.personId;
      let fellowshipId = plan.fellowshipId;

      if (personId === null || fellowshipId === null) {
        sequence += 1;
        fellowshipId = formatFellowshipId(
          startYear,
          birthDay(officer.dateOfBirth),
          sequence,
        );
        const person = await tx.person.create({
          data: {
            email: officer.email,
            firstName: officer.firstName,
            lastName: officer.lastName,
            phone: officer.phone,
            studyClass: officer.studyClass,
            course: officer.course,
            yearOfStudy: officer.yearOfStudy,
            dateOfBirth: officer.dateOfBirth,
          },
        });
        personId = person.id;
        const application = await tx.application.create({
          data: {
            personId,
            status: ApplicationStatus.APPROVED,
            submittedAt: now,
            expiresAt: now,
            approvedAt: now,
          },
        });
        await tx.membership.create({
          data: {
            personId,
            applicationId: application.id,
            status: MembershipStatus.ACTIVE,
            fellowshipId,
            activatedAt: now,
          },
        });
        await tx.account.create({
          data: { personId, status: AccountStatus.ACTIVE },
        });
      }

      await tx.fellowshipOfficeAssignment.create({
        data: {
          personId,
          fellowshipYearId: year.id,
          office: officer.office,
          effectiveFrom: now,
        },
      });
      opened.push({
        office: officer.office,
        email: officer.email,
        fellowshipId,
        created: plan.personId === null,
      });
    }

    return { yearLabel: year.label, officers: opened };
  });
}

function isOffice(value: string): value is FellowshipOffice {
  return (OFFICES as string[]).includes(value);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}
