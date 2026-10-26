import { describe, expect, it } from "vitest";
import stageSource from "./Stage.tsx?raw";

describe("stage localization", () => {
  it("keeps Arabic UI copy in the locale dictionary", () => {
    expect(stageSource).not.toMatch(/[\u0600-\u06ff]/u);
  });
});
