import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { auth, logOutFirebase, onAuthStateChanged, type User as FirebaseUser } from "@/lib/firebase";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logOutFirebase().catch(() => undefined);
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      try {
        sessionStorage.removeItem("manus-cookie");
        localStorage.removeItem("manus-runtime-user-token");
        localStorage.removeItem("manus-runtime-user-info");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const resolvedUser = useMemo(() => {
    if (meQuery.data) return meQuery.data;
    if (firebaseUser) {
      return {
        id: 1,
        openId: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "مستخدم Google",
        email: firebaseUser.email || "",
        role: "admin",
        accountStatus: "active",
        avatarUrl: firebaseUser.photoURL || undefined,
        loginMethod: "google",
      };
    }
    if (meQuery.isLoading && typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("manus-runtime-user-token");
        const cached = localStorage.getItem("manus-runtime-user-info");
        if (storedToken && cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") {
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  }, [meQuery.data, firebaseUser, meQuery.isLoading]);

  const state = useMemo(() => {
    if (resolvedUser) {
      try {
        localStorage.setItem(
          "manus-runtime-user-info",
          JSON.stringify(resolvedUser)
        );
      } catch {}
    }
    return {
      user: resolvedUser,
      loading: (meQuery.isLoading && firebaseLoading && !resolvedUser) || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(resolvedUser),
    };
  }, [
    resolvedUser,
    meQuery.isLoading,
    firebaseLoading,
    meQuery.error,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!meQuery.isLoading && !firebaseLoading && !meQuery.data && !firebaseUser && typeof window !== "undefined") {
      try {
        localStorage.removeItem("manus-runtime-user-token");
        localStorage.removeItem("manus-runtime-user-info");
        sessionStorage.removeItem("manus-cookie");
      } catch {}
    }
  }, [meQuery.isLoading, firebaseLoading, meQuery.data, firebaseUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || firebaseLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    let hadToken = false;
    try {
      hadToken = Boolean(
        localStorage.getItem("manus-runtime-user-token") ||
        sessionStorage.getItem("manus-cookie")
      );
    } catch {}

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      window.location.href = hadToken ? "/login?reason=expired" : "/login";
    }
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    firebaseLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

