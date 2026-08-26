import { describe, expect, it } from "vitest";

import { releaseEnvironmentLabel, releaseLabel } from "../shared/releaseInfo";

describe("release metadata labels", () => {
  it("formats a traceable version and revision label", () => {
    expect(releaseLabel({ version: "0.1.0", revision: "22b576f" })).toBe("v0.1.0 · 22b576f");
  });

  it("uses Arabic labels for known build environments", () => {
    expect(releaseEnvironmentLabel("production")).toBe("إنتاج");
    expect(releaseEnvironmentLabel("development")).toBe("تطوير");
  });
});
