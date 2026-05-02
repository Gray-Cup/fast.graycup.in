import { NextRequest, NextResponse } from "next/server";

const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const BASE_URL =
  process.env.DELHIVERY_ENV === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";

export async function POST(req: NextRequest) {
  const { waybill } = await req.json();

  if (!waybill || typeof waybill !== "string") {
    return NextResponse.json({ error: "waybill required" }, { status: 400 });
  }
  if (!DELHIVERY_TOKEN) {
    return NextResponse.json({ error: "DELHIVERY_API_TOKEN not configured" }, { status: 500 });
  }

  const res = await fetch(
    `${BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=4R`,
    { headers: { Authorization: `Token ${DELHIVERY_TOKEN}`, "Content-Type": "application/json" } }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Delhivery ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
  }

  const data = await res.json();
  const pdfUrl: string | undefined = data?.packages?.[0]?.pdf_download_link;

  if (!pdfUrl) {
    return NextResponse.json({ error: `No label URL in response: ${JSON.stringify(data).slice(0, 200)}` }, { status: 502 });
  }

  const pdf = await fetch(pdfUrl);
  if (!pdf.ok) {
    return NextResponse.json({ error: `Failed to fetch label: ${pdf.status}` }, { status: 502 });
  }

  return new Response(await pdf.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${waybill}.pdf"`,
    },
  });
}
