# الانتقال إلى Cloudflare Workers

توثيق إعادة بناء طبقة النقل بالكامل لتشغيل HBS كـWorker حقيقي على Cloudflare
(`wrangler deploy`)، بدل خادم Express/Node التقليدي.

---

## ١. لماذا هذا تعديل كامل لا إصلاح بناء

مشروع Cloudflare Workers باسم `hbs` كان مربوطاً بالمستودع عبر لوحة Cloudflare
(build: `pnpm run build`، deploy: `npx wrangler deploy`)، لكن كل بناء كان يفشل:
لا `wrangler.jsonc` في المستودع إطلاقاً، والخادم القائم مبني بالكامل على Express
— نموذج Node التقليدي بمقبس استماع (`server.listen(port)`) — بينما Workers يُصدِّر
دالة `fetch(request, env, ctx)` بلا مقبس استماع وبلا Node TCP خام. لا يوجد تدرّج
بين النموذجين: الاستماع على مقبس، وقراءة `DATABASE_URL` كسلسلة اتصال TCP خام
عبر `mysql2`، كلاهما لا معنى له في بيئة Workers.

---

## ٢. القرار المعماري الحاسم: AsyncLocalStorage بدل تمرير السياق يدوياً

الفحص كشف أن **165 دالة مُصدَّرة في `server/db.ts`، منها 145 تستدعي `getDb()`
بلا وسائط مطلقاً**، عبر 27 ملفاً منتِجاً (24 راوتراً + `oauth.ts`/`sdk.ts`/
`systemRouter.ts`). الحل الساذج — تمرير اتصال Hyperdrive صراحةً كوسيط في كل
دالة — كان يعني تعديل تلك الملفات الـ27 جميعها، وهو تعديل ضخم عالي الخطورة
لمنتج يخدم مستخدمين حقيقيين.

البديل المعتمد: **`AsyncLocalStorage`** (من `node:async_hooks`)، مدعومة رسمياً
في Workers وموصى بها تحديداً لهذه المسألة — تمرير قيمة لكل طلب عبر عمق استدعاء
عشوائي دون تعديل توقيع أي دالة. `server/_core/requestContext.ts` (جديد) يحمل
مخزناً لكل طلب؛ `worker.ts` يفتحه عند بداية كل طلب بسلسلة اتصال Hyperdrive؛
و`getDb()` وحدها تغيّرت — لا شيء آخر في `db.ts` ولا في الملفات الـ27 يلمسها.

```ts
export async function getDb() {
  const store = requestContext.getStore();
  if (store) {
    // اتصال واحد فعلي لكل طلب، مذكَّر لبقية استدعاءات الطلب نفسه
    if (store.db !== undefined) return store.db;
    store.connection = await createConnection(store.connectionString);
    store.db = drizzle(store.connection);
    return store.db;
  }
  // سقوط احتياطي: خارج نطاق Workers (اختبارات Node) — السلوك القديم حرفياً
  ...
}
```

اتصال حقيقي واحد (`mysql2/promise`'s `createConnection`، **وليس** `createPool`
— التجمّع الفعلي تديره Hyperdrive في الطرف الآخر) يُنشأ عند أول استدعاء لكل
طلب، ويُغلَق صراحة بعد الاستجابة عبر `ctx.waitUntil`.

**استثناء واحد موثّق:** `server/approvalWorkflow.integration.test.ts` يستدعي
دوال `db.ts` مباشرة بلا سياق طلب، معتمداً على `process.env.DATABASE_URL` +
متغيّر ثابت طوال عمر العملية. هذا مسار اختبار Node بحت — `getDb()` تدعم هذا
المسار كسقوط احتياطي حين لا يوجد مخزن ALS، فيبقى هذا الاختبار يعمل دون تعديل.

---

## ٣. حقيقة منصّية غيّرت حجم التعديل: `process.env` تُملأ تلقائياً

بحث مباشر في سجلات تغييرات Cloudflare أكّد: **`process.env` يُملأ تلقائياً من
متغيّرات (`vars`) وأسرار (`secrets`) الـWorker** متى فُعِّل `nodejs_compat`
بتاريخ توافق حديث. هذا يعني **`server/_core/env.ts` لم يحتَج أي تعديل** — يبقى
يقرأ `process.env.X` تماماً كما كان، طالما `wrangler.jsonc` يعرّف المتغيّرات
المطابقة. الشاهد العملي: عند تشغيل `wrangler dev` محلياً ظهر في السجل
`[OAuth] Initialized with baseURL: ...` بالقيمة المضبوطة في `vars` — تأكيد
مباشر لا نظري.

---

## ٤. تجزئة كلمات المرور: PBKDF2 استباقياً

`server/localCredentials.ts` كان يستخدم `node:crypto`'s `scrypt`، الذي لم يكن
توافقه مع Workers مؤكَّداً وقت اتخاذ القرار. بقرار المستخدم: تبديل استباقي إلى
**PBKDF2-HMAC-SHA256 عبر `crypto.subtle`** (WebCrypto قياسي، بلا أي مخاطرة
توافق منصّة) لكل تجزئة جديدة، بصيغة `pbkdf2$<iterations>$<saltHex>$<hashHex>`،
مع **إبقاء التحقق من تجزئات scrypt القديمة يعمل** لحسابات المستخدمين الحاليين
— لا حذف، لا إجبار على إعادة تعيين جماعية.

**600,000 تكرار** (توصية OWASP الحالية) — قياس فعلي: **~285 مللي ثانية معالجة
لكل عملية**، مؤكَّدة آمنة بعد تحديد **خطة Workers Paid** (حدّ CPU قابل للضبط
حتى ثوانٍ، بخلاف الخطة المجانية ذات الحدّ الافتراضي الضيّق جداً).

اختبار انحدار صريح في `server/localCredentials.test.ts` يتحقق من أن تجزئة
scrypt **حقيقية** (وليست وهمية — أُنشئت فعلياً بالخوارزمية القديمة) لا تزال
تُتحقَّق بنجاح.

---

## ٥. التوجيه: لماذا لا `not_found_handling: "single-page-application"`

خيار Workers Assets هذا كان سيبدو الحل الطبيعي لسقوط SPA — لكنه كان سيُقدِّم
`index.html` مباشرة لكل مسار غير مطابق لملف ثابت، **بما فيها `/api/trpc/*`
و`/api/oauth/callback` و`/manus-storage/*`**، فلا تصل دالة `fetch()` في
الـWorker إليها إطلاقاً ويتعطّل الـAPI **بصمت**. التصميم المعتمد: `not_found_
handling: "none"`، مع توجيه وسقوط SPA يدويين داخل `worker.ts` نفسها — تحقّق كل
مسار API صراحةً أولاً، ثم يُستدعى `env.ASSETS.fetch()` وسقوطه إلى `index.html`
فقط لما تبقّى.

---

## ٦. ما تغيّر وما لم يتغيّر

**ملفات جديدة:** `server/_core/worker.ts` (مدخل Workers)، `server/_core/
requestContext.ts` (مخزن ALS)، `server/_core/httpTypes.ts` (نوع طلب مبسّط)،
`wrangler.jsonc`.

**مُعدَّلة:**
- `server/_core/context.ts` — محوّل fetch بدل Express؛ `res.cookie`/
  `clearCookie` تُلحِق بترويسات `resHeaders` القابلة للتعديل التي يوفّرها محوّل
  fetch مباشرة (لا حاجة لبناء `Response` يدوياً).
- `server/_core/cookies.ts` — مبسّط: Workers دائماً HTTPS، لا حاجة لفحص
  `x-forwarded-proto`.
- `server/_core/oauth.ts` و`storageProxy.ts` — من مسارات Express إلى دوال
  `Request → Response` مستقلة. المنطق الداخلي لم يتغيّر، فقط واجهة الاستقبال.
- `server/_core/sdk.ts` و`server/mail.ts` — استبدال axios بـfetch القياسي (3
  نداءات في sdk.ts، نداء واحد في mail.ts). بخلاف axios، fetch لا يرمي تلقائياً
  عند استجابة غير ناجحة؛ كل موضع يفحص `response.ok` صراحةً الآن.
- `server/db.ts` — `getDb()` فقط، كما وُصف أعلاه.
- `package.json` — `build` أصبح `vite build` فقط (Wrangler يبني الـWorker
  بأدواته الداخلية من `main`)؛ `dev`/`dev:client`/`dev:worker` جديدة؛ حُذفت
  `express`/`axios`/`dotenv`/`@types/express`/`esbuild`؛ أُضيفت `wrangler`/
  `@cloudflare/workers-types`.
- `playwright.config.ts` — `webServer` يبني العميل ثم يشغّل `wrangler dev
  --port` (كان `pnpm dev` عبر Express)؛ متغيّرات `VITE_*` تُخبَز عند البناء لا
  عند التشغيل، لأن `wrangler dev` يُقدِّم أصولاً مبنية مسبقاً، لا خادم Vite حياً.

**محذوفة:** `server/_core/index.ts` (Express بالكامل)، `server/_core/vite.ts`
(تقديم الملفات الثابتة ينتقل لربط Workers Assets)، `server/_core/vite.test.ts`.

**بلا تغيير منطقي:** `server/_core/trpc.ts`، `server/_core/notification.ts`،
`server/_core/env.ts`، `server/_core/heartbeat.ts`/`tenancy.ts`، `server/_core/
systemRouter.ts`، `vite.config.ts`، `drizzle.config.ts` (أداة CLI محلية)،
`server/routers.ts`، `server/routers/localAccess.ts` (يُصرَّف بأنواع جديدة
فقط)، بقية الراوترات الـ24، وكل الـ145 موضع استدعاء `getDb()`.

### عثرة جانبية أُصلحت في الطريق

ملف `server/_core/types/cookie.d.ts` كان يحمل تصريحاً وهمياً قديماً
(`declare module "cookie" { export function parse... }`) يعود لزمن كانت فيه
حزمة `cookie` بلا أنواع خاصة بها. هذا التصريح كان **يُظلِّل** أنواع الحزمة
الحقيقية المثبَّتة (`cookie@1.0.2`، التي تصدّر `serialize`/`SerializeOptions`
بشكل كامل وصحيح)، فيمنع أي استخدام لـ`serialize` في كل المشروع. حُذف الملف —
لم يعد له مبرر.

---

## ٧. التحقق — الحقيقي، لا الافتراضي

`pnpm check` **يستثني `**/*.test.ts` من فحص الأنواع بحكم `tsconfig.json`** —
لا يمكن الاعتماد عليه لكشف كسر أنواع ملفات الاختبار (خطأ في تخطيط سابق صُحِّح
أثناء التنفيذ). التحقق الفعلي جرى بتشغيل `pnpm test` كاملاً بعد كل تعديل جوهري.

**محلياً، بلا أي وصول لحساب Cloudflare:**
```
pnpm check      # ✓ نظيف على مستوى المشروع
pnpm test       # ✓ 272 اختباراً في 67 ملفاً
pnpm build      # ✓ dist/public فقط (لا dist/index.js بعد الآن)
```

**`wrangler deploy --dry-run`** — يبني `worker.ts` وكل ما يستورده بأدوات
Wrangler الحقيقية (esbuild الداخلي)، يقرأ `wrangler.jsonc` بتعليقاته، يحلّ
مجلد الأصول، ويسرد كل الروابط (bindings) بنجاح — دون نشر فعلي.

**`wrangler dev` شُغِّل فعلياً محلياً** (بلا حساب Cloudflare — `hyperdrive[].
localConnectionString` يتجاوز الحاجة لـHyperdrive حي تماماً، تحقّقنا من هذا
عملياً: بلا `localConnectionString` يرفض Wrangler البدء فوراً محلياً بخطأ
تشخيصي واضح، لا بمحاولة اتصال شبكي) وفُحص بطلبات HTTP حقيقية:

| الطلب | النتيجة |
| --- | --- |
| `GET /` | 200، `index.html` |
| `GET /app/مسار-غير-موجود` | 200، سقوط SPA يعمل |
| `GET /assets/*.js` | 200، محتوى ثابت صحيح |
| `POST /api/trpc/system.health` | استجابة tRPC صحيحة |
| `GET /api/trpc/auth.me` (بلا جلسة) | `null` كما هو متوقَّع |
| `POST /api/trpc/localAccess.login` (لا قاعدة بيانات فعلية) | 401 برسالة عربية صحيحة — لا انهيار |
| `GET /manus-storage/*` (forge غير مضبوط) | 500 برسالة واضحة — لا انهيار |
| `GET /api/oauth/callback` (بلا معاملات) | 400 JSON — لا انهيار |

كل مسارات الفشل تتدهور بأمان بالضبط كالتصميم المقصود — لا انهيار غير معالَج
في أي منها.

**اختبارات e2e الفعلية** عبر `playwright.config.ts` المُعدَّل: **5 من 6
نجحت**. الفشل الوحيد (`page.goto("/subscribe", { waitUntil: "load" })`) يطابق
تماماً قيداً معروفاً مسبقاً في بيئة التطوير هذه (حجب شبكي لمورد خارجي يمنع
حدث `load` من الاكتمال) — وقد وُثِّق هذا القيد سابقاً لنفس الصفحة تحت الخادم
القديم أيضاً. أُعيد التأكد بـ`waitUntil: "domcontentloaded"`: الصفحة تُعرَض
بصورة صحيحة كاملة. ليس انحداراً من هذا الترحيل.

**`pnpm install --frozen-lockfile` من الصفر** (محاكاة دقيقة لـCI) يبني حزمتي
`workerd`/`esbuild` تلقائياً عبر `pnpm.onlyBuiltDependencies` في
`package.json` دون أي خطوة يدوية إضافية — **لا حاجة لتعديل ملف CI الحالي**
(`.github/workflows/webpack.yml`) إطلاقاً.

---

## ٨. ما يحتاج إجراءً يدوياً من المستخدم (لا يمكن تنفيذه من جلسة العمل)

الجلسة لا تملك صلاحية Cloudflare API/CLI — لا يمكنها تسجيل الدخول أو تزويد
موارد حساب فعلي. الخطوات التالية على المستخدم قبل نشر حقيقي:

1. `wrangler login`.
2. `wrangler hyperdrive create <name> --connection-string="mysql://..."` نحو
   مضيف MySQL الفعلي في الإنتاج — التقاط الـ`id` الناتج ووضعه في
   `wrangler.jsonc` (حالياً قيمة نائبة `<من wrangler hyperdrive create>`).
3. التأكد أن مضيف MySQL قابل للوصول شبكياً من Hyperdrive (ليس خلف جدار VPC
   خاص إلا عبر Cloudflare Tunnel).
4. `wrangler secret put JWT_SECRET` و`BUILT_IN_FORGE_API_KEY` و
   `MAIL_WEBHOOK_URL` و`MAIL_WEBHOOK_TOKEN` — لا تُكتب هذه في `wrangler.jsonc`
   إطلاقاً.
5. استبدال القيم النائبة الأخرى في `wrangler.jsonc`'s `vars` (`VITE_APP_ID`،
   `OAUTH_SERVER_URL`، `OWNER_OPEN_ID`، `LOCAL_ACCESS_ALLOWED_ORIGINS`،
   `BUILT_IN_FORGE_API_URL`، `HRHBS_ADMIN_EMAIL`) بالقيم الفعلية.
6. تشغيل بناء لوحة Cloudflare المُعدّ مسبقاً (أو `wrangler deploy` مباشرة).
7. **اختبار قبول ما بعد النشر — الأهم:** تسجيل دخول مستخدم موجود قبل الترحيل
   (يتحقق من مسار scrypt القديم فعلياً تحت وقت تشغيل Workers الحقيقي — اختبار
   الوحدة ضروري لكن غير كافٍ وحده)، إضافة لتسجيل جديد (PBKDF2)، رد نداء
   OAuth، رفع/تنزيل ملف عبر `/manus-storage/*`، و`systemRouter.
   operationalStatus` (يفحص Hyperdrive كاملاً).
8. `wrangler tail` أثناء أول نافذة استخدام حقيقي، مع انتباه خاص لأي "Exceeded
   CPU limit" أو أخطاء اتصال Hyperdrive.

---

## ٩. ما تُرك عمداً خارج هذا الترحيل

- **لا HMR حي للعميل بعد الآن.** `wrangler dev` يُعيد تحميل شيفرة الـWorker
  فقط، ويُقدِّم `dist/public` كملفات مبنية مسبقاً. تطوير العميل محلياً يحتاج
  سكربتين متوازيين (`pnpm dev:client` يبني بمراقبة، `pnpm dev:worker` يشغّل
  الـWorker) بدل حلقة واحدة حية كما كانت. `@cloudflare/vite-plugin` الرسمي قد
  يعيد HMR الموحّد لاحقاً — لم يُدمَج هنا، خارج نطاق هذا الترحيل.
- **`@aws-sdk/client-s3`/`@aws-sdk/s3-request-presigner`** ما زالتا في
  `package.json` رغم تأكّد أنهما غير مستخدَمتين إطلاقاً في الشيفرة الفعلية —
  لم تُحذفا لأن ذلك خارج نطاق ما وافق عليه المستخدم لهذا الترحيل تحديداً.
- **الوضع الجديد لا يدعم استضافة Node موازية.** بقرار المستخدم: Workers هي
  الوجهة الوحيدة. `getDb()` تحتفظ بمسار احتياطي واحد فقط لأجل اختبارات Node
  المحلية، لا كاستضافة إنتاج بديلة.
