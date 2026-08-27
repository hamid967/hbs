// @vitest-environment happy-dom
import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("يفتح المحتوى داخل بيئة React DOM من دون Invalid hook call", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>قائمة الحساب</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole("button", { name: "قائمة الحساب" }));

    expect(screen.getByRole("menuitem", { name: "تسجيل الخروج" })).toBeTruthy();
  });
});
