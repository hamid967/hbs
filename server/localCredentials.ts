import { createHash, randomBytes, scrypt as nativeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nativeScrypt);
const KEY_LENGTH = 64;

export function normalizeLocalEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

export async function hashLocalPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyLocalPassword(password: string, encoded: string) {
  const [algorithm, salt, storedKey] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  const expected = Buffer.from(storedKey, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationToken() {
  return randomBytes(32).toString("base64url");
}
