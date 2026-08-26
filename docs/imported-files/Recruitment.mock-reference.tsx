import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building2,
  MapPin,
  Plus,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

/**
 * صفحة التوظيف (ATS) — المرحلة 13 من خارطة الثلاثين مرحلة.
 *
 * ملاحظة تشغيلية: هذه الواجهة تُبنى أولاً بحالة محلية (mock) قابلة للاستبدال
 * المباشر بإجراءات tRPC حقيقية (recruitment.jobs.*, recruitment.candidates.*)
 * دون تغيير بنية المكوّنات، اتساقاً مع نهج "الواجهة أولاً ثم الربط الحي" المتبع
 * في بقية وحدات المشروع. لا تُستبدل ببيانات حقيقية قبل اعتماد نموذج الصلاحيات
 * ومخطط قاعدة البيانات لهذه الوحدة صراحة.
 */

type JobStatus = "open" | "paused" | "closed";
type CandidateStage = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: JobStatus;
  candidateCount: number;
}

interface Candidate {
  id: string;
  name: string;
  jobId: string;
  stage: CandidateStage;
  appliedOn: string;
}

const initialJobs: JobPosting[] = [
  { id: "job-1", title: "أخصائي علاقات حكومية", department: "العلاقات الحكومية", location: "جدة", status: "open", candidateCount: 3 },
  { id: "job-2", title: "محاسب رواتب", department: "الموارد البشرية", location: "الرياض", status: "open", candidateCount: 2 },
  { id: "job-3", title: "مطوّر واجهات أمامية", department: "المنتج والتقنية", location: "عن بُعد", status: "paused", candidateCount: 1 },
];

const initialCandidates: Candidate[] = [
  { id: "cand-1", name: "سارة العتيبي", jobId: "job-1", stage: "interview", appliedOn: "2026-08-02" },
  { id: "cand-2", name: "محمد الحربي", jobId: "job-1", stage: "applied", appliedOn: "2026-08-10" },
  { id: "cand-3", name: "نورة القحطاني", jobId: "job-1", stage: "screening", appliedOn: "2026-08-06" },
  { id: "cand-4", name: "خالد الزهراني", jobId: "job-2", stage: "offer", appliedOn: "2026-07-28" },
  { id: "cand-5", name: "ريم آل سعيد", jobId: "job-2", stage: "applied", appliedOn: "2026-08-14" },
  { id: "cand-6", name: "عبدالله الشمري", jobId: "job-3", stage: "hired", appliedOn: "2026-07-15" },
];

const stageOrder: CandidateStage[] = ["applied", "screening", "interview", "offer", "hired", "rejected"];

const stageLabels: Record<CandidateStage, string> = {
  applied: "تقدّم",
  screening: "فرز أولي",
  interview: "مقابلة",
  offer: "عرض",
  hired: "تم التعيين",
  rejected: "معتذر",
};

const stageTone: Record<CandidateStage, string> = {
  applied: "bg-[#eaf0ec] text-[#3a5c48]",
  screening: "bg-[#e7f0f7] text-[#2f5f80]",
  interview: "bg-[#f6efd7] text-[#8a6a1f]",
  offer: "bg-[#f0e0f6] text-[#6f3f85]",
  hired: "bg-[#e5f3e8] text-[#1f6b41]",
  rejected: "bg-[#f8e9df] text-[#a15f36]",
};

const statusLabels: Record<JobStatus, string> = { open: "مفتوحة", paused: "متوقفة مؤقتاً", closed: "مغلقة" };
const statusTone: Record<JobStatus, string> = {
  open: "bg-[#e5f3e8] text-[#1f6b41]",
  paused: "bg-[#f6efd7] text-[#8a6a1f]",
  closed: "bg-[#f1f3f1] text-[#657069]",
};

export default function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>(initialJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", location: "" });

  const openJobsCount = jobs.filter(job => job.status === "open").length;
  const activeCandidatesCount = candidates.filter(candidate => !["hired", "rejected"].includes(candidate.stage)).length;
  const interviewCount = candidates.filter(candidate => candidate.stage === "interview").length;
  const offerCount = candidates.filter(candidate => candidate.stage === "offer").length;

  const candidatesByStage = useMemo(() => {
    const grouped: Record<CandidateStage, Candidate[]> = {
      applied: [], screening: [], interview: [], offer: [], hired: [], rejected: [],
    };
    for (const candidate of candidates) grouped[candidate.stage].push(candidate);
    return grouped;
  }, [candidates]);

  function jobTitle(jobId: string) {
    return jobs.find(job => job.id === jobId)?.title ?? "—";
  }

  function moveCandidate(candidateId: string, stage: CandidateStage) {
    setCandidates(current => current.map(candidate => (candidate.id === candidateId ? { ...candidate, stage } : candidate)));
  }

  function createJob() {
    if (!newJob.title.trim() || !newJob.department.trim()) return;
    const job: JobPosting = {
      id: `job-${Date.now()}`,
      title: newJob.title.trim(),
      department: newJob.department.trim(),
      location: newJob.location.trim() || "غير محدد",
      status: "open",
      candidateCount: 0,
    };
    setJobs(current => [job, ...current]);
    setNewJob({ title: "", department: "", location: "" });
    setJobDialogOpen(false);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl" dir="rtl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4c8564]">
              <Briefcase className="size-4" /> التوظيف والتهيئة
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[#173e30] md:text-3xl">التوظيف</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#728077]">
              إدارة الوظائف الشاغرة ومسار المتقدمين من التقديم حتى التعيين، ضمن نفس نطاق صلاحيات الشركة المعتمد في بقية الوحدات.
            </p>
          </div>
          <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#1f5b45]">
                <Plus className="ml-2 size-4" /> وظيفة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>إضافة وظيفة شاغرة</DialogTitle>
                <DialogDescription>ستظهر الوظيفة فوراً ضمن قائمة الوظائف المفتوحة لهذه الشركة.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">المسمى الوظيفي</Label>
                  <Input id="job-title" value={newJob.title} onChange={event => setNewJob(current => ({ ...current, title: event.target.value }))} placeholder="مثال: أخصائي موارد بشرية" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job-department">القسم</Label>
                    <Input id="job-department" value={newJob.department} onChange={event => setNewJob(current => ({ ...current, department: event.target.value }))} placeholder="مثال: الموارد البشرية" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-location">الموقع</Label>
                    <Input id="job-location" value={newJob.location} onChange={event => setNewJob(current => ({ ...current, location: event.target.value }))} placeholder="مثال: جدة، أو عن بُعد" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJobDialogOpen(false)} className="rounded-xl">إلغاء</Button>
                <Button onClick={createJob} className="rounded-xl bg-[#1f5b45]">حفظ الوظيفة</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Briefcase} label="وظائف مفتوحة" value={openJobsCount} tone="text-[#1f6b41]" />
          <StatCard icon={Users} label="متقدمون نشطون" value={activeCandidatesCount} tone="text-[#2f5f80]" />
          <StatCard icon={UserRoundSearch} label="في مرحلة المقابلة" value={interviewCount} tone="text-[#8a6a1f]" />
          <StatCard icon={Building2} label="عروض قيد القرار" value={offerCount} tone="text-[#6f3f85]" />
        </section>

        <Tabs defaultValue="jobs" className="mt-8">
          <TabsList className="rounded-xl bg-[#eef3ee]">
            <TabsTrigger value="jobs" className="rounded-lg">الوظائف الشاغرة</TabsTrigger>
            <TabsTrigger value="pipeline" className="rounded-lg">مسار المتقدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-5 space-y-3">
            {jobs.map(job => (
              <Card key={job.id} className="rounded-2xl border-[#e5eae5]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-bold text-[#233e31]">{job.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#728077]">
                      <span className="flex items-center gap-1"><Building2 className="size-3.5" />{job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Users className="size-3.5" />{candidates.filter(candidate => candidate.jobId === job.id).length} متقدم</span>
                    </div>
                  </div>
                  <Badge className={statusTone[job.status]} variant="outline">{statusLabels[job.status]}</Badge>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d6e3d8] bg-[#fbfcfa] py-10 text-center text-sm text-[#849087]">
                لا توجد وظائف شاغرة حالياً. أضف أول وظيفة للبدء.
              </div>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="mt-5">
            <div className="grid gap-3 overflow-x-auto pb-2 lg:grid-cols-6">
              {stageOrder.map(stage => (
                <div key={stage} className="min-w-[220px] rounded-2xl bg-[#f6f8f6] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-[#425449]">{stageLabels[stage]}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#657069]">{candidatesByStage[stage].length}</span>
                  </div>
                  <div className="space-y-2">
                    {candidatesByStage[stage].map(candidate => (
                      <Card key={candidate.id} className="rounded-xl border-[#e5eae5] py-3">
                        <CardContent className="space-y-2 px-3">
                          <p className="text-sm font-bold text-[#233e31]">{candidate.name}</p>
                          <p className="text-[11px] text-[#849087]">{jobTitle(candidate.jobId)}</p>
                          <p className="text-[10px] text-[#9ca8a1]">تقديم: {candidate.appliedOn}</p>
                          <Select value={candidate.stage} onValueChange={value => moveCandidate(candidate.id, value as CandidateStage)}>
                            <SelectTrigger className="h-8 rounded-lg text-[11px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {stageOrder.map(option => (
                                <SelectItem key={option} value={option}>{stageLabels[option]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))}
                    {candidatesByStage[stage].length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#dbe4dc] p-3 text-center text-[10px] text-[#9ca8a1]">لا يوجد</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 rounded-2xl border-[#e5eae5] bg-[#fbfcfa]">
          <CardHeader>
            <CardTitle className="text-sm text-[#425449]">ملاحظة حول هذا الإصدار</CardTitle>
          </CardHeader>
          <CardContent className="text-xs leading-6 text-[#728077]">
            هذه الواجهة تعمل حالياً ببيانات محلية للمعاينة والتحقق من التجربة. الخطوة التالية المعتمدة قبل الربط الحي:
            تصميم مخطط بيانات الوظائف والمتقدمين في Drizzle، وتحديد نطاق صلاحيات الوحدة (من يرى الوظائف والمتقدمين ومن يملك تغيير المرحلة)، ثم استبدال الحالة المحلية بإجراءات tRPC حقيقية دون تغيير بنية هذه الواجهة.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Briefcase; label: string; value: number; tone: string }) {
  return (
    <Card className="rounded-2xl border-[#e5eae5]">
      <CardContent className="flex items-center gap-3 py-2">
        <span className={`flex size-10 items-center justify-center rounded-2xl bg-[#f1f6f1] ${tone}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xl font-bold text-[#1d5038]">{value}</p>
          <p className="text-[11px] text-[#77857b]">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
