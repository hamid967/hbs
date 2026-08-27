import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflowPath = path.resolve(import.meta.dirname, "../.github/workflows/deno.yml");
const workflow = fs.readFileSync(workflowPath, "utf-8");

describe("Deno workflow scope", () => {
  it("runs only when Deno sources or its own workflow change", () => {
    expect(workflow).toContain('paths:\n      - "deno/**"');
    expect(workflow).toContain('- ".github/workflows/deno.yml"');
  });

  it("discovers explicit Deno targets instead of linting the Node application root", () => {
    expect(workflow).toContain("find deno -type f");
    expect(workflow).toContain('deno lint "${deno_sources[@]}"');
    expect(workflow).not.toContain("run: deno lint\n");
  });
});
