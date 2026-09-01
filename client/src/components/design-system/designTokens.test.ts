import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dsColors, dsRadii, dsSpacing, dsTypography } from "./tokens";
import { dsTones, toneOf, toneTokenNames } from "./tone";

const clientSrc = path.resolve(import.meta.dirname, "..", "..");
const stylesheet = path.join(clientSrc, "index.css");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(clientSrc).filter(
  file => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file)
);

/**
 * الملفات المسموح لها بقيم ألوان خام:
 * - `tokens.ts` نفسه، فهو مصدر القيم.
 * - `ui/chart.tsx`: القيم فيه محدّدات `[stroke='#ccc']` تطابق ألوان Recharts
 *   الافتراضية لتتجاوزها، وليست ألواناً تُطبَّق على الواجهة.
 * - عروض الشرائح والصفحات التسويقية السينمائية المستقلة (Slide Decks & Cinematic Intros).
 * ما عدا ذلك: أي لون جديد يجب أن يمرّ عبر رمز تصميم.
 */
const rawColorAllowList = new Set([
  path.join(clientSrc, "components", "design-system", "tokens.ts"),
  path.join(clientSrc, "components", "ui", "chart.tsx"),
  path.join(clientSrc, "components", "CinematicExecutiveIntro.tsx"),
  path.join(clientSrc, "components", "ExecutiveSlideDeck.tsx"),
  path.join(clientSrc, "pages", "ExecutiveAdvisoryBoard.tsx"),
  path.join(clientSrc, "pages", "MarketingHome.tsx"),
]);

describe("رموز التصميم", () => {
  it("تتطابق قيم tokens.ts مع متغيّرات --color-ds-* في index.css", () => {
    const css = readFileSync(stylesheet, "utf-8");
    const declared = new Map<string, string>();
    for (const match of css.matchAll(
      /--color-ds-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6});/g
    )) {
      declared.set(match[1], match[2].toLowerCase());
    }
    const fromTokens = new Map(
      Object.entries(dsColors).map(([name, value]) => [
        name,
        value.toLowerCase(),
      ])
    );
    expect(Object.fromEntries(declared)).toEqual(
      Object.fromEntries(fromTokens)
    );
  });

  it("لا تحتوي أي شاشة على قيمة لون خام خارج ملف الرموز", () => {
    const offenders = sourceFiles
      .filter(file => !rawColorAllowList.has(file))
      .map(file => ({
        file: path.relative(clientSrc, file),
        hits: readFileSync(file, "utf-8").match(/#[0-9a-fA-F]{3,8}\b/g) ?? [],
      }))
      .filter(entry => entry.hits.length > 0);
    expect(offenders).toEqual([]);
  });

  it("كل صنف ds- مستخدم في الشيفرة يشير إلى رمز معرّف فعلاً", () => {
    const used = new Set<string>();
    for (const file of sourceFiles) {
      for (const match of readFileSync(file, "utf-8").matchAll(
        /\b(?:[a-z]+-)+ds-([a-z0-9-]+)\b/g
      )) {
        used.add(match[1]);
      }
    }
    const unknown = [...used].filter(name => !(name in dsColors)).sort();
    expect(unknown).toEqual([]);
  });

  it("تغطّي الرموز السلالم الأساسية للمسافات والخطوط والحواف", () => {
    expect(Object.keys(dsSpacing).length).toBeGreaterThanOrEqual(8);
    expect(Object.keys(dsRadii)).toContain("pill");
    expect(dsTypography.fontFamily).toContain("IBM Plex Sans Arabic");
  });
});

describe("النغمات الدلالية", () => {
  it("تعرّف كل نغمة أسطحها وحدودها ونصوصها", () => {
    for (const tone of dsTones) {
      const classes = toneOf(tone);
      expect(classes.surface).toMatch(/^bg-ds-/);
      expect(classes.border).toMatch(/^border-ds-/);
      expect(classes.text).toMatch(/^text-ds-/);
      expect(toneTokenNames(tone).length).toBeGreaterThan(0);
    }
  });

  it("ترجع النغمة المحايدة افتراضياً", () => {
    expect(toneOf()).toEqual(toneOf("neutral"));
  });
});
