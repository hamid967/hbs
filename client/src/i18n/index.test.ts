import { describe, expect, it } from "vitest";
import { directionForLocale, messageFor, resolveLocale } from "./index";

describe("i18n foundation", () => {
  it("keeps Arabic as the safe default locale", () => {
    expect(resolveLocale(undefined)).toBe("ar-SA");
    expect(resolveLocale("unknown")).toBe("ar-SA");
  });

  it("returns the correct document direction and shell text", () => {
    expect(directionForLocale("ar-SA")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
    expect(messageFor("en", "common.loading")).toBe("Loading page…");
  });
});
