import { describe, expect, it } from "vitest";
import { defaultConfig } from "./defaultConfig";

describe("defaultConfig", () => {
  it("provides valid foundation defaults", () => {
    expect(defaultConfig.persona.name.trim()).not.toBe("");
    expect(defaultConfig.quietHours.start).toMatch(
      /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    );
    expect(defaultConfig.quietHours.end).toMatch(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
    expect(defaultConfig.weeklyDaysOff.length).toBeGreaterThan(0);
    expect(defaultConfig.weeklyDaysOff).toContain("fri");
  });
});
