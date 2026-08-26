import { jsPDF } from "jspdf";

export type GoalExportRow = { title: string; employee: string; department: string; status: string; progress: number; targetAt: string };

function safeFilenamePart(value: string) { return value.replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").slice(0, 40) || "filtered"; }

export function exportGoalsCsv(rows: GoalExportRow[], label = "filtered") {
  const lines = [["Goal", "Employee", "Department", "Status", "Progress", "Target date"], ...rows.map(row => [row.title, row.employee, row.department, row.status, `${row.progress}%`, row.targetAt])];
  const csv = lines.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `hbs-goals-${safeFilenamePart(label)}.csv`; link.click(); URL.revokeObjectURL(url);
}

export function exportGoalsPdf(rows: GoalExportRow[], label = "filtered") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(16); doc.text("HBS Goals Progress Report", 40, 48);
  doc.setFontSize(9); let y = 76;
  const allRows = [["Goal | Employee | Department | Status | Progress | Target"], ...rows.map(row => [`${row.title} | ${row.employee} | ${row.department} | ${row.status} | ${row.progress}% | ${row.targetAt}`])];
  allRows.forEach(([text]) => { if (y > 790) { doc.addPage(); y = 48; } doc.text(text.slice(0, 150), 40, y); y += 18; });
  doc.save(`hbs-goals-${safeFilenamePart(label)}.pdf`);
}
