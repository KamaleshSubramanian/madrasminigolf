import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool as NodePool } from "pg";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Detect if we're using Neon or local PostgreSQL
const isNeonDatabase =
  process.env.DATABASE_URL.includes("neon.tech") ||
  process.env.DATABASE_URL.includes("neon.database") ||
  process.env.NODE_ENV === "production";

let pool: NeonPool | NodePool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isNeonDatabase) {
  // Neon serverless configuration
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Railway PostgreSQL configuration with SSL handling
  const connectionString = process.env.DATABASE_URL;
  const sslConfig = connectionString?.includes("railway")
    ? { rejectUnauthorized: false }
    : undefined;

  pool = new NodePool({
    connectionString: connectionString,
    ssl: sslConfig,
  });
  db = drizzleNode(pool, { schema });
}

export { pool, db };
