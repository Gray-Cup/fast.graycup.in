import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db.select().from(schema.orders).where(eq(schema.orders.orderRef, orderRef)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const order = rows[0];

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const cashfreeEnv = process.env.CASHFREE_ENV || "sandbox";

  if (!appId || !secretKey) {
    return NextResponse.json({ error: "Cashfree credentials not configured" }, { status: 500 });
  }

  const apiBase = cashfreeEnv === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  const cfRes = await fetch(`${apiBase}/orders/${orderRef}`, {
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
  });

  if (!cfRes.ok) {
    const errData = await cfRes.json().catch(() => ({}));
    return NextResponse.json({ error: errData.message || "Failed to verify with Cashfree" }, { status: 502 });
  }

  const cfData = await cfRes.json();

  const paymentsRes = await fetch(`${apiBase}/orders/${orderRef}/payments`, {
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
  });

  let transactionId: string | null = null;
  let paymentStatus: string | null = null;

  if (paymentsRes.ok) {
    const paymentsData = await paymentsRes.json();
    const successfulPayment = Array.isArray(paymentsData) && paymentsData.find((p: { payment_status: string }) => p.payment_status === "SUCCESS");
    if (successfulPayment) {
      transactionId = String(successfulPayment.cf_payment_id || "");
      paymentStatus = successfulPayment.payment_status;
    }
  }

  if (cfData.order_status === "PAID" && order.status !== "PAID") {
    await db.update(schema.orders).set({ status: "PAID" }).where(eq(schema.orders.orderRef, orderRef));
    return NextResponse.json({
      verified: true,
      orderStatus: "PAID",
      cfOrderStatus: cfData.order_status,
      transactionId,
      message: "Payment verified and status updated to PAID",
    });
  }

  return NextResponse.json({
    verified: paymentStatus === "SUCCESS" || cfData.order_status === "PAID",
    orderStatus: order.status,
    cfOrderStatus: cfData.order_status,
    transactionId: transactionId || undefined,
    message: transactionId
      ? `Payment successful. Transaction ID: ${transactionId}`
      : `Order status: ${cfData.order_status}`,
  });
}