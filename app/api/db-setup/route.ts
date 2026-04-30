import { NextResponse } from "next/server";
import { setupSchema } from "@/lib/db";

/** GET /api/db-setup — run once to create the orders table */
export async function GET() {
  try {
    await setupSchema();
    return NextResponse.json({ ok: true, message: "Orders table ready" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
