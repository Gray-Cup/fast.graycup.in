import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq, inArray } from "drizzle-orm";
import { trackMultipleShipments, mapDelhiveryStatus } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { orderRefs } = body as { orderRefs?: string[] };

  // Fetch orders that have a waybill — either the specified ones or all DISPATCHED orders
  let orders;
  if (orderRefs && orderRefs.length > 0) {
    orders = await db
      .select()
      .from(schema.orders)
      .where(inArray(schema.orders.orderRef, orderRefs));
  } else {
    orders = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.status, "DISPATCHED"));
  }

  const withWaybill = orders.filter((o) => o.delhiveryWaybill);

  if (withWaybill.length === 0) {
    return NextResponse.json({ message: "No in-transit orders to sync" });
  }

  const waybills = withWaybill.map((o) => o.delhiveryWaybill!);
  const tracking = await trackMultipleShipments(waybills);

  let updated = 0;

  for (const order of withWaybill) {
    const info = tracking[order.delhiveryWaybill!];
    if (!info) continue;

    const newStatus = mapDelhiveryStatus(info.statusType);
    if (newStatus && newStatus !== order.status) {
      await db
        .update(schema.orders)
        .set({ status: newStatus })
        .where(eq(schema.orders.orderRef, order.orderRef));
      updated++;
    }
  }

  return NextResponse.json({
    message: `Synced ${withWaybill.length} order(s), ${updated} status update(s)`,
    checked: withWaybill.length,
    updated,
  });
}
