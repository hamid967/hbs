import { jsPDF } from "jspdf";

export type GoalExportRow = { title: string; employee: string; department: string; status: string; progress: number; targetAt: string };
export type GoalExportColumn = keyof GoalExportRow;
export const goalExportLabels: Record<GoalExportColumn, string> = { title: "Goal", employee: "Employee", department: "Department", status: "Status", progress: "Progress", targetAt: "Target date" };

function safeFilenamePart(value: string) { return value.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").slice(0, 40) || "filtered"; }

export function exportGoalsCsv(rows: GoalExportRow[], label = "filtered", columns: GoalExportColumn[] = Object.keys(goalExportLabels) as GoalExportColumn[]) {
  const lines = [[...columns.map(column => goalExportLabels[column])], ...rows.map(row => columns.map(column => column === "progress" ? `${row.progress}%` : String(row[column])))];
  const csv = lines.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `hbs-goals-${safeFilenamePart(label)}.csv`; link.click(); URL.revokeObjectURL(url);
}

export function exportGoalsPdf(rows: GoalExportRow[], label = "filtered", columns: GoalExportColumn[] = Object.keys(goalExportLabels) as GoalExportColumn[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16); doc.text("HBS Goals Progress Report", 40, 48);
  const average = rows.length ? Math.round(rows.reduce((total, row) => total + row.progress, 0) / rows.length) : 0;
  const completed = rows.filter(row => row.status === "مكتمل").length;
  doc.setFontSize(10); doc.text(`Filtered goals: ${rows.length}   Completed: ${completed}   Average progress: ${average}%`, 40, 72);
  doc.setDrawColor(212, 228, 215); doc.setFillColor(238, 245, 239); doc.roundedRect(40, 86, 300, 16, 8, 8, "FD");
  doc.setFillColor(51, 121, 80); doc.roundedRect(40, 86, Math.max(0, Math.min(300, 3 * average)), 16, 8, 8, "F");
  doc.setFontSize(8); doc.text(`${average}%`, 348, 98);
  doc.setFontSize(9); let y = 126;
  const allRows = [[columns.map(column => goalExportLabels[column]).join(" | ")], ...rows.map(row => [columns.map(column => column === "progress" ? `${row.progress}%` : String(row[column])).join(" | ")])];
  allRows.forEach(([text]) => { if (y > 790) { doc.addPage(); y = 48; } doc.text(text.slice(0, 150), 40, y); y += 18; });
  doc.save(`hbs-goals-${safeFilenamePart(label)}.pdf`);
}
