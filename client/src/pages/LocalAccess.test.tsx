// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: vi.fn() } } }),
    localAccess: {
      login: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      requestSubscription: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false, isSuccess: false }) },
      activateInvitation: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
    },
  },
}));

import { ActivateInvitation, LocalLogin, SubscriptionRequest } from "./LocalAccess";

describe("public local access pages", () => {
  it("renders the local login and subscription request without an OAuth session", () => {
    const login = render(<LocalLogin />);
    expect(screen.getByRole("heading", { name: "الدخول بالبريد" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "تسجيل الدخول" })).toBeTruthy();
    expect(document.querySelector(".auth-spatial-scene")).toBeTruthy();
    login.unmount();
    render(<SubscriptionRequest />);
    expect(screen.getByRole("heading", { name: "اطلب اشتراك المنشأة" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "إرسال طلب الاشتراك" })).toBeTruthy();
  });

  it("shows a safe validation message for an incomplete invitation URL", () => {
    window.history.replaceState({}, "", "/activate");
    render(<ActivateInvitation />);
    expect(screen.getByRole("alert").textContent).toContain("رابط الدعوة غير مكتمل");
  });
});
