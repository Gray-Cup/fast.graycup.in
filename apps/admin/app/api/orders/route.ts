import { NextResponse } from "next/server";
import { db, schema, sql } from "@graycup/db";
import { desc, getTableColumns } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        ...getTableColumns(schema.orders),
        orderNumber: sql<number>`ROW_NUMBER() OVER (ORDER BY ${schema.orders.id} ASC)`,
      })
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}