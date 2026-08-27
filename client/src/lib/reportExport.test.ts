import { beforeEach, describe, expect, it, vi } from "vitest";

const excelMock = vi.hoisted(() => {
  const toFile = vi.fn(async () => undefined);
  const writeExcelFile = vi.fn(() => ({ toFile }));
  return { toFile, writeExcelFile };
});

vi.mock("write-excel-file/browser", () => ({ default: excelMock.writeExcelFile }));

import { exportReportExcel, reportExportRows } from "./reportExport";

const report = {
  scope: "team" as const,
  selectedMonth: "2026-08",
  leaveDays: { current: 3, previous: 0, delta: 3, percentChange: null, byType: { annual: 3 } },
  expensesSar: { current: 1250, previous: 1000, delta: 250, percentChange: 25, byType: { travel: 1250 } },
};

beforeEach(() => {
  excelMock.toFile.mockClear();
  excelMock.writeExcelFile.mockClear();
});

describe("report export rows", () => {
  it("includes the authorized scope, monthly comparison, and breakdowns", () => {
    expect(reportExportRows(report)).toEqual(expect.arrayContaining([
      ["نطاق البيانات", "فريقي المباشر"],
      ["أيام الإجازات", 3, 0, 3, "غير متاح"],
      ["المصروفات (ر.س)", 1250, 1000, 250, "25%"],
      ["annual", 3],
      ["travel", 1250],
    ]));
  });
});

describe("Excel report export", () => {
  it("writes the authorized report rows to a right-to-left XLSX download", async () => {
    await exportReportExcel(report);

    expect(excelMock.writeExcelFile).toHaveBeenCalledWith(
      reportExportRows(report),
      expect.objectContaining({ sheet: "تقرير العمليات", rightToLeft: true })
    );
    expect(excelMock.toFile).toHaveBeenCalledWith("hr-hbs-report-2026-08.xlsx");
  });
});
