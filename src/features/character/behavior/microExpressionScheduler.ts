import type { MochiSize, MochiState } from "../types";
import {
  DEFAULT_MOCHI_MOTION_PRESET,
  MOTION_PRESETS,
  type MicroExpressionId,
  type MochiMotionPreset,
  type MicroExpressionConfig,
} from "./motionPresets";

export { type MicroExpressionId } from "./motionPresets";
export const MICRO_EXPRESSIONS =
  MOTION_PRESETS[DEFAULT_MOCHI_MOTION_PRESET].microExpressions;
export type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

export interface TimerSource {
  setTimeout(callback: () => void, delayMs: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

export interface VisibilitySource {
  readonly hidden: boolean;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
}

export interface MicroExpressionSchedulerOptions {
  getState(): MochiState;
  getSize(): MochiSize;
  getReducedMotion(): boolean;
  onMicroExpression(id: MicroExpressionId, durationMs: number): void;
  timer?: TimerSource;
  random?: () => number;
  visibility?: VisibilitySource;
  motionPreset?: MochiMotionPreset;
  minimumIntervalMs?: number;
  maximumIntervalMs?: number;
}

export interface MicroExpressionScheduler {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

const defaultTimer: TimerSource = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle),
};

function chooseMicroExpression(
  random: () => number,
  expressions: readonly MicroExpressionConfig[],
): MicroExpressionId {
  const value = Math.max(0, Math.min(0.999999999, random())) * 100;
  let cumulativeWeight = 0;

  for (const expression of expressions) {
    cumulativeWeight += expression.weight;
    if (value < cumulativeWeight) {
      return expression.id;
    }
  }

  return expressions[expressions.length - 1].id;
}

export function createMicroExpressionScheduler(
  options: MicroExpressionSchedulerOptions,
): MicroExpressionScheduler {
  const timer = options.timer ?? defaultTimer;
  const random = options.random ?? Math.random;
  const visibility = options.visibility;
  const motionConfig =
    MOTION_PRESETS[options.motionPreset ?? DEFAULT_MOCHI_MOTION_PRESET];
  const expressions = motionConfig.microExpressions;
  const minimumIntervalMs =
    options.minimumIntervalMs ?? motionConfig.minimumIntervalMs;
  const maximumIntervalMs =
    options.maximumIntervalMs ?? motionConfig.maximumIntervalMs;
  let timeout: TimerHandle | undefined;
  let running = false;
  let paused = false;

  const isEligible = () =>
    running &&
    !paused &&
    options.getState() === "idle" &&
    options.getSize() === "full" &&
    !options.getReducedMotion() &&
    !visibility?.hidden;

  const clearScheduled = () => {
    if (timeout !== undefined) {
      timer.clearTimeout(timeout);
      timeout = undefined;
    }
  };

  const schedule = () => {
    clearScheduled();
    if (!isEligible()) return;

    const interval =
      minimumIntervalMs + random() * (maximumIntervalMs - minimumIntervalMs);

    timeout = timer.setTimeout(() => {
      timeout = undefined;
      if (!isEligible()) return;
      const id = chooseMicroExpression(random, expressions);
      const expression = expressions.find((item) => item.id === id);
      if (!expression) return;
      const durationMs = expression.durationMs;
      options.onMicroExpression(id, durationMs);
      schedule();
    }, interval);
  };

  const onVisibilityChange = () => {
    if (visibility?.hidden) {
      paused = true;
      clearScheduled();
    } else {
      paused = false;
      schedule();
    }
  };

  return {
    start() {
      if (running) return;
      running = true;
      visibility?.addEventListener("visibilitychange", onVisibilityChange);
      schedule();
    },
    pause() {
      paused = true;
      clearScheduled();
    },
    resume() {
      paused = false;
      schedule();
    },
    stop() {
      running = false;
      clearScheduled();
      visibility?.removeEventListener("visibilitychange", onVisibilityChange);
    },
  };
}
