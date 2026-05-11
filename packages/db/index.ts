import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql, eq, desc, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { sql, eq, desc, inArray, schema };
export { manualInvoices } from "./schema";

/** Ensure orders table columns exist (batch, pickup date, weight). Safe on every admin/store request. */
let ensureOrdersColumnsPromise: Promise<void> | null = null;
export function ensureOrdersColumns(): Promise<void> {
  if (!ensureOrdersColumnsPromise) {
    ensureOrdersColumnsPromise = (async () => {
      await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS batch_id TEXT`);
      await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delhivery_pickup_date TEXT`);
      await db.execute(
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_category TEXT NOT NULL DEFAULT '150gm'`
      );
      await db.execute(
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_weight_grams INTEGER NOT NULL DEFAULT 150`
      );
      await db.execute(
        sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_weight_grams INTEGER NOT NULL DEFAULT 150`
      );
    })();
  }
  return ensureOrdersColumnsPromise;
}

export async function generateOrderRef(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `GCF-${timestamp}${randomPart}`;
}

export async function generateInvoiceRef(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `GCFINV-${timestamp}${randomPart}`;
}