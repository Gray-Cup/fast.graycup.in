import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db, schema, eq } from "@graycup/db";
import { s3, BUCKET } from "@/lib/s3";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  try {
    const rows = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderRef, orderRef))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = rows[0];

    // Delete invoice from bucket0 if it was uploaded there
    if (order.invoiceKey) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: order.invoiceKey }));
      } catch {
        // Non-fatal — continue with DB deletion
      }
    }

    // Delete linked document records
    await db
      .delete(schema.documents)
      .where(eq(schema.documents.orderRef, orderRef));

    // Delete the order
    await db
      .delete(schema.orders)
      .where(eq(schema.orders.orderRef, orderRef));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
