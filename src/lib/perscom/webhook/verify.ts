import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Perscom's Signature header (HMAC-SHA256 of raw body).
 * Tries hex (64 chars), then base64, with optional `sha256=` prefix — align with
 * a real `webhook.test` in Perscom logs if verification fails.
 */
export function verifyPerscomSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader?.trim()) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest();

  const normalize = (s: string) =>
    s
      .trim()
      .replace(/^sha256=/i, "")
      .trim();
  const sig = normalize(signatureHeader);

  const tryHex = (hex: string): boolean => {
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) return false;
    const provided = Buffer.from(hex, "hex");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  };

  const tryB64 = (b64: string): boolean => {
    try {
      const provided = Buffer.from(b64, "base64");
      if (provided.length !== expected.length) return false;
      return timingSafeEqual(provided, expected);
    } catch {
      return false;
    }
  };

  if (tryHex(sig)) return true;
  if (tryB64(sig)) return true;
  return false;
}
