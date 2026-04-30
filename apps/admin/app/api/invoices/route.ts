import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db, schema, generateInvoiceRef } from "@graycup/db";
import { eq, inArray } from "drizzle-orm";
import { generateMultiInvoicePdf, generateGstSummaryPdf, generateInvoicePdf } from "@/lib/invoice";
import { s3, BUCKET } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const { orderRefs, type } = await req.json();
    if (!orderRefs?.length) return NextResponse.json({ error: "No orders selected" }, { status: 400 });

    const rows = await db.select().from(schema.orders).where(inArray(schema.orders.orderRef, orderRefs));
    if (!rows.length) return NextResponse.json({ error: "No orders found" }, { status: 404 });

    const invoiceMap = new Map(rows.map(o => [o.orderRef, o]));
    const invoices = await Promise.all(
      rows.map(async (o) => {
        let invoiceNumber = o.invoiceNumber;
        if (!invoiceNumber) {
          invoiceNumber = await generateInvoiceRef();
          await db.update(schema.orders).set({ invoiceNumber }).where(eq(schema.orders.id, o.id));
          invoiceMap.get(o.orderRef)!.invoiceNumber = invoiceNumber;
        }
        return {
          invoiceNumber,
          orderRef: o.orderRef,
          date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerEmail: o.customerEmail,
          customerAddress: o.customerAddress,
          customerPincode: o.customerPincode,
          productName: o.productName,
          variantLabel: o.variantLabel,
          quantity: Number(o.quantity),
          amount: Number(o.amount),
          gstAmount: Number(o.gstAmount),
        };
      })
    );

    const pdf = type === "gst"
      ? await generateGstSummaryPdf(invoices)
      : await generateMultiInvoicePdf(invoices);

    if (type !== "gst") {
      await Promise.all(
        rows.map(async (o) => {
          const invNum = invoiceMap.get(o.orderRef)!.invoiceNumber ?? "—";
          const invoicePdf = await generateInvoicePdf({
            invoiceNumber: invNum,
            orderRef: o.orderRef,
            date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            customerEmail: o.customerEmail,
            customerAddress: o.customerAddress,
            customerPincode: o.customerPincode,
            productName: o.productName,
            variantLabel: o.variantLabel,
            quantity: Number(o.quantity),
            amount: Number(o.amount),
            gstAmount: Number(o.gstAmount),
          });
          const key = `invoices/${o.orderRef}.pdf`;
          await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: new Uint8Array(invoicePdf), ContentType: "application/pdf" }));
          await db.update(schema.orders).set({ invoiceKey: key }).where(eq(schema.orders.id, o.id));
          await db.insert(schema.documents).values({
            type: "INVOICE",
            source: "ADMIN",
            key,
            orderRef: o.orderRef,
            filename: `Invoice-${o.orderRef}.pdf`,
          });
        })
      );
    } else {
      const key = `gst-summarys/${Date.now()}.pdf`;
      await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: new Uint8Array(pdf), ContentType: "application/pdf" }));
      await db.insert(schema.documents).values({
        type: "GST_SUMMARY",
        source: "ADMIN",
        key,
        orderRef: null,
        filename: `GST-Summary-${Date.now()}.pdf`,
      });
    }

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