import { describe, expect, it } from "vitest";
import { projectApprovalStages, redactApprovalStagesForEmployee, redactRequestHistoryForEmployee } from "./db";

describe("request detail privacy", () => {
  it("replaces detailed operational history text for an employee", () => {
    const history = redactRequestHistoryForEmployee([
      { id: 1, action: "note", nextStatus: null, note: "قرار المدير: تم اعتماد الاستثناء" },
      { id: 2, action: "status_change", nextStatus: "in_review", note: "أحيل إلى فريق الموارد البشرية مع ملاحظة داخلية" },
    ]);
    expect(history[0]?.note).toBe("تم تحديث مرحلة الموافقة.");
    expect(history[1]?.note).toBe("حالة المرحلة: in_review");
    expect(JSON.stringify(history)).not.toContain("استثناء");
    expect(JSON.stringify(history)).not.toContain("داخلية");
  });

  it("keeps stage status and dates but omits reviewer decision notes for an employee", () => {
    const stages = redactApprovalStagesForEmployee([{ id: 7, approverRole: "manager", status: "approved", createdAt: new Date("2026-08-01"), decidedAt: new Date("2026-08-02"), decisionNote: "تمت الموافقة لأن المستند مؤكد" }]);
    expect(stages[0]).toMatchObject({ id: 7, approverRole: "manager", status: "approved" });
    expect(stages[0]).not.toHaveProperty("decisionNote");
  });

  it("keeps the reviewer decision note for an authorized manager or unit reviewer", () => {
    const stages = projectApprovalStages([{ id: 7, decisionNote: "ملاحظة تشغيلية مفصلة" }], true);
    expect(stages[0]).toHaveProperty("decisionNote", "ملاحظة تشغيلية مفصلة");
  });
});
