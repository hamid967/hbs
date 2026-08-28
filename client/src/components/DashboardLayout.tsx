import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  ClipboardList,
  BotMessageSquare,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  PanelRight,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Rocket,
  LayoutTemplate,
  Wrench,
  UserCog,
  Building2,
  UserRoundSearch,
  ClipboardCheck,
  BellRing,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  CalendarDays,
  BookOpenCheck,
  Inbox,
  FileText,
  ListChecks,
  Goal,
  ChartNoAxesCombined,
  Activity,
  ArchiveRestore,
  Database,
  KeyRound,
  MessagesSquare,
  Network,
} from "lucide-react";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { BuildInfoStamp } from "./BuildInfoStamp";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/app" },
  { icon: FilePlus2, label: "طلب جديد", path: "/requests/new" },
  { icon: ClipboardList, label: "طلباتي", path: "/my-requests" },
  { icon: BotMessageSquare, label: "مساعد الطلبات", path: "/assistant" },
  { icon: Sparkles, label: "مصمم نظام HR", path: "/hr-system" },
  { icon: ShieldCheck, label: "مركز العمليات", path: "/operations", requiresOperationAccess: true },
  { icon: UsersRound, label: "طلبات العروض", path: "/demo-requests" },
  { icon: Rocket, label: "خارطة التطوير", path: "/roadmap" },
  { icon: LayoutTemplate, label: "مساحة MVP", path: "/mvp" },
  { icon: Wrench, label: "أدوات HR", path: "/hr-tools" },
  { icon: UserCog, label: "إدارة الحسابات", path: "/accounts", adminOnly: true },
  { icon: KeyRound, label: "طلبات الاشتراك", path: "/subscriptions", adminOnly: true },
  { icon: ShieldCheck, label: "سجل التدقيق", path: "/audit", adminOnly: true },
  { icon: Activity, label: "صحة التطبيق", path: "/system-health", adminOnly: true },
  { icon: ArchiveRestore, label: "سياسات الاحتفاظ", path: "/data-retention", adminOnly: true },
  { icon: Database, label: "جرد البيانات", path: "/data-inventory", adminOnly: true },
  { icon: KeyRound, label: "جاهزية OAuth", path: "/oauth-acceptance-readiness", adminOnly: true },
  { icon: Building2, label: "قوالب الشركة", path: "/company-templates", adminOnly: true },
  { icon: Network, label: "البنية التنظيمية", path: "/organization", requiresDirectoryAccess: true },
  { icon: UserRoundSearch, label: "دليل الموظفين", path: "/employees", requiresDirectoryAccess: true },
  { icon: ClipboardCheck, label: "دورة حياة الموظف", path: "/employee-lifecycle", requiresLifecycleAccess: true },
  { icon: FileText, label: "العقود والوثائق", path: "/contracts", requiresContractsAccess: true },
  { icon: BriefcaseBusiness, label: "العهد والأجهزة", path: "/assets", requiresContractsAccess: true },
  { icon: ListChecks, label: "إنهاء الخدمة", path: "/offboarding", requiresOffboardingAccess: true },
  { icon: Goal, label: "الأهداف والأداء", path: "/goals", requiresGoalsAccess: true },
  { icon: ChartNoAxesCombined, label: "لوحة المديرين", path: "/manager-dashboard", managerOnly: true },
  { icon: BookOpenCheck, label: "التدريب الداخلي", path: "/training", requiresLifecycleAccess: true },
  { icon: BriefcaseBusiness, label: "التوظيف والتهيئة", path: "/recruitment", requiresRecruitmentAccess: true },
  { icon: Clock3, label: "الدوام", path: "/attendance" },
  { icon: CalendarDays, label: "سياسات الدوام", path: "/attendance-schedules", requiresSchedulingAccess: true },
  { icon: CalendarDays, label: "سياسات الإجازة", path: "/leave-policies", requiresSchedulingAccess: true },
  { icon: ClipboardCheck, label: "صندوق الموافقات", path: "/approvals", requiresApprovalAccess: true },
  { icon: ShieldCheck, label: "محاكي الموافقات", path: "/approval-simulator", requiresDirectoryAccess: true },
  { icon: Inbox, label: "صندوق العمل", path: "/workboard" },
  { icon: BellRing, label: "الإشعارات", path: "/notifications" },
  { icon: MessagesSquare, label: "المراسلات الداخلية", path: "/messaging" },
  { icon: BarChart3, label: "التقارير", path: "/reports", requiresDirectoryAccess: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { direction, t } = useI18n();
  const { data: modulePermissions } = trpc.accounts.myModulePermissions.useQuery(undefined, { enabled: Boolean(user && (!user.accountStatus || user.accountStatus === "active")) });

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div dir={direction} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ds-ink-strong px-5 text-ds-ink-strong">
        <div className="premium-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-28 -top-32 size-[28rem] rounded-full bg-ds-emerald/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-ds-gold/10 blur-3xl" />
        <section className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-ds-ivory/95 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur sm:p-10">
          <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-3xl bg-ds-emerald text-xl font-bold text-ds-ink-strong shadow-lg shadow-ds-emerald/20">هـ</div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-ds-teal-500">HR HBS</p>
          <h1 className="premium-wordmark text-3xl font-bold tracking-tight text-ds-ink">حلول الغد</h1>
          <p className="mt-4 text-sm leading-7 text-ds-teal-600">منصة داخلية منظمة لتقديم ومتابعة طلبات الموارد البشرية والعلاقات الحكومية.</p>
          <Button onClick={() => setLocation("/login")} size="lg" className="pressable mt-8 h-12 w-full rounded-2xl bg-ds-emerald text-base font-bold text-ds-ink hover:bg-ds-emerald-bright">الدخول بالبريد</Button>
          <button onClick={() => setLocation("/subscribe")} className="mt-4 w-full text-sm font-bold text-ds-success">طلب اشتراك جديد</button>
          <p className="mt-5 text-xs leading-6 text-ds-neutral-600">بعد الموافقة يصدر المسؤول رابط دعوة آمن لإنشاء كلمة المرور. لا ترسل المنصة كلمات مرور عبر البريد.</p>
          <div className="mt-5 flex justify-center"><BuildInfoStamp compact /></div>
        </section>
      </div>
    );
  }

  if (user.accountStatus && user.accountStatus !== "active") {
    const isRejected = user.accountStatus === "rejected";
    const isSuspended = user.accountStatus === "suspended";
    return <div dir={direction} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ds-ink-strong px-5 text-ds-ink-strong"><div className="premium-grid absolute inset-0 opacity-70" /><div className="absolute -right-28 -top-32 size-[28rem] rounded-full bg-ds-emerald/15 blur-3xl" /><section className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-ds-ivory/95 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,.28)]"><span className={`mx-auto flex size-16 items-center justify-center rounded-3xl ${isRejected || isSuspended ? "bg-ds-danger-soft text-ds-danger" : "bg-ds-brand-100 text-ds-success"}`}><Clock3 className="size-7" /></span><p className="mt-7 text-xs font-bold tracking-[.18em] text-ds-teal-500">HR HBS</p><h1 className="premium-wordmark mt-3 text-2xl font-bold text-ds-ink">{isRejected ? "تعذر تفعيل الحساب" : isSuspended ? "الحساب موقوف مؤقتاً" : "الحساب بانتظار التفعيل"}</h1><p className="mt-4 text-sm leading-7 text-ds-teal-600">{isRejected || isSuspended ? "يرجى التواصل مع مسؤول المنصة لمعرفة الخطوة التالية." : "تم تسجيل طلب الانضمام بعد دخولك الموحد. سيصلك الوصول بعد مراجعة المسؤول وتحديد الدور المناسب."}</p><Button onClick={logout} variant="outline" className="pressable mt-7 rounded-xl border-ds-neutral-300 text-ds-brand-800">تسجيل الخروج</Button></section></div>;
  }

  const hasOperationAccess = user.role === "admin" || Boolean(modulePermissions?.some(permission => permission.canView));
  const canManageDirectory = ["admin", "manager", "hr"].includes(user.role);
  const canManageLifecycle = ["admin", "hr"].includes(user.role);
  const canApprove = ["admin", "manager", "hr", "government"].includes(user.role);
  const canManageRecruitment = ["admin", "hr"].includes(user.role);
  const canManageSchedules = ["admin", "hr"].includes(user.role);
  const canManageContracts = ["admin", "hr"].includes(user.role);
  const canManageOffboarding = ["admin", "hr"].includes(user.role);
  const canManageGoals = ["admin", "hr"].includes(user.role);
  const isManager = user.role === "manager";
  const visibleMenuItems = menuItems.filter(item => (!item.adminOnly || user.role === "admin") && (!item.requiresOperationAccess || hasOperationAccess) && (!item.requiresDirectoryAccess || canManageDirectory) && (!item.requiresLifecycleAccess || canManageLifecycle) && (!item.requiresContractsAccess || canManageContracts) && (!item.requiresOffboardingAccess || canManageOffboarding) && (!item.requiresGoalsAccess || canManageGoals) && (!item.managerOnly || isManager) && (!item.requiresRecruitmentAccess || canManageRecruitment) && (!item.requiresSchedulingAccess || canManageSchedules) && (!item.requiresApprovalAccess || canApprove));

  return (
    <SidebarProvider dir={direction} className="bg-ds-ivory text-ds-ink-strong">
      <Sidebar side="right" collapsible="icon" className="border-l border-white/10 bg-ds-ink-strong text-white">
        <SidebarHeader className="h-[88px] justify-center px-4">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-ds-emerald text-base font-bold text-ds-ink-strong">هـ</div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-base font-bold tracking-tight">حلول الغد</p>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-ds-mist-strong">HR HBS</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 pt-6">
          <p className="px-3 pb-3 text-[10px] font-semibold tracking-[0.16em] text-ds-mist-strong group-data-[collapsible=icon]:hidden">مساحة العمل</p>
          <SidebarMenu className="gap-2">
            {visibleMenuItems.map(item => <NavigationItem key={item.path} {...item} />)}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-semibold">هل تحتاج إلى مساعدة؟</p>
            <p className="mt-1 text-[11px] leading-5 text-ds-mist-strong">تواصل مع فريق الموارد البشرية عند الحاجة.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="pressable flex w-full items-center gap-3 rounded-2xl p-2 text-right hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-gold group-data-[collapsible=icon]:justify-center">
                <Avatar className="size-9 border border-white/15">
                  <AvatarFallback className="bg-ds-teal-900 text-xs font-bold text-ds-ivory">{user.name?.charAt(0).toUpperCase() || "م"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold">{user.name || "موظف حلول الغد"}</p>
                  <p className="mt-0.5 truncate text-[11px] text-ds-mist-strong">{user.email || "حساب موظف"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="ml-2 size-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mt-3 px-2 group-data-[collapsible=icon]:hidden"><BuildInfoStamp /></div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh bg-ds-ivory">
        <TopBar availabilityLabel={t("common.available")} />
        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-8 md:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function NavigationItem({ icon: Icon, label, path }: (typeof menuItems)[number]) {
  const [location, setLocation] = useLocation();
  const isActive = path === "/" ? location === path : location.startsWith(path);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => setLocation(path)}
        tooltip={label}
        className="pressable h-11 rounded-xl px-3 text-sm text-ds-neutral-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-ds-emerald data-[active=true]:font-bold data-[active=true]:text-ds-ink"
      >
        <Icon className="size-[18px]" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function TopBar({ availabilityLabel }: { availabilityLabel: string }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const item = menuItems.find(entry => entry.path === location) ?? menuItems.find(entry => location.startsWith(entry.path));

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-ds-neutral-200 bg-ds-ivory/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        {isMobile ? <SidebarTrigger className="size-9 rounded-xl bg-white shadow-sm" /> : <PanelRight className="size-5 text-ds-teal-500" />}
        <div>
          <p className="premium-wordmark text-sm font-bold text-ds-ink">{item?.label || "حلول الغد"}</p>
          <p className="hidden text-[11px] text-ds-teal-500 sm:block">إدارة منضبطة لطلباتك الداخلية</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-ds-neutral-300 bg-white/75 px-3 py-1.5 text-xs font-medium text-ds-teal-600">
        <span className="size-2 rounded-full bg-ds-emerald" />
        {availabilityLabel}
      </div>
    </header>
  );
}
