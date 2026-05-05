import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";

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
  const status = order.status?.trim().toUpperCase();

  if (status === "DELIVERED") {
    return NextResponse.json({ error: "Cannot refund a delivered order" }, { status: 400 });
  }

  if (!["PAID", "PAID_DISPATCH_PENDING", "DISPATCHED"].includes(status)) {
    return NextResponse.json({ error: `Cannot refund order in status: ${status}` }, { status: 400 });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const cashfreeEnv = process.env.CASHFREE_ENV || "sandbox";

  if (!appId || !secretKey) {
    return NextResponse.json({ error: "Cashfree credentials not configured" }, { status: 500 });
  }

  const apiBase =
    cashfreeEnv === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  const refundId = `${orderRef}-REFUND-${Date.now()}`;

  const cfRes = await fetch(`${apiBase}/orders/${orderRef}/refunds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      refund_amount: order.amount,
      refund_id: refundId,
      refund_note: `Refund for order ${orderRef}`,
    }),
  });

  const cfData = await cfRes.json();

  if (!cfRes.ok) {
    return NextResponse.json(
      { error: cfData.message || "Cashfree refund failed", _debug: cfData },
      { status: 502 }
    );
  }

  await db
    .update(schema.orders)
    .set({ status: "REFUNDED" })
    .where(eq(schema.orders.orderRef, orderRef));

  return NextResponse.json({ success: true, refundId, cfRefundStatus: cfData.refund_status });
}
