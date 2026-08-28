import { describe, expect, it } from "vitest";
import { hashInvitationToken, hashLocalPassword, normalizeLocalEmail, verifyLocalPassword } from "./localCredentials";

describe("local credentials", () => {
  it("normalizes email and verifies a scrypt hash without returning the password", async () => {
    const hash = await hashLocalPassword("strong-passphrase-2026");
    await expect(verifyLocalPassword("strong-passphrase-2026", hash)).resolves.toBe(true);
    await expect(verifyLocalPassword("incorrect-passphrase", hash)).resolves.toBe(false);
    expect(normalizeLocalEmail(" Client@Example.Test ")).toBe("client@example.test");
    expect(hash).not.toContain("strong-passphrase-2026");
  });

  it("hashes invitation tokens before persistence", async () => {
    expect(hashInvitationToken("one-time-token")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails closed when the stored hash is malformed", async () => {
    await expect(verifyLocalPassword("strong-passphrase-2026", "bad-format")).resolves.toBe(false);
  });
});
