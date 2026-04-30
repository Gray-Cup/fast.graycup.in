import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { count, sql, eq, desc } from "drizzle-orm";
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

export { sql, count, eq, desc, schema };

export async function generateOrderRef(): Promise<string> {
  const result = await db.select({ count: count() }).from(schema.orders);
  const n = Number(result[0].count) + 1;
  return `GCF-${String(n).padStart(4, "0")}`;
}