import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3, BUCKET } from "@/lib/s3";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db.select().from(orders).where(eq(orders.orderRef, orderRef)).limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = rows[0];

  const pdf = await generateInvoicePdf({
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