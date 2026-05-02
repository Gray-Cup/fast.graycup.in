import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { inArray } from "drizzle-orm";
import { getShippingLabels } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  const { orderRefs } = await req.json();

  if (!Array.isArray(orderRefs) || orderRefs.length === 0) {
    return NextResponse.json({ error: "No orderRefs provided" }, { status: 400 });
  }

  const orders = await db
    .select()
    .from(schema.orders)
    .where(inArray(schema.orders.orderRef, orderRefs));

  const waybills = orders
    .filter((o) => o.delhiveryWaybill)
    .map((o) => o.delhiveryWaybill!);

  if (waybills.length === 0) {
    return NextResponse.json({ error: "None of the selected orders have a waybill" }, { status: 400 });
  }

  const result = await getShippingLabels(waybills);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return new Response(result.pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shipping-labels.pdf"`,
    },
  });
}
