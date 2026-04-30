import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3, BUCKET } from "@/lib/s3";
import { createShipment, getPincodeDetails } from "@/lib/delhivery";
import { generateInvoicePdf } from "@/lib/invoice";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const secretKey = process.env.CASHFREE_SECRET_KEY;

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

    const rows = await db.select().from(orders).where(eq(orders.orderRef, orderRef)).limit(1);
    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = rows[0];

    if (order.status === "PAID" || order.delhiveryWaybill) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await db.update(orders).set({ status: "PAID" }).where(eq(orders.orderRef, orderRef));

    const pincodeInfo = await getPincodeDetails(order.customerPincode).catch(() => null);

    const delhivery = await createShipment({
      orderRef,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.customerAddress,
      pincode: order.customerPincode,
      city: pincodeInfo?.city || "",
      state: pincodeInfo?.state || "",
      productDesc: `${order.productName} ${order.variantLabel} ×${order.quantity}`,
      totalAmount: order.amount,
      weightKg: 0.5,
    });

    if (delhivery.success && delhivery.waybill) {
      await db.update(orders)
        .set({ delhiveryWaybill: delhivery.waybill, status: "DISPATCHED" })
        .where(eq(orders.orderRef, orderRef));
    } else {
      console.error(`Delhivery failed for ${orderRef}:`, delhivery.error);
      await db.update(orders)
        .set({ status: "PAID_DISPATCH_PENDING" })
        .where(eq(orders.orderRef, orderRef));
    }

    const invoicePdf = await generateInvoicePdf({
      orderRef,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      customerAddress: order.customerAddress,
      customerPincode: order.customerPincode,
      productName: order.productName,
      variantLabel: order.variantLabel,
      quantity: order.quantity,
      amount: order.amount,
      gstAmount: order.gstAmount,
    });

    const invoiceKey = `invoices/${orderRef}.pdf`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: invoiceKey,
      Body: new Uint8Array(invoicePdf),
      ContentType: "application/pdf",
    }));

    await db.update(orders).set({ invoiceKey }).where(eq(orders.orderRef, orderRef));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}