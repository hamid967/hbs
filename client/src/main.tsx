import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { I18nProvider } from "@/i18n";
import "./index.css";

const queryClient = new QueryClient();

const isPublicPath = (pathname: string) => {
  return [
    "/",
    "/login",
    "/subscribe",
    "/activate",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/request-demo",
  ].includes(pathname);
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG ||
    error.message?.includes("10001") ||
    error.data?.code === "UNAUTHORIZED";

  if (!isUnauthorized) return;

  let hadToken = false;
  try {
    hadToken = Boolean(
      localStorage.getItem("manus-runtime-user-token") ||
      sessionStorage.getItem("manus-cookie")
    );
    localStorage.removeItem("manus-runtime-user-token");
    localStorage.removeItem("manus-runtime-user-info");
    sessionStorage.removeItem("manus-cookie");
  } catch {}

  if (!isPublicPath(window.location.pathname) && !window.location.pathname.startsWith("/login")) {
    const destination = hadToken ? "/login?reason=expired" : "/login";
    window.location.assign(destination);
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    const isUnauthorized =
      error instanceof TRPCClientError &&
      (error.message === UNAUTHED_ERR_MSG ||
        error.message?.includes("10001") ||
        error.data?.code === "UNAUTHORIZED");

    if (isUnauthorized) {
      redirectToLoginIfUnauthorized(error);
    } else {
      console.warn("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    const isUnauthorized =
      error instanceof TRPCClientError &&
      (error.message === UNAUTHED_ERR_MSG ||
        error.message?.includes("10001") ||
        error.data?.code === "UNAUTHORIZED");

    if (isUnauthorized) {
      redirectToLoginIfUnauthorized(error);
    } else {
      console.warn("[API Mutation Error]", error);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const storedToken = localStorage.getItem("manus-runtime-user-token");
          if (storedToken) {
            return { Authorization: `Bearer ${storedToken}` };
          }
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair ? pair.trim().slice(prefix.length) : raw;
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // storage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
