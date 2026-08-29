import { AlertCircle, Lightbulb, TrendingUp, Target, CheckCircle, Clock, Users } from "lucide-react";
import { ReactNode } from "react";

export type HrPlanContent = {
  executiveSummary: string;
  operatingModel: string;
  personalizationRationale: string;
  assumptions: string[];
  modules: Array<{
    name: string;
    purpose: string;
    priority: "أساسي" | "مهم" | "متقدم";
  }>;
  organizationalRoles: Array<{
    role: string;
    responsibility: string;
    timing: string;
  }>;
  workflows: Array<{
    name: string;
    outcome: string;
    owner: string;
  }>;
  policies: Array<{
    name: string;
    intent: string;
  }>;
  executionDecisions: Array<{
    decision: string;
    recommendation: string;
    whyNow: string;
    isEssential: boolean;
  }>;
  first90Days: Array<{
    period: string;
    phase: string;
    objective: string;
    actions: string[];
    owner?: string;
  }>;
  keyMetrics: Array<{
    metric: string;
    baseline: string;
    target30Days?: string;
    target90Days?: string;
  }>;
  risks: string[];
};

interface HrPlanViewerProps {
  content: HrPlanContent;
  companyContext?: {
    businessActivity: string;
    companySize: string;
    workModel?: string;
    geographicFootprint?: string;
    growthHorizon?: string;
  };
}

export function AssumptionsPanel({
  assumptions,
}: {
  assumptions: string[];
}) {
  if (!assumptions.length) return null;
  return (
    <section className="rounded-2xl border border-ds-brand-100 bg-ds-brand-50 p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-ds-neutral-950">
        <Lightbulb className="size-4 text-ds-brand-600" />
        الافتراضات المستنبطة من السياق
      </div>
      <ul className="mt-3 space-y-2 text-xs leading-6 text-ds-neutral-700">
        {assumptions.map((assumption) => (
          <li key={assumption} className="flex gap-2">
            <span className="text-ds-brand-600">✓</span>
            <span>{assumption}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-ds-neutral-600 italic">
        هذه الافتراضات توضح كيف أثرت بيانات شركتك على التوصيات المقترحة.
      </p>
    </section>
  );
}

export function KeyMetricsPanel({
  keyMetrics,
}: {
  keyMetrics: HrPlanContent["keyMetrics"];
}) {
  if (!keyMetrics.length) return null;
  return (
    <section className="rounded-2xl border border-ds-success-border bg-ds-success-soft/30 p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-ds-neutral-950">
        <TrendingUp className="size-4 text-ds-success" />
        مقاييس الأداء والأهداف
      </div>
      <div className="mt-4 space-y-3">
        {keyMetrics.map((item) => (
          <div
            key={item.metric}
            className="rounded-xl border border-ds-neutral-200 bg-white p-3"
          >
            <p className="text-xs font-bold text-ds-neutral-950">{item.metric}</p>
            <div className="mt-2 grid gap-2 grid-cols-3 text-[11px]">
              <div>
                <p className="text-ds-neutral-600">الوضع الحالي</p>
                <p className="font-bold text-ds-neutral-900">{item.baseline}</p>
              </div>
              {item.target30Days && (
                <div>
                  <p className="text-ds-neutral-600">هدف 30 يوم</p>
                  <p className="font-bold text-ds-brand-600">
                    {item.target30Days}
                  </p>
                </div>
              )}
              {item.target90Days && (
                <div>
                  <p className="text-ds-neutral-600">هدف 90 يوم</p>
                  <p className="font-bold text-ds-success">
                    {item.target90Days}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExecutionDecisionsPanel({
  decisions,
}: {
  decisions: HrPlanContent["executionDecisions"];
}) {
  if (!decisions.length) return null;
  const essential = decisions.filter((d) => d.isEssential);
  const enhancements = decisions.filter((d) => !d.isEssential);

  return (
    <section className="space-y-4">
      {essential.length > 0 && (
        <div className="rounded-2xl border-l-4 border-l-ds-danger bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-ds-neutral-950">
            <CheckCircle className="size-4 text-ds-danger" />
            قرارات أساسية (يجب البدء بها الآن)
          </div>
          <div className="mt-3 space-y-3">
            {essential.map((decision) => (
              <div key={decision.decision} className="text-sm">
                <p className="font-bold text-ds-neutral-950">
                  ❓ {decision.decision}
                </p>
                <p className="mt-1 text-xs text-ds-neutral-700">
                  <strong>التوصية:</strong> {decision.recommendation}
                </p>
                <p className="mt-1 text-xs text-ds-neutral-600">
                  <strong>لماذا الآن:</strong> {decision.whyNow}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {enhancements.length > 0 && (
        <div className="rounded-2xl border-l-4 border-l-ds-warning bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-ds-neutral-950">
            <Clock className="size-4 text-ds-warning" />
            تحسينات لاحقة (بعد أول 90 يوم)
          </div>
          <div className="mt-3 space-y-3">
            {enhancements.map((decision) => (
              <div key={decision.decision} className="text-sm">
                <p className="font-bold text-ds-neutral-950">
                  💡 {decision.decision}
                </p>
                <p className="mt-1 text-xs text-ds-neutral-700">
                  {decision.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function First90DaysPanel({
  first90Days,
}: {
  first90Days: HrPlanContent["first90Days"];
}) {
  if (!first90Days.length) return null;
  const phases = ["اليوم 1–30", "اليوم 31–60", "اليوم 61–90"];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-ds-neutral-950">
        <Target className="size-4 text-ds-brand-600" />
        خطة التنفيذ: أول 90 يوم
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {phases.map((phase) => {
          const phaseData = first90Days.find((p) =>
            p.period.includes(phase.split("–")[0])
          );
          return (
            <div
              key={phase}
              className="rounded-xl border-2 border-ds-brand-200 bg-ds-brand-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-ds-brand-700">{phase}</p>
                {phaseData?.owner && (
                  <span className="flex items-center gap-1 text-[11px] text-ds-neutral-600">
                    <Users className="size-3" />
                    {phaseData.owner}
                  </span>
                )}
              </div>
              {phaseData && (
                <>
                  <p className="mt-2 text-xs font-bold text-ds-neutral-950">
                    {phaseData.phase}
                  </p>
                  <p className="mt-1 text-xs text-ds-neutral-700">
                    {phaseData.objective}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-ds-neutral-600">
                    {phaseData.actions.map((action) => (
                      <li key={action} className="flex gap-2">
                        <span className="text-ds-brand-600">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function RisksPanel({ risks }: { risks: string[] }) {
  if (!risks.length) return null;
  return (
    <section className="rounded-2xl border border-ds-warning bg-ds-ivory p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-ds-warning">
        <AlertCircle className="size-4" />
        مخاطر ونقاط انتباه
      </div>
      <ul className="mt-3 space-y-2 text-xs leading-6 text-ds-neutral-700">
        {risks.map((risk) => (
          <li key={risk} className="flex gap-2">
            <span className="text-ds-warning">⚠</span>
            <span>{risk}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CustomizationScore({
  context,
}: {
  context?: HrPlanViewerProps["companyContext"];
}) {
  if (!context) return null;

  const providedFields = [
    context.businessActivity,
    context.companySize,
    context.workModel,
    context.geographicFootprint,
    context.growthHorizon,
  ].filter(Boolean).length;

  const score = Math.round((providedFields / 5) * 100);
  const scoreColor =
    score >= 80 ? "ds-success" : score >= 60 ? "ds-brand-600" : "ds-warning";

  return (
    <div className={`rounded-xl border border-${scoreColor}/20 bg-${scoreColor}/10 p-4`}>
      <p className="text-xs font-bold text-ds-neutral-950">
        درجة التخصيص: {score}%
      </p>
      <div className="mt-2 h-2 rounded-full bg-ds-neutral-200 overflow-hidden">
        <div
          className={`h-full bg-${scoreColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-ds-neutral-600">
        {score >= 80
          ? "✓ الخطة مخصصة بدقة عالية بناءً على سياق شركتك"
          : score >= 60
            ? "○ أضف تفاصيل أكثر للحصول على توصيات أدق"
            : "! أكمل ملف الشركة لتحسين جودة التخصيص"}
      </p>
    </div>
  );
}
