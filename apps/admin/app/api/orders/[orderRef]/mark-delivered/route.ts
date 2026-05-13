import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ orderRef: string }> }) {
  const { orderRef } = await params;

  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.orderRef, orderRef));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await db.update(schema.orders)
    .set({ status: "DELIVERED" })
    .where(eq(schema.orders.orderRef, orderRef));

  return NextResponse.json({ success: true });
}
