import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { trackMultipleShipments, mapDelhiveryStatus } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { orderRefs } = body as { orderRefs?: string[] };

  // Only sync DISPATCHED orders that have a waybill.
  // Skips: no waybill, DELIVERED, RETURNED, CANCELLED, PAID*, PENDING.
  const conditions = [
    eq(schema.orders.status, "DISPATCHED"),
    isNotNull(schema.orders.delhiveryWaybill),
    ...(orderRefs?.length ? [inArray(schema.orders.orderRef, orderRefs)] : []),
  ];

  const orders = await db
    .select()
    .from(schema.orders)
    .where(and(...conditions));

  if (orders.length === 0) {
    return NextResponse.json({ message: "No in-transit orders to sync" });
  }

  const waybills = orders.map((o) => o.delhiveryWaybill!);
  const tracking = await trackMultipleShipments(waybills);

  let updated = 0;

  for (const order of orders) {
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
    message: `${updated > 0 ? `${updated} updated` : "No changes"} — checked ${orders.length} in-transit order${orders.length !== 1 ? "s" : ""}`,
    checked: orders.length,
    updated,
  });
}
