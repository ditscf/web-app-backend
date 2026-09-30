import { resolve } from "path";
import { config as loadEnv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { DatabaseService } from "../src/database/database.service";

// Load env before AppModule is loaded (Nest validates DATABASE_URL, JWT_SECRET, etc.).
const root = resolve(__dirname, "..");
loadEnv({ path: resolve(root, ".env") });
loadEnv({
    path: resolve(root, `.env.${process.env.NODE_ENV || "development"}`),
    override: true,
});

async function clear() {
    const { AppModule } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic import() resolves to missing src/app.module.js; require uses ts-node .ts hook
        require("../src/app.module") as typeof import("../src/app.module");

    const app = await NestFactory.createApplicationContext(AppModule);

    const db = app.get(DatabaseService);

    await db.clearDatabase();

    console.log("Database cleared");

    await app.close();
}

clear().catch((err) => {
    console.error(err);
    process.exit(1);
});
