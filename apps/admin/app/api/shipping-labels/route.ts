import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { inArray } from "drizzle-orm";
import { generateShippingLabelPdf } from "@/lib/invoice";

export async function POST(req: NextRequest) {
  const { orderRefs } = await req.json();

  if (!Array.isArray(orderRefs) || orderRefs.length === 0) {
    return NextResponse.json({ error: "No orderRefs provided" }, { status: 400 });
  }

  const orders = await db
    .select()
    .from(schema.orders)
    .where(inArray(schema.orders.orderRef, orderRefs));

  const withWaybill = orders.filter((o) => o.delhiveryWaybill);

  if (withWaybill.length === 0) {
    return NextResponse.json({ error: "None of the selected orders have a waybill" }, { status: 400 });
  }

  const labels = withWaybill.map((o) => ({
    orderRef: o.orderRef,
    waybill: o.delhiveryWaybill!,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    customerPincode: o.customerPincode,
    productDesc: `${o.productName} ${o.variantLabel} ×${o.quantity}`,
    amount: o.amount,
  }));

  try {
    const pdf = await generateShippingLabelPdf(labels);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="shipping-labels.pdf"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    return NextResponse.json({ error: "PDF generation failed", detail: msg }, { status: 500 });
  }
}
