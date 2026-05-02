import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { inArray } from "drizzle-orm";
import { triggerPickup } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  const { orderRefs } = await req.json();

  if (!Array.isArray(orderRefs) || orderRefs.length === 0) {
    return NextResponse.json({ error: "No orderRefs provided" }, { status: 400 });
  }

  const orders = await db
    .select({ delhiveryWaybill: schema.orders.delhiveryWaybill })
    .from(schema.orders)
    .where(inArray(schema.orders.orderRef, orderRefs));

  const count = orders.filter((o) => o.delhiveryWaybill).length;

  if (count === 0) {
    return NextResponse.json({ error: "None of the selected orders have a waybill" }, { status: 400 });
  }

  const result = await triggerPickup(count);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    pickupId: result.pickupId,
    message: `Pickup scheduled for ${count} package(s)${result.pickupId ? ` · ID ${result.pickupId}` : ""}`,
  });
}
