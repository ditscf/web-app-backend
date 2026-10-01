import {
  AccountStatus,
  ApplicationStatus,
  FellowshipOffice,
  FellowshipYearStatus,
  MembershipStatus,
  type PrismaClient,
} from "../../generated/prisma/client";
import { openFellowshipYear, parseOpenYearInput } from "./open-fellowship-year";

const now = new Date("2026-09-30T12:00:00.000Z");

const file = {
  year_label: "2025/2026",
  officers: [
    officer("CHAIRMAN", "aishamushi@gmail.com", "2004-03-14"),
    officer("VICE_CHAIRMAN", "jamesmwakasege@gmail.com", "2003-11-22"),
    officer("GENERAL_SECRETARY", "fatumahassan@gmail.com", "2005-07-08"),
    officer("VICE_GENERAL_SECRETARY", "davidkimaro@gmail.com", "1998-09-30"),
    officer("TREASURER", "gracenkwabi@gmail.com", "2004-01-19"),
  ],
};

describe("open fellowship year", () => {
  const database = {
    fellowshipYear: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    person: { findMany: vi.fn(), create: vi.fn() },
    application: { create: vi.fn() },
    membership: { create: vi.fn() },
    account: { create: vi.fn() },
    fellowshipOfficeAssignment: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  const client = database as unknown as PrismaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(
      async (callback: (tx: typeof database) => unknown) => callback(database),
    );
    database.fellowshipYear.findFirst.mockResolvedValue(null);
    database.fellowshipYear.findUnique.mockResolvedValue(null);
    database.fellowshipYear.count.mockResolvedValue(0);
    database.fellowshipYear.create.mockImplementation(
      async ({ data }: { data: { label: string } }) => ({
        id: "year-1",
        ...data,
      }),
    );
    database.person.findMany.mockResolvedValue([]);
    database.person.create.mockImplementation(
      async ({ data }: { data: { email: string } }) => ({
        id: `person-${data.email}`,
      }),
    );
    database.application.create.mockResolvedValue({ id: "application-1" });
    database.membership.create.mockResolvedValue({});
    database.account.create.mockResolvedValue({});
    database.fellowshipOfficeAssignment.create.mockResolvedValue({});
  });

  it("creates the first five officers as Active Members with Fellowship IDs and offices", async () => {
    const result = await openFellowshipYear(
      client,
      parseOpenYearInput(file, now),
      now,
    );

    expect(result.officers.map((item) => item.fellowshipId)).toEqual([
      "25140001",
      "25220002",
      "25080003",
      "25300004",
      "25190005",
    ]);
    expect(database.fellowshipYear.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        label: "2025/2026",
        status: FellowshipYearStatus.OPEN,
        operativeSlot: 1,
        lastIssuedMemberNumber: 5,
      }),
    });
    expect(database.application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: ApplicationStatus.APPROVED }),
    });
    expect(database.membership.create).toHaveBeenCalledTimes(5);
    expect(database.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: AccountStatus.ACTIVE }),
    });
    expect(database.fellowshipOfficeAssignment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        personId: "person-fatumahassan@gmail.com",
        office: FellowshipOffice.GENERAL_SECRETARY,
      }),
    });
  });

  it("refuses to open a year while another year is still open or closed", async () => {
    database.fellowshipYear.findFirst.mockResolvedValue({ label: "2025/2026" });

    await expect(
      openFellowshipYear(client, parseOpenYearInput(file, now), now),
    ).rejects.toThrow("Archive it before opening another year.");
    expect(database.fellowshipYear.create).not.toHaveBeenCalled();
  });

  it("keeps an existing member's person record and Fellowship ID in a later year", async () => {
    database.fellowshipYear.count.mockResolvedValue(1);
    database.person.findMany.mockResolvedValue(
      file.officers.map((item, index) => ({
        id: `person-${index}`,
        email: item.email,
        membership: {
          status: MembershipStatus.ACTIVE,
          fellowshipId: `2516000${index + 1}`,
        },
        account: { status: AccountStatus.ACTIVE },
      })),
    );

    const result = await openFellowshipYear(
      client,
      parseOpenYearInput({ ...file, year_label: "2026/2027" }, now),
      now,
    );

    expect(result.officers[0]).toEqual({
      office: FellowshipOffice.CHAIRMAN,
      email: "aishamushi@gmail.com",
      fellowshipId: "25160001",
      created: false,
    });
    expect(database.person.create).not.toHaveBeenCalled();
    expect(database.membership.create).not.toHaveBeenCalled();
    expect(database.fellowshipOfficeAssignment.create).toHaveBeenCalledTimes(5);
  });

  it("refuses a new person after the first year", async () => {
    database.fellowshipYear.count.mockResolvedValue(1);

    await expect(
      openFellowshipYear(
        client,
        parseOpenYearInput({ ...file, year_label: "2026/2027" }, now),
        now,
      ),
    ).rejects.toThrow("every officer must already be an Active Member");
    expect(database.fellowshipYear.create).not.toHaveBeenCalled();
  });

  it("refuses an Associate as an officer", async () => {
    database.person.findMany.mockResolvedValue([
      {
        id: "person-1",
        email: "aishamushi@gmail.com",
        membership: {
          status: MembershipStatus.ASSOCIATE,
          fellowshipId: "25140001",
        },
        account: { status: AccountStatus.DISABLED },
      },
    ]);

    await expect(
      openFellowshipYear(client, parseOpenYearInput(file, now), now),
    ).rejects.toThrow("is not an Active Member");
  });

  it("requires each office exactly once, so General Secretary and Vice General Secretary are two people", () => {
    const officers = [...file.officers];
    officers[3] = {
      ...officers[3],
      office: "GENERAL_SECRETARY",
    };

    expect(() => parseOpenYearInput({ ...file, officers }, now)).toThrow(
      "Exactly one officer must hold GENERAL_SECRETARY.",
    );
  });

  it("refuses the same email for two offices", () => {
    const officers = [...file.officers];
    officers[3] = { ...officers[3], email: officers[2].email };

    expect(() => parseOpenYearInput({ ...file, officers }, now)).toThrow(
      "Each officer must have a different email.",
    );
  });
});

function officer(office: string, email: string, dateOfBirth: string) {
  return {
    office,
    email,
    first_name: "First",
    last_name: "Last",
    phone: "+255 700 000 000",
    class: "Bachelor Degree",
    course: "Engineering",
    year_of_study: "2025/2026",
    date_of_birth: dateOfBirth,
  };
}
