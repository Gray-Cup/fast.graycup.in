import { NextResponse } from "next/server";
import { generatePayoutsSignature } from "@/lib/cashfree-payouts";

export async function POST() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET" },
      { status: 500 }
    );
  }

  let signature: string;
  let timestamp: string;

  try {
    ({ signature, timestamp } = generatePayoutsSignature(clientId));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signature generation failed" },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.cashfree.com/payout/v1/authorize", {
    method: "POST",
    headers: {
      "X-Client-Id": clientId,
      "X-Client-Secret": clientSecret,
      "X-Cf-Signature": signature,
      "X-Cf-Timestamp": timestamp,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
