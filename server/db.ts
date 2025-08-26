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

// Detect if we're using Neon or Railway PostgreSQL
const isNeonDatabase =
  process.env.DATABASE_URL.includes("neon.tech") ||
  process.env.DATABASE_URL.includes("neon.database");

const isRailwayDatabase =
  process.env.DATABASE_URL.includes("railway") ||
  process.env.DATABASE_URL.includes("proxy.rlwy.net");

let pool: NeonPool | NodePool;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzleNode>;

if (isNeonDatabase) {
  // Neon serverless configuration
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Railway or Local PostgreSQL configuration
  const connectionString = process.env.DATABASE_URL;

  // For Railway databases, disable SSL certificate verification
  const sslConfig = isRailwayDatabase
    ? { rejectUnauthorized: false }
    : connectionString?.startsWith("postgres://")
    ? { rejectUnauthorized: false }
    : undefined;

  pool = new NodePool({
    connectionString: connectionString,
    ssl: sslConfig,
  });
  db = drizzleNode(pool, { schema });
}

export { pool, db };
