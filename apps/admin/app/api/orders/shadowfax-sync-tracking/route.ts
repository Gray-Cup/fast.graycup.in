import { NextRequest, NextResponse } from "next/server";
import { db, schema, ensureOrdersColumns } from "@graycup/db";
import { and, eq, inArray, isNotNull, notInArray } from "drizzle-orm";
import { trackMultipleShadowfaxOrders, mapShadowfaxStatus } from "@/lib/shadowfax";

const TERMINAL_STATUSES = ["DELIVERED", "RETURNED", "CANCELLED"];

export async function POST(req: NextRequest) {
  await ensureOrdersColumns();
  const body = await req.json().catch(() => ({}));
  const { orderRefs } = body as { orderRefs?: string[] };

  const conditions = [
    notInArray(schema.orders.status, TERMINAL_STATUSES),
    isNotNull(schema.orders.shadowfaxRequestId),
    eq(schema.orders.carrier, "shadowfax"),
    ...(orderRefs?.length ? [inArray(schema.orders.orderRef, orderRefs)] : []),
  ];

  const orders = await db.select().from(schema.orders).where(and(...conditions));

  if (orders.length === 0) {
    return NextResponse.json({ message: "No in-transit Shadowfax orders to sync" });
  }

  const requestIds = orders.map((o) => o.shadowfaxRequestId!);
  const tracking = await trackMultipleShadowfaxOrders(requestIds);

  let updated = 0;

  for (const order of orders) {
    const info = tracking[order.shadowfaxRequestId!];
    if (!info) continue;

    const newStatus = mapShadowfaxStatus(info.status);
    if (newStatus && newStatus !== order.status) {
      await db.update(schema.orders)
        .set({ status: newStatus })
        .where(eq(schema.orders.orderRef, order.orderRef));
      updated++;
    }
  }

  return NextResponse.json({
    message: `${updated > 0 ? `${updated} updated` : "No changes"} — checked ${orders.length} Shadowfax order${orders.length !== 1 ? "s" : ""}`,
    checked: orders.length,
    updated,
  });
}
