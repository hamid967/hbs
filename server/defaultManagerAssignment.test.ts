import { describe, expect, it } from "vitest";
import { hasDefaultManagerAssignment } from "./db";

describe("default manager assignment signal", () => {
  it("reports only the assignment state without exposing the manager identity", () => {
    expect(hasDefaultManagerAssignment([{ note: "تم تعيين مدير افتراضي من مسؤولي الشركة لأن ملف الموظف لا يحتوي مديراً مباشراً." }])).toBe(true);
    expect(hasDefaultManagerAssignment([{ note: "تم إنشاء الطلب وإرساله للمراجعة." }])).toBe(false);
  });
});
