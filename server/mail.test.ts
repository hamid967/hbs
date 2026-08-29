import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());

const message = {
  to: "user@example.test",
  subject: "موضوع",
  body: "نص",
  tag: "email_verification",
};

/**
 * ENV.ts نسخة مأخوذة عند أول استيراد (ثابت على مستوى الوحدة، لا يُعاد قراءة
 * process.env حياً)، لذا vi.stubEnv لا يؤثر عليها بعد الاستيراد الأول. نموّه
 * ../_core/env مباشرة بدل ذلك — النمط المتّبع أصلاً في باقي اختبارات المستودع —
 * ونعيد استيراد mail.ts ديناميكياً بعد كل تمويه ليقرأ القيمة الجديدة.
 */
async function loadSendMail(env: {
  mailWebhookUrl: string;
  mailWebhookToken?: string;
  mailFromAddress: string;
}) {
  vi.doMock("./_core/env", () => ({ ENV: env }));
  vi.resetModules();
  return import("./mail");
}

describe("ناقل البريد", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock("./_core/env");
    vi.resetModules();
  });

  it("يسجّل الرسالة كمسوّدة ولا يرسل حين لا يوجد ناقل مهيّأ", async () => {
    const { sendMail, readDraftOutbox, clearDraftOutbox } = await loadSendMail({
      mailWebhookUrl: "",
      mailFromAddress: "no-reply@hrhbs.com",
    });
    clearDraftOutbox();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await sendMail(message);
    expect(result).toEqual({
      delivered: false,
      transport: "draft",
      reason: "unconfigured",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(readDraftOutbox()).toHaveLength(1);
    expect(readDraftOutbox()[0].tag).toBe("email_verification");
    // التحذير لا يطبع جسم الرسالة لأنه قد يحمل رمزاً صالحاً
    expect(warn.mock.calls[0][0]).not.toContain(message.body);
    warn.mockRestore();
  });

  it("يحدّ صندوق المسوّدات فلا ينمو بلا سقف", async () => {
    const { sendMail, readDraftOutbox, clearDraftOutbox } = await loadSendMail({
      mailWebhookUrl: "",
      mailFromAddress: "no-reply@hrhbs.com",
    });
    clearDraftOutbox();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let index = 0; index < 60; index += 1)
      await sendMail({ ...message, subject: `رسالة ${index}` });
    expect(readDraftOutbox()).toHaveLength(50);
    expect(readDraftOutbox()[49].subject).toBe("رسالة 59");
  });

  it("لا يعتبر البريد مهيّأً بلا رابط خطّاف", async () => {
    const { isMailConfigured } = await loadSendMail({
      mailWebhookUrl: "",
      mailFromAddress: "no-reply@hrhbs.com",
    });
    expect(isMailConfigured()).toBe(false);
  });

  it("يرسل عبر fetch ويُبلَغ التسليم حين يهيَّأ الخطّاف", async () => {
    const { sendMail, isMailConfigured } = await loadSendMail({
      mailWebhookUrl: "https://mail.example.test/hook",
      mailWebhookToken: "secret-token",
      mailFromAddress: "no-reply@hrhbs.com",
    });
    expect(isMailConfigured()).toBe(true);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const result = await sendMail(message);
    expect(result).toEqual({ delivered: true, transport: "http" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://mail.example.test/hook");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer secret-token");
    expect(JSON.parse(init.body)).toMatchObject({
      to: message.to,
      subject: message.subject,
      text: message.body,
      tag: message.tag,
    });
  });

  it("لا يعامل استجابة غير ناجحة من الخطّاف كتسليم ناجح", async () => {
    const { sendMail } = await loadSendMail({
      mailWebhookUrl: "https://mail.example.test/hook",
      mailFromAddress: "no-reply@hrhbs.com",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const result = await sendMail(message);
    expect(result).toEqual({
      delivered: false,
      transport: "http",
      reason: "transport_error",
    });
  });
});
