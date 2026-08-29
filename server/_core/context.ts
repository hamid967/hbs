import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { serialize, type SerializeOptions } from "cookie";
import type { User } from "../../drizzle/schema";
import type { TrpcRequest } from "./httpTypes";
import { sdk } from "./sdk";

/**
 * بديل res.cookie/res.clearCookie من Express. تُلحَق قيم Set-Cookie بترويسات
 * الاستجابة (resHeaders) التي يطبّقها محوّل fetch تلقائياً على الاستجابة
 * الصادرة — لا حاجة لبناء Response يدوياً هنا.
 */
export type TrpcResponse = {
  cookie: (name: string, value: string, options: SerializeOptions) => void;
  clearCookie: (name: string, options: SerializeOptions) => void;
};

export type TrpcContext = {
  req: TrpcRequest;
  res: TrpcResponse;
  user: User | null;
};

function toHeaderRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const req: TrpcRequest = {
    headers: toHeaderRecord(opts.req.headers),
    ip: opts.req.headers.get("cf-connecting-ip") ?? undefined,
  };
  const res: TrpcResponse = {
    cookie: (name, value, options) =>
      opts.resHeaders.append("set-cookie", serialize(name, value, options)),
    clearCookie: (name, options) =>
      opts.resHeaders.append(
        "set-cookie",
        serialize(name, "", { ...options, maxAge: 0, expires: new Date(0) })
      ),
  };

  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return { req, res, user };
}
