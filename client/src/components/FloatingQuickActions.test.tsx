// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import FloatingQuickActions from "./FloatingQuickActions";

// Mock useAuth
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "أحمد المدير", email: "manager@example.com", role: "admin" },
    isAuthenticated: true,
  }),
}));

// Mock wouter useLocation
const mockSetLocation = vi.fn();
vi.mock("wouter", () => ({
  useLocation: () => ["/app", mockSetLocation],
}));

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      employees: { list: { invalidate: vi.fn() } },
    }),
  },
}));

afterEach(() => {
  cleanup();
  mockSetLocation.mockClear();
});

describe("FloatingQuickActions Component", () => {
  it("renders the floating trigger button at the bottom", () => {
    render(<FloatingQuickActions />);
    const trigger = screen.getByRole("button", { name: /قائمة الإجراءات السريعة/ });
    expect(trigger).toBeTruthy();
    expect(screen.getByText("إجراءات سريعة")).toBeTruthy();
  });

  it("opens the quick actions menu upon clicking trigger", async () => {
    const user = userEvent.setup();
    render(<FloatingQuickActions />);

    const trigger = screen.getByRole("button", { name: /قائمة الإجراءات السريعة/ });
    await user.click(trigger);

    // Verify header and primary tasks
    expect(screen.getByText("الإجراءات السريعة")).toBeTruthy();
    expect(screen.getByText("إضافة موظف جديد")).toBeTruthy();
    expect(screen.getByText("مسير رواتب جديد (WPS)")).toBeTruthy();
    expect(screen.getByText("تقديم طلب جديد")).toBeTruthy();
  });

  it("navigates to /requests/new when 'تقديم طلب جديد' is clicked", async () => {
    const user = userEvent.setup();
    render(<FloatingQuickActions />);

    const trigger = screen.getByRole("button", { name: /قائمة الإجراءات السريعة/ });
    await user.click(trigger);

    const submitRequestBtn = screen.getByText("تقديم طلب جديد");
    await user.click(submitRequestBtn);

    expect(mockSetLocation).toHaveBeenCalledWith("/requests/new");
  });

  it("navigates to /employees when 'إضافة موظف جديد' is clicked", async () => {
    const user = userEvent.setup();
    render(<FloatingQuickActions />);

    const trigger = screen.getByRole("button", { name: /قائمة الإجراءات السريعة/ });
    await user.click(trigger);

    const addEmployeeBtn = screen.getByText("إضافة موظف جديد");
    await user.click(addEmployeeBtn);

    expect(mockSetLocation).toHaveBeenCalledWith("/employees");
  });

  it("navigates to /reports when 'مسير رواتب جديد (WPS)' is clicked", async () => {
    const user = userEvent.setup();
    render(<FloatingQuickActions />);

    const trigger = screen.getByRole("button", { name: /قائمة الإجراءات السريعة/ });
    await user.click(trigger);

    const newPayrollBtn = screen.getByText("مسير رواتب جديد (WPS)");
    await user.click(newPayrollBtn);

    expect(mockSetLocation).toHaveBeenCalledWith("/reports");
  });
});
