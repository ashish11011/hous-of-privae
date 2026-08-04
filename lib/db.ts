import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

const client = postgres(process.env.DATABASE_URL as string, {
  connect_timeout: 5,
  max_lifetime: null,
});
export const db = drizzle(client, { schema });
