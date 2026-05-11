#!/usr/bin/env node
/**
 * Derives pincode ranges per state from pincode-with-coords.txt.
 *
 * Output: pincode-ranges.json — a sorted array of [start, end, state] tuples.
 *   [[110001, 110097, "Delhi"], [121001, 135003, "Haryana"], ...]
 *
 * To look up a pincode: find the first tuple where start <= pin <= end.
 *
 * Run: node scripts/build-pincode-json.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const INPUT  = path.join(__dirname, "../lib/pincode-with-coords.txt");
const OUTPUT = path.join(__dirname, "../lib/pincode-ranges.json");

// Pincodes within the same state that are ≤ GAP apart get merged into one range.
// Keeps the output compact while tolerating holes in numbering.
const GAP = 10;

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT),
    crlfDelay: Infinity,
  });

  // state → Set of integer pincodes
  const byState = new Map();

  for await (const line of rl) {
    const p = line.split("\t");
    if (p.length < 6) continue;
    const pincode = parseInt(p[1]?.trim(), 10);
    const state   = p[3]?.trim();
    if (!state || isNaN(pincode)) continue;

    if (!byState.has(state)) byState.set(state, new Set());
    byState.get(state).add(pincode);
  }

  console.log(`Found ${byState.size} states.`);

  // Build ranges per state then flatten into one sorted array
  const ranges = []; // [start, end, state]

  for (const [state, pincodeSet] of byState) {
    const sorted = Array.from(pincodeSet).sort((a, b) => a - b);

    let start = sorted[0];
    let end   = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - end <= GAP) {
        end = sorted[i];
      } else {
        ranges.push([start, end, state]);
        start = sorted[i];
        end   = sorted[i];
      }
    }
    ranges.push([start, end, state]);
  }

  // Sort by range start so lookups can binary-search
  ranges.sort((a, b) => a[0] - b[0]);

  fs.writeFileSync(OUTPUT, JSON.stringify(ranges));

  const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`Written ${OUTPUT} — ${ranges.length} ranges, ${kb} KB`);

  // Print a preview
  console.log("\nSample ranges:");
  ranges.slice(0, 10).forEach(([s, e, st]) =>
    console.log(`  ${s}–${e}  →  ${st}`)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
