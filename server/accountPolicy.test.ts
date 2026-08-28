import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBootstrapAccountSettings, isConfiguredAdminEmail } from "./accountPolicy";

const configuredEmail = "configured-admin@example.invalid";

describe("configured admin account", () => {
  beforeEach(() => { vi.stubEnv("HRHBS_ADMIN_EMAIL", configuredEmail); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("recognizes the securely configured administrator email", () => {
    expect(isConfiguredAdminEmail(configuredEmail)).toBe(true);
    expect(isConfiguredAdminEmail(`  ${configuredEmail.toUpperCase()} `)).toBe(true);
    expect(isConfiguredAdminEmail("other@example.com")).toBe(false);
    expect(isConfiguredAdminEmail(null)).toBe(false);
  });

  it("treats an unconfigured administrator email as no administrator at all", () => {
    vi.stubEnv("HRHBS_ADMIN_EMAIL", "");
    expect(isConfiguredAdminEmail("")).toBe(false);
    expect(isConfiguredAdminEmail(configuredEmail)).toBe(false);
  });

  it("provisions a matching administrator as active and a new employee as pending", () => {
    expect(getBootstrapAccountSettings({ openId: "admin-oauth", email: configuredEmail, ownerOpenId: "owner" })).toEqual({ role: "admin", accountStatus: "active" });
    expect(getBootstrapAccountSettings({ openId: "owner", email: "someone@example.com", ownerOpenId: "owner" })).toEqual({ role: "admin", accountStatus: "active" });
    expect(getBootstrapAccountSettings({ openId: "new-oauth", email: "employee@example.com", ownerOpenId: "owner" })).toEqual({ role: "user", accountStatus: "pending" });
  });
});
