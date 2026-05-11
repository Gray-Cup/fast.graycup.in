import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = "postgresql://neondb_owner:npg_LWeAO5PcZsy2@ep-royal-violet-aldn831c-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);

const RANGES = JSON.parse(
  readFileSync(resolve(__dirname, "apps/admin/lib/pincode-ranges.json"), "utf8")
);

function pincodeToState(pincode) {
  const n = parseInt(String(pincode ?? "").trim(), 10);
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

async function main() {
  // ── 1. Does manual_invoices exist and how many rows? ──────────────────────
  let manualCount = 0;
  try {
    const r = await sql`SELECT COUNT(*)::int AS n FROM manual_invoices`;
    manualCount = r[0].n;
    console.log(`manual_invoices rows (all time): ${manualCount}`);
  } catch (e) {
    console.log("manual_invoices table missing:", e.message);
    return;
  }

  // ── 2. Last 20 manual invoices ────────────────────────────────────────────
  const manuals = await sql`
    SELECT id, invoice_number, buyer_pincode, amount, invoice_date
    FROM manual_invoices
    ORDER BY id DESC
    LIMIT 20
  `;
  console.log(`\nLast ${manuals.length} manual invoices:`);
  for (const r of manuals) {
    const state = pincodeToState(r.buyer_pincode);
    console.log(`  id=${r.id}  pincode=${r.buyer_pincode}  state=${state ?? "UNKNOWN"}  amount=${r.amount}  date="${r.invoice_date}"  inv=${r.invoice_number}`);
  }

  // ── 3. Date-range check matching state-orders route ───────────────────────
  const startDate = "2026-01-01";
  const endDate   = "2026-12-31";

  const website = await sql`
    SELECT customer_pincode, amount
    FROM orders
    WHERE status IN ('PAID','PAID_DISPATCH_PENDING','DISPATCHED','DELIVERED')
    AND created_at >= ${startDate}::date
    AND created_at < (${endDate}::date + interval '1 day')
  `;

  const manual = await sql`
    SELECT buyer_pincode, amount
    FROM manual_invoices
    WHERE invoice_date::date >= ${startDate}::date
    AND invoice_date::date <= ${endDate}::date
  `;

  console.log(`\n=== Date range ${startDate} → ${endDate} ===`);
  console.log(`Website orders (paid/dispatched/delivered): ${website.length}`);
  console.log(`Manual invoices in range:                   ${manual.length}`);
  console.log(`Combined:                                   ${website.length + manual.length}`);

  // ── 4. All-time totals ────────────────────────────────────────────────────
  const [aw] = await sql`
    SELECT COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS rev
    FROM orders
    WHERE status IN ('PAID','PAID_DISPATCH_PENDING','DISPATCHED','DELIVERED')
  `;
  const [am] = await sql`
    SELECT COUNT(*)::int AS n, COALESCE(SUM(amount),0)::int AS rev
    FROM manual_invoices
  `;

  console.log(`\n=== All-time totals ===`);
  console.log(`Website successful: ${aw.n}  revenue: ₹${aw.rev}`);
  console.log(`Manual:             ${am.n}  revenue: ₹${am.rev}`);
  console.log(`Combined:           ${aw.n + am.n}`);

  // ── 5. Manual invoices with unrecognised pincodes ─────────────────────────
  const bad = manuals.filter(r => !pincodeToState(r.buyer_pincode));
  if (bad.length) {
    console.log(`\n=== Manual invoices with UNRECOGNISED pincodes ===`);
    for (const r of bad) console.log(`  id=${r.id}  pincode="${r.buyer_pincode}"  inv=${r.invoice_number}`);
  } else {
    console.log(`\nAll manual invoice pincodes resolve to a state OK.`);
  }

  // ── 6. State breakdown for manual invoices ────────────────────────────────
  const stateMap = new Map();
  for (const r of manual) {
    const s = pincodeToState(r.buyer_pincode) ?? "UNKNOWN";
    stateMap.set(s, (stateMap.get(s) ?? 0) + 1);
  }
  console.log(`\n=== Manual invoice state breakdown (${startDate}→${endDate}) ===`);
  for (const [state, cnt] of [...stateMap.entries()].sort((a,b) => b[1]-a[1])) {
    console.log(`  ${state}: ${cnt}`);
  }
}

main().catch(console.error);
