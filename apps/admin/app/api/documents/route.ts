import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { desc, eq, and, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const source = searchParams.get("source");
    const orderRef = searchParams.get("orderRef");

    const conditions = [];
    if (type) conditions.push(eq(schema.documents.type, type as "INVOICE" | "GST_SUMMARY" | "LABEL" | "PACKING_SLIP"));
    if (source) conditions.push(eq(schema.documents.source, source as "ADMIN" | "STORE"));
    if (orderRef) conditions.push(eq(schema.documents.orderRef, orderRef));

    const rows = await db.select().from(schema.documents)
      .orderBy(desc(schema.documents.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, source, key, orderRef, filename } = await req.json();
    if (!type || !source || !key || !filename) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const [row] = await db.insert(schema.documents).values({
      type,
      source,
      key,
      orderRef: orderRef || null,
      filename,
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to insert document" }, { status: 500 });
  }
}