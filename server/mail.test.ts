import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const axiosMock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("axios", () => ({ default: axiosMock }));

import { clearDraftOutbox, isMailConfigured, readDraftOutbox, sendMail } from "./mail";

const message = { to: "user@example.test", subject: "موضوع", body: "نص", tag: "email_verification" };

describe("ناقل البريد", () => {
  beforeEach(() => { clearDraftOutbox(); axiosMock.post.mockReset(); vi.unstubAllEnvs(); vi.resetModules(); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("يسجّل الرسالة كمسوّدة ولا يرسل حين لا يوجد ناقل مهيّأ", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await sendMail(message);
    expect(result).toEqual({ delivered: false, transport: "draft", reason: "unconfigured" });
    expect(axiosMock.post).not.toHaveBeenCalled();
    expect(readDraftOutbox()).toHaveLength(1);
    expect(readDraftOutbox()[0].tag).toBe("email_verification");
    // التحذير لا يطبع جسم الرسالة لأنه قد يحمل رمزاً صالحاً
    expect(warn.mock.calls[0][0]).not.toContain(message.body);
    warn.mockRestore();
  });

  it("يحدّ صندوق المسوّدات فلا ينمو بلا سقف", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let index = 0; index < 60; index += 1) await sendMail({ ...message, subject: `رسالة ${index}` });
    expect(readDraftOutbox()).toHaveLength(50);
    expect(readDraftOutbox()[49].subject).toBe("رسالة 59");
  });

  it("لا يعتبر البريد مهيّأً بلا رابط خطّاف", () => {
    expect(isMailConfigured()).toBe(false);
  });
});
