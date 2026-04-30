import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  const { orderRef } = await params;

  const rows = await db.select({ invoiceKey: orders.invoiceKey })
    .from(orders)
    .where(eq(orders.orderRef, orderRef))
    .limit(1);

  if (!rows.length || !rows[0].invoiceKey) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const key = rows[0].invoiceKey;
  const response = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));

  const chunks: Uint8Array[] = [];
  const body = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of body) {
    chunks.push(chunk);
  }
  const html = Buffer.concat(chunks);

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}