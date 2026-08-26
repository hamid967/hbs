import { describe, expect, it } from "vitest";
import { buildEmployeeProfileLifecycleChanges } from "./db";

describe("employee profile lifecycle changes", () => {
  const baseline = { employmentStatus: "active", departmentId: 2, managerUserId: 8 };

  it("records only meaningful operational changes", () => {
    expect(buildEmployeeProfileLifecycleChanges(baseline, baseline)).toEqual([]);
    expect(buildEmployeeProfileLifecycleChanges(baseline, { employmentStatus: "on_leave", departmentId: 5, managerUserId: 9 }).map(change => change.eventType)).toEqual(["status_changed", "department_changed", "manager_changed"]);
  });

  it("does not include sensitive profile fields in lifecycle notes", () => {
    const changes = buildEmployeeProfileLifecycleChanges(baseline, { employmentStatus: "active", departmentId: 2, managerUserId: null });
    expect(changes).toEqual([{ eventType: "manager_changed", note: "تحديث المدير المباشر من ملف الموظف" }]);
  });
});
