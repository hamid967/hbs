import { describe, expect, it } from "vitest";
import { reactPrebundleDependencies, reactRuntimeDedupe } from "../vite.config";

describe("React runtime resolution", () => {
  it("dedupes React and React DOM for all Vite dependencies", () => {
    expect(reactRuntimeDedupe).toEqual(["react", "react-dom"]);
  });

  it("prebundles the DropdownMenu dependency with the shared React runtime", () => {
    expect(reactPrebundleDependencies).toContain("@radix-ui/react-dropdown-menu");
  });
});
