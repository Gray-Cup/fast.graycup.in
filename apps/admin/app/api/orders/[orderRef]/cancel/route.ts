import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";
import { cancelShipment } from "@/lib/delhivery";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.orderRef, orderRef))
    .limit(1);

  if (!rows.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const order = rows[0];

  if (!order.delhiveryWaybill) {
    return NextResponse.json({ error: "No waybill to cancel" }, { status: 400 });
  }

  const result = await cancelShipment(order.delhiveryWaybill);

  if (result.success) {
    await db
      .update(schema.orders)
      .set({ status: "CANCELLED" })
      .where(eq(schema.orders.orderRef, orderRef));
    return NextResponse.json({ success: true, message: "Shipment cancelled" });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 502 });
}
