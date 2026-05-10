/**
 * Apply SQL migrations in ./drizzle (see drizzle/meta/_journal.json).
 * Loads DATABASE_URL from apps/admin/.env or repo-root .env if present.
 *
 * If migration 0000 fails because enums/tables already exist, we insert a baseline
 * row for 0000 into drizzle.__drizzle_migrations and retry (common for Neon DBs
 * created before Drizzle migrate was used).
 */
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsFolder = join(root, "drizzle");

for (const rel of ["apps/admin/.env", ".env"]) {
  const p = join(root, rel);
  if (existsSync(p)) {
    config({ path: p });
    break;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to apps/admin/.env or export it.");
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL));

/** sha256 of drizzle/0000_worried_omega_red.sql — must match drizzle-kit journal. */
const HASH_0000 =
  "f4698b83ba523eb62e040373ecf0506b682e6b315a08e5666fb356916b3cd1dc";
const WHEN_0000 = 1777586406629;

function isDuplicateSchemaObjectError(err) {
  const cause = err?.cause?.message ?? err?.message ?? String(err);
  return (
    cause.includes("already exists") &&
    (cause.includes("document_source") ||
      cause.includes("document_type") ||
      /type.*already exists/i.test(cause))
  );
}

try {
  await migrate(db, { migrationsFolder });
} catch (err) {
  if (!isDuplicateSchemaObjectError(err)) throw err;
  console.warn(
    "Baseline: marking 0000_worried_omega_red as applied, then retrying migrations…"
  );
  await db.execute(sql.raw(`
    INSERT INTO drizzle.__drizzle_migrations ("hash", created_at)
    SELECT '${HASH_0000}', ${WHEN_0000}
    WHERE NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE "hash" = '${HASH_0000}')
  `));
  await migrate(db, { migrationsFolder });
}

console.log("Migrations finished.");
