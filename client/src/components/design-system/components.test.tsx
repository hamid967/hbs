// @vitest-environment happy-dom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "@/components/ui/input";
import { ActionButton } from "./ActionButton";
import { DataTable } from "./DataTable";
import { DescriptionList } from "./DescriptionList";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { FormField } from "./FormField";
import { InlineNotice } from "./InlineNotice";
import { KpiCard } from "./KpiCard";
import { LoadingState } from "./LoadingState";
import { SectionHeading } from "./SectionHeading";
import { StatusBadge } from "./StatusBadge";
import { Surface } from "./Surface";
import { TimelineList } from "./TimelineList";

// vitest لا يعمل بوضع globals، فلا يُسجَّل تنظيف testing-library تلقائياً.
afterEach(cleanup);

describe("FormField", () => {
  it("يربط التسمية بعنصر الإدخال ويعلن الخطأ لقارئ الشاشة", () => {
    render(
      <FormField label="اسم الموظف" error="الاسم مطلوب" required>
        {props => <Input {...props} />}
      </FormField>
    );
    const input = screen.getByLabelText(/اسم الموظف/);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("الاسم مطلوب");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("يعرض التلميح فقط حين لا يوجد خطأ", () => {
    const { rerender } = render(
      <FormField label="الرمز" hint="حروف وأرقام فقط">
        <Input />
      </FormField>
    );
    expect(screen.getByText("حروف وأرقام فقط")).toBeTruthy();
    rerender(
      <FormField label="الرمز" hint="حروف وأرقام فقط" error="رمز غير صالح">
        <Input />
      </FormField>
    );
    expect(screen.queryByText("حروف وأرقام فقط")).toBeNull();
    expect(screen.getByRole("alert").textContent).toBe("رمز غير صالح");
  });
});

describe("DataTable", () => {
  type Row = { id: number; name: string };
  const columns = [
    { key: "name", header: "الاسم", cell: (row: Row) => row.name },
    { key: "id", header: "الرقم", cell: (row: Row) => row.id },
  ];

  it("يعرض الرؤوس والصفوف", () => {
    render(
      <DataTable
        columns={columns}
        rows={[
          { id: 1, name: "سارة" },
          { id: 2, name: "أحمد" },
        ]}
        rowKey={row => row.id}
      />
    );
    expect(
      screen.getAllByRole("columnheader").map(cell => cell.textContent)
    ).toEqual(["الاسم", "الرقم"]);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(within(screen.getByRole("table")).getByText("سارة")).toBeTruthy();
  });

  it("يستبدل الجدول بحالة فارغة حين لا توجد صفوف", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={row => row.id}
        emptyTitle="لا يوجد موظفون"
      />
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("لا يوجد موظفون")).toBeTruthy();
  });
});

describe("حالات الصفحة", () => {
  it("تعلن حالة الخطأ كتنبيه وحالة التحميل كحالة حيّة", () => {
    const { unmount } = render(<ErrorState description="تعذر الاتصال" />);
    expect(screen.getByRole("alert").textContent).toContain(
      "تعذّر تحميل البيانات"
    );
    unmount();
    render(<LoadingState />);
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  });

  it("تعرض الحالة الفارغة فعلاً مساعداً حين يُمرَّر", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="لا توجد طلبات"
        action={<ActionButton onClick={onClick}>طلب جديد</ActionButton>}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "طلب جديد" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("المكوّنات العرضية", () => {
  it("تبني بنية دلالية صحيحة", () => {
    render(
      <Surface as="article" aria-label="بطاقة">
        <SectionHeading title="الفريق" description="أعضاء الوحدة" />
        <KpiCard
          label="الطلبات المفتوحة"
          value={12}
          detail="خلال 30 يوماً"
          tone="warning"
        />
        <StatusBadge tone="success">مفعّل</StatusBadge>
        <InlineNotice tone="info" title="ملاحظة">
          القيم تشغيلية.
        </InlineNotice>
        <DescriptionList
          items={[{ term: "الوحدة", value: "الموارد البشرية" }]}
        />
        <TimelineList
          entries={[
            { id: 1, title: "أُنشئ الطلب", meta: "أمس", tone: "brand" },
          ]}
        />
      </Surface>
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "الفريق" })
    ).toBeTruthy();
    expect(screen.getByRole("article")).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain("القيم تشغيلية.");
    expect(screen.getByRole("term").textContent).toBe("الوحدة");
    expect(screen.getByRole("listitem").textContent).toContain("أُنشئ الطلب");
    expect(screen.getByLabelText("الطلبات المفتوحة").textContent).toContain(
      "12"
    );
    expect(screen.getByText("مفعّل").className).toContain("text-ds-success");
  });

  it("يميّز زر الفعل الهدّام عن الفعل الرئيسي", () => {
    render(
      <>
        <ActionButton intent="primary">حفظ</ActionButton>
        <ActionButton intent="destructive">حذف</ActionButton>
      </>
    );
    expect(screen.getByRole("button", { name: "حفظ" }).className).toContain(
      "bg-ds-brand-800"
    );
    expect(screen.getByRole("button", { name: "حذف" }).className).toContain(
      "bg-ds-danger"
    );
  });
});
