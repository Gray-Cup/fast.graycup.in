import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "@/lib/s3";

export async function GET() {
  try {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "manual-invoices/" })
    );

    const objects = (res.Contents || [])
      .filter((obj) => obj.Key !== "manual-invoices/")
      .map((obj) => ({
        key: obj.Key!,
        filename: obj.Key!.split("/").pop()!,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified?.toISOString() ?? null,
      }))
      .sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));

    return NextResponse.json(objects);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
