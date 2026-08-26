import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { requestsRouter } from "./routers/requests";
import { assistantRouter } from "./routers/assistant";
import { demoRequestsRouter } from "./routers/demoRequests";
import { mvpAnalyticsRouter } from "./routers/mvpAnalytics";
import { accountsRouter } from "./routers/accounts";
import { employeesRouter } from "./routers/employees";
import { approvalsRouter } from "./routers/approvals";
import { notificationsRouter } from "./routers/notifications";
import { reportsRouter } from "./routers/reports";
import { recruitmentRouter } from "./routers/recruitment";
import { attendanceRouter } from "./routers/attendance";
import { auditRouter } from "./routers/audit";
import { workboardRouter } from "./routers/workboard";
import { executionControlRouter } from "./routers/executionControl";
import { contractsRouter } from "./routers/contracts";
import { offboardingRouter } from "./routers/offboarding";
import { goalsRouter } from "./routers/goals";
import { managerDashboardRouter } from "./routers/managerDashboard";
import { leavesRouter } from "./routers/leaves";
import { assetsRouter } from "./routers/assets";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  requests: requestsRouter,
  assistant: assistantRouter,
  demoRequests: demoRequestsRouter,
  mvpAnalytics: mvpAnalyticsRouter,
  accounts: accountsRouter,
  employees: employeesRouter,
  approvals: approvalsRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  recruitment: recruitmentRouter,
  attendance: attendanceRouter,
  audit: auditRouter,
  workboard: workboardRouter,
  executionControl: executionControlRouter,
  contracts: contractsRouter,
  offboarding: offboardingRouter,
  goals: goalsRouter,
  managerDashboard: managerDashboardRouter,
  leaves: leavesRouter,
  assets: assetsRouter,
});

export type AppRouter = typeof appRouter;
