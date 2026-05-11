import { NextResponse } from "next/server";
import { db, sql } from "@graycup/db";
import ranges from "../../../lib/pincode-ranges.json";

// ranges is sorted by start — binary search for O(log n) lookup
const RANGES = ranges as [number, number, string][];

function pincodeToState(pincode: string): string | null {
  const n = parseInt(pincode.trim(), 10);
  if (isNaN(n)) return null;
  let lo = 0, hi = RANGES.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [start, end] = RANGES[mid];
    if (n < start) hi = mid - 1;
    else if (n > end) lo = mid + 1;
    else return RANGES[mid][2];
  }
  return null;
}

function buildDateConditions(column: string, startDate: string | null, endDate: string | null) {
  const conditions = [] as any[];
  if (startDate) conditions.push(sql`${sql.raw(column)} >= ${startDate}`);
  if (endDate) {
    if (column === "created_at") {
      conditions.push(sql`${sql.raw(column)} < (${endDate}::date + interval '1 day')`);
    } else {
      conditions.push(sql`${sql.raw(column)} <= ${endDate}`);
    }
  }
  return conditions;
}

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const orderConditions = buildDateConditions("created_at", startDate, endDate);
  const manualConditions = buildDateConditions("invoice_date", startDate, endDate);

  const orders = await db.execute(sql`
    SELECT customer_pincode, status, amount
    FROM orders
    ${orderConditions.length ? sql`WHERE ${sql.join(orderConditions, sql` AND `)}` : sql``}
  `);

  const manualInvoices = await db.execute(sql`
    SELECT buyer_pincode, amount
    FROM manual_invoices
    ${manualConditions.length ? sql`WHERE ${sql.join(manualConditions, sql` AND `)}` : sql``}
  `);

  const stateMap = new Map<string, { total: number; website: number; manual: number; successful: number; expired: number; revenue: number; pincodes: Set<string> }>();

  for (const row of orders.rows as { customer_pincode: string; status: string; amount: number }[]) {
    const state = pincodeToState(row.customer_pincode);
    if (!state) continue;

    let entry = stateMap.get(state);
    if (!entry) { entry = { total: 0, website: 0, manual: 0, successful: 0, expired: 0, revenue: 0, pincodes: new Set() }; stateMap.set(state, entry); }

    entry.total += 1;
    entry.website += 1;
    entry.revenue += row.amount ?? 0;
    if (row.customer_pincode) entry.pincodes.add(row.customer_pincode.trim());
    if (["PAID", "PAID_DISPATCH_PENDING", "DISPATCHED", "DELIVERED"].includes(row.status)) entry.successful += 1;
    if (row.status === "EXPIRED") entry.expired += 1;
  }

  for (const row of manualInvoices.rows as { buyer_pincode: string; amount: number }[]) {
    const state = pincodeToState(row.buyer_pincode);
    if (!state) continue;

    let entry = stateMap.get(state);
    if (!entry) { entry = { total: 0, website: 0, manual: 0, successful: 0, expired: 0, revenue: 0, pincodes: new Set() }; stateMap.set(state, entry); }

    entry.total += 1;
    entry.manual += 1;
    entry.revenue += row.amount ?? 0;
    entry.successful += 1;
    if (row.buyer_pincode) entry.pincodes.add(row.buyer_pincode.trim());
  }

  const result = Array.from(stateMap.entries())
    .map(([state, c]) => ({
      state,
      total_count: c.total,
      website_count: c.website,
      manual_count: c.manual,
      successful_count: c.successful,
      expired_count: c.expired,
      revenue: c.revenue,
      pincodes: Array.from(c.pincodes).sort(),
    }))
    .sort((a, b) => b.total_count - a.total_count);

  return NextResponse.json(result);
}
