import { createRemoteJWKSet, jwtVerify } from "jose";
import { ENV } from "./env";

/**
 * يتحقق من رمز Google ID Token الصادر عبر Firebase Authentication.
 *
 * لا يجوز أبداً الوثوق بحقل email/uid يرسله العميل مباشرة عند تسجيل الدخول —
 * أي طرف يمكنه استدعاء نقطة tRPC العامة مباشرة (بدون مرور بالمتصفح) ويزوّر
 * أي بريد ومعرّف يريدهما. التحقق هنا يتأكد من توقيع الرمز عبر مفاتيح Google
 * العامة (JWKS)، ومن أن المُصدِر (issuer) والمستلم (audience) يطابقان مشروع
 * Firebase الخاص بالمنصة، ومن أن الرمز لم تنتهِ صلاحيته — فقط عندها تُستخرج
 * الهوية (uid/email) من محتوى الرمز الموثّق، لا من مدخلات الطلب.
 */
const googleIdTokenJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export type VerifiedGoogleIdentity = {
  uid: string;
  email: string;
  name?: string;
  emailVerified: boolean;
};

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  if (!ENV.firebaseProjectId) throw new Error("FIREBASE_PROJECT_ID غير مهيأ");
  const { payload } = await jwtVerify(idToken, googleIdTokenJwks, {
    issuer: `https://securetoken.google.com/${ENV.firebaseProjectId}`,
    audience: ENV.firebaseProjectId,
  });
  const uid = typeof payload.sub === "string" ? payload.sub : undefined;
  const email = typeof payload.email === "string" ? payload.email : undefined;
  if (!uid || !email) throw new Error("رمز جوجل لا يحتوي على هوية صالحة");
  return {
    uid,
    email,
    name: typeof payload.name === "string" ? payload.name : undefined,
    emailVerified: payload.email_verified === true,
  };
}
