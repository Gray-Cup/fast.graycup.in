import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFName, PDFArray, PDFNumber } from "pdf-lib";

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
    `${BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true`,
    { headers: { Authorization: `Token ${DELHIVERY_TOKEN}` } }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Delhivery ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("pdf")) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Delhivery returned non-PDF response (${contentType}): ${text.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const pdfBytes = await res.arrayBuffer();

  try {
    const src = await PDFDocument.load(pdfBytes);
    const output = await PDFDocument.create();

    for (let i = 0; i < src.getPageCount(); i++) {
      // Re-load to avoid cross-doc reference issues when embedding multiple pages
      const freshSrc = await PDFDocument.load(pdfBytes);
      const freshPage = freshSrc.getPage(i);
      const mb = freshPage.getMediaBox();

      let contentBox = {
        left: mb.x,
        bottom: mb.y,
        right: mb.x + mb.width,
        top: mb.y + mb.height,
        width: mb.width,
        height: mb.height,
      };

      // TrimBox → CropBox → ArtBox — use the tightest box available
      for (const boxName of ["TrimBox", "CropBox", "ArtBox"]) {
        try {
          const arr = freshPage.node.lookupMaybe(PDFName.of(boxName), PDFArray);
          if (arr && arr.size() === 4) {
            const left = (arr.lookup(0) as PDFNumber).asNumber();
            const bottom = (arr.lookup(1) as PDFNumber).asNumber();
            const right = (arr.lookup(2) as PDFNumber).asNumber();
            const top = (arr.lookup(3) as PDFNumber).asNumber();
            const w = right - left;
            const h = top - bottom;
            if (w > 0 && h > 0 && (w < mb.width * 0.99 || h < mb.height * 0.99)) {
              contentBox = { left, bottom, right, top, width: w, height: h };
              break;
            }
          }
        } catch {}
      }

      const newPage = output.addPage([contentBox.width, contentBox.height]);
      const [embedded] = await output.embedPages([freshPage], [
        { left: contentBox.left, bottom: contentBox.bottom, right: contentBox.right, top: contentBox.top },
      ]);
      newPage.drawPage(embedded, { x: 0, y: 0, width: contentBox.width, height: contentBox.height });
    }

    const croppedBytes = await output.save();
    return new Response(Buffer.from(croppedBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${waybill}.pdf"`,
      },
    });
  } catch {
    // pdf-lib failed — return the original PDF as-is
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${waybill}.pdf"`,
      },
    });
  }
}
