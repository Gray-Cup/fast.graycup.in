import { NextResponse } from "next/server";
import { db, schema } from "@graycup/db";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}