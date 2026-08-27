export type OAuthAcceptanceReadinessInput = {
  activeEmployees: number;
  activeManagers: number;
  activeSpecialists: number;
  linkedEmployeeManagers: number;
};

export function buildOAuthAcceptanceReadinessSnapshot(input: OAuthAcceptanceReadinessInput) {
  const checks = [
    { id: "employee", label: "موظف مفعّل", ready: input.activeEmployees > 0, detail: input.activeEmployees > 0 ? "يوجد حساب موظف مفعّل يمكنه بدء الطلب." : "يلزم تفعيل حساب موظف واحد على الأقل." },
    { id: "manager", label: "مدير مباشر مفعّل", ready: input.activeManagers > 0, detail: input.activeManagers > 0 ? "يوجد حساب مدير مفعّل داخل الشركة." : "يلزم تفعيل حساب مدير واحد على الأقل." },
    { id: "specialist", label: "وحدة مختصة مفعّلة", ready: input.activeSpecialists > 0, detail: input.activeSpecialists > 0 ? "توجد وحدة HR أو علاقات حكومية مفعّلة." : "يلزم تفعيل حساب HR أو علاقات حكومية واحد على الأقل." },
    { id: "relationship", label: "ارتباط موظف بمدير مباشر", ready: input.linkedEmployeeManagers > 0, detail: input.linkedEmployeeManagers > 0 ? "يوجد ارتباط مباشر صالح لبدء اختبار مسار الموافقة." : "يلزم ربط موظف مفعّل بمدير مباشر مفعّل داخل ملفه." },
  ] as const;

  return {
    overall: checks.every(check => check.ready) ? "ready" as const : "waiting" as const,
    checkedAt: new Date().toISOString(),
    counts: input,
    checks,
  };
}
