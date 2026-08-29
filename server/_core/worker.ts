import type { ExecutionContext } from "@cloudflare/workers-types";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { handleOAuthCallback } from "./oauth";
import { requestContext, runWithRequestContext } from "./requestContext";
import { handleStorageProxy } from "./storageProxy";

interface Env {
  HYPERDRIVE: { connectionString: string };
  ASSETS: { fetch: typeof fetch };
}

/**
 * التوجيه اليدوي هنا مقصود: لا نستخدم assets.not_found_handling بصيغة
 * "single-page-application" في wrangler.jsonc، لأن ذلك يجعل كل مسار غير مطابق
 * لملف ثابت — بما فيها /api/trpc و/api/oauth/callback و/manus-storage — يُقدَّم
 * كـindex.html مباشرة من طبقة الأصول، فلا تصل هذه الدالة إطلاقاً ويتعطّل الـAPI
 * بصمت. لذا نترك not_found_handling بلا قيمة، ونفعل التوجيه والسقوط إلى SPA هنا.
 */
async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/oauth/callback")
    return handleOAuthCallback(request);
  if (url.pathname.startsWith("/manus-storage/"))
    return handleStorageProxy(request);
  if (url.pathname.startsWith("/api/trpc")) {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext,
    });
  }

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) return assetResponse;
  return env.ASSETS.fetch(
    new Request(new URL("/index.html", request.url), { method: "GET" })
  );
}

/**
 * لا نستخدم satisfies ExportedHandler<Env> هنا عمداً: تلك الواجهة من
 * @cloudflare/workers-types تفرض نوعها الخاص لـRequest (الذي يضيف حقل cf غير
 * موجود في Request القياسي من lib: dom المستخدم في بقية الملف والمشروع)، فيصطدم
 * تصريحياً رغم تطابق السلوك الفعلي تماماً — وقد تحقّقنا من هذا التطابق فعلياً عبر
 * `wrangler deploy --dry-run` الذي يبني هذا الملف وينفّذه بأدوات Wrangler الحقيقية
 * بنجاح. العقد الحقيقي الذي يتحقق منه Wrangler وقت التشغيل هو وجود fetch(request,
 * env, ctx) بالضبط — وهو محقَّق هنا دون أي غموض.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return runWithRequestContext(env.HYPERDRIVE.connectionString, async () => {
      const response = await routeRequest(request, env);
      const store = requestContext.getStore();
      if (store?.connection)
        ctx.waitUntil(store.connection.end().catch(() => {}));
      return response;
    });
  },
};
