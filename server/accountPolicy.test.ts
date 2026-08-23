import { describe, expect, it } from "vitest";
import { getBootstrapAccountSettings, isConfiguredAdminEmail } from "./accountPolicy";

describe("configured admin account", () => {
  it("recognizes the securely configured administrator email", () => {
    const configuredEmail = process.env.HRHBS_ADMIN_EMAIL;
    expect(configuredEmail).toBeTruthy();
    expect(isConfiguredAdminEmail(configuredEmail)).toBe(true);
    expect(isConfiguredAdminEmail("other@example.com")).toBe(false);
  });

  it("provisions a matching administrator as active and a new employee as pending", () => {
    const configuredEmail = process.env.HRHBS_ADMIN_EMAIL as string;
    expect(getBootstrapAccountSettings({ openId: "admin-oauth", email: configuredEmail, ownerOpenId: "owner" })).toEqual({ role: "admin", accountStatus: "active" });
    expect(getBootstrapAccountSettings({ openId: "new-oauth", email: "employee@example.com", ownerOpenId: "owner" })).toEqual({ role: "user", accountStatus: "pending" });
  });
});
