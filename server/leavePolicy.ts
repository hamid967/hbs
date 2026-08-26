export type LeaveType = "annual" | "sick" | "emergency";

export const leaveTypeLabels: Record<LeaveType, string> = {
  annual: "إجازة سنوية",
  sick: "إجازة مرضية",
  emergency: "إجازة طارئة",
};

export function countInclusiveLeaveDays(startDate: string, endDate: string) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) throw new Error("نطاق تاريخ الإجازة غير صالح");
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function dateRangesOverlap(startDate: string, endDate: string, existingStartDate: string, existingEndDate: string) {
  return startDate <= existingEndDate && endDate >= existingStartDate;
}

export function getLeaveRequestYear(startDate: string, endDate: string) {
  const startYear = Number(startDate.slice(0, 4));
  const endYear = Number(endDate.slice(0, 4));
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear !== endYear) throw new Error("يجب أن يقع طلب الإجازة ضمن سنة تقويمية واحدة");
  return startYear;
}

export function calculateLeaveBalance(input: { allocatedDays: number; approvedDays: number; pendingDays: number }) {
  const remainingDays = input.allocatedDays - input.approvedDays - input.pendingDays;
  return { ...input, remainingDays: Math.max(0, remainingDays) };
}
