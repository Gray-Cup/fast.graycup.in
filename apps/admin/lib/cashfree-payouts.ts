import crypto from "crypto";

// Cashfree Payouts 2FA uses RSA public key *encryption* (not signing).
// The server encrypts clientId.timestamp with Cashfree's public key so only
// Cashfree (holding the private key) can decrypt and verify the request.
// The timestamp prevents replay attacks — Cashfree rejects stale signatures.

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

export function generatePayoutsSignature(clientId: string): {
  signature: string;
  timestamp: string;
} {
  // Vercel stores multiline env vars with literal \n — normalize to real newlines
  const publicKey = getEnv("CASHFREE_PUBLIC_KEY").replace(/\\n/g, "\n");
  const timestamp = Date.now().toString();
  const payload = `${clientId}.${timestamp}`;

  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(payload)
  );

  return {
    signature: encrypted.toString("base64"),
    timestamp,
  };
}
