import "dotenv/config";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../src/database/database.service";

async function clear(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to clear the database when NODE_ENV is production.",
    );
  }

  const database = new DatabaseService(new ConfigService());
  try {
    await database.clearDatabase();
    console.log(
      "Database cleared. Run npm run seed:ministries to restore the ministries.",
    );
  } finally {
    await database.$disconnect();
  }
}

clear().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
