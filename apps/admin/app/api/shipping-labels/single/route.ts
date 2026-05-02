import { NextRequest, NextResponse } from "next/server";

const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN;
const DELHIVERY_ENV = process.env.DELHIVERY_ENV || "sandbox";
const BASE_URL =
  DELHIVERY_ENV === "production"
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

  try {
    const res = await fetch(
      `${BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=A4`,
      { headers: { Authorization: `Token ${DELHIVERY_TOKEN}`, "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Delhivery ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";

    let pdfBuffer: ArrayBuffer;

    if (contentType.includes("application/json") || contentType.includes("text/")) {
      const data = await res.json();
      const s3Url: string | undefined = data?.packages?.[0]?.pdf_download_link;

      if (!s3Url) {
        return NextResponse.json(
          { error: `No label URL in Delhivery response: ${JSON.stringify(data).slice(0, 200)}` },
          { status: 502 }
        );
      }

      const s3Res = await fetch(s3Url);
      if (!s3Res.ok) {
        return NextResponse.json({ error: `S3 fetch failed: ${s3Res.status}` }, { status: 502 });
      }

      pdfBuffer = await s3Res.arrayBuffer();
    } else {
      pdfBuffer = await res.arrayBuffer();
    }

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${waybill}.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
