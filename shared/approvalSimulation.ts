export type SimulationRequestType = "hr" | "government";
export type SimulationStep = "draft" | "manager" | "specialist" | "completed";

export function specialistLabel(type: SimulationRequestType) {
  return type === "government" ? "العلاقات الحكومية" : "الموارد البشرية";
}

export function advanceSimulation(step: SimulationStep, type: SimulationRequestType): SimulationStep {
  if (step === "draft") return "manager";
  if (step === "manager") return "specialist";
  if (step === "specialist") return "completed";
  return "completed";
}

export function simulationStages(type: SimulationRequestType, step: SimulationStep) {
  const order: SimulationStep[] = ["draft", "manager", "specialist", "completed"];
  const current = order.indexOf(step);
  return [
    { key: "draft", label: "إرسال افتراضي من الموظف", status: current >= 1 ? "completed" : "current" },
    { key: "manager", label: "موافقة المدير المباشر", status: current > 1 ? "completed" : current === 1 ? "current" : "pending" },
    { key: "specialist", label: `موافقة ${specialistLabel(type)}`, status: current > 2 ? "completed" : current === 2 ? "current" : "pending" },
    { key: "completed", label: "اكتمال المسار", status: current === 3 ? "completed" : "pending" },
  ] as const;
}
