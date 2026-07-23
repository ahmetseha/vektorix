import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const root = globalThis as typeof globalThis & {
  __vektorixPostgresPool?: Pool;
};

const pool = databaseUrl
  ? (root.__vektorixPostgresPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 6,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 5_000,
    }))
  : null;

if (pool) root.__vektorixPostgresPool = pool;

export const database = pool ? drizzle(pool, { schema }) : null;
export const hasPersistentDatabase = database !== null;
