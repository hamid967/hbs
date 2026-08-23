import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AssistantIntake from "./pages/AssistantIntake";
import HrSystemDesigner from "./pages/HrSystemDesigner";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import Operations from "./pages/Operations";
import RequestDetail from "./pages/RequestDetail";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/assistant" component={AssistantIntake} /><Route path="/hr-system" component={HrSystemDesigner} /><Route path="/requests/new" component={NewRequest} /><Route path="/requests/:id" component={RequestDetail} /><Route path="/my-requests" component={MyRequests} /><Route path="/operations" component={Operations} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-center" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
