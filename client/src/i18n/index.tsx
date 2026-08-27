import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const supportedLocales = ["ar-SA", "en"] as const;
export type AppLocale = (typeof supportedLocales)[number];
export type TextDirection = "rtl" | "ltr";

const localeStorageKey = "hrhbs-locale";

const messages = {
  "ar-SA": {
    "common.loading": "جارٍ تحميل الصفحة…",
    "common.available": "المنصة متاحة",
    "common.switchLanguage": "تغيير اللغة",
  },
  en: {
    "common.loading": "Loading page…",
    "common.available": "Platform available",
    "common.switchLanguage": "Change language",
  },
} as const;

export type TranslationKey = keyof (typeof messages)["ar-SA"];

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && supportedLocales.includes(value as AppLocale));
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isSupportedLocale(value) ? value : "ar-SA";
}

export function directionForLocale(locale: AppLocale): TextDirection {
  return locale === "ar-SA" ? "rtl" : "ltr";
}

export function messageFor(locale: AppLocale, key: TranslationKey): string {
  return messages[locale][key];
}

type I18nValue = {
  locale: AppLocale;
  direction: TextDirection;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function getStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "ar-SA";
  try {
    return resolveLocale(window.localStorage.getItem(localeStorageKey));
  } catch {
    return "ar-SA";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(getStoredLocale);
  const direction = directionForLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale === "ar-SA" ? "ar" : "en";
    document.documentElement.dir = direction;
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // Local storage is optional for this client-side preference.
    }
  }, [direction, locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    direction,
    setLocale,
    t: key => messageFor(locale, key),
  }), [direction, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
