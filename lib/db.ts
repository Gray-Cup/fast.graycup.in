import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

/** Run once to create tables. Call via /api/db-setup in dev. */
export async function setupSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      tagline     TEXT NOT NULL,
      description TEXT NOT NULL,
      category    TEXT NOT NULL,
      image_url   TEXT NOT NULL,
      badge       TEXT,
      variants    JSONB NOT NULL DEFAULT '[]',
      active      BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL PRIMARY KEY,
      order_ref       TEXT UNIQUE NOT NULL,
      cashfree_order_id TEXT,
      product_id      INTEGER REFERENCES products(id),
      variant_label   TEXT NOT NULL,
      quantity        INTEGER NOT NULL,
      amount          INTEGER NOT NULL,
      gst_amount      INTEGER NOT NULL,
      customer_name   TEXT NOT NULL,
      customer_phone  TEXT NOT NULL,
      customer_email  TEXT,
      customer_address TEXT NOT NULL,
      customer_pincode TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'PENDING',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

/** Generate next GCF order ref: GCF-0001, GCF-0002, ... */
export async function generateOrderRef(): Promise<string> {
  const result = await sql`SELECT COUNT(*) as count FROM orders`;
  const count = Number(result[0].count) + 1;
  return `GCF-${String(count).padStart(4, "0")}`;
}
