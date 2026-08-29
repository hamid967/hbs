import { describe, expect, it } from "vitest";
import {
  hashInvitationToken,
  hashLocalPassword,
  normalizeLocalEmail,
  verifyLocalPassword,
} from "./localCredentials";

describe("local credentials", () => {
  it("normalizes email and verifies a pbkdf2 hash without returning the password", async () => {
    const hash = await hashLocalPassword("strong-passphrase-2026");
    expect(hash).toMatch(/^pbkdf2\$600000\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    await expect(
      verifyLocalPassword("strong-passphrase-2026", hash)
    ).resolves.toBe(true);
    await expect(
      verifyLocalPassword("incorrect-passphrase", hash)
    ).resolves.toBe(false);
    expect(normalizeLocalEmail(" Client@Example.Test ")).toBe(
      "client@example.test"
    );
    expect(hash).not.toContain("strong-passphrase-2026");
  });

  it("verifies a pre-migration scrypt hash created before the PBKDF2 switch", async () => {
    // scrypt$<salt>$<derivedKey>, produced by the OLD hashLocalPassword() for
    // "legacy-passphrase-2025" via node:crypto's scrypt(password, salt, 64) —
    // a real value, not a placeholder, so this is a genuine regression check.
    const legacyHash =
      "scrypt$050165c0b14b01b2771cd79284a3cd85$fa44ae51b516568e751f6dc2c273b0336f9718524bc5d2c32b123fa8afa51398225ed1767484eaebd600f64f25ef685f90cc6488b511b944164971b1e96eaf1b";
    await expect(
      verifyLocalPassword("legacy-passphrase-2025", legacyHash)
    ).resolves.toBe(true);
    await expect(
      verifyLocalPassword("wrong-passphrase", legacyHash)
    ).resolves.toBe(false);
  });

  it("hashes invitation tokens before persistence", async () => {
    expect(hashInvitationToken("one-time-token")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("fails closed when the stored hash is malformed", async () => {
    await expect(
      verifyLocalPassword("strong-passphrase-2026", "bad-format")
    ).resolves.toBe(false);
    await expect(
      verifyLocalPassword(
        "strong-passphrase-2026",
        "pbkdf2$not-a-number$abcd$abcd"
      )
    ).resolves.toBe(false);
    await expect(
      verifyLocalPassword("strong-passphrase-2026", "unknown-algo$abcd$abcd")
    ).resolves.toBe(false);
  });
});
