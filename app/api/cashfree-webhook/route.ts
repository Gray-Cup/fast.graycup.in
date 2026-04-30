import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { sql } from "@/lib/db";
import { createShipment, getPincodeDetails } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // Verify Cashfree webhook signature
    if (signature && timestamp && secretKey) {
      const expectedSig = createHmac("sha256", secretKey)
        .update(timestamp + rawBody)
        .digest("base64");
      if (expectedSig !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({ ok: true });
    }

    const orderRef: string = data?.order?.order_id;
    if (!orderRef) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Fetch the order from DB
    const rows = await sql`SELECT * FROM orders WHERE order_ref = ${orderRef} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = rows[0];

    // Skip if already processed
    if (order.status === "PAID" || order.delhivery_waybill) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Mark as PAID
    await sql`UPDATE orders SET status = 'PAID' WHERE order_ref = ${orderRef}`;

    // Create Delhivery shipment
    const pincodeInfo = await getPincodeDetails(order.customer_pincode).catch(() => null);
    const weightKg = 0.5; // default; in a real app derive from product weight

    const delhivery = await createShipment({
      orderRef,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      address: order.customer_address,
      pincode: order.customer_pincode,
      city: pincodeInfo?.city || "",
      state: pincodeInfo?.state || "",
      productDesc: `${order.product_name} ${order.variant_label} ×${order.quantity}`,
      totalAmount: order.amount,
      weightKg,
    });

    if (delhivery.success && delhivery.waybill) {
      await sql`
        UPDATE orders
        SET delhivery_waybill = ${delhivery.waybill}, status = 'DISPATCHED'
        WHERE order_ref = ${orderRef}
      `;
    } else {
      console.error(`Delhivery failed for ${orderRef}:`, delhivery.error);
      // Still mark PAID; can retry dispatch manually
      await sql`
        UPDATE orders
        SET status = 'PAID_DISPATCH_PENDING'
        WHERE order_ref = ${orderRef}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
