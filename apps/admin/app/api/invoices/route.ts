import { NextRequest, NextResponse } from "next/server";
import { db, schema, generateInvoiceRef } from "@graycup/db";
import { eq, inArray } from "drizzle-orm";
import { generateMultiInvoicePdf, generateGstSummaryPdf } from "@/lib/invoice";

export async function POST(req: NextRequest) {
  try {
    const { orderRefs, type } = await req.json();
    if (!orderRefs?.length) return NextResponse.json({ error: "No orders selected" }, { status: 400 });

    const rows = await db.select().from(schema.orders).where(inArray(schema.orders.orderRef, orderRefs));
    if (!rows.length) return NextResponse.json({ error: "No orders found" }, { status: 404 });

    const invoices = await Promise.all(
      rows.map(async (o) => {
        let invoiceNumber = o.invoiceNumber;
        if (!invoiceNumber) {
          invoiceNumber = await generateInvoiceRef();
          await db.update(schema.orders).set({ invoiceNumber }).where(eq(schema.orders.id, o.id));
        }
        return {
          invoiceNumber,
          orderRef: o.orderRef,
          date: (o.createdAt as unknown as Date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
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
        };
      })
    );

    const pdf = type === "gst"
      ? await generateGstSummaryPdf(invoices)
      : await generateMultiInvoicePdf(invoices);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${type === "gst" ? "GST-Summary" : "Invoices"}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}