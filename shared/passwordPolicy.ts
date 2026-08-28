/**
 * سياسة كلمات المرور.
 *
 * الطول أولاً: 12 محرفاً هو الحد الأدنى، وهو أقوى عملياً من فرض رموز معقّدة على
 * كلمة قصيرة. ثم نرفض الأنماط التي تجعل كلمة طويلة بلا قيمة فعلية: محرف واحد
 * مكرّر، تسلسل لوحة المفاتيح، أو كلمة شائعة معروفة في قوائم التخمين.
 */
export const MIN_PASSWORD_LENGTH = 12;

const commonPasswords = [
  "password",
  "passw0rd",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "azertyuiop",
  "administrator",
  "iloveyou",
  "welcome123",
  "letmein123",
  "changeme123",
  "abcdefghijkl",
  "aaaaaaaaaaaa",
  "112233445566",
];

const keyboardRuns = [
  "qwertyui",
  "asdfghjk",
  "zxcvbnm",
  "12345678",
  "87654321",
];

export type PasswordVerdict =
  | { ok: true }
  | { ok: false; reason: "too_short" | "too_weak" };

export function evaluatePassword(password: string): PasswordVerdict {
  if (password.length < MIN_PASSWORD_LENGTH)
    return { ok: false, reason: "too_short" };
  const lowered = password.toLocaleLowerCase("en-US");
  if (new Set(lowered).size < 5) return { ok: false, reason: "too_weak" };
  if (commonPasswords.some(entry => lowered.includes(entry)))
    return { ok: false, reason: "too_weak" };
  if (keyboardRuns.some(run => lowered.includes(run)))
    return { ok: false, reason: "too_weak" };
  return { ok: true };
}

/** مؤشّر قوة للعرض في الواجهة فقط — لا يُستخدم للقبول أو الرفض. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const verdict = evaluatePassword(password);
  if (!verdict.ok) return password.length >= 8 ? 1 : 0;
  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(pattern =>
    pattern.test(password)
  ).length;
  return password.length >= 16 && variety >= 3 ? 3 : 2;
}
