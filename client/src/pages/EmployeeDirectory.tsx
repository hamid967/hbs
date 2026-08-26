import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BriefcaseBusiness, Plus, ShieldAlert, UserRoundCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabels = { active: "نشط", on_leave: "في إجازة", inactive: "غير نشط" } as const;
type EmploymentStatus = keyof typeof statusLabels;

export default function EmployeeDirectory() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const { data: employees, isLoading, isError, error } = trpc.employees.list.useQuery();
  const { data: departments } = trpc.employees.departments.useQuery();
  const { data: designations } = trpc.employees.designations.useQuery();
  const canManageSensitiveProfile = user?.role === "admin" || user?.role === "hr";
  const { data: emergencyContacts } = trpc.employees.emergencyContacts.useQuery(undefined, { enabled: canManageSensitiveProfile });
  const [departmentOpen, setDepartmentOpen] = useState(false);
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
  const [departmentId, setDepartmentId] = useState("none");
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
  const saveProfile = trpc.employees.saveProfile.useMutation({
    onSuccess: () => { toast.success("تم حفظ ملف الموظف"); setSelectedId(null); utils.employees.list.invalidate(); utils.employees.lifecycle.invalidate(); },
    onError: issue => toast.error("تعذر حفظ الملف", { description: issue.message }),
  });
  const saveEmergencyContact = trpc.employees.saveEmergencyContact.useMutation({
    onSuccess: () => { toast.success("تم حفظ جهة اتصال الطوارئ"); utils.employees.emergencyContacts.invalidate(); utils.employees.lifecycle.invalidate(); },
    onError: issue => toast.error("تعذر حفظ جهة اتصال الطوارئ", { description: issue.message }),
  });

  const selected = employees?.find(item => item.id === selectedId);
  const openProfile = (employee: NonNullable<typeof employees>[number]) => {
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

  return <DashboardLayout><div dir="rtl" className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold text-[#5d8d70]">القوى العاملة</p><h1 className="mt-2 text-3xl font-bold text-[#1d4532]">دليل الموظفين والأقسام</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#748178]">ملفات موظفي شركتك فقط، مع الأقسام والمسميات المنظمة والمدير والمنطقة وموقع العمل لدعم التحليل التشغيلي.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setDesignationOpen(true)} className="h-10 rounded-xl border-[#cfe0d3] text-[#286746]"><BriefcaseBusiness className="ml-2 size-4" />مسمى جديد</Button><Button onClick={() => setDepartmentOpen(true)} className="h-10 rounded-xl bg-[#1f5b45]"><Plus className="ml-2 size-4" />قسم جديد</Button></div>
    </div>
    {isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-40 rounded-3xl" />)}</div> : isError ? <StateCard title="تعذر تحميل دليل الموظفين" text={error.message} error /> : employees?.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{employees.map(employee => <article key={employee.id} className="rounded-3xl border border-[#dfe9e1] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#e7f3e9] text-sm font-bold text-[#337b54]">{employee.name?.charAt(0) || "م"}</span><span className="rounded-full bg-[#e7f4ea] px-3 py-1 text-xs font-bold text-[#30774e]">{statusLabels[employee.profile?.employmentStatus || "active"]}</span></div><h2 className="mt-4 font-bold text-[#294535]">{employee.name || "موظف بلا اسم"}</h2><p className="mt-1 text-sm text-[#65796d]">{employee.designation?.title || employee.profile?.jobTitle || "لم يُحدد المسمى الوظيفي"}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf1ed] pt-4 text-xs sm:grid-cols-4"><Fact label="القسم" value={employee.department?.name || "غير محدد"} /><Fact label="المسمى" value={employee.designation?.code || "غير منظم"} /><Fact label="الموقع" value={employee.profile?.workLocation || "غير محدد"} /><Fact label="رقم الموظف" value={employee.profile?.employeeNumber || "—"} /></div><Button variant="outline" onClick={() => openProfile(employee)} className="mt-5 h-9 w-full rounded-xl border-[#d5e3d7] text-[#386f50]"><UserRoundCheck className="ml-2 size-4" />إدارة الملف</Button></article>)}</div> : <StateCard title="لا توجد حسابات مفعّلة بعد" text="بعد تفعيل الحسابات من إدارة الوصول، ستظهر هنا لتجهيز ملفاتها الوظيفية." />}

    <Dialog open={departmentOpen} onOpenChange={setDepartmentOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>قسم جديد</DialogTitle><DialogDescription>يُحفظ القسم داخل الشركة الحالية فقط.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="اسم القسم"><Input value={departmentName} onChange={event => setDepartmentName(event.target.value)} /></Field><Field label="رمز القسم"><Input value={departmentCode} onChange={event => setDepartmentCode(event.target.value)} /></Field></div><DialogFooter><Button variant="outline" onClick={() => setDepartmentOpen(false)}>إلغاء</Button><Button onClick={() => createDepartment.mutate({ name: departmentName.trim(), ...(departmentCode.trim() ? { code: departmentCode.trim() } : {}) })} disabled={createDepartment.isPending || departmentName.trim().length < 2} className="bg-[#1f5b45]">حفظ القسم</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={designationOpen} onOpenChange={setDesignationOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>مسمى وظيفي جديد</DialogTitle><DialogDescription>كتالوج داخلي مملوك للشركة، ولا يغيّر المسميات النصية الموجودة في ملفات الموظفين.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="المسمى"><Input value={designationTitle} onChange={event => setDesignationTitle(event.target.value)} placeholder="مثال: أخصائي موارد بشرية" /></Field><Field label="رمز المسمى"><Input value={designationCode} onChange={event => setDesignationCode(event.target.value)} placeholder="اختياري" /></Field></div><DialogFooter><Button variant="outline" onClick={() => setDesignationOpen(false)}>إلغاء</Button><Button onClick={() => createDesignation.mutate({ title: designationTitle.trim(), ...(designationCode.trim() ? { code: designationCode.trim() } : {}) })} disabled={createDesignation.isPending || designationTitle.trim().length < 2} className="bg-[#1f5b45]">حفظ المسمى</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={selectedId !== null} onOpenChange={open => !open && setSelectedId(null)}><DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>ملف {selected?.name || "الموظف"}</DialogTitle><DialogDescription>المسمى المنظم اختياري ولا يستبدل المسمى النصي الحالي. تعرض جهة اتصال الطوارئ لمسؤولي HR والمسؤول فقط.</DialogDescription></DialogHeader><div className="grid gap-4 py-3"><Field label="رقم الموظف"><Input value={employeeNumber} onChange={event => setEmployeeNumber(event.target.value)} /></Field><Field label="المسمى النصي الحالي"><Input value={jobTitle} onChange={event => setJobTitle(event.target.value)} /></Field><Field label="المسمى المنظم"><Select value={designationId} onValueChange={setDesignationId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير مربوط بمسمى منظم</SelectItem>{designations?.map(item => <SelectItem key={item.id} value={String(item.id)} disabled={!item.isActive}>{item.title}{item.code ? ` · ${item.code}` : ""}{!item.isActive ? " (موقوف)" : ""}</SelectItem>)}</SelectContent></Select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="المنطقة الجغرافية"><Input value={region} onChange={event => setRegion(event.target.value)} placeholder="مثال: الرياض" /></Field><Field label="موقع العمل"><Input value={workLocation} onChange={event => setWorkLocation(event.target.value)} placeholder="مثال: المقر الرئيسي" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="القسم"><Select value={departmentId} onValueChange={setDepartmentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير محدد</SelectItem>{departments?.map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></Field><Field label="المدير المباشر"><Select value={managerId} onValueChange={setManagerId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">غير محدد</SelectItem>{employees?.filter(item => item.id !== selectedId).map(item => <SelectItem key={item.id} value={String(item.id)}>{item.name || "موظف"}</SelectItem>)}</SelectContent></Select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="الحالة الوظيفية"><Select value={employmentStatus} onValueChange={value => setEmploymentStatus(value as EmploymentStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="تاريخ الانضمام"><Input type="date" value={joinedAt} onChange={event => setJoinedAt(event.target.value)} /></Field></div>{canManageSensitiveProfile && <section className="rounded-2xl border border-[#e5d7be] bg-[#fffaf2] p-4"><p className="text-sm font-bold text-[#6d522d]">جهة اتصال الطوارئ</p><p className="mt-1 text-xs leading-5 text-[#896e47]">تُحفظ داخل الشركة وتظهر فقط لمسؤولي HR والمسؤول. لا تُنسخ تفاصيلها إلى سجل دورة الحياة.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><Field label="الاسم"><Input value={emergencyContactName} onChange={event => setEmergencyContactName(event.target.value)} /></Field><Field label="صلة القرابة"><Input value={emergencyRelationship} onChange={event => setEmergencyRelationship(event.target.value)} /></Field><Field label="رقم الجوال"><Input inputMode="tel" value={emergencyPhone} onChange={event => setEmergencyPhone(event.target.value)} /></Field></div><Button variant="outline" size="sm" onClick={saveContact} disabled={saveEmergencyContact.isPending || emergencyContactName.trim().length < 2 || emergencyRelationship.trim().length < 2 || emergencyPhone.trim().length < 7} className="mt-3 border-[#e0c99e] text-[#815b25]">حفظ جهة الطوارئ</Button></section>}</div><DialogFooter><Button variant="outline" onClick={() => setSelectedId(null)}>إلغاء</Button><Button onClick={save} disabled={saveProfile.isPending} className="bg-[#1f5b45]">حفظ الملف</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="mb-2 block text-xs font-bold text-[#61756a]">{label}</label>{children}</div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><p className="text-[#89958d]">{label}</p><p className="mt-1 font-bold text-[#3a5646]">{value}</p></div>; }
function StateCard({ title, text, error = false }: { title: string; text: string; error?: boolean }) { return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-[#dfe9e1] bg-white px-6 text-center"><span className={`flex size-14 items-center justify-center rounded-3xl ${error ? "bg-[#fdecea] text-[#a94e48]" : "bg-[#eaf3eb] text-[#357b53]"}`}>{error ? <ShieldAlert className="size-6" /> : <UsersRound className="size-6" />}</span><h2 className="mt-5 font-bold text-[#294535]">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#748178]">{text}</p></div>; }
