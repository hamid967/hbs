import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
const OperationalHealth = lazy(() => import("./pages/OperationalHealth"));
const DataRetentionPolicies = lazy(() => import("./pages/DataRetentionPolicies"));
const DataInventory = lazy(() => import("./pages/DataInventory"));
const OAuthAcceptanceReadiness = lazy(() => import("./pages/OAuthAcceptanceReadiness"));
const InternalMessaging = lazy(() => import("./pages/InternalMessaging"));
const OrganizationStructure = lazy(() => import("./pages/OrganizationStructure"));
const LocalLogin = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.LocalLogin })));
const ExecutiveAdvisoryBoard = lazy(() => import("./pages/ExecutiveAdvisoryBoard"));
const SubscriptionRequest = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.SubscriptionRequest })));
const ActivateInvitation = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.ActivateInvitation })));
const RegisterCompany = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.RegisterCompany })));
const VerifyEmail = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.VerifyEmail })));
const ForgotPassword = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/LocalAccess").then(module => ({ default: module.ResetPassword })));
const SubscriptionRequestsAdmin = lazy(() => import("./pages/SubscriptionRequestsAdmin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() { return <main dir="rtl" className="flex min-h-screen items-center justify-center bg-ds-neutral-50 px-6" role="status" aria-live="polite"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-ds-brand-200 border-t-ds-brand-700" /><p className="mt-4 text-sm font-bold text-ds-brand-900">جارٍ تحميل الصفحة…</p></div></main>; }

function Router() {
  return <Suspense fallback={<RouteFallback />}><Switch>
    <Route path="/" component={MarketingHome} /><Route path="/request-demo" component={RequestDemo} /><Route path="/login" component={LocalLogin} /><Route path="/subscribe" component={SubscriptionRequest} /><Route path="/activate" component={ActivateInvitation} /><Route path="/register" component={RegisterCompany} /><Route path="/verify-email" component={VerifyEmail} /><Route path="/forgot-password" component={ForgotPassword} /><Route path="/reset-password" component={ResetPassword} /><Route path="/app" component={Home} />
    <Route path="/assistant" component={AssistantIntake} /><Route path="/hr-system" component={HrSystemDesigner} /><Route path="/hr-tools" component={HrToolsCenter} />
    <Route path="/consulting-hub" component={ExecutiveAdvisoryBoard} /><Route path="/team-hub" component={ExecutiveAdvisoryBoard} /><Route path="/executive-advisory" component={ExecutiveAdvisoryBoard} />
    <Route path="/employee-requests" component={EmployeeRequests} /><Route path="/leave-policies" component={LeavePolicies} /><Route path="/system-health" component={OperationalHealth} /><Route path="/data-retention" component={DataRetentionPolicies} /><Route path="/data-inventory" component={DataInventory} /><Route path="/oauth-acceptance-readiness" component={OAuthAcceptanceReadiness} />
    <Route path="/requests/new" component={NewRequest} /><Route path="/requests/:id" component={RequestDetail} /><Route path="/my-requests" component={MyRequests} />
    <Route path="/operations" component={Operations} /><Route path="/demo-requests" component={DemoRequestsAdmin} /><Route path="/roadmap" component={DeliveryRoadmap} /><Route path="/mvp" component={MvpStudio} />
    <Route path="/accounts" component={AccountManagement} /><Route path="/company-templates" component={CompanyPermissionTemplates} /><Route path="/employees" component={EmployeeDirectory} /><Route path="/employee-lifecycle" component={EmployeeLifecycle} />
    <Route path="/organization" component={OrganizationStructure} /><Route path="/subscriptions" component={SubscriptionRequestsAdmin} />
    <Route path="/contracts" component={ContractsDocuments} /><Route path="/assets" component={Assets} /><Route path="/offboarding" component={Offboarding} /><Route path="/goals" component={GoalsPerformance} />
    <Route path="/manager-dashboard" component={ManagerDashboard} /><Route path="/approval-simulator" component={ApprovalSimulator} /><Route path="/training" component={Training} /><Route path="/recruitment" component={RecruitmentOnboarding} />
    <Route path="/attendance" component={Attendance} /><Route path="/attendance-schedules" component={AttendanceSchedules} /><Route path="/audit" component={AuditLog} /><Route path="/workboard" component={Workboard} />
    <Route path="/approvals" component={ApprovalsInbox} /><Route path="/notifications" component={NotificationsCenter} /><Route path="/messaging" component={InternalMessaging} /><Route path="/reports" component={HrReports} /><Route path="/404" component={NotFound} /><Route component={NotFound} />
  </Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-center" richColors /><Router /><SpeedInsights /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
