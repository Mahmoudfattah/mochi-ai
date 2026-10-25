import { describe, expect, it } from "vitest";
import { EXPRESSIONS } from "./expressions.config";
import { MOCHI_STATES } from "./types";

describe("EXPRESSIONS", () => {
  it("contains one complete expression for each unique state", () => {
    expect(Object.keys(EXPRESSIONS).sort()).toEqual([...MOCHI_STATES].sort());
    expect(new Set(MOCHI_STATES).size).toBe(MOCHI_STATES.length);

    for (const state of MOCHI_STATES) {
      const expression = EXPRESSIONS[state];
      expect(expression.tier).toBeDefined();
      expect(expression.eyes.variant).toBeDefined();
      expect(expression.eyes.opacity).toBeTypeOf("number");
      expect(expression.blushOpacity).toBeTypeOf("number");
      expect(expression.bodyTint.variant).toBeDefined();
      expect(expression.glow.color).toBeTruthy();
      expect(expression.badge.kind).toBeDefined();
      expect(expression.badge.content).toBeDefined();
      expect(expression.badge.opacity).toBeTypeOf("number");
      expect(expression.badge.scale).toBeTypeOf("number");
      expect(expression.hands.kind).toBeDefined();
      expect(expression.hands.reducedMotion).toBeTypeOf("boolean");
      expect(expression.particles).toBeTypeOf("number");
      expect(expression.rings.orbit).toBeTypeOf("number");
      expect(expression.rings.ripple).toBeTypeOf("number");
      expect(expression.pose.tilt).toBeTypeOf("number");
      expect(expression.pose.transformOrder).toBeDefined();
      expect(expression.motion.breathingAmplitude).toBeTypeOf("number");
      expect(expression.motion.periodSeconds).toBeGreaterThan(0);
      expect(expression.motion.floatDistancePx).toBeTypeOf("number");
      expect(expression.motion.easing).toBeTruthy();
    }
  });

  it("marks exactly the first sixteen expressions as core", () => {
    const core = MOCHI_STATES.filter(
      (state) => EXPRESSIONS[state].tier === "core",
    );

    expect(core).toHaveLength(16);
    expect(core).toEqual(MOCHI_STATES.slice(0, 16));
  });
});
