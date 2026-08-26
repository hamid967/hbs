export type OperationalHealthState = "available" | "attention";

export type OperationalHealthSignal = {
  id: "application" | "database" | "build";
  label: string;
  state: OperationalHealthState;
  detail: string;
};

export function buildOperationalHealthSnapshot(input: { databaseReachable: boolean; checkedAt?: Date }) {
  const checkedAt = input.checkedAt ?? new Date();
  const signals: OperationalHealthSignal[] = [
    { id: "application", label: "استجابة التطبيق", state: "available", detail: "استجاب مسار tRPC الإداري بنجاح." },
    {
      id: "database",
      label: "اتصال قاعدة البيانات",
      state: input.databaseReachable ? "available" : "attention",
      detail: input.databaseReachable ? "نجح فحص اتصال محدود من دون قراءة سجلات أعمال." : "تعذر فحص اتصال قاعدة البيانات؛ راجع التشغيل من دون عرض بيانات حساسة.",
    },
    { id: "build", label: "مصدر البناء", state: "available", detail: "يعرض التطبيق الإصدار ومرجع الالتزام وبيئة البناء في واجهته." },
  ];

  return {
    overall: input.databaseReachable ? "available" : "attention" as OperationalHealthState,
    checkedAt,
    signals,
  };
}
