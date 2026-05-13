import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderRef: string }> }) {
  const { orderRef } = await params;
  const { awb } = await req.json().catch(() => ({}));

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderRef, orderRef));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const update: Record<string, string> = { status: "DELIVERED" };
  if (awb?.trim()) {
    if (order.carrier === "shadowfax") {
      update.shadowfaxRequestId = awb.trim();
    } else {
      update.delhiveryWaybill = awb.trim();
    }
  }

  await db.update(schema.orders).set(update).where(eq(schema.orders.orderRef, orderRef));

  return NextResponse.json({ success: true });
}
