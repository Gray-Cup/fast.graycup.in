import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/** GET /api/db-setup — run once to create the orders table */
export async function GET() {
  try {
    await db.execute(sql`
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
        invoice_key       TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    return NextResponse.json({ ok: true, message: "Orders table ready" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
