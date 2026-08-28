import { describe, expect, it } from "vitest";
import { evaluatePassword, MIN_PASSWORD_LENGTH, passwordStrength } from "./passwordPolicy";

describe("سياسة كلمة المرور", () => {
  it("ترفض ما دون الحد الأدنى للطول", () => {
    expect(evaluatePassword("Short1!")).toEqual({ ok: false, reason: "too_short" });
    expect(evaluatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toEqual({ ok: false, reason: "too_short" });
  });

  it("ترفض الكلمات الطويلة لكن التافهة", () => {
    expect(evaluatePassword("aaaaaaaaaaaaaaa")).toEqual({ ok: false, reason: "too_weak" });
    expect(evaluatePassword("mypassword12345")).toEqual({ ok: false, reason: "too_weak" });
    expect(evaluatePassword("qwertyuiopasdf")).toEqual({ ok: false, reason: "too_weak" });
    expect(evaluatePassword("123456789012345")).toEqual({ ok: false, reason: "too_weak" });
  });

  it("تقبل كلمة طويلة ومتنوعة", () => {
    expect(evaluatePassword("Rakiza-9x-Falak")).toEqual({ ok: true });
    expect(evaluatePassword("مسارالعملالمؤسسي2026")).toEqual({ ok: true });
  });

  it("تعطي مؤشر قوة للعرض دون أن تغيّر قرار القبول", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("Short1!")).toBe(0);
    expect(passwordStrength("aaaaaaaaaaaaaaa")).toBe(1);
    expect(passwordStrength("Rakiza-9x-Falak")).toBe(2);
    expect(passwordStrength("Rakiza-9x-Falak-Nujum")).toBe(3);
  });
});
