import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileCheck2,
  Filter,
  History,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FilterBar } from "@/components/design-system";

const categoryLabels = {
  recruitment: "التوظيف والكوادر",
  attendance: "الدوام والحضور",
  training: "التدريب والتطوير",
  approval: "الموافقات والاعتمادات",
  account: "الحسابات والمصادقة",
  permission: "الصلاحيات والأدوار",
  leave: "الإجازات والاستئذان",
  document: "الوثائق والعقود",
} as const;

type AuditCategoryKey = keyof typeof categoryLabels;

export default function AuditLog() {
  const [category, setCategory] = useState<AuditCategoryKey | "all">("all");
  const [selectedActorId, setSelectedActorId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Fetch actor list for user filter
  const { data: actors } = trpc.audit.actors.useQuery();

  // Compute actual date filters based on preset
  const computedDateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === "today") {
      const todayStr = now.toISOString().slice(0, 10);
      return { startDate: todayStr, endDate: todayStr };
    }
    if (datePreset === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      return { startDate: sevenDaysAgo, endDate: todayStr };
    }
    if (datePreset === "30days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      return { startDate: thirtyDaysAgo, endDate: todayStr };
    }
    if (datePreset === "custom") {
      return {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
    }
    return { startDate: undefined, endDate: undefined };
  }, [datePreset, startDate, endDate]);

  const queryInput = useMemo(() => {
    return {
      limit: 100,
      ...(category !== "all" ? { category } : {}),
      ...(selectedActorId !== "all" ? { actorUserId: Number(selectedActorId) } : {}),
      ...(computedDateRange.startDate ? { startDate: computedDateRange.startDate } : {}),
      ...(computedDateRange.endDate ? { endDate: computedDateRange.endDate } : {}),
      ...(searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {}),
    };
  }, [category, selectedActorId, computedDateRange, searchQuery]);

  const { data, isLoading, isError, error, refetch, isFetching } = trpc.audit.list.useQuery(queryInput);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== "all") count++;
    if (selectedActorId !== "all") count++;
    if (datePreset !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [category, selectedActorId, datePreset, searchQuery]);

  const resetFilters = () => {
    setCategory("all");
    setSelectedActorId("all");
    setSearchQuery("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  const copyEventDetails = (eventItem: any) => {
    const text = `حدث تدقيق #${eventItem.event.id}\nالوقت: ${new Date(eventItem.event.createdAt).toLocaleString("ar-SA")}\nالفاعل: ${eventItem.actor?.name || "نظام"}\nالفئة: ${categoryLabels[eventItem.event.category as AuditCategoryKey] || eventItem.event.category}\nالحدث: ${eventItem.event.action}\nالملخص: ${eventItem.event.summary}`;
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ تفاصيل الحدث إلى الحافظة");
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-ds-brand-100 text-ds-brand-800">
                <Shield className="size-4" />
              </span>
              <p className="text-xs font-bold text-ds-brand-500">الأمن والموثوقية والرقابة</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-ds-brand-950">سجل التدقيق والامتثال الأمني</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ds-neutral-600">
              يسجل كافة العمليات الإدارية والتشغيلية وتغييرات الحسابات والصلاحيات داخل الشركة لضمان الشفافية والمساءلة
              الأمنية.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-10 rounded-xl border-ds-neutral-200 text-ds-neutral-700 hover:bg-ds-neutral-50 cursor-pointer"
            >
              <RotateCcw className={`ml-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
              تحديث السجل
            </Button>
          </div>
        </div>

        {/* Audit Log Filter Component */}
        <div className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ds-neutral-100 pb-3.5">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-ds-brand-700" />
              <h2 className="text-sm font-bold text-ds-brand-950">مرشحات البحث الأمني المتقدم</h2>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-ds-brand-100 px-2.5 py-0.5 text-xs font-bold text-ds-brand-800">
                  {activeFiltersCount} مفعّل
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-ds-danger hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="size-3.5" /> إعادة ضبط المرشحات
              </button>
            )}
          </div>

          {/* Top Filter Row: Search & User & Date Presets */}
          <div className="grid gap-3 sm:grid-cols-12">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ds-neutral-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالإجراء، الملخص، نوع الكيان…"
                className="h-10 rounded-xl border-ds-neutral-200 bg-ds-neutral-50/50 pr-9 text-xs focus-visible:ring-ds-brand-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-neutral-400 hover:text-ds-neutral-700 p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Actor / User Selector */}
            <div className="sm:col-span-4">
              <Select value={selectedActorId} onValueChange={setSelectedActorId}>
                <SelectTrigger className="h-10 rounded-xl border-ds-neutral-200 bg-ds-neutral-50/50 text-xs font-semibold">
                  <User className="ml-1.5 size-3.5 text-ds-neutral-500" />
                  <SelectValue placeholder="تصفية بالمستخدم" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="bg-white">
                  <SelectItem value="all">كل المستخدمين والمسؤولين</SelectItem>
                  {actors?.map(act => (
                    <SelectItem key={act.id} value={String(act.id)}>
                      {act.name || "مستخدم"} ({act.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Preset Selector */}
            <div className="sm:col-span-3">
              <Select
                value={datePreset}
                onValueChange={v => setDatePreset(v as "all" | "today" | "7days" | "30days" | "custom")}
              >
                <SelectTrigger className="h-10 rounded-xl border-ds-neutral-200 bg-ds-neutral-50/50 text-xs font-semibold">
                  <Calendar className="ml-1.5 size-3.5 text-ds-neutral-500" />
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="bg-white">
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="7days">آخر 7 أيام</SelectItem>
                  <SelectItem value="30days">آخر 30 يوماً</SelectItem>
                  <SelectItem value="custom">نطاق تاريخ مخصص…</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range Inputs (Visible when 'custom' is selected) */}
          {datePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-ds-neutral-50 p-3 border border-ds-neutral-200 text-xs">
              <span className="font-bold text-ds-neutral-700 flex items-center gap-1">
                <Clock className="size-3.5 text-ds-brand-600" /> النطاق المخصص:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-ds-neutral-500">من:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-8 w-36 rounded-lg border-ds-neutral-200 bg-white text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-ds-neutral-500">إلى:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="h-8 w-36 rounded-lg border-ds-neutral-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="pt-1">
            <p className="text-[11px] font-bold text-ds-neutral-500 mb-2">نوع النشاط والفئة:</p>
            <div role="group" aria-label="تصفية فئات سجل التدقيق" className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  category === "all"
                    ? "bg-ds-brand-800 text-white shadow-xs"
                    : "border border-ds-neutral-200 bg-white text-ds-neutral-700 hover:bg-ds-neutral-50"
                }`}
              >
                الكل
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={category === key}
                  onClick={() => setCategory(key as AuditCategoryKey)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    category === key
                      ? "bg-ds-brand-800 text-white shadow-xs"
                      : "border border-ds-neutral-200 bg-white text-ds-neutral-700 hover:bg-ds-neutral-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header & Counter */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-ds-neutral-600">
            الأحداث المسجلة:{" "}
            <span className="font-bold text-ds-brand-900">{data?.length ?? 0} حدثاً أمنياً مطابقة</span>
          </p>
          <span className="text-[11px] text-ds-neutral-500">
            يتم الترتيب تنازلياً من الأحدث زمناً
          </span>
        </div>

        {/* Events Table or State Cards */}
        {isLoading ? (
          <div className="grid gap-3" aria-live="polite">
            {[1, 2, 3, 4, 5].map(item => (
              <Skeleton key={item} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <StateCard title="تعذر تحميل سجل التدقيق" text={error.message} error />
        ) : data?.length ? (
          <section className="overflow-hidden rounded-3xl border border-ds-neutral-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-xs">
                <caption className="sr-only">أحداث سجل التدقيق والرقابة الأمنية</caption>
                <thead className="border-b border-ds-neutral-100 bg-ds-neutral-50 text-ds-neutral-600 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">الوقت والتاريخ</th>
                    <th className="px-5 py-3.5">الفاعل (المستخدم)</th>
                    <th className="px-5 py-3.5">الفئة</th>
                    <th className="px-5 py-3.5">نوع الإجراء</th>
                    <th className="px-5 py-3.5">ملخص النشاط</th>
                    <th className="px-5 py-3.5 text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ds-neutral-100">
                  {data.map(item => {
                    const eventDate = new Date(item.event.createdAt);
                    const catKey = item.event.category as AuditCategoryKey;
                    return (
                      <tr
                        key={item.event.id}
                        className="hover:bg-ds-neutral-50/70 transition-colors duration-150"
                      >
                        <td className="px-5 py-4 text-ds-neutral-600 font-mono whitespace-nowrap">
                          {new Intl.DateTimeFormat("ar-SA", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(eventDate)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-ds-brand-950 flex items-center gap-1.5">
                            <UserCheck className="size-3.5 text-ds-brand-600" />
                            {item.actor?.name || "نظام آلي"}
                          </div>
                          {item.actor?.id && (
                            <span className="text-[10px] text-ds-neutral-500 font-mono">
                              مُعرّف #{item.actor.id}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="rounded-full bg-ds-brand-50 border border-ds-brand-200 px-2.5 py-1 text-[11px] font-bold text-ds-brand-800">
                            {categoryLabels[catKey] || item.event.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ds-neutral-900">
                          {item.event.action}
                        </td>
                        <td className="px-5 py-4 text-ds-neutral-700 max-w-xs truncate" title={item.event.summary}>
                          {item.event.summary}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEvent(item)}
                              className="size-8 rounded-lg p-0 text-ds-brand-700 hover:bg-ds-brand-50 cursor-pointer"
                              title="معاينة تفاصيل الحدث"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyEventDetails(item)}
                              className="size-8 rounded-lg p-0 text-ds-neutral-500 hover:bg-ds-neutral-100 cursor-pointer"
                              title="نسخ بيانات الحدث"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <StateCard
            title="لا توجد أحداث تدقيق مطابقة للمرشحات"
            text="جرّب تعديل الفئة أو نطاق التاريخ أو اسم المستخدم لعرض أحداث أخرى."
          />
        )}

        {/* Detailed Event Inspection Dialog */}
        <Dialog open={selectedEvent !== null} onOpenChange={open => !open && setSelectedEvent(null)}>
          <DialogContent dir="rtl" className="sm:max-w-lg rounded-3xl p-6 bg-white">
            <DialogHeader className="text-right">
              <div className="flex items-center gap-2 text-ds-brand-700 mb-1">
                <ShieldCheck className="size-5" />
                <span className="text-xs font-bold">تفاصيل الحدث الأمني #{selectedEvent?.event.id}</span>
              </div>
              <DialogTitle className="text-lg font-bold text-ds-neutral-950">
                {selectedEvent?.event.action}
              </DialogTitle>
              <DialogDescription className="text-xs text-ds-neutral-600">
                تم التسجيل في:{" "}
                {selectedEvent?.event.createdAt &&
                  new Intl.DateTimeFormat("ar-SA", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  }).format(new Date(selectedEvent.event.createdAt))}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-3 py-3 text-xs">
                <div className="rounded-2xl border border-ds-neutral-200 bg-ds-neutral-50 p-4 space-y-2.5">
                  <div className="flex justify-between border-b border-ds-neutral-200 pb-2">
                    <span className="text-ds-neutral-500">الفاعل (المستخدم):</span>
                    <span className="font-bold text-ds-brand-950">
                      {selectedEvent.actor?.name || "نظام أو حساب محذوف"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-ds-neutral-200 pb-2">
                    <span className="text-ds-neutral-500">الفئة:</span>
                    <span className="font-bold text-ds-neutral-900">
                      {categoryLabels[selectedEvent.event.category as AuditCategoryKey] ||
                        selectedEvent.event.category}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-ds-neutral-200 pb-2">
                    <span className="text-ds-neutral-500">نوع الكيان:</span>
                    <span className="font-mono font-bold text-ds-neutral-900">
                      {selectedEvent.event.entityType}
                    </span>
                  </div>
                  {selectedEvent.event.entityId && (
                    <div className="flex justify-between border-b border-ds-neutral-200 pb-2">
                      <span className="text-ds-neutral-500">مُعرّف الكيان:</span>
                      <span className="font-mono font-bold text-ds-neutral-900">
                        #{selectedEvent.event.entityId}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-ds-neutral-500 block mb-1">ملخص الإجراء:</span>
                    <p className="rounded-xl bg-white p-3 border border-ds-neutral-200 text-ds-neutral-900 font-medium leading-6">
                      {selectedEvent.event.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between gap-2 border-t border-ds-neutral-100 pt-3">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border-ds-neutral-200"
              >
                إغلاق
              </Button>
              <Button
                onClick={() => copyEventDetails(selectedEvent)}
                className="rounded-xl bg-ds-brand-800 text-white hover:bg-ds-brand-900"
              >
                <Copy className="ml-1.5 size-3.5" />
                نسخ السجل
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function StateCard({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-ds-neutral-200 bg-white px-6 text-center shadow-xs">
      <span
        className={`flex size-14 items-center justify-center rounded-3xl ${
          error ? "bg-ds-danger-soft text-ds-danger" : "bg-ds-success-soft text-ds-brand-600"
        }`}
      >
        {error ? <ShieldAlert className="size-6" /> : <ShieldCheck className="size-6" />}
      </span>
      <h2 className="mt-5 font-bold text-ds-neutral-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ds-neutral-600">{text}</p>
    </div>
  );
}
