import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "../../../migrations/schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.log("Cannot find DATABASE_URL in .env file");
}

const client = postgres(process.env.DATABASE_URL as string, {
  max: 1,
  prepare: false,
});

const db = drizzle(client, { schema });
export const migrateDb = async () => {
  // console.log("Migrating Client");
  try {
    await migrate(db, { migrationsFolder: "migrations" });
    // console.log("Client Migrated");
  } catch (e) {
    console.log("Migrating Failed - ", e);
  }
};

export default db;
