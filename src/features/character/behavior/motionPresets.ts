export type MochiMotionPreset = "spec" | "reference";

export type MicroExpressionId =
  | "double-blink"
  | "look-left"
  | "look-right"
  | "deep-breath"
  | "wink"
  | "jelly"
  | "micro-happy";

export interface MicroExpressionConfig {
  id: MicroExpressionId;
  weight: number;
  durationMs: number;
}

interface MotionPresetConfig {
  minimumIntervalMs: number;
  maximumIntervalMs: number;
  microExpressions: readonly MicroExpressionConfig[];
  doubleBlink: {
    durationMs: number;
    closedScaleY: number;
    transitionDurationMs: number;
    transitionEasing: string;
  };
  wink: {
    durationMs: number;
    tiltDegrees: number;
    easing: string;
  };
  look: {
    durationMs: number;
    horizontalOffsetPx: number;
    verticalOffsetPx: number;
    tiltDegrees: number;
    easing: string;
  };
  deepBreath: {
    durationMs: number;
    risePx: number;
    scaleX: number;
    scaleY: number;
    eyeScaleY: number;
    easing: string;
  };
  jelly: {
    durationMs: number;
    peakScaleX: number;
    peakScaleY: number;
    settleScaleX: number;
    settleScaleY: number;
    easing: string;
  };
  microHappy: {
    durationMs: number;
    easing: string;
  };
}

const sharedMicroExpressions = [
  { id: "double-blink", weight: 35 },
  { id: "look-left", weight: 12.5 },
  { id: "look-right", weight: 12.5 },
  { id: "deep-breath", weight: 15 },
  { id: "wink", weight: 10 },
  { id: "jelly", weight: 10 },
  { id: "micro-happy", weight: 5 },
] as const;

export const REFERENCE_DOUBLE_BLINK_PHASES_MS = [90, 180, 270] as const;

function createMotionPreset(
  config: Omit<MotionPresetConfig, "microExpressions">,
): MotionPresetConfig {
  return {
    ...config,
    microExpressions: sharedMicroExpressions.map(({ id, weight }) => ({
      id,
      weight,
      durationMs:
        id === "double-blink"
          ? config.doubleBlink.durationMs
          : id === "look-left" || id === "look-right"
            ? config.look.durationMs
            : id === "deep-breath"
              ? config.deepBreath.durationMs
              : id === "wink"
                ? config.wink.durationMs
                : id === "jelly"
                  ? config.jelly.durationMs
                  : config.microHappy.durationMs,
    })),
  };
}

export const MOTION_PRESETS = {
  spec: createMotionPreset({
    minimumIntervalMs: 5000,
    maximumIntervalMs: 10000,
    doubleBlink: {
      durationMs: 380,
      closedScaleY: 0.08,
      transitionDurationMs: 65,
      transitionEasing: "ease",
    },
    wink: { durationMs: 950, tiltDegrees: 4.5, easing: "ease-in-out" },
    look: {
      durationMs: 1600,
      horizontalOffsetPx: 6,
      verticalOffsetPx: -1,
      tiltDegrees: 1.5,
      easing: "ease-in-out",
    },
    deepBreath: {
      durationMs: 2200,
      risePx: -9,
      scaleX: 1.05,
      scaleY: 0.96,
      eyeScaleY: 0.45,
      easing: "ease-in-out",
    },
    jelly: {
      durationMs: 800,
      peakScaleX: 1.06,
      peakScaleY: 0.94,
      settleScaleX: 0.98,
      settleScaleY: 1.03,
      easing: "ease-out",
    },
    microHappy: { durationMs: 1200, easing: "ease-in-out" },
  }),
  reference: createMotionPreset({
    minimumIntervalMs: 5000,
    maximumIntervalMs: 9800,
    doubleBlink: {
      durationMs: 270,
      closedScaleY: 0.08,
      transitionDurationMs: 65,
      transitionEasing: "ease",
    },
    wink: { durationMs: 980, tiltDegrees: 4.5, easing: "ease-in-out" },
    look: {
      durationMs: 1500,
      horizontalOffsetPx: 7,
      verticalOffsetPx: -1,
      tiltDegrees: 2,
      easing: "ease-in-out",
    },
    deepBreath: {
      durationMs: 1400,
      risePx: -9,
      scaleX: 1.05,
      scaleY: 0.96,
      eyeScaleY: 0.45,
      easing: "ease-in-out",
    },
    jelly: {
      durationMs: 320,
      peakScaleX: 1.06,
      peakScaleY: 0.94,
      settleScaleX: 0.98,
      settleScaleY: 1.03,
      easing: "ease-out",
    },
    microHappy: { durationMs: 1200, easing: "ease-in-out" },
  }),
} as const satisfies Record<MochiMotionPreset, MotionPresetConfig>;

export const POINTER_FOLLOW_CONFIG = {
  maxHorizontalOffsetPx: 8,
  maxVerticalOffsetPx: 5,
  maxTiltDegrees: 2.5,
  neutralOffsetPx: 0,
  neutralTiltDegrees: 0,
  transitionDurationMs: 320,
  transitionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const DEFAULT_MOCHI_MOTION_PRESET: MochiMotionPreset = "spec";
