import { afterEach, describe, expect, it } from "vitest";
import { clearLocalAccessRateLimitsForTests, consumeLocalAccessRateLimit } from "./localAccessRateLimit";

describe("local access rate limiting", () => {
  afterEach(clearLocalAccessRateLimitsForTests);
  it("limits repeated attempts and resets the bucket when its time window ends", () => {
    expect(consumeLocalAccessRateLimit("login:ip:email", 2, 1_000, 10)).toBe(true);
    expect(consumeLocalAccessRateLimit("login:ip:email", 2, 1_000, 11)).toBe(true);
    expect(consumeLocalAccessRateLimit("login:ip:email", 2, 1_000, 12)).toBe(false);
    expect(consumeLocalAccessRateLimit("login:ip:email", 2, 1_000, 1_011)).toBe(true);
  });
});
