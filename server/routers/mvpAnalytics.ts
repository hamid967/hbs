import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMvpMetrics, type MvpMetrics } from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const insightSchema = z.object({
  summary: z.string().min(1),
  positiveSignals: z.array(z.string()).max(3),
  attentionSignals: z.array(z.object({ level: z.enum(["مرتفع", "متوسط", "منخفض"]), title: z.string(), detail: z.string() })).max(3),
  recommendations: z.array(z.object({ priority: z.enum(["الآن", "قريباً", "لاحقاً"]), action: z.string(), rationale: z.string() })).max(3),
  dataSufficiency: z.enum(["كافٍ", "محدود"]),
});

function assertAnalyticsAccess(role: string) {
  if (role !== "admin" && role !== "manager") throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية الاطلاع على تحليلات MVP" });
}

function textContent(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.flatMap(item => typeof item === "object" && item !== null && "type" in item && item.type === "text" && "text" in item && typeof item.text === "string" ? [item.text] : []).join("\n");
}

function emptyAnalysis(metrics: MvpMetrics) {
  return { metrics, analysis: { summary: "لا توجد بيانات تشغيلية كافية بعد لتقديم قراءة ذكية موثوقة. ابدأ بتسجيل الطلبات أو جهات الاتصال أو إنشاء خطط HR، ثم حدّث التحليل.", positiveSignals: [], attentionSignals: [], recommendations: [{ priority: "الآن" as const, action: "تفعيل المسارات الأساسية", rationale: "التحليل يحتاج إلى بيانات تشغيلية فعلية، ولا يتم استخدام بيانات تجريبية." }], dataSufficiency: "محدود" as const } };
}

export const mvpAnalyticsRouter = router({
  metrics: protectedProcedure.query(async ({ ctx }) => { assertAnalyticsAccess(ctx.user.role); return getMvpMetrics(); }),
  analyze: protectedProcedure.mutation(async ({ ctx }) => {
    assertAnalyticsAccess(ctx.user.role);
    const metrics = await getMvpMetrics();
    const hasData = metrics.requests.total + metrics.demos.total + metrics.hrPlans.total > 0;
    if (!hasData) return emptyAnalysis(metrics);
    const result = await invokeLLM({
      model: "gpt-5-mini",
      maxTokens: 1500,
      messages: [
        { role: "system", content: "أنت محلل عمليات لمنصة موارد بشرية عربية. حلل فقط مؤشرات مجمّعة مقدمة لك. لا تخترع أسباباً أو أرقاماً، ولا تصدر أحكاماً عن أشخاص أو تتناول مشورة قانونية أو مالية. اكتب بالعربية بوضوح تنفيذي. عندما تكون البيانات قليلة، صرّح بذلك واقترح جمع بيانات بدل استنتاجات غير مدعومة." },
        { role: "user", content: `هذه مؤشرات MVP المجمعة فقط:\n${JSON.stringify(metrics)}\n\nأنتج ملخصاً تنفيذياً وإشارات وتوصيات قصيرة قابلة للتنفيذ.` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "mvp_performance_analysis", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, positiveSignals: { type: "array", items: { type: "string" } }, attentionSignals: { type: "array", items: { type: "object", properties: { level: { type: "string", enum: ["مرتفع", "متوسط", "منخفض"] }, title: { type: "string" }, detail: { type: "string" } }, required: ["level", "title", "detail"], additionalProperties: false } }, recommendations: { type: "array", items: { type: "object", properties: { priority: { type: "string", enum: ["الآن", "قريباً", "لاحقاً"] }, action: { type: "string" }, rationale: { type: "string" } }, required: ["priority", "action", "rationale"], additionalProperties: false } }, dataSufficiency: { type: "string", enum: ["كافٍ", "محدود"] } }, required: ["summary", "positiveSignals", "attentionSignals", "recommendations", "dataSufficiency"], additionalProperties: false } } },
    });
    try { return { metrics, analysis: insightSchema.parse(JSON.parse(textContent(result.choices[0]?.message.content))) }; } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء تحليل منظم للمؤشرات، حاول مرة أخرى" }); }
  }),
});
