import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../src/database/database.service";
import {
  openFellowshipYear,
  parseOpenYearInput,
} from "../src/fellowship-years/open-fellowship-year";

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    throw new Error("Usage: npm run open-year -- <path-to-officers.json>");
  }

  const input = parseOpenYearInput(
    JSON.parse(await readFile(resolve(file), "utf8")) as unknown,
    new Date(),
  );
  const database = new DatabaseService(new ConfigService());
  try {
    const result = await openFellowshipYear(database, input);
    console.log(`Fellowship year ${result.yearLabel} is open.`);
    console.table(
      result.officers.map((officer) => ({
        office: officer.office,
        email: officer.email,
        fellowshipId: officer.fellowshipId,
        member: officer.created ? "created" : "existing",
      })),
    );
    if ((await database.ministry.count()) === 0) {
      console.log(
        "No ministries exist yet. Run npm run seed:ministries so officers can finish onboarding.",
      );
    }
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
