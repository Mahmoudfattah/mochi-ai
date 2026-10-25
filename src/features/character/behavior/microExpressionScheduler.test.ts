import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMicroExpressionScheduler,
  MICRO_EXPRESSIONS,
  type MicroExpressionId,
  type VisibilitySource,
} from "./microExpressionScheduler";
import type { MochiMotionPreset } from "./motionPresets";

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function makeVisibilitySource() {
  let hidden = false;
  const listeners = new Set<() => void>();
  const source: VisibilitySource = {
    get hidden() {
      return hidden;
    },
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener);
    },
  };

  return {
    source,
    setHidden(value: boolean) {
      hidden = value;
      listeners.forEach((listener) => listener());
    },
  };
}

function makeScheduler(
  overrides: {
    state?: () => "idle" | "listening";
    reducedMotion?: () => boolean;
    visibility?: VisibilitySource;
    onMicroExpression?: (id: MicroExpressionId, durationMs: number) => void;
    random?: () => number;
    motionPreset?: MochiMotionPreset;
  } = {},
) {
  const onMicroExpression = vi.fn((id: MicroExpressionId, durationMs: number) =>
    overrides.onMicroExpression?.(id, durationMs),
  );
  const scheduler = createMicroExpressionScheduler({
    getState: overrides.state ?? (() => "idle"),
    getSize: () => "full",
    getReducedMotion: overrides.reducedMotion ?? (() => false),
    onMicroExpression,
    random: overrides.random ?? seededRandom(42),
    visibility: overrides.visibility,
    motionPreset: overrides.motionPreset,
  });

  return { scheduler, onMicroExpression };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("createMicroExpressionScheduler", () => {
  it("schedules expressions 5 to 10 seconds apart", () => {
    vi.useFakeTimers();
    const timestamps: number[] = [];
    const { scheduler } = makeScheduler({
      onMicroExpression: () => timestamps.push(Date.now()),
    });

    scheduler.start();
    vi.advanceTimersByTime(180_000);
    scheduler.stop();

    expect(timestamps.length).toBeGreaterThan(10);
    for (let index = 1; index < timestamps.length; index += 1) {
      const interval = timestamps[index] - timestamps[index - 1];
      expect(interval).toBeGreaterThanOrEqual(5000);
      expect(interval).toBeLessThanOrEqual(10000);
    }
  });

  it("uses the reference preset interval and expression durations", () => {
    vi.useFakeTimers();
    const { scheduler, onMicroExpression } = makeScheduler({
      random: () => 0,
      motionPreset: "reference",
    });

    scheduler.start();
    vi.advanceTimersByTime(5000);
    scheduler.stop();

    expect(onMicroExpression).toHaveBeenCalledWith("double-blink", 270);
  });

  it("respects the configured probability weights over many selections", () => {
    vi.useFakeTimers();
    const { scheduler, onMicroExpression } = makeScheduler({
      random: seededRandom(982451653),
    });

    scheduler.start();
    vi.advanceTimersByTime(10_000_000);
    scheduler.stop();

    const total = onMicroExpression.mock.calls.length;
    expect(total).toBeGreaterThan(1000);

    for (const expression of MICRO_EXPRESSIONS) {
      const observed =
        onMicroExpression.mock.calls.filter(([id]) => id === expression.id)
          .length / total;
      expect(observed).toBeCloseTo(expression.weight / 100, 1);
    }
  });

  it("does not run outside idle or while reduced motion is enabled", () => {
    vi.useFakeTimers();
    let state: "idle" | "listening" = "listening";
    let reducedMotion = false;
    const { scheduler, onMicroExpression } = makeScheduler({
      state: () => state,
      reducedMotion: () => reducedMotion,
    });

    scheduler.start();
    vi.advanceTimersByTime(20_000);
    expect(onMicroExpression).not.toHaveBeenCalled();

    state = "idle";
    scheduler.stop();
    const resumed = makeScheduler({
      state: () => state,
      reducedMotion: () => reducedMotion,
    });
    resumed.scheduler.start();
    vi.advanceTimersByTime(20_000);
    expect(resumed.onMicroExpression).toHaveBeenCalled();

    reducedMotion = true;
    resumed.scheduler.stop();
    const suppressed = makeScheduler({
      state: () => state,
      reducedMotion: () => reducedMotion,
    });
    suppressed.scheduler.start();
    vi.advanceTimersByTime(20_000);
    expect(suppressed.onMicroExpression).not.toHaveBeenCalled();
    suppressed.scheduler.stop();
  });

  it("pauses while the page is hidden and schedules again when visible", () => {
    vi.useFakeTimers();
    const visibility = makeVisibilitySource();
    const { scheduler, onMicroExpression } = makeScheduler({
      visibility: visibility.source,
      random: () => 0,
    });

    scheduler.start();
    vi.advanceTimersByTime(4999);
    visibility.setHidden(true);
    vi.advanceTimersByTime(20_000);
    expect(onMicroExpression).not.toHaveBeenCalled();

    visibility.setHidden(false);
    vi.advanceTimersByTime(4999);
    expect(onMicroExpression).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onMicroExpression).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });
});
