import crypto from "crypto";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec: number,
) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + Math.floor(expiresInSec),
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const toSign = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(toSign);
  const signature = base64url(hmac.digest());

  return `${toSign}.${signature}`;
}

export function verifyJwt(token: string, secret: string) {
  try {
    if (!secret) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const headerB64 = parts[0] ?? "";
    const payloadB64 = parts[1] ?? "";
    const sig = parts[2] ?? "";
    const toSign = `${headerB64}.${payloadB64}`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(toSign);
    const expected = base64url(hmac.digest());
    if (sig !== expected) return null;
    const payloadJson = Buffer.from(String(payloadB64), "base64").toString(
      "utf8",
    );
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === "number" && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export default { signJwt, verifyJwt };
