import type { SerializeOptions } from "cookie";

/**
 * نشر Cloudflare Workers دائماً عبر HTTPS، فلا حاجة لفحص x-forwarded-proto كما
 * كان يفعل الوضع السابق تحت Express (حيث قد يقف خلف طبقة توجيه غير مشفّرة
 * محلياً). الوسيط اختياري فقط للحفاظ على شكل الاستدعاء عند مواضع الاستخدام
 * القائمة (getSessionCookieOptions(ctx.req)).
 */
export function getSessionCookieOptions(
  _req?: unknown
): Pick<SerializeOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
  };
}
