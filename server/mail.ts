import axios from "axios";
import { ENV } from "./_core/env";

export type MailMessage = {
  to: string;
  subject: string;
  /** نص عادي فقط: رسائل المصادقة لا تحتاج HTML، وتجنّبه يقلّل سطح الأخطاء. */
  body: string;
  /** وسم تشغيلي للتتبّع، مثل "email_verification". لا يحتوي بيانات شخصية. */
  tag: string;
};

export type MailResult =
  | { delivered: true; transport: "http" }
  | { delivered: false; transport: "draft"; reason: "unconfigured" }
  | { delivered: false; transport: "http"; reason: "transport_error" };

/**
 * صندوق صادر في الذاكرة يعمل حين لا يكون هناك ناقل بريد مهيّأ.
 *
 * مقصور على الخادم: لا يُعرَض عبر tRPC ولا يصل إلى المتصفح إطلاقاً، لأنه يحمل
 * روابط تحتوي رموزاً حسّاسة. وجوده يتيح للاختبارات أن تقطع المسار كاملاً دون
 * ناقل حقيقي، ويمنع فقدان الرسائل بصمت أثناء التطوير.
 */
const draftOutbox: Array<MailMessage & { at: Date }> = [];
const DRAFT_OUTBOX_LIMIT = 50;

export function readDraftOutbox() {
  return [...draftOutbox];
}

export function clearDraftOutbox() {
  draftOutbox.length = 0;
}

function recordDraft(message: MailMessage) {
  draftOutbox.push({ ...message, at: new Date() });
  if (draftOutbox.length > DRAFT_OUTBOX_LIMIT) draftOutbox.shift();
  // لا نطبع جسم الرسالة: قد يحتوي رمزاً صالحاً.
  console.warn(
    `[Mail] لا يوجد ناقل بريد مهيّأ؛ لم تُرسل رسالة "${message.tag}". اضبط MAIL_WEBHOOK_URL لتفعيل الإرسال.`
  );
}

/**
 * يرسل رسالة عبر خطّاف HTTP عام (Resend أو Postmark أو مُرحِّل داخلي — أي خدمة
 * تقبل POST بصيغة JSON). أُختير الخطّاف العام بدل ربط مزوّد بعينه حتى لا تُقيَّد
 * المنصة بمزوّد واحد، ولأن axios متاح أصلاً فلا حاجة إلى اعتمادية جديدة.
 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!ENV.mailWebhookUrl) {
    recordDraft(message);
    return { delivered: false, transport: "draft", reason: "unconfigured" };
  }
  try {
    await axios.post(
      ENV.mailWebhookUrl,
      {
        from: ENV.mailFromAddress,
        to: message.to,
        subject: message.subject,
        text: message.body,
        tag: message.tag,
      },
      {
        timeout: 10_000,
        headers: ENV.mailWebhookToken
          ? { Authorization: `Bearer ${ENV.mailWebhookToken}` }
          : undefined,
      }
    );
    return { delivered: true, transport: "http" };
  } catch {
    // لا نُسرّب تفاصيل المزوّد إلى المستدعي؛ المسار الأعلى يقرر ماذا يخبر المستخدم.
    console.error(
      `[Mail] فشل إرسال رسالة "${message.tag}" عبر الناقل المهيّأ.`
    );
    return { delivered: false, transport: "http", reason: "transport_error" };
  }
}

export function isMailConfigured() {
  return Boolean(ENV.mailWebhookUrl);
}
