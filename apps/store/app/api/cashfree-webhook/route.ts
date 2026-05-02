import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { orders, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3, BUCKET } from "@/lib/s3";
import { generateInvoicePdf } from "@/lib/invoice";
import { generateInvoiceRef } from "@graycup/db";

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

    // Idempotency: skip if already processed
    const existing = await db.select().from(orders).where(eq(orders.orderRef, orderRef)).limit(1);
    if (existing.length && existing[0].status === "PAID") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Reconstruct order data from Cashfree's order_tags + customer_details
    const tags: Record<string, string> = data?.order?.order_tags ?? {};
    const customerDetails = data?.customer_details ?? {};

    const productId = tags.productId ?? "";
    const productName = tags.productName ?? "";
    const variantLabel = tags.variantLabel ?? "";
    const quantity = parseInt(tags.quantity ?? "1", 10);
    const amount = Math.round(Number(data?.order?.order_amount ?? 0));
    const gstAmount = parseInt(tags.gstAmount ?? "0", 10);
    const batchId = tags.batchId || null;
    const customerAddress = tags.customerAddress ?? "";
    const customerPincode = tags.customerPincode ?? "";
    const customerName = customerDetails.customer_name ?? "";
    const customerPhone = customerDetails.customer_phone ?? "";
    const customerEmail = customerDetails.customer_email || null;
    const cfPaymentId = String(data?.payment?.cf_payment_id ?? orderRef);

    const invoiceNumber = await generateInvoiceRef();
    const now = new Date();

    await db.insert(orders).values({
      orderRef,
      cashfreeOrderId: cfPaymentId,
      productId,
      productName,
      variantLabel,
      quantity,
      amount,
      gstAmount,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerPincode,
      batchId,
      status: "PAID",
      invoiceNumber,
    });

    const invoicePdf = await generateInvoicePdf({
      invoiceNumber,
      orderRef,
      date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerPincode,
      productName,
      variantLabel,
      quantity,
      amount,
      gstAmount,
    });

    const invoiceKey = `invoices/${orderRef}.pdf`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: invoiceKey,
      Body: new Uint8Array(invoicePdf),
      ContentType: "application/pdf",
    }));

    await db.update(orders).set({ invoiceKey }).where(eq(orders.orderRef, orderRef));

    await db.insert(documents).values({
      type: "INVOICE",
      source: "STORE",
      key: invoiceKey,
      orderRef,
      filename: `Invoice-${orderRef}.pdf`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
