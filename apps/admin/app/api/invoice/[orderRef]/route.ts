import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";
import { generateInvoicePdf } from "@/lib/invoice";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db.select().from(schema.orders).where(eq(schema.orders.orderRef, orderRef)).limit(1);
  if (!rows.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const order = rows[0];

  if (order.invoiceKey) {
    try {
      const s3Res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: order.invoiceKey }));
      const body = await s3Res.Body!.transformToByteArray();
      const buffer = new ArrayBuffer(body.byteLength);
      new Uint8Array(buffer).set(body);
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="Invoice-${orderRef}.pdf"`,
        },
      });
    } catch {}
  }

  const pdf = await generateInvoicePdf({
    invoiceNumber: order.invoiceNumber ?? "—",
    orderRef: order.orderRef,
    date: order.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
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

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Invoice-${orderRef}.pdf"`,
    },
  });
}