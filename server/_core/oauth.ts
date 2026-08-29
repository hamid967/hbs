import {
  COOKIE_NAME,
  ONE_YEAR_MS,
  OAUTH_STATE_COOKIE,
  decodeOAuthState,
} from "@shared/const";
import { parse as parseCookieHeader, serialize } from "cookie";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export async function handleOAuthCallback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;

  if (!code || !state) {
    return Response.json(
      { error: "code and state are required" },
      { status: 400 }
    );
  }

  // CSRF guard: the nonce in `state` must match the one-time cookie that
  // startLogin set in the browser that began this login. An attacker can
  // forge `state`, but cannot plant this cookie in the victim's browser.
  const { nonce } = decodeOAuthState(state);
  const expectedNonce = parseCookieHeader(request.headers.get("cookie") ?? "")[
    OAUTH_STATE_COOKIE
  ];
  if (!nonce || nonce !== expectedNonce) {
    return Response.json({ error: "invalid oauth state" }, { status: 403 });
  }

  const headers = new Headers();
  headers.append(
    "set-cookie",
    serialize(OAUTH_STATE_COOKIE, "", {
      path: "/",
      secure: true,
      sameSite: "none",
      maxAge: 0,
    })
  );

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

    if (!userInfo.openId) {
      return Response.json(
        { error: "openId missing from user info" },
        { status: 400, headers }
      );
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    headers.append(
      "set-cookie",
      serialize(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(),
        maxAge: ONE_YEAR_MS,
      })
    );
    headers.set("location", "/");
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    return Response.json(
      { error: "OAuth callback failed" },
      { status: 500, headers }
    );
  }
}
