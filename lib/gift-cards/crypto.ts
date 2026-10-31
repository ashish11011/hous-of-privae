import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function encryptionKey() {
  const secret =
    process.env.GIFT_CARD_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "A stable gift card encryption key of at least 32 characters is required.",
    );
  return createHash("sha256").update(`haus-gift-card:${secret}`).digest();
}
export function assertGiftCardEncryption() {
  encryptionKey();
}
export function normalizeGiftCardCode(code: string) {
  return code.replace(/[\s-]/g, "").toUpperCase();
}
export function hashGiftCardCode(code: string) {
  return createHash("sha256").update(normalizeGiftCardCode(code)).digest("hex");
}
export function createGiftCardCode() {
  return `HOP-${randomBytes(12).toString("hex").toUpperCase().match(/.{6}/g)!.join("-")}`;
}
export function encryptGiftCardCode(code: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(code, "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((value) => value.toString("base64url"))
    .join(".");
}
export function decryptGiftCardCode(value: string) {
  const parts = value.split(".").map((part) => Buffer.from(part, "base64url"));
  if (parts.length !== 3) throw new Error("Invalid encrypted gift card code");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), parts[0]);
  decipher.setAuthTag(parts[1]);
  return Buffer.concat([decipher.update(parts[2]), decipher.final()]).toString(
    "utf8",
  );
}
