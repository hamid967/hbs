import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BotMessageSquare,
  CheckCircle2,
  Clock,
  FilePlus2,
  HelpCircle,
  Landmark,
  Plus,
  ReceiptText,
  ShieldAlert,
  Sparkles,
  UserPlus,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface QuickActionItem {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  tone: "indigo" | "emerald" | "amber" | "sky" | "violet";
  adminOrHrOnly?: boolean;
  onClick: () => void;
}

export default function FloatingQuickActions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [quickAddEmployeeOpen, setQuickAddEmployeeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHrOrAdmin = Boolean(user && ["admin", "hr"].includes(user.role));
  const isManagerOrAdmin = Boolean(user && ["admin", "hr", "manager"].includes(user.role));

  // Quick Employee Creation Mutation
  const utils = trpc.useUtils();
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeeJobTitle, setNewEmployeeJobTitle] = useState("");

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const actions: QuickActionItem[] = [
    {
      id: "submit-request",
      title: "تقديم طلب جديد",
      titleEn: "Submit Request",
      description: "إجازة، تعريف بالراتب، سلفة، أو تفويض ومهمة عمل",
      icon: FilePlus2,
      badge: "الخدمة الذاتية",
      tone: "indigo",
      onClick: () => {
        setIsOpen(false);
        setLocation("/requests/new");
      },
    },
    {
      id: "add-employee",
      title: "إضافة موظف جديد",
      titleEn: "Add Employee",
      description: "تسجيل كادر جديد واستكمال متطلبات مباشرة العمل",
      icon: UserPlus,
      badge: isHrOrAdmin ? "HR متاح" : "استعراض الكوادر",
      tone: "emerald",
      onClick: () => {
        setIsOpen(false);
        setLocation("/employees");
      },
    },
    {
      id: "new-payroll",
      title: "مسير رواتب جديد (WPS)",
      titleEn: "New Payroll",
      description: "إعداد مسير الأجور الشهري ومطابقة منصة مدد",
      icon: ReceiptText,
      badge: "حماية الأجور",
      tone: "amber",
      onClick: () => {
        setIsOpen(false);
        setLocation("/reports");
      },
    },
    {
      id: "record-attendance",
      title: "تسجيل الحضور / الدوام",
      titleEn: "Record Attendance",
      description: "إثبات الدوام والانضباط ومتابعة الساعات اليومية",
      icon: Clock,
      badge: "الدوام الحي",
      tone: "sky",
      onClick: () => {
        setIsOpen(false);
        setLocation("/attendance");
      },
    },
    ...(isManagerOrAdmin
      ? [
          {
            id: "approvals-inbox",
            title: "صندوق الموافقات الإدارية",
            titleEn: "Pending Approvals",
            description: "اعتماد طلبات الموظفين واتخاذ القرارات الإدارية",
            icon: CheckCircle2,
            badge: "إجراء إداري",
            tone: "violet" as const,
            onClick: () => {
              setIsOpen(false);
              setLocation("/approvals");
            },
          },
        ]
      : []),
    {
      id: "ai-assistant",
      title: "المساعد الذكي (AI)",
      titleEn: "AI HR Assistant",
      description: "استشارة فورية لنظام العمل ولوائح MHRSD",
      icon: BotMessageSquare,
      badge: "مستشار ذكي",
      tone: "indigo",
      onClick: () => {
        setIsOpen(false);
        setLocation("/assistant");
      },
    },
  ];

  const toneClasses = {
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      iconBg: "bg-indigo-600 text-white",
      hover: "hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40",
      badge: "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-600 text-white",
      hover: "hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40",
      badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-500 text-white",
      hover: "hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/40",
      badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200",
    },
    sky: {
      bg: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      iconBg: "bg-sky-600 text-white",
      hover: "hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/40",
      badge: "bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
      iconBg: "bg-violet-600 text-white",
      hover: "hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/40",
      badge: "bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200",
    },
  };

  return (
    <>
      <div
        ref={containerRef}
        dir="rtl"
        id="floating-quick-actions"
        className="fixed bottom-6 left-6 z-40 flex flex-col items-start select-none"
      >
        {/* ── Expanded Quick Actions Menu ─────────────────────────── */}
        {isOpen && (
          <div
            id="quick-actions-panel"
            className="mb-3 w-[340px] sm:w-[380px] origin-bottom-left animate-in fade-in zoom-in-95 duration-200 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Zap className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    الإجراءات السريعة
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    وصول مباشر للمهام اليومية الأكثر تكراراً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="pressable rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label="إغلاق القائمة"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Actions List */}
            <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
              {actions.map((action) => {
                const Icon = action.icon;
                const tone = toneClasses[action.tone];
                return (
                  <button
                    key={action.id}
                    id={`quick-action-btn-${action.id}`}
                    onClick={action.onClick}
                    className={`pressable group flex w-full items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-right transition duration-150 ${tone.hover} cursor-pointer`}
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone.iconBg} shadow-xs transition group-hover:scale-105`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-black text-slate-900 dark:text-slate-100">
                          {action.title}
                        </span>
                        {action.badge && (
                          <span
                            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${tone.badge}`}
                          >
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    <ArrowLeft className="size-4 shrink-0 text-slate-400 group-hover:-translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                  </button>
                );
              })}
            </div>

            {/* Footer Tip */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 px-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-indigo-600" />
                متوافق مع الصلاحيات الممنوحة
              </span>
              <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:text-slate-300">
                Esc للإغلاق
              </kbd>
            </div>
          </div>
        )}

        {/* ── Primary Floating Trigger Button ─────────────────────── */}
        <button
          id="floating-quick-actions-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="قائمة الإجراءات السريعة"
          className={`pressable group relative flex h-13 items-center gap-2.5 rounded-full px-4 shadow-xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
            isOpen
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-4 ring-indigo-500/20"
              : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-indigo-600/30 hover:scale-105 hover:shadow-indigo-600/40"
          }`}
        >
          <div
            className={`flex size-8 items-center justify-center rounded-full transition-transform duration-300 ${
              isOpen ? "rotate-45 bg-white/20 dark:bg-black/10" : "bg-white/20 group-hover:rotate-90"
            }`}
          >
            {isOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          </div>
          <span className="text-xs font-black tracking-wide">
            {isOpen ? "إغلاق" : "إجراءات سريعة"}
          </span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
        </button>
      </div>
    </>
  );
}
