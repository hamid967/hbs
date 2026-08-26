import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const AssistantIntake = lazy(() => import("./pages/AssistantIntake"));
const HrSystemDesigner = lazy(() => import("./pages/HrSystemDesigner"));
const MarketingHome = lazy(() => import("./pages/MarketingHome"));
const RequestDemo = lazy(() => import("./pages/RequestDemo"));
const DemoRequestsAdmin = lazy(() => import("./pages/DemoRequestsAdmin"));
const DeliveryRoadmap = lazy(() => import("./pages/DeliveryRoadmap"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const NewRequest = lazy(() => import("./pages/NewRequest"));
const Operations = lazy(() => import("./pages/Operations"));
const RequestDetail = lazy(() => import("./pages/RequestDetail"));
const MvpStudio = lazy(() => import("./pages/MvpStudio"));
const HrToolsCenter = lazy(() => import("./pages/HrToolsCenter"));
const AccountManagement = lazy(() => import("./pages/AccountManagement"));
const CompanyPermissionTemplates = lazy(() => import("./pages/CompanyPermissionTemplates"));
const EmployeeDirectory = lazy(() => import("./pages/EmployeeDirectory"));
const EmployeeLifecycle = lazy(() => import("./pages/EmployeeLifecycle"));
const ApprovalsInbox = lazy(() => import("./pages/ApprovalsInbox"));
const NotificationsCenter = lazy(() => import("./pages/NotificationsCenter"));
const EmployeeRequests = lazy(() => import("./pages/EmployeeRequests"));
const HrReports = lazy(() => import("./pages/HrReports"));
const RecruitmentOnboarding = lazy(() => import("./pages/RecruitmentOnboarding"));
const Attendance = lazy(() => import("./pages/Attendance"));
const AttendanceSchedules = lazy(() => import("./pages/AttendanceSchedules"));
const Training = lazy(() => import("./pages/Training"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const Workboard = lazy(() => import("./pages/Workboard"));
const ContractsDocuments = lazy(() => import("./pages/ContractsDocuments"));
const Assets = lazy(() => import("./pages/Assets"));
const Offboarding = lazy(() => import("./pages/Offboarding"));
const GoalsPerformance = lazy(() => import("./pages/GoalsPerformance"));
const ApprovalSimulator = lazy(() => import("./pages/ApprovalSimulator"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const LeavePolicies = lazy(() => import("./pages/LeavePolicies"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() { return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-6" role="status" aria-live="polite"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-[#d7e8da] border-t-[#256645]" /><p className="mt-4 text-sm font-bold text-[#315440]">جارٍ تحميل الصفحة…</p></div></main>; }

function Router() {
  return <Suspense fallback={<RouteFallback />}><Switch><Route path="/" component={MarketingHome} /><Route path="/request-demo" component={RequestDemo} /><Route path="/app" component={Home} /><Route path="/assistant" component={AssistantIntake} /><Route path="/hr-system" component={HrSystemDesigner} /><Route path="/hr-tools" component={HrToolsCenter} /><Route path="/employee-requests" component={EmployeeRequests} /><Route path="/leave-policies" component={LeavePolicies} /><Route path="/requests/new" component={NewRequest} /><Route path="/requests/:id" component={RequestDetail} /><Route path="/my-requests" component={MyRequests} /><Route path="/operations" component={Operations} /><Route path="/demo-requests" component={DemoRequestsAdmin} /><Route path="/roadmap" component={DeliveryRoadmap} /><Route path="/mvp" component={MvpStudio} /><Route path="/accounts" component={AccountManagement} /><Route path="/company-templates" component={CompanyPermissionTemplates} /><Route path="/employees" component={EmployeeDirectory} /><Route path="/employee-lifecycle" component={EmployeeLifecycle} /><Route path="/contracts" component={ContractsDocuments} /><Route path="/assets" component={Assets} /><Route path="/offboarding" component={Offboarding} /><Route path="/goals" component={GoalsPerformance} /><Route path="/manager-dashboard" component={ManagerDashboard} /><Route path="/approval-simulator" component={ApprovalSimulator} /><Route path="/training" component={Training} /><Route path="/recruitment" component={RecruitmentOnboarding} /><Route path="/attendance" component={Attendance} /><Route path="/attendance-schedules" component={AttendanceSchedules} /><Route path="/audit" component={AuditLog} /><Route path="/workboard" component={Workboard} /><Route path="/approvals" component={ApprovalsInbox} /><Route path="/notifications" component={NotificationsCenter} /><Route path="/reports" component={HrReports} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-center" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
