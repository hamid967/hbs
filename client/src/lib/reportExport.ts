import { jsPDF } from "jspdf";
import writeExcelFile from "write-excel-file/browser";

export type ExportableReport = { scope: "company" | "team"; selectedMonth: string; leaveDays: { current: number; previous: number; delta: number; percentChange: number | null; byType: Record<string, number> }; expensesSar: { current: number; previous: number; delta: number; percentChange: number | null; byType: Record<string, number> } };
const scopeLabel = (scope: ExportableReport["scope"]) => scope === "team" ? "فريقي المباشر" : "الشركة";
const percent = (value: number | null) => value === null ? "غير متاح" : `${value}%`;
export function reportExportRows(report: ExportableReport) {
  return [["تقرير عمليات الموارد البشرية", report.selectedMonth], ["نطاق البيانات", scopeLabel(report.scope)], [], ["المؤشر", "الحالي", "السابق", "الفرق", "نسبة التغير"], ["أيام الإجازات", report.leaveDays.current, report.leaveDays.previous, report.leaveDays.delta, percent(report.leaveDays.percentChange)], ["المصروفات (ر.س)", report.expensesSar.current, report.expensesSar.previous, report.expensesSar.delta, percent(report.expensesSar.percentChange)], [], ["تفصيل الإجازات حسب النوع", "الأيام"], ...Object.entries(report.leaveDays.byType), [], ["تفصيل المصروفات حسب النوع", "ر.س"], ...Object.entries(report.expensesSar.byType)];
}
export async function exportReportExcel(report: ExportableReport) {
  await writeExcelFile(reportExportRows(report), {
    sheet: "تقرير العمليات",
    columns: [30, 18, 18, 18, 18].map(width => ({ width })),
    rightToLeft: true,
  }).toFile(`hr-hbs-report-${report.selectedMonth}.xlsx`);
}
export function exportReportPdf(report: ExportableReport) { const doc = new jsPDF({ unit: "pt", format: "a4" }); const rows = reportExportRows(report); doc.setFontSize(16); doc.text("HR HBS Operations Report", 40, 48); doc.setFontSize(10); let y = 78; rows.forEach(row => { const text = row.map(value => String(value)).join("  |  "); if (y > 790) { doc.addPage(); y = 48; } doc.text(text, 40, y); y += 18; }); doc.save(`hr-hbs-report-${report.selectedMonth}.pdf`); }
