export function formatMonthlyPercentChange(percentChange: number | null) {
  return percentChange === null ? "لا تتوفر نسبة" : `${percentChange > 0 ? "+" : ""}${percentChange}%`;
}

export function monthlyComparisonHint(percentChange: number | null) {
  return percentChange === null ? "لا يمكن حساب النسبة لأن الشهر السابق لا يحتوي على بيانات." : "مقارنة بالشهر السابق.";
}
