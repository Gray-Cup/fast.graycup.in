import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/delhivery";

export async function GET(req: NextRequest) {
  const awb = req.nextUrl.searchParams.get("awb");
  if (!awb) return NextResponse.json({ error: "awb required" }, { status: 400 });

  const result = await trackShipment(awb);
  if (!result) return NextResponse.json({ error: "Could not track" }, { status: 502 });

  return NextResponse.json(result);
}