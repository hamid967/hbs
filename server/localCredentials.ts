import {
  createHash,
  randomBytes,
  scrypt as nativeScrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nativeScrypt);
const SCRYPT_KEY_LENGTH = 64;

/**
 * PBKDF2-HMAC-SHA256، 600,000 تكرار (توصية OWASP الحالية). WebCrypto قياسي —
 * يعمل بالضبط بلا فرق بين Node وCloudflare Workers، بخلاف scrypt القديم الذي
 * توافقه مع Workers لم يكن مؤكَّداً وقت اتخاذ هذا القرار.
 */
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEY_LENGTH_BITS = 512;

export function normalizeLocalEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

async function derivePbkdf2(
  password: string,
  salt: Buffer,
  iterations: number
) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  // Node's `Buffer` types as `ArrayBufferLike` (includes SharedArrayBuffer) while
  // WebCrypto's `BufferSource` narrows to plain `ArrayBuffer` — a real Buffer always
  // satisfies this at runtime, the mismatch is TypeScript's typing only.
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH_BITS
  );
  return Buffer.from(bits);
}

export async function hashLocalPassword(password: string) {
  const salt = crypto.getRandomValues(Buffer.alloc(16));
  const derived = await derivePbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPbkdf2(
  password: string,
  iterationsRaw: string,
  saltHex: string,
  storedHex: string
) {
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(storedHex, "hex");
  const derived = await derivePbkdf2(password, salt, iterations);
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

/**
 * يبقى هذا المسار قائماً للتحقق من تجزئات أُنشئت قبل التحوّل إلى PBKDF2 — لا
 * تُنتِج hashLocalPassword صيغة scrypt بعد الآن، لكن حسابات المستخدمين الحاليين
 * لا تزال تحمل تجزئات بهذه الصيغة ويجب أن تستمر في الدخول دون إعادة تعيين قسرية.
 */
async function verifyScrypt(password: string, salt: string, storedHex: string) {
  const derived = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(storedHex, "hex");
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

export async function verifyLocalPassword(password: string, encoded: string) {
  const [algorithm, ...rest] = encoded.split("$");
  if (algorithm === "pbkdf2") {
    const [iterations, salt, stored] = rest;
    if (!iterations || !salt || !stored) return false;
    return verifyPbkdf2(password, iterations, salt, stored);
  }
  if (algorithm === "scrypt") {
    const [salt, stored] = rest;
    if (!salt || !stored) return false;
    return verifyScrypt(password, salt, stored);
  }
  return false;
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationToken() {
  return randomBytes(32).toString("base64url");
}
