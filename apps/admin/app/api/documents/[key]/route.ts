import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "@/lib/s3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  try {
    const s3Res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: decodedKey }));
    const body = await s3Res.Body!.transformToByteArray();
    const buffer = new ArrayBuffer(body.byteLength);
    new Uint8Array(buffer).set(body);

    const contentType = s3Res.ContentType || "application/pdf";
    const filename = decodedKey.split("/").pop() || "document.pdf";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to fetch document:", err);
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}