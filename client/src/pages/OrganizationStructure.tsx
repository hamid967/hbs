import DashboardLayout from "@/components/DashboardLayout";
import { KpiCard, PageHeader, StateNotice } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Network, Plus, UsersRound, WalletCards } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CreateKind = "entity" | "branch" | "team" | "cost-center" | "location" | null;

const labels: Record<Exclude<CreateKind, null>, { title: string; description: string; name: string; code: string }> = {
  entity: { title: "كيان نظامي", description: "مرجع تنظيمي داخلي للشركة. لا يعني هذا تفعيل تكاملات أو امتثالاً نظامياً خارجياً.", name: "اسم الكيان", code: "رمز الكيان" },
  branch: { title: "فرع تنظيمي", description: "يرتبط اختيارياً بكيان نظامي داخل الشركة الحالية فقط.", name: "اسم الفرع", code: "رمز الفرع" },
  team: { title: "فريق", description: "فريق تشغيلي اختياري داخل القسم أو الفرع الحاليين.", name: "اسم الفريق", code: "رمز الفريق" },
  "cost-center": { title: "مركز تكلفة", description: "مرجع تصنيفي داخلي ولا يتضمن بيانات مالية أو حسابات محاسبية.", name: "اسم المركز", code: "رمز المركز" },
  location: { title: "موقع عمل", description: "مرجع موقع داخلي يمكن ربطه بفرع تنظيمي.", name: "اسم الموقع", code: "رمز الموقع" },
};

export default function OrganizationStructure() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data, isLoading, isError, error } = trpc.organization.list.useQuery();
  const { data: departments } = trpc.employees.departments.useQuery();
  const { data: employees } = trpc.employees.list.useQuery();
  const [kind, setKind] = useState<CreateKind>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState("none");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [managerUserId, setManagerUserId] = useState("none");
  const canManage = user?.role === "admin";

  const refresh = () => utils.organization.list.invalidate();
  const onSaved = (message: string) => { toast.success(message); setKind(null); setName(""); setCode(""); setParentId("none"); setCity(""); setRegion(""); setManagerUserId("none"); refresh(); };
  const createEntity = trpc.organization.createLegalEntity.useMutation({ onSuccess: () => onSaved("تم حفظ الكيان النظامي"), onError: issue => toast.error("تعذر الحفظ", { description: issue.message }) });
  const createBranch = trpc.organization.createBranch.useMutation({ onSuccess: () => onSaved("تم حفظ الفرع التنظيمي"), onError: issue => toast.error("تعذر الحفظ", { description: issue.message }) });
  const createTeam = trpc.organization.createTeam.useMutation({ onSuccess: () => onSaved("تم حفظ الفريق"), onError: issue => toast.error("تعذر الحفظ", { description: issue.message }) });
  const createCenter = trpc.organization.createCostCenter.useMutation({ onSuccess: () => onSaved("تم حفظ مركز التكلفة"), onError: issue => toast.error("تعذر الحفظ", { description: issue.message }) });
  const createLocation = trpc.organization.createWorkLocation.useMutation({ onSuccess: () => onSaved("تم حفظ موقع العمل"), onError: issue => toast.error("تعذر الحفظ", { description: issue.message }) });

  const submit = () => {
    if (!kind || name.trim().length < 2) return;
    const shared = { name: name.trim(), ...(code.trim() ? { code: code.trim() } : {}) };
    if (kind === "entity") createEntity.mutate(shared);
    if (kind === "branch") createBranch.mutate({ ...shared, ...(parentId !== "none" ? { legalEntityId: Number(parentId) } : {}), ...(city.trim() ? { city: city.trim() } : {}), ...(region.trim() ? { region: region.trim() } : {}), ...(managerUserId !== "none" ? { managerUserId: Number(managerUserId) } : {}) });
    if (kind === "team") createTeam.mutate({ ...shared, ...(parentId !== "none" ? { departmentId: Number(parentId) } : {}), ...(managerUserId !== "none" ? { managerUserId: Number(managerUserId) } : {}) });
    if (kind === "cost-center" && code.trim().length >= 2) createCenter.mutate({ name: name.trim(), code: code.trim() });
    if (kind === "location") createLocation.mutate({ ...shared, ...(parentId !== "none" ? { branchId: Number(parentId) } : {}), ...(city.trim() ? { city: city.trim() } : {}), ...(region.trim() ? { region: region.trim() } : {}) });
  };

  const pending = createEntity.isPending || createBranch.isPending || createTeam.isPending || createCenter.isPending || createLocation.isPending;
  const current = kind ? labels[kind] : null;
  const parentOptions = kind === "branch" ? data?.legalEntities : kind === "team" ? departments : kind === "location" ? data?.branches : [];

  return <DashboardLayout><div className="mx-auto max-w-7xl" dir="rtl">
    <PageHeader eyebrow="تشغيل متعدد الوحدات" title="البنية التنظيمية" description="كيانات وفروع وفرق ومراكز تكلفة ومواقع عمل مملوكة للشركة الحالية. لا تتغير الأقسام أو ملفات الموظفين القائمة تلقائياً عند إضافة هذه المراجع." actions={canManage ? <Button className="pressable rounded-xl bg-[#0b6b54]" onClick={() => setKind("entity")}><Plus className="ml-2 size-4" />إضافة مرجع</Button> : null} />

    {isLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-32 rounded-3xl" />)}</div> : isError ? <StateNotice title="تعذر تحميل البنية التنظيمية" description={error.message} /> : <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="الكيانات النظامية" value={data?.legalEntities.length ?? 0} visual={<Building2 className="size-6 text-primary" />} />
        <KpiCard label="الفروع التنظيمية" value={data?.branches.length ?? 0} visual={<Network className="size-6 text-primary" />} />
        <KpiCard label="الفرق" value={data?.teams.length ?? 0} visual={<UsersRound className="size-6 text-primary" />} />
        <KpiCard label="مراكز التكلفة" value={data?.costCenters.length ?? 0} visual={<WalletCards className="size-6 text-primary" />} />
      </div>
      <section className="mt-7 grid gap-5 xl:grid-cols-2">
        <OrgList title="الكيانات النظامية" icon={<Building2 className="size-5" />} items={data?.legalEntities ?? []} empty="لا توجد كيانات نظامية بعد." action={canManage ? () => setKind("entity") : undefined} />
        <OrgList title="الفروع" icon={<Network className="size-5" />} items={data?.branches ?? []} empty="لا توجد فروع تنظيمية بعد." action={canManage ? () => setKind("branch") : undefined} />
        <OrgList title="الفرق" icon={<UsersRound className="size-5" />} items={data?.teams ?? []} empty="لا توجد فرق بعد." action={canManage ? () => setKind("team") : undefined} />
        <OrgList title="مواقع العمل" icon={<MapPin className="size-5" />} items={data?.workLocations ?? []} empty="لا توجد مواقع عمل بعد." action={canManage ? () => setKind("location") : undefined} />
      </section>
      <StateNotice title="تعيين الموظفين التنظيمي" description={`يوجد ${data?.assignments.length ?? 0} سجل تعيين محفوظ. تُضاف واجهة التعيين التفصيلية في الدفعة التالية بعد مراجعة الترحيل؛ لا تُعاد كتابة حقول ملف الموظف أو المدير المباشر ضمن هذه الدفعة.`} />
    </>}

    <Dialog open={kind !== null} onOpenChange={open => !open && setKind(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{current?.title}</DialogTitle><DialogDescription>{current?.description}</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label={current?.name || "الاسم"}><Input value={name} onChange={event => setName(event.target.value)} /></Field><Field label={current?.code || "الرمز"}><Input value={code} onChange={event => setCode(event.target.value)} placeholder={kind === "cost-center" ? "مطلوب" : "اختياري"} /></Field>{["branch", "team", "location"].includes(kind || "") ? <Field label={kind === "branch" ? "الكيان النظامي" : kind === "team" ? "القسم" : "الفرع"}><Select value={parentId} onValueChange={setParentId}><SelectTrigger><SelectValue placeholder="اختياري" /></SelectTrigger><SelectContent><SelectItem value="none">غير مربوط حالياً</SelectItem>{parentOptions?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></Field> : null}{["branch", "location"].includes(kind || "") ? <div className="grid gap-4 sm:grid-cols-2"><Field label="المدينة"><Input value={city} onChange={event => setCity(event.target.value)} placeholder="اختياري" /></Field><Field label="المنطقة"><Input value={region} onChange={event => setRegion(event.target.value)} placeholder="اختياري" /></Field></div> : null}{["branch", "team"].includes(kind || "") ? <Field label="المسؤول"><Select value={managerUserId} onValueChange={setManagerUserId}><SelectTrigger><SelectValue placeholder="اختياري" /></SelectTrigger><SelectContent><SelectItem value="none">غير محدد</SelectItem>{employees?.map(employee => <SelectItem key={employee.id} value={String(employee.id)}>{employee.name || "موظف"}</SelectItem>)}</SelectContent></Select></Field> : null}</div><DialogFooter><Button variant="outline" onClick={() => setKind(null)}>إلغاء</Button><Button onClick={submit} disabled={pending || name.trim().length < 2 || (kind === "cost-center" && code.trim().length < 2)} className="bg-[#0b6b54]">حفظ</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}

function OrgList({ title, icon, items, empty, action }: { title: string; icon: React.ReactNode; items: Array<{ id: number; name: string; code: string | null; status: "active" | "archived" }>; empty: string; action?: () => void }) {
  return <section className="ds-surface"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-primary">{icon}<h2 className="font-bold text-foreground">{title}</h2></div>{action ? <Button variant="outline" size="sm" className="pressable rounded-lg" onClick={action}><Plus className="ml-1 size-3.5" />إضافة</Button> : null}</div>{items.length ? <div className="mt-4 space-y-2">{items.slice(0, 5).map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/55 px-3 py-2.5"><span className="min-w-0 truncate text-sm font-semibold text-foreground">{item.name}</span><span className="shrink-0 text-xs text-muted-foreground">{item.code || "بدون رمز"}</span></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">{empty}</p>}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-muted-foreground"><span className="mb-2 block">{label}</span>{children}</label>; }
