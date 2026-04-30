import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.local.example to .env.local and add your Neon connection string."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (getDb() as any)(...args);
    },
    get(_target, prop) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (getDb() as any)[prop];
    },
  }
);

export async function setupSchema() {
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS orders (
      id                SERIAL PRIMARY KEY,
      order_ref         TEXT UNIQUE NOT NULL,
      cashfree_order_id TEXT,
      product_id        TEXT NOT NULL,
      product_name      TEXT NOT NULL,
      variant_label     TEXT NOT NULL,
      quantity          INTEGER NOT NULL,
      amount            INTEGER NOT NULL,
      gst_amount        INTEGER NOT NULL,
      customer_name     TEXT NOT NULL,
      customer_phone    TEXT NOT NULL,
      customer_email    TEXT,
      customer_address  TEXT NOT NULL,
      customer_pincode  TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'PENDING',
      delhivery_waybill TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function generateOrderRef(): Promise<string> {
  const db = getDb();
  const result = await db`SELECT COUNT(*) as count FROM orders`;
  const count = Number(result[0].count) + 1;
  return `GCF-${String(count).padStart(4, "0")}`;
}
