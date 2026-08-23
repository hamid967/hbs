import { describe, expect, it } from "vitest";
import { createRequestReference, canManageRequest, permittedRequestTypes } from "./requestPolicy";
import { createRequestInput } from "./routers/requests";

describe("request permissions", () => {
  it("limits each operational team to the matching request type", () => {
    expect(canManageRequest("hr", "hr")).toBe(true);
    expect(canManageRequest("hr", "government")).toBe(false);
    expect(permittedRequestTypes("government")).toEqual(["government"]);
    expect(permittedRequestTypes("manager")).toEqual(["hr", "government"]);
  });

  it("validates the essential fields required to submit a request", () => {
    expect(() => createRequestInput.parse({ type: "hr", category: "إجازة", subject: "طلب إجازة سنوية", details: "أرغب في تقديم طلب إجازة سنوية لمدة خمسة أيام." })).not.toThrow();
    expect(() => createRequestInput.parse({ type: "hr", category: "", subject: "قصير", details: "قصير" })).toThrow();
  });

  it("creates an identifiable reference with the appropriate request prefix", () => {
    expect(createRequestReference("hr", 1712345678901)).toMatch(/^HBS-HR-678901-[A-Z0-9]{3}$/);
    expect(createRequestReference("government", 1712345678901)).toMatch(/^HBS-GR-678901-[A-Z0-9]{3}$/);
  });
});
