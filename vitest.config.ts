import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  // JSX في الاختبارات كان يتطلب `import React` يدوياً في كل ملف لأن vitest
  // لا يمرّ بإضافة react الخاصة بـvite. تشغيل الوقت التلقائي هنا يطابق سلوك
  // البناء ويمنع أخطاء "React is not defined" في اختبارات المكوّنات.
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.ts", "client/**/*.test.tsx", "client/**/*.spec.ts", "client/**/*.spec.tsx"],
  },
});
