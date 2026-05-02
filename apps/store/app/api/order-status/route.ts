import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const orderRef = req.nextUrl.searchParams.get("order_id");
  if (!orderRef) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const rows = await db.select({
    status: orders.status,
    amount: orders.amount,
    productName: orders.productName,
    variantLabel: orders.variantLabel,
    quantity: orders.quantity,
  }).from(orders).where(eq(orders.orderRef, orderRef)).limit(1);

  if (!rows.length) {
    return NextResponse.json({ status: "NOT_FOUND" });
  }

  return NextResponse.json(rows[0]);
}
