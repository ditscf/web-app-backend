import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const PREDEFINED_MINISTRIES = [
  "Praise Team",
  "Media Team",
  "Dancers",
  "Evangelists",
  "Teachers of the Word",
  "Instrumentalists",
] as const;

async function seedMinistries(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    for (const name of PREDEFINED_MINISTRIES) {
      await database.ministry.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log(`Ministries ready: ${PREDEFINED_MINISTRIES.join(", ")}.`);
  } finally {
    await database.$disconnect();
  }
}

void seedMinistries().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
