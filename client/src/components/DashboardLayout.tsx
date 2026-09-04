import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/useMobile";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Activity,
  ArchiveRestore,
  BarChart3,
  Bell,
  BellRing,
  BookOpenCheck,
  BotMessageSquare,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  Database,
  FilePlus2,
  FileText,
  Goal,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  LogOut,
  MessagesSquare,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  ReceiptText,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  UserRoundSearch,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { BuildInfoStamp } from "./BuildInfoStamp";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import FloatingQuickActions from "./FloatingQuickActions";
import { Button } from "./ui/button";

// ── Types ────────────────────────────────────────────────────────────
export type NavCategory = "workspace" | "people" | "time" | "finance" | "governance";

export interface NavItemConfig {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string | number;
  badgeTone?: "emerald" | "amber" | "rose" | "blue";
  adminOnly?: boolean;
  requiresOperationAccess?: boolean;
  requiresDirectoryAccess?: boolean;
  requiresLifecycleAccess?: boolean;
  requiresContractsAccess?: boolean;
  requiresOffboardingAccess?: boolean;
  requiresGoalsAccess?: boolean;
  managerOnly?: boolean;
  requiresRecruitmentAccess?: boolean;
  requiresSchedulingAccess?: boolean;
  requiresApprovalAccess?: boolean;
}

export interface NavGroupConfig {
  id: NavCategory;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  items: NavItemConfig[];
}

// ── Grouped Navigation Structure ─────────────────────────────────────
const NAV_GROUPS: NavGroupConfig[] = [
  {
    id: "workspace",
    title: "مساحة العمل",
    titleEn: "Workspace",
    description: "الطلبات اليومية، المعاملات، والمراسلات",
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: "لوحة التحكم", path: "/app" },
      { icon: FilePlus2, label: "طلب جديد", path: "/requests/new" },
      { icon: ClipboardList, label: "طلباتي ومتابعة الحالة", path: "/my-requests" },
      { icon: ClipboardCheck, label: "صندوق الموافقات", path: "/approvals", requiresApprovalAccess: true },
      { icon: Inbox, label: "صندوق العمل والمعاملات", path: "/workboard" },
      { icon: BotMessageSquare, label: "المساعد الذكي «حامد»", path: "/assistant" },
      { icon: UsersRound, label: "فريق الخبراء والاستشارات (10)", path: "/consulting-hub", badge: "فريق 2030", badgeTone: "emerald" },
      { icon: MessagesSquare, label: "المراسلات الداخلية", path: "/messaging" },
      { icon: BellRing, label: "الإشعارات والتنبيهات", path: "/notifications" },
      { icon: ShieldCheck, label: "مركز العمليات", path: "/operations", requiresOperationAccess: true },
      { icon: Sparkles, label: "مصمم نظام HR", path: "/hr-system" },
      { icon: Wrench, label: "أدوات وحاسبات HR", path: "/hr-tools" },
      { icon: Rocket, label: "خارطة التطوير", path: "/roadmap" },
      { icon: LayoutTemplate, label: "مساحة MVP", path: "/mvp" },
    ],
  },
  {
    id: "people",
    title: "الموظفون والأفراد",
    titleEn: "People",
    description: "الهيكل التنظيمي، إدارة المواهب، والتوظيف",
    icon: UsersRound,
    items: [
      { icon: UserRoundSearch, label: "دليل الموظفين", path: "/employees", requiresDirectoryAccess: true },
      { icon: Network, label: "الهيكل والبنية التنظيمية", path: "/organization", requiresDirectoryAccess: true },
      { icon: UserCheck, label: "دورة حياة الموظف", path: "/employee-lifecycle", requiresLifecycleAccess: true },
      { icon: FileText, label: "العقود والوثائق الرسمية", path: "/contracts", requiresContractsAccess: true },
      { icon: BriefcaseBusiness, label: "العهد والأجهزة", path: "/assets", requiresContractsAccess: true },
      { icon: BriefcaseBusiness, label: "التوظيف والتهيئة", path: "/recruitment", requiresRecruitmentAccess: true },
      { icon: BookOpenCheck, label: "التدريب والتطوير الداخلي", path: "/training", requiresLifecycleAccess: true },
      { icon: Goal, label: "الأهداف وتقييم الأداء", path: "/goals", requiresGoalsAccess: true },
      { icon: ChartNoAxesCombined, label: "لوحة تحكم المديرين", path: "/manager-dashboard", managerOnly: true },
      { icon: ListChecks, label: "إنهاء الخدمة والمستحقات", path: "/offboarding", requiresOffboardingAccess: true },
    ],
  },
  {
    id: "time",
    title: "الوقت والدوام",
    titleEn: "Time",
    description: "الحضور، الورديات، والإجازات",
    icon: Clock3,
    items: [
      { icon: Clock3, label: "سجل الدوام والحضور", path: "/attendance" },
      { icon: CalendarDays, label: "سياسات وجداول الورديات", path: "/attendance-schedules", requiresSchedulingAccess: true },
      { icon: CalendarDays, label: "سياسات وأرصدة الإجازات", path: "/leave-policies", requiresSchedulingAccess: true },
    ],
  },
  {
    id: "finance",
    title: "المالية والرواتب",
    titleEn: "Finance",
    description: "مسيرات الرواتب (WPS مدد)، النفقات والاشتراكات",
    icon: ReceiptText,
    items: [
      { icon: BarChart3, label: "تقارير الرواتب والمصروفات", path: "/reports", requiresDirectoryAccess: true },
      { icon: KeyRound, label: "إدارة الاشتراكات والفوترة", path: "/subscriptions", adminOnly: true },
      { icon: ShieldCheck, label: "محاكي سلاسل الصرف والاعتماد", path: "/approval-simulator", requiresDirectoryAccess: true },
      { icon: UsersRound, label: "طلبات العروض المؤسسية", path: "/demo-requests" },
    ],
  },
  {
    id: "governance",
    title: "الإدارة والحوكمة",
    titleEn: "Governance",
    description: "الصلاحيات، التدقيق، والسيادة الرقمية",
    icon: ShieldCheck,
    items: [
      { icon: UserCog, label: "إدارة الحسابات والمستخدمين", path: "/accounts", adminOnly: true },
      { icon: Building2, label: "قوالب صلاحيات المنشأة", path: "/company-templates", adminOnly: true },
      { icon: Activity, label: "صحة النظام والتشغيل", path: "/system-health", adminOnly: true },
      { icon: ShieldCheck, label: "سجل التدقيق الشامل", path: "/audit", adminOnly: true },
      { icon: ArchiveRestore, label: "سياسات الاحتفاظ بالبيانات", path: "/data-retention", adminOnly: true },
      { icon: Database, label: "جرد وتصنيف البيانات", path: "/data-inventory", adminOnly: true },
      { icon: KeyRound, label: "جاهزية تكاملات OAuth", path: "/oauth-acceptance-readiness", adminOnly: true },
    ],
  },
];

// Flat fallback menu for topbar breadcrumb lookup
const FLAT_MENU_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { direction, t } = useI18n();

  const { data: modulePermissions } = trpc.accounts.myModulePermissions.useQuery(
    undefined,
    { enabled: Boolean(user && (!user.accountStatus || user.accountStatus === "active")) }
  );

  // Dynamic notification & approval counts for badges
  const { data: notificationsData } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: Boolean(user) }
  );
  const unreadNotificationsCount = useMemo(
    () => (notificationsData ?? []).filter((n) => !n.readAt).length,
    [notificationsData]
  );

  const canApprove = user ? ["admin", "manager", "hr", "government"].includes(user.role) : false;
  const { data: approvalsInbox } = trpc.approvals.inbox.useQuery(
    undefined,
    { enabled: Boolean(user && canApprove) }
  );
  const pendingApprovalsCount = approvalsInbox?.length || 0;

  // Search filter inside sidebar
  const [searchQuery, setSearchQuery] = useState("");

  // Collapsible state for each category
  const [openGroups, setOpenGroups] = useState<Record<NavCategory, boolean>>({
    workspace: true,
    people: true,
    time: true,
    finance: true,
    governance: true,
  });

  // Automatically expand the group containing the active route
  useEffect(() => {
    NAV_GROUPS.forEach((group) => {
      const hasActive = group.items.some((item) =>
        item.path === "/" ? location === item.path : location.startsWith(item.path)
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location]);

  const toggleGroup = (id: NavCategory) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div dir={direction} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ds-brand-950 px-5 text-white">
        <div className="premium-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-28 -top-32 size-[28rem] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-sky-500/10 blur-3xl" />
        <section className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-ds-neutral-50 p-8 text-center text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,.35)] backdrop-blur sm:p-10">
          <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-black text-white shadow-lg shadow-blue-950/20">
            هـ
          </div>
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-blue-700">HR HBS 2030</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">حلول الغد</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            منظومة الموارد البشرية والامتثال السيادي للشركات السعودية.
          </p>
          <Button
            onClick={() => setLocation("/login")}
            size="lg"
            className="pressable mt-8 h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-base font-bold text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-950/30"
          >
            الدخول الموحد للمنشآت
          </Button>
          <button
            onClick={() => setLocation("/subscribe")}
            className="mt-4 w-full text-sm font-bold text-blue-600 hover:text-blue-800 transition"
          >
            طلب اشتراك منشأة جديدة
          </button>
          <p className="mt-5 text-xs leading-6 text-slate-500">
            بعد الموافقة يصدر المسؤول رابط دعوة آمن لإنشاء كلمة المرور.
          </p>
          <div className="mt-5 flex justify-center">
            <BuildInfoStamp compact />
          </div>
        </section>
      </div>
    );
  }

  if (user.accountStatus && user.accountStatus !== "active") {
    const isRejected = user.accountStatus === "rejected";
    const isSuspended = user.accountStatus === "suspended";
    return (
      <div dir={direction} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ds-brand-950 px-5 text-white">
        <div className="premium-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-28 -top-32 size-[28rem] rounded-full bg-blue-500/15 blur-3xl" />
        <section className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-ds-neutral-50 p-8 text-center text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,.35)]">
          <span className={`mx-auto flex size-16 items-center justify-center rounded-3xl ${isRejected || isSuspended ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-800"}`}>
            {isRejected || isSuspended ? <ShieldAlert className="size-8" /> : <Clock3 className="size-8" />}
          </span>
          <p className="mt-7 text-xs font-bold tracking-[.18em] text-blue-700">HR HBS 2030</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950">
            {isRejected ? "تعذر تفعيل الحساب" : isSuspended ? "الحساب موقوف مؤقتاً" : "الحساب بانتظار التفعيل"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {isRejected || isSuspended
              ? "يرجى التواصل مع مسؤول المنصة لمعرفة الخطوة التالية وتحديث بيانات المنشأة."
              : "تم تسجيل طلب الانضمام بعد دخولك الموحد. سيصلك الوصول بعد مراجعة المسؤول وتحديد الصلاحيات."}
          </p>
          <Button onClick={logout} variant="outline" className="mt-7 rounded-xl border-slate-300 text-slate-800 font-bold">
            تسجيل الخروج
          </Button>
        </section>
      </div>
    );
  }

  // Permission predicates
  const hasOperationAccess = user.role === "admin" || Boolean(modulePermissions?.some((p) => p.canView));
  const canManageDirectory = ["admin", "manager", "hr"].includes(user.role);
  const canManageLifecycle = ["admin", "hr"].includes(user.role);
  const canManageRecruitment = ["admin", "hr"].includes(user.role);
  const canManageSchedules = ["admin", "hr"].includes(user.role);
  const canManageContracts = ["admin", "hr"].includes(user.role);
  const canManageOffboarding = ["admin", "hr"].includes(user.role);
  const canManageGoals = ["admin", "hr"].includes(user.role);
  const isManager = user.role === "manager";

  const isItemVisible = (item: NavItemConfig) => {
    if (item.adminOnly && user.role !== "admin") return false;
    if (item.requiresOperationAccess && !hasOperationAccess) return false;
    if (item.requiresDirectoryAccess && !canManageDirectory) return false;
    if (item.requiresLifecycleAccess && !canManageLifecycle) return false;
    if (item.requiresContractsAccess && !canManageContracts) return false;
    if (item.requiresOffboardingAccess && !canManageOffboarding) return false;
    if (item.requiresGoalsAccess && !canManageGoals) return false;
    if (item.managerOnly && !isManager) return false;
    if (item.requiresRecruitmentAccess && !canManageRecruitment) return false;
    if (item.requiresSchedulingAccess && !canManageSchedules) return false;
    if (item.requiresApprovalAccess && !canApprove) return false;
    return true;
  };

  // Filter groups & attach live dynamic badges
  const filteredGroups = NAV_GROUPS.map((group) => {
    const visibleItems = group.items
      .filter(isItemVisible)
      .map((item) => {
        // Inject live badge counts
        if (item.path === "/notifications" && unreadNotificationsCount > 0) {
          return { ...item, badge: unreadNotificationsCount, badgeTone: "rose" as const };
        }
        if (item.path === "/approvals" && pendingApprovalsCount > 0) {
          return { ...item, badge: pendingApprovalsCount, badgeTone: "amber" as const };
        }
        return item;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          item.label.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q) ||
          group.titleEn.toLowerCase().includes(q)
        );
      });

    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  return (
    <SidebarProvider dir={direction} className="bg-ds-neutral-50 text-slate-900">
      <Sidebar
        side="right"
        collapsible="icon"
        className="border-l border-white/10 bg-ds-ink text-white shadow-2xl transition-all duration-300"
      >
        {/* ── Sidebar Header ────────────────────────────────────────── */}
        <SidebarHeader className="h-[88px] justify-center border-b border-white/10 px-4">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <button
              onClick={() => setLocation("/app")}
              className="flex items-center gap-3 text-right hover:opacity-90 transition cursor-pointer"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-base font-black text-white shadow-md shadow-blue-950/40">
                هـ
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-black tracking-tight text-white">حلول الغد</p>
                  <span className="rounded bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
                    2030
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-blue-300">
                  SOVEREIGN HR ENTERPRISE
                </p>
              </div>
            </button>

            {/* Quick Toggle on Header */}
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarToggleHeaderButton />
            </div>
          </div>
        </SidebarHeader>

        {/* ── Sidebar Content ────────────────────────────────────────── */}
        <SidebarContent className="px-3 pt-4 space-y-4">
          {/* Quick Action Button */}
          <div className="px-1 pb-1 group-data-[collapsible=icon]:px-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setLocation("/requests/new")}
                  className="pressable h-11 w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-bold text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-950/40 group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0"
                >
                  <FilePlus2 className="size-4 shrink-0 group-data-[collapsible=icon]:ml-0 ml-1.5" />
                  <span className="group-data-[collapsible=icon]:hidden">إنشاء طلب جديد</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-bold text-xs bg-slate-900 text-white">
                إنشاء طلب جديد
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Quick Search Filter (Hidden in icon-only collapsed mode) */}
          <div className="px-1 group-data-[collapsible=icon]:hidden">
            <div className="relative flex items-center">
              <Search className="absolute right-3 size-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث سريع في القوائم..."
                className="w-full h-9 pr-9 pl-7 rounded-xl bg-white/[0.07] border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white/[0.12] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 p-0.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* ── Grouped Navigation Categories ────────────────────────── */}
          <div className="space-y-3 pb-6">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400 group-data-[collapsible=icon]:hidden">
                لا توجد نتائج تطابق "{searchQuery}"
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isOpen = openGroups[group.id] || Boolean(searchQuery.trim());
                const GroupIcon = group.icon;

                return (
                  <Collapsible
                    key={group.id}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(group.id)}
                    className="group/collapsible rounded-2xl border border-white/5 bg-white/[0.02] p-1.5 transition"
                  >
                    {/* Category Header / Trigger */}
                    <CollapsibleTrigger asChild>
                      <button
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-right text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center"
                        title={group.title}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-emerald-400 group-hover/collapsible:border-emerald-500/30">
                            <GroupIcon className="size-3.5" />
                          </span>
                          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                            <span className="truncate text-xs font-bold text-slate-200">
                              {group.title}
                            </span>
                            <span className="text-[9px] font-normal text-emerald-400/80 mr-1.5">
                              ({group.titleEn})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
                          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                            {group.items.length}
                          </span>
                          <ChevronDown
                            className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-emerald-400" : ""
                            }`}
                          />
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    {/* Category Items */}
                    <CollapsibleContent className="space-y-1 pt-1">
                      <SidebarMenu className="gap-1">
                        {group.items.map((item) => (
                          <GroupedNavigationItem
                            key={item.path}
                            item={item}
                            groupTitle={group.title}
                          />
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>
        </SidebarContent>

        {/* ── Sidebar Footer: Profile, Status, Controls ─────────────── */}
        <SidebarFooter className="border-t border-white/10 p-3 bg-black/20">
          {/* Executive Support Card (Hidden in icon rail) */}
          <div className="mb-2 rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-blue-400" />
                الامتثال السيادي
              </span>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] leading-relaxed text-blue-200/80">
              نظام العمل السعودي MHRSD ولائحة منصة مدد حماية الأجور WPS نشطة.
            </p>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="pressable flex w-full items-center gap-3 rounded-2xl p-2 text-right hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group-data-[collapsible=icon]:justify-center">
                <Avatar className="size-9 border border-blue-500/40 shadow-sm">
                  <AvatarFallback className="bg-blue-900 text-xs font-black text-blue-200">
                    {user.name?.charAt(0).toUpperCase() || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-xs font-bold text-white">
                      {user.name || "موظف حلول الغد"}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-blue-200">
                      {user.role === "admin" ? "مسؤول" : user.role === "manager" ? "مدير" : user.role === "hr" ? "HR" : "موظف"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400 font-mono">
                    {user.email || "حساب موظف"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl border-slate-200 bg-white p-1 text-slate-900 shadow-xl">
              <DropdownMenuLabel className="px-3 py-2 text-xs">
                <p className="font-bold text-slate-950">{user.name || "موظف المنشأة"}</p>
                <p className="text-[10px] text-slate-500 font-normal">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation("/app")}
                className="cursor-pointer text-xs font-semibold hover:bg-slate-100 rounded-xl"
              >
                <LayoutDashboard className="ml-2 size-4 text-blue-600" />
                لوحة التحكم الرئيسية
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation("/my-requests")}
                className="cursor-pointer text-xs font-semibold hover:bg-slate-100 rounded-xl"
              >
                <ClipboardList className="ml-2 size-4 text-slate-600" />
                طلباتي ومتابعة الحالة
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation("/notifications")}
                className="cursor-pointer text-xs font-semibold hover:bg-slate-100 rounded-xl"
              >
                <Bell className="ml-2 size-4 text-slate-600" />
                مركز الإشعارات ({unreadNotificationsCount})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-xs font-bold text-rose-700 focus:text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="ml-2 size-4 text-rose-600" />
                تسجيل الخروج الآمن
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Compact Theme Toggle */}
          <div className="mt-2">
            <SidebarThemeToggle />
          </div>

          <div className="mt-2 px-2 group-data-[collapsible=icon]:hidden">
            <BuildInfoStamp />
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* ── Main Inset Content Area ──────────────────────────────────── */}
      <SidebarInset className="min-h-svh bg-ds-neutral-50 dark:bg-ds-ink-strong transition-colors duration-200">
        <TopBar
          availabilityLabel={t("common.available")}
          activeLocation={location}
        />
        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-8 md:py-8">
          {children}
        </main>
        <FloatingQuickActions />
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Helper Component: Navigation Item with Rich Tooltip ───────────────
function GroupedNavigationItem({
  item,
  groupTitle,
}: {
  item: NavItemConfig;
  groupTitle: string;
}) {
  const [location, setLocation] = useLocation();
  const { icon: Icon, label, path, badge, badgeTone } = item;
  const isActive = path === "/" ? location === path : location.startsWith(path);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => setLocation(path)}
        tooltip={{
          children: (
            <div className="text-right">
              <p className="text-[10px] text-blue-400 font-bold">{groupTitle}</p>
              <p className="text-xs font-extrabold text-white">{label}</p>
              {badge !== undefined && (
                <p className="text-[10px] text-amber-300 font-semibold mt-0.5">{badge} عنصر جديد</p>
              )}
            </div>
          ),
          side: "left",
        }}
        className="pressable h-10 rounded-xl px-2.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition data-[active=true]:bg-blue-600 data-[active=true]:font-bold data-[active=true]:text-white shadow-sm"
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate flex-1 text-right">{label}</span>
        {badge !== undefined && (
          <span
            className={`mr-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black group-data-[collapsible=icon]:hidden ${
              badgeTone === "rose"
                ? "bg-rose-500 text-white"
                : badgeTone === "amber"
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-blue-500/30 text-blue-200"
            }`}
          >
            {badge}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ── Helper Component: Sidebar Toggle Header Button ────────────────────
function SidebarToggleHeaderButton() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="size-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
      title={state === "expanded" ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"}
    >
      {state === "expanded" ? (
        <PanelLeftClose className="size-4 rotate-180" />
      ) : (
        <PanelLeftOpen className="size-4 rotate-180" />
      )}
    </Button>
  );
}

// ── TopBar with Adaptive Breadcrumbs & Actions ────────────────────────
function TopBar({
  availabilityLabel,
  activeLocation,
}: {
  availabilityLabel: string;
  activeLocation: string;
}) {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  const activeItem =
    FLAT_MENU_ITEMS.find((entry) => entry.path === activeLocation) ??
    FLAT_MENU_ITEMS.find((entry) => activeLocation.startsWith(entry.path));

  // Find category for current page
  const activeGroup = NAV_GROUPS.find((g) =>
    g.items.some((item) =>
      item.path === "/" ? activeLocation === item.path : activeLocation.startsWith(item.path)
    )
  );

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-ds-neutral-50/95 dark:bg-ds-ink-strong/95 px-4 backdrop-blur md:px-8 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3">
        {isMobile ? (
          <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800" />
        ) : (
          <div className="flex items-center gap-2">
            <SidebarTrigger className="size-8 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800" />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5">
            {activeGroup && (
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                {activeGroup.title}
              </span>
            )}
            <p className="text-sm font-black text-slate-900 dark:text-white">
              {activeItem?.label || "حلول الغد 2030"}
            </p>
          </div>
          <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
            {activeGroup?.description || "منظومة إدارة الموارد البشرية والامتثال الحكومي"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Request Button in TopBar */}
        <Button
          onClick={() => setLocation("/requests/new")}
          size="sm"
          className="hidden md:inline-flex h-9 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs px-3.5 shadow-sm"
        >
          <FilePlus2 className="ml-1.5 size-3.5" />
          طلب جديد
        </Button>

        <NotificationBell onNavigate={setLocation} />

        <div className="hidden items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 sm:flex shadow-xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {availabilityLabel} (نشط)
        </div>
      </div>
    </header>
  );
}

// ── Notification Popover Component ────────────────────────────────────
function NotificationBell({ onNavigate }: { onNavigate: (path: string) => void }) {
  const utils = trpc.useUtils();
  const { data } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const unread = (data ?? []).filter((entry) => !entry.readAt);
  const recent = (data ?? []).slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`الإشعارات${unread.length ? ` — ${unread.length} غير مقروءة` : ""}`}
          className="pressable relative flex size-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
        >
          <Bell className="size-[18px]" />
          {unread.length > 0 && (
            <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-sm">
              {unread.length > 9 ? "٩+" : unread.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl border-slate-200 dark:border-slate-800 p-0 shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div dir="rtl" className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
          <p className="text-sm font-bold text-slate-950 dark:text-white">مركز الإشعارات</p>
          {unread.length ? (
            <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-[11px] font-black text-rose-700 dark:text-rose-300">
              {unread.length} غير مقروءة
            </span>
          ) : null}
        </div>
        {recent.length ? (
          <ul dir="rtl" className="max-h-80 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
            {recent.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() => {
                    if (!entry.readAt) markRead.mutate({ id: entry.id });
                    onNavigate(entry.href || "/notifications");
                  }}
                  className="flex w-full flex-col items-start gap-1 px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {!entry.readAt && <span className="size-1.5 rounded-full bg-emerald-500" />}
                    <span className="text-xs font-bold text-slate-950 dark:text-white">{entry.title}</span>
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-5 text-slate-600 dark:text-slate-400">{entry.body}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p dir="rtl" className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            لا توجد إشعارات جديدة.
          </p>
        )}
        <div dir="rtl" className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
          <Button
            variant="ghost"
            onClick={() => onNavigate("/notifications")}
            className="h-9 w-full rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          >
            عرض كل الإشعارات
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

