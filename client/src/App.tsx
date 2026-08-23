import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AssistantIntake from "./pages/AssistantIntake";
import HrSystemDesigner from "./pages/HrSystemDesigner";
import MarketingHome from "./pages/MarketingHome";
import RequestDemo from "./pages/RequestDemo";
import DemoRequestsAdmin from "./pages/DemoRequestsAdmin";
import DeliveryRoadmap from "./pages/DeliveryRoadmap";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import Operations from "./pages/Operations";
import RequestDetail from "./pages/RequestDetail";
import MvpStudio from "./pages/MvpStudio";
import HrToolsCenter from "./pages/HrToolsCenter";
import AccountManagement from "./pages/AccountManagement";
import CompanyPermissionTemplates from "./pages/CompanyPermissionTemplates";
import EmployeeDirectory from "./pages/EmployeeDirectory";

function Router() {
  return <Switch><Route path="/" component={MarketingHome} /><Route path="/request-demo" component={RequestDemo} /><Route path="/app" component={Home} /><Route path="/assistant" component={AssistantIntake} /><Route path="/hr-system" component={HrSystemDesigner} /><Route path="/hr-tools" component={HrToolsCenter} /><Route path="/requests/new" component={NewRequest} /><Route path="/requests/:id" component={RequestDetail} /><Route path="/my-requests" component={MyRequests} /><Route path="/operations" component={Operations} /><Route path="/demo-requests" component={DemoRequestsAdmin} /><Route path="/roadmap" component={DeliveryRoadmap} /><Route path="/mvp" component={MvpStudio} /><Route path="/accounts" component={AccountManagement} /><Route path="/company-templates" component={CompanyPermissionTemplates} /><Route path="/employees" component={EmployeeDirectory} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-center" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
