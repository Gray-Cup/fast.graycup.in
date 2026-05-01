import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db, schema } from "@graycup/db";
import { eq } from "drizzle-orm";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.orderRef, orderRef))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const o = rows[0];

  const pdf = await renderToBuffer(
    React.createElement(InvoicePdf, {
      data: {
        invoiceNumber: o.invoiceNumber ?? "—",
        orderRef: o.orderRef,
        date: o.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        customerAddress: o.customerAddress,
        customerPincode: o.customerPincode,
        productName: o.productName,
        variantLabel: o.variantLabel,
        quantity: o.quantity,
        amount: o.amount,
        gstAmount: o.gstAmount,
      },
    }) as React.ReactElement<any>
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${orderRef}.pdf"`,
    },
  });
}
