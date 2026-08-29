/**
 * تمثيل بسيط للطلب مقصور على ما تحتاجه المصادقة والسياسات — كائن ترويسات عادي
 * بمفاتيح صغيرة الحروف (وليس Headers من Fetch API) حتى يقرأ sdk.ts وملفات
 * الراوترات ترويسات مثل ctx.req.headers.cookie أو ctx.req.headers.origin
 * كخاصية عادية، تماماً كما كانت تفعل مع Request من Express.
 */
export type TrpcRequest = { headers: Record<string, string>; ip?: string };
