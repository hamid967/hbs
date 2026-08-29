import { AsyncLocalStorage } from "node:async_hooks";
import type { Connection } from "mysql2/promise";
import type { MySql2Database } from "drizzle-orm/mysql2";

/**
 * حالة قاعدة البيانات لكل طلب — يُنشأ اتصال Hyperdrive واحد فعلياً عند أول
 * استدعاء لـ getDb() داخل الطلب، ويُذكَّر (memoized) للاستدعاءات اللاحقة في
 * الطلب نفسه، ثم يُغلَق صراحة بعد إرسال الاستجابة. التجمّع (pooling) الفعلي
 * تديره Hyperdrive في الطرف الآخر؛ إنشاء تجمّع محلي هنا مضاد للنمط الموصى به
 * على Workers.
 */
export type RequestStore = {
  connectionString: string;
  db?: MySql2Database<Record<string, never>> | null;
  connection?: Connection;
};

export const requestContext = new AsyncLocalStorage<RequestStore>();

export function runWithRequestContext<T>(
  connectionString: string,
  fn: () => T | Promise<T>
) {
  return requestContext.run({ connectionString }, fn);
}
