import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";
import { cancelShadowfaxOrder } from "@/lib/shadowfax";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ orderRef: string }> }) {
  const { orderRef } = await params;

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderRef, orderRef));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.shadowfaxRequestId) return NextResponse.json({ error: "No Shadowfax request ID for this order" }, { status: 400 });

  const result = await cancelShadowfaxOrder(order.shadowfaxRequestId);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 502 });
  }

  await db.update(schema.orders).set({ status: "CANCELLED" }).where(eq(schema.orders.orderRef, orderRef));

  return NextResponse.json({ success: true, message: `Shadowfax order ${order.shadowfaxRequestId} cancelled` });
}
