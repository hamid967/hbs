export const parseAllowedOrigins = (raw: string) => raw.split(",").map(value => value.trim()).filter(value => {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.origin === value && !url.username && !url.password;
  } catch {
    return false;
  }
});

const env = {
  appId: process.env.VITE_APP_ID || "c83c8f33-b222-4837-97d1-7153ca880e66",
  cookieSecret: process.env.JWT_SECRET || "hbs-studio-secret-jwt-token-2026-auth-session-key",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  localAccessAllowedOrigins: parseAllowedOrigins(process.env.LOCAL_ACCESS_ALLOWED_ORIGINS ?? ""),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // ناقل البريد: خطّاف HTTP عام. بدونه تعمل المصادقة بوضع "مسوّدة" ولا تُرسل رسائل.
  mailWebhookUrl: process.env.MAIL_WEBHOOK_URL ?? "",
  mailWebhookToken: process.env.MAIL_WEBHOOK_TOKEN ?? "",
  mailFromAddress: process.env.MAIL_FROM_ADDRESS ?? "no-reply@hrhbs.com",
};

export const ENV = env;
