import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BriefcaseBusiness, Plus, Search, ShieldAlert, UserRoundCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FilterBar, FormField } from "@/components/design-system";

const statusLabels = { active: "نشط", on_leave: "في إجازة", inactive: "غير نشط" } as const;
type EmploymentStatus = keyof typeof statusLabels;

export default function EmployeeDirectory() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const { data: employees, isLoading, isError, error } = trpc.employees.list.useQuery();
  const { data: departments } = trpc.employees.departments.useQuery();
  const { data: designations } = trpc.employees.designations.useQuery();
  const canManageSensitiveProfile = user?.role === "admin" || user?.role === "hr";
  const canManageEmployeeProfile = user?.role === "admin" || user?.role === "hr";
  const { data: emergencyContacts } = trpc.employees.emergencyContacts.useQuery(undefined, { enabled: canManageSensitiveProfile });
  const { data: dependents } = trpc.employees.dependents.useQuery(undefined, { enabled: canManageSensitiveProfile });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("all");
  const [filterStatus, setFilterStatus] = useState<EmploymentStatus | "all">("all");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentManagerOpen, setDepartmentManagerOpen] = useState(false);
  const [designationOpen, setDesignationOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [designationTitle, setDesignationTitle] = useState("");
  const [designationCode, setDesignationCode] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [region, setRegion] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [dependentName, setDependentName] = useState("");
  const [dependentRelationship, setDependentRelationship] = useState("");
  const [dependentBirthYear, setDependentBirthYear] = useState("");
  const [departmentId, setDepartmentId] = useState("none");
  const [managedDepartmentId, setManagedDepartmentId] = useState("none");
  const [departmentManagerId, setDepartmentManagerId] = useState("none");
  const [designationId, setDesignationId] = useState("none");
  const [managerId, setManagerId] = useState("none");
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>("active");
  const [joinedAt, setJoinedAt] = useState("");

  const createDepartment = trpc.employees.createDepartment.useMutation({
    onSuccess: () => { toast.success("تم إنشاء القسم"); setDepartmentOpen(false); setDepartmentName(""); setDepartmentCode(""); utils.employees.departments.invalidate(); },
    onError: issue => toast.error("تعذر إنشاء القسم", { description: issue.message }),
  });
  const createDesignation = trpc.employees.createDesignation.useMutation({
    onSuccess: () => { toast.success("تم إنشاء المسمى الوظيفي"); setDesignationOpen(false); setDesignationTitle(""); setDesignationCode(""); utils.employees.designations.invalidate(); },
    onError: issue => toast.error("تعذر إنشاء المسمى الوظيفي", { description: issue.message }),
  });
  const saveDepartmentManager = trpc.employees.saveDepartmentManager.useMutation({
    onSuccess: () => { toast.success("تم حفظ مدير القسم"); setDepartmentManagerOpen(false); utils.employees.departments.invalidate(); },
    onError: issue => toast.error("تعذر حفظ مدير القسم", { description: issue.message }),
  });
  const saveProfile = trpc.employees.saveProfile.useMutation({
    onSuccess: () => { toast.success("تم حفظ ملف الموظف"); setSelectedId(null); utils.employees.list.invalidate(); utils.employees.lifecycle.invalidate(); },
    onError: issue => toast.error("تعذر حفظ الملف", { description: issue.message }),
  });
  const saveEmergencyContact = trpc.employees.saveEmergencyContact.useMutation({
    onSuccess: () => { toast.success("تم حفظ جهة اتصال الطوارئ"); utils.employees.emergencyContacts.invalidate(); utils.employees.lifecycle.invalidate(); },
    onError: issue => toast.error("تعذر حفظ جهة اتصال الطوارئ", { description: issue.message }),
  });
  const saveDependent = trpc.employees.saveDependent.useMutation({
    onSuccess: () => { toast.success("تم حفظ سجل التابع"); setDependentName(""); setDependentRelationship(""); setDependentBirthYear(""); utils.employees.dependents.invalidate(); utils.employees.lifecycle.invalidate(); },
    onError: issue => toast.error("تعذر حفظ سجل التابع", { description: issue.message }),
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEmployees = (employees ?? []).filter(employee => {
    if (filterDepartmentId !== "all" && String(employee.department?.id ?? "") !== filterDepartmentId) return false;
    if (filterStatus !== "all" && (employee.profile?.employmentStatus || "active") !== filterStatus) return false;
    if (!normalizedQuery) return true;
    const haystack = [employee.name, employee.designation?.title, employee.profile?.jobTitle, employee.profile?.employeeNumber, employee.department?.name].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
  const selected = employees?.find(item => item.id === selectedId);
  const openProfile = (employee: NonNullable<typeof employees>[number]) => {
    if (!canManageEmployeeProfile) { toast.error("لا تملك صلاحية إدارة ملف الموظف"); return; }
    const contact = emergencyContacts?.find(item => item.employeeUserId === employee.id);
    setSelectedId(employee.id);
    setEmployeeNumber(employee.profile?.employeeNumber || "");
    setJobTitle(employee.profile?.jobTitle || "");
    setRegion(employee.profile?.region || "");
    setWorkLocation(employee.profile?.workLocation || "");
    setEmergencyContactName(contact?.contactName || "");
    setEmergencyRelationship(contact?.relationship || "");
    setEmergencyPhone(contact?.phone || "");
    setDepartmentId(employee.profile?.departmentId ? String(employee.profile.departmentId) : "none");
    setDesignationId(employee.profile?.designationId ? String(employee.profile.designationId) : "none");
    setManagerId(employee.profile?.managerUserId ? String(employee.profile.managerUserId) : "none");
    setEmploymentStatus(employee.profile?.employmentStatus || "active");
    setJoinedAt(employee.profile?.joinedAt ? new Date(employee.profile.joinedAt).toISOString().slice(0, 10) : "");
  };
  const save = () => {
    if (!selected) return;
    saveProfile.mutate({
      userId: selected.id,
      ...(employeeNumber.trim() ? { employeeNumber: employeeNumber.trim() } : {}),
      ...(jobTitle.trim() ? { jobTitle: jobTitle.trim() } : {}),
      ...(designationId !== "none" ? { designationId: Number(designationId) } : {}),
      ...(region.trim() ? { region: region.trim() } : {}),
      ...(workLocation.trim() ? { workLocation: workLocation.trim() } : {}),
      ...(departmentId !== "none" ? { departmentId: Number(departmentId) } : {}),
      ...(managerId !== "none" ? { managerUserId: Number(managerId) } : {}),
      employmentStatus,
      ...(joinedAt ? { joinedAt: new Date(`${joinedAt}T00:00:00`) } : {}),
    });
  };
  const saveContact = () => {
    if (!selected || !canManageSensitiveProfile) return;
    saveEmergencyContact.mutate({ employeeUserId: selected.id, contactName: emergencyContactName.trim(), relationship: emergencyRelationship.trim(), phone: emergencyPhone.trim() });
  };
  const saveSelectedDependent = () => {
    if (!selected || !canManageSensitiveProfile) return;
    saveDependent.mutate({ employeeUserId: selected.id, fullName: dependentName.trim(), relationship: dependentRelationship.trim(), ...(dependentBirthYear ? { birthYear: Number(dependentBirthYear) } : {}) });
  };

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold text-ds-brand-400">القوى العاملة</p><h1 className="mt-2 text-3xl font-bold text-ds-brand-950">دليل الموظفين والأقسام</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-ds-neutral-600">ملفات موظفي شركتك فقط، مع الأقسام والمسميات المنظمة والمدير والمنطقة وموقع العمل لدعم التحليل التشغيلي.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setDepartmentManagerOpen(true)} className="h-10 rounded-xl border-ds-brand-200 text-ds-brand-700">مدير القسم</Button><Button variant="outline" onClick={() => setDesignationOpen(true)} className="h-10 rounded-xl border-ds-brand-200 text-ds-brand-700"><BriefcaseBusiness className="ml-2 size-4" />مسمى جديد</Button><Button onClick={() => setDepartmentOpen(true)} className="h-10 rounded-xl bg-ds-brand-800"><Plus className="ml-2 size-4" />قسم جديد</Button></div>
    </div>
    {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-40 rounded-3xl" />)}</div> : isError ? <StateCard title="تعذر تحميل دليل الموظفين" text={error.message} error /> : employees?.length ? <>
      <FilterBar className="mt-8" label="بحث وتصفية دليل الموظفين" actions={<span className="text-xs font-bold text-ds-neutral-600">{filteredEmployees.length} من {employees.length} موظفاً</span>}>
        <div className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ds-neutral-400" /><Input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="ابحث بالاسم أو المسمى أو رقم الموظف…" className="h-10 rounded-xl border-ds-neutral-200 bg-white pr-9" /></div>
        <Select value={filterDepartmentId} onValueChange={setFilterDepartmentId}><SelectTrigger className="h-10 w-44 rounded-xl border-ds-neutral-200 bg-white"><SelectValue placeholder="القسم" /></SelectTrigger><SelectContent><SelectItem value="all">كل الأقسام</SelectItem>{departments?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>
        <Select value={filterStatus} onValueChange={value => setFilterStatus(value as EmploymentStatus | "all")}><SelectTrigger className="h-10 w-40 rounded-xl border-ds-neutral-200 bg-white"><SelectValue placeholder="الحالة" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
      </FilterBar>
      {filteredEmployees.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{filteredEmployees.map(employee => <article key={employee.id} className="rounded-3xl border border-ds-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-ds-brand-100 text-sm font-bold text-ds-brand-600">{employee.name?.charAt(0) || "م"}</span><span className="rounded-full bg-ds-brand-100 px-3 py-1 text-xs font-bold text-ds-brand-600">{statusLabels[employee.profile?.employmentStatus || "active"]}</span></div><h2 className="mt-4 font-bold text-ds-neutral-950">{employee.name || "موظف بلا اسم"}</h2><p className="mt-1 text-sm text-ds-neutral-700">{employee.designation?.title || employee.profile?.jobTitle || "لم يُحدد المسمى الوظيفي"}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-ds-neutral-100 pt-4 text-xs sm:grid-cols-4"><Fact label="القسم" value={employee.department?.name || "غير محدد"} /><Fact label="المسمى" value={employee.designation?.code || "غير منظم"} /><Fact label="الموقع" value={employee.profile?.workLocation || "غير محدد"} /><Fact label="رقم الموظف" value={employee.profile?.employeeNumber || "—"} /></div><Button variant="outline" onClick={() => openProfile(employee)} className="mt-5 h-9 w-full rounded-xl border-ds-brand-200 text-ds-brand-700"><UserRoundCheck className="ml-2 size-4" />إدارة الملف</Button></article>)}</div> : <StateCard title="لا توجد نتائج مطابقة" text="عدّل كلمة البحث أو التصفية لعرض موظفين آخرين." />}
    </> : <StateCard title="لا توجد حسابات مفعّلة بعد" text="بعد تفعيل الحسابات من إدارة الوصول، ستظهر هنا لتجهيز ملفاتها الوظيفية." />}

    <Dialog open={departmentOpen} onOpenChange={setDepartmentOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>قسم جديد</DialogTitle><DialogDescription>يُحفظ القسم داخل الشركة الحالية فقط.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormField label="اسم القسم"><Input value={departmentName} onChange={event => setDepartmentName(event.target.value)} /></FormField><FormField label="رمز القسم"><Input value={departmentCode} onChange={event => setDepartmentCode(event.target.value)} /></FormField></div><DialogFooter><Button variant="outline" onClick={() => setDepartmentOpen(false)}>إلغاء</Button><Button onClick={() => createDepartment.mutate({ name: departmentName.trim(), ...(departmentCode.trim() ? { code: departmentCode.trim() } : {}) })} disabled={createDepartment.isPending || departmentName.trim().length < 2} className="bg-ds-brand-800">حفظ القسم</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={departmentManagerOpen} onOpenChange={setDepartmentManagerOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>مدير القسم</DialogTitle><DialogDescription>يُختار حساب مفعّل من الشركة الحالية فقط. هذا التعيين تنظيمي ولا يغير المدير المباشر المخزن في ملف الموظف.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormField label="القسم"><Select value={managedDepartmentId} onValueChange={value => { setManagedDepartmentId(value); const department = departments?.find(item => item.id === Number(value)); setDepartmentManagerId(department?.managerUserId ? String(department.managerUserId) : "none"); }}><SelectTrigger><SelectValue placeholder="اختر قسماً" /></SelectTrigger><SelectContent>{departments?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}{item.code ? ` · ${item.code}` : ""}</SelectItem>)}</SelectContent></Select></FormField><FormField label="مدير القسم"><Select value={departmentManagerId} onValueChange={setDepartmentManagerId} disabled={managedDepartmentId === "none"}><SelectTrigger><SelectValue placeholder="اختر حساباً مفعلاً" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مدير محدد</SelectItem>{employees?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name || "موظف"}</SelectItem>)}</SelectContent></Select></FormField></div><DialogFooter><Button variant="outline" onClick={() => setDepartmentManagerOpen(false)}>إلغاء</Button><Button onClick={() => saveDepartmentManager.mutate({ departmentId: Number(managedDepartmentId), ...(departmentManagerId !== "none" ? { managerUserId: Number(departmentManagerId) } : {}) })} disabled={saveDepartmentManager.isPending || managedDepartmentId === "none"} className="bg-ds-brand-800">حفظ المدير</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={designationOpen} onOpenChange={setDesignationOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>مسمى وظيفي جديد</DialogTitle><DialogDescription>كتالوج داخلي مملوك للشركة، ولا يغيّر المسميات النصية الموجودة في ملفات الموظفين.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormField label="المسمى"><Input value={designationTitle} onChange={event => setDesignationTitle(event.target.value)} placeholder="مثال: أخصائي موارد بشرية" /></FormField><FormField label="رمز المسمى"><Input value={designationCode} onChange={event => setDesignationCode(event.target.value)} placeholder="اختياري" /></FormField></div><DialogFooter><Button variant="outline" onClick={() => setDesignationOpen(false)}>إلغاء</Button><Button onClick={() => createDesignation.mutate({ title: designationTitle.trim(), ...(designationCode.trim() ? { code: designationCode.trim() } : {}) })} disabled={createDesignation.isPending || designationTitle.trim().length < 2} className="bg-ds-brand-800">حفظ المسمى</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={selectedId !== null} onOpenChange={open => !open && setSelectedId(null)}><DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>ملف {selected?.name || "الموظف"}</DialogTitle><DialogDescription>المسمى المنظم اختياري ولا يستبدل المسمى النصي الحالي. تظهر بيانات العائلة الحساسة لمسؤولي HR والمسؤول فقط.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><FormField label="رقم الموظف"><Input value={employeeNumber} onChange={event => setEmployeeNumber(event.target.value)} /></FormField><FormField label="المسمى النصي الحالي"><Input value={jobTitle} onChange={event => setJobTitle(event.target.value)} /></FormField><FormField label="المسمى المنظم"><Select value={designationId} onValueChange={setDesignationId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير مربوط بمسمى منظم</SelectItem>{designations?.map(item => <SelectItem key={item.id} value={String(item.id)} disabled={!item.isActive}>{item.title}{item.code ? ` · ${item.code}` : ""}{!item.isActive ? " (موقوف)" : ""}</SelectItem>)}</SelectContent></Select></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="المنطقة الجغرافية"><Input value={region} onChange={event => setRegion(event.target.value)} placeholder="مثال: الرياض" /></FormField><FormField label="موقع العمل"><Input value={workLocation} onChange={event => setWorkLocation(event.target.value)} placeholder="مثال: المقر الرئيسي" /></FormField></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="القسم"><Select value={departmentId} onValueChange={setDepartmentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير محدد</SelectItem>{departments?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></FormField><FormField label="المدير المباشر"><Select value={managerId} onValueChange={setManagerId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير محدد</SelectItem>{employees?.filter(item => item.id !== selectedId).map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name || "موظف"}</SelectItem>)}</SelectContent></Select></FormField></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="الحالة الوظيفية"><Select value={employmentStatus} onValueChange={value => setEmploymentStatus(value as EmploymentStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></FormField><FormField label="تاريخ الانضمام"><Input type="date" value={joinedAt} onChange={event => setJoinedAt(event.target.value)} /></FormField></div>{canManageSensitiveProfile && <><section className="rounded-2xl border border-ds-warning-border bg-ds-ivory p-4"><p className="text-sm font-bold text-ds-warning-strong">جهة اتصال الطوارئ</p><p className="mt-1 text-xs leading-5 text-ds-warning-tan">تُحفظ داخل الشركة وتظهر فقط لمسؤولي HR والمسؤول. لا تُنسخ تفاصيلها إلى سجل دورة الحياة.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><FormField label="الاسم"><Input value={emergencyContactName} onChange={event => setEmergencyContactName(event.target.value)} /></FormField><FormField label="صلة القرابة"><Input value={emergencyRelationship} onChange={event => setEmergencyRelationship(event.target.value)} /></FormField><FormField label="رقم الجوال"><Input inputMode="tel" value={emergencyPhone} onChange={event => setEmergencyPhone(event.target.value)} /></FormField></div><Button variant="outline" size="sm" onClick={saveContact} disabled={saveEmergencyContact.isPending || emergencyContactName.trim().length < 2 || emergencyRelationship.trim().length < 2 || emergencyPhone.trim().length < 7} className="mt-3 border-ds-gold-soft text-ds-warning-strong">حفظ جهة الطوارئ</Button></section><section className="rounded-2xl border border-ds-brand-200 bg-ds-neutral-50 p-4"><p className="text-sm font-bold text-ds-brand-800">التابعون</p><p className="mt-1 text-xs leading-5 text-ds-neutral-700">الحد الأدنى من البيانات الداخلية؛ لا مرفقات أو استحقاقات أو آثار مالية في هذه الدفعة.</p>{selectedId !== null && dependents?.filter(item => item.employeeUserId === selectedId).length ? <div className="mt-3 space-y-2">{dependents.filter(item => item.employeeUserId === selectedId).map(item => <div key={item.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"><span className="font-bold text-ds-brand-900">{item.fullName}</span><span className="text-ds-neutral-600">{item.relationship}{item.birthYear ? ` · ${item.birthYear}` : ""}</span></div>)}</div> : <p className="mt-3 text-xs text-ds-neutral-600">لا توجد سجلات تابعين بعد.</p>}<div className="mt-3 grid gap-3 sm:grid-cols-3"><FormField label="الاسم"><Input value={dependentName} onChange={event => setDependentName(event.target.value)} /></FormField><FormField label="صلة القرابة"><Input value={dependentRelationship} onChange={event => setDependentRelationship(event.target.value)} /></FormField><FormField label="سنة الميلاد"><Input inputMode="numeric" value={dependentBirthYear} onChange={event => setDependentBirthYear(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="اختياري" /></FormField></div><Button variant="outline" size="sm" onClick={saveSelectedDependent} disabled={saveDependent.isPending || dependentName.trim().length < 2 || dependentRelationship.trim().length < 2} className="mt-3 border-ds-success-border text-ds-brand-700">حفظ التابع</Button></section></>}</div><DialogFooter><Button variant="outline" onClick={() => setSelectedId(null)}>إلغاء</Button><Button onClick={save} disabled={saveProfile.isPending} className="bg-ds-brand-800">حفظ الملف</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div><p className="text-ds-neutral-500">{label}</p><p className="mt-1 font-bold text-ds-brand-900">{value}</p></div>; }
function StateCard({ title, text, error = false }: { title: string; text: string; error?: boolean }) { return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-ds-neutral-200 bg-white px-6 text-center"><span className={`flex size-14 items-center justify-center rounded-3xl ${error ? "bg-ds-danger-soft text-ds-danger" : "bg-ds-success-soft text-ds-brand-600"}`}>{error ? <ShieldAlert className="size-6" /> : <UsersRound className="size-6" />}</span><h2 className="mt-5 font-bold text-ds-neutral-950">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-ds-neutral-600">{text}</p></div>; }
