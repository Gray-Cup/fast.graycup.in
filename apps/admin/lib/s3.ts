import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "auto",
  endpoint: "https://s3.bucket0.com",
  credentials: {
    accessKeyId: process.env.BUCKET0_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BUCKET0_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const BUCKET = process.env.BUCKET0_BUCKET_NAME!;