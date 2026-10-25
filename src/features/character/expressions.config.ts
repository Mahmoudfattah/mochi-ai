import type { MochiState } from "./types";

export type EyeVariant = "round" | "happy" | "flat" | "sleepy";
export type TintVariant = "blue" | "purple" | "amber" | "slate" | "none";

export interface ExpressionConfig {
  tier: "core" | "extended";
  eyes: {
    variant: EyeVariant;
    leftScale: number;
    rightScale: number;
    opacity: number;
  };
  blushOpacity: number;
  bodyTint: {
    variant: TintVariant;
    opacity: number;
  };
  glow: {
    color: string;
    opacity: number;
  };
  badge: {
    kind: "none" | "pill" | "circle";
    color: string;
    content: "none" | "dots" | "!";
    opacity: number;
    scale: number;
  };
  hands: {
    kind: "none" | "both" | "right";
    opacity: number;
    reducedMotion: boolean;
  };
  particles: number;
  rings: {
    orbit: number;
    ripple: number;
    ripplePeriodSeconds: number;
  };
  pose: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    tilt: number;
    transformOrder: "translate-rotate" | "rotate-translate";
  };
  face: {
    x: number;
    y: number;
  };
  motion: {
    breathingAmplitude: number;
    periodSeconds: number;
    floatDistancePx: number;
    easing: string;
  };
  audioReactive: boolean;
}

type ExpressionOverrides = Partial<
  Omit<
    ExpressionConfig,
    | "eyes"
    | "bodyTint"
    | "glow"
    | "badge"
    | "hands"
    | "rings"
    | "pose"
    | "face"
    | "motion"
  >
> & {
  eyes?: Partial<ExpressionConfig["eyes"]>;
  bodyTint?: Partial<ExpressionConfig["bodyTint"]>;
  glow?: Partial<ExpressionConfig["glow"]>;
  badge?: Partial<ExpressionConfig["badge"]>;
  hands?: Partial<ExpressionConfig["hands"]>;
  rings?: Partial<ExpressionConfig["rings"]>;
  pose?: Partial<ExpressionConfig["pose"]>;
  face?: Partial<ExpressionConfig["face"]>;
  motion?: Partial<ExpressionConfig["motion"]>;
};

const makeExpression = (
  tier: ExpressionConfig["tier"],
  overrides: ExpressionOverrides = {},
): ExpressionConfig => ({
  tier,
  eyes: {
    variant: "round",
    leftScale: 1,
    rightScale: 1,
    opacity: 1,
    ...overrides.eyes,
  },
  blushOpacity: overrides.blushOpacity ?? 0.12,
  bodyTint: {
    variant: "none",
    opacity: 0,
    ...overrides.bodyTint,
  },
  glow: { color: "#93C5FD", opacity: 0.08, ...overrides.glow },
  badge: {
    kind: "none",
    color: "#2589FF",
    content: "none",
    opacity: 0,
    scale: 1,
    ...overrides.badge,
  },
  hands: {
    kind: "none",
    opacity: 0,
    reducedMotion: false,
    ...overrides.hands,
  },
  particles: overrides.particles ?? 0,
  rings: {
    orbit: 0,
    ripple: 0,
    ripplePeriodSeconds: 1.6,
    ...overrides.rings,
  },
  pose: {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    tilt: 0,
    transformOrder: "translate-rotate",
    ...overrides.pose,
  },
  face: { x: 0, y: 0, ...overrides.face },
  motion: {
    breathingAmplitude: 0.018,
    periodSeconds: 4,
    floatDistancePx: -6,
    easing: "ease-in-out",
    ...overrides.motion,
  },
  audioReactive: overrides.audioReactive ?? false,
});

const pill = (color: string) => ({
  kind: "pill" as const,
  color,
  content: "dots" as const,
  opacity: 1,
  scale: 1,
});

const circle = (color: string) => ({
  kind: "circle" as const,
  color,
  content: "!" as const,
  opacity: 1,
  scale: 1,
});

export const EXPRESSIONS: Record<MochiState, ExpressionConfig> = {
  idle: makeExpression("core", {
    glow: { color: "#FFFFFF", opacity: 0.08 },
    blushOpacity: 0.12,
    motion: {
      breathingAmplitude: 0.02,
      periodSeconds: 4,
      floatDistancePx: -6,
      easing: "ease-in-out",
    },
  }),
  "waiting-permission": makeExpression("core", {
    eyes: { variant: "round", leftScale: 1, rightScale: 1 },
    face: { x: -4, y: -5 },
    blushOpacity: 0.36,
    bodyTint: { variant: "amber", opacity: 0.35 },
    glow: { color: "#F59E0B", opacity: 0.18 },
    badge: circle("#F59E0B"),
    pose: { tilt: -4 },
    motion: {
      breathingAmplitude: 0.025,
      periodSeconds: 3.2,
      floatDistancePx: -8,
      easing: "ease-in-out",
    },
  }),
  listening: makeExpression("core", {
    face: { x: -2, y: 5 },
    blushOpacity: 0.45,
    bodyTint: { variant: "blue", opacity: 0.85 },
    glow: { color: "#3898FF", opacity: 0.32 },
    badge: pill("#2589FF"),
    pose: { scaleX: 1.02, scaleY: 1.02 },
    rings: { orbit: 0, ripple: 0.45 },
    motion: {
      breathingAmplitude: 0.03,
      periodSeconds: 2.8,
      floatDistancePx: -5,
      easing: "ease-in-out",
    },
  }),
  hearing: makeExpression("core", {
    eyes: { variant: "round", leftScale: 1.1, rightScale: 1.1 },
    face: { y: 3 },
    blushOpacity: 0.55,
    bodyTint: { variant: "blue", opacity: 0.95 },
    glow: { color: "#60A5FA", opacity: 0.45 },
    badge: { ...pill("#2589FF"), scale: 1.04 },
    pose: { scaleX: 1.04, scaleY: 0.98 },
    rings: { orbit: 0, ripple: 1 },
    motion: {
      breathingAmplitude: 0.04,
      periodSeconds: 1.5,
      floatDistancePx: -4,
      easing: "cubic-bezier(0.34,1.56,0.64,1)",
    },
  }),
  thinking: makeExpression("core", {
    face: { x: 3, y: -4 },
    blushOpacity: 0.42,
    bodyTint: { variant: "purple", opacity: 0.88 },
    glow: { color: "#8B5CF6", opacity: 0.36 },
    badge: pill("#7C3AED"),
    pose: { tilt: 2 },
    rings: { orbit: 0.55, ripple: 0 },
    motion: {
      breathingAmplitude: 0.025,
      periodSeconds: 2.4,
      floatDistancePx: -9,
      easing: "ease-in-out",
    },
  }),
  speaking: makeExpression("core", {
    blushOpacity: 0.5,
    bodyTint: { variant: "blue", opacity: 0.45 },
    glow: { color: "#93C5FD", opacity: 0.38 },
    rings: { orbit: 0, ripple: 0.8, ripplePeriodSeconds: 1.4 },
    audioReactive: true,
    motion: {
      breathingAmplitude: 0.03,
      periodSeconds: 1.1,
      floatDistancePx: -7,
      easing: "ease-in-out",
    },
  }),
  followup: makeExpression("core", {
    face: { x: 2, y: 1 },
    blushOpacity: 0.35,
    bodyTint: { variant: "blue", opacity: 0.5 },
    glow: { color: "#60A5FA", opacity: 0.22 },
    badge: { ...pill("#2589FF"), color: "#2589FF", opacity: 0.9, scale: 0.92 },
    pose: { tilt: 3.5 },
    motion: {
      breathingAmplitude: 0.02,
      periodSeconds: 3.4,
      floatDistancePx: -5,
      easing: "ease-in-out",
    },
  }),
  paused: makeExpression("core", {
    eyes: { variant: "flat", leftScale: 1, rightScale: 1 },
    blushOpacity: 0,
    bodyTint: { variant: "slate", opacity: 0.35 },
    glow: { color: "#94A3B8", opacity: 0.03 },
    pose: { y: 4 },
    motion: {
      breathingAmplitude: 0.01,
      periodSeconds: 5.5,
      floatDistancePx: -2,
      easing: "ease-in-out",
    },
  }),
  interrupted: makeExpression("core", {
    eyes: { variant: "round", leftScale: 1.18, rightScale: 1.18 },
    blushOpacity: 0.45,
    bodyTint: { variant: "blue", opacity: 0.6 },
    glow: { color: "#3898FF", opacity: 0.3 },
    pose: { y: 3, scaleX: 1.07, scaleY: 0.93 },
    motion: {
      breathingAmplitude: 0.03,
      periodSeconds: 2,
      floatDistancePx: -6,
      easing: "ease-out",
    },
  }),
  error: makeExpression("core", {
    face: { y: 2 },
    blushOpacity: 0.55,
    bodyTint: { variant: "amber", opacity: 0.9 },
    glow: { color: "#F59E0B", opacity: 0.34 },
    badge: circle("#F59E0B"),
    pose: { tilt: -2.5 },
    rings: { orbit: 0.45, ripple: 0 },
    motion: {
      breathingAmplitude: 0.02,
      periodSeconds: 3.6,
      floatDistancePx: -4,
      easing: "ease-in-out",
    },
  }),
  offline: makeExpression("core", {
    eyes: { variant: "sleepy", leftScale: 1, rightScale: 1 },
    blushOpacity: 0.1,
    bodyTint: { variant: "slate", opacity: 0.75 },
    glow: { color: "#64748B", opacity: 0.04 },
    badge: { ...circle("#64748B"), opacity: 0.92, scale: 0.95 },
    pose: { y: 4 },
    motion: {
      breathingAmplitude: 0.015,
      periodSeconds: 5,
      floatDistancePx: -3,
      easing: "ease-in-out",
    },
  }),
  happy: makeExpression("core", {
    eyes: { variant: "happy", leftScale: 1, rightScale: 1 },
    blushOpacity: 0.55,
    glow: { color: "#F8FAFC", opacity: 0.35 },
    hands: { kind: "both", opacity: 1, reducedMotion: true },
    particles: 12,
    pose: { y: -6, tilt: -1.5 },
    motion: {
      breathingAmplitude: 0.045,
      periodSeconds: 1.9,
      floatDistancePx: -10,
      easing: "cubic-bezier(0.34,1.56,0.64,1)",
    },
  }),
  proud: makeExpression("core", {
    eyes: { variant: "happy", leftScale: 1, rightScale: 1 },
    blushOpacity: 0.45,
    glow: { color: "#FEF3C7", opacity: 0.22 },
    pose: { y: -3 },
    motion: {
      breathingAmplitude: 0.025,
      periodSeconds: 3.3,
      floatDistancePx: -6,
      easing: "ease-in-out",
    },
  }),
  curious: makeExpression("core", {
    eyes: { variant: "round", leftScale: 0.88, rightScale: 1.18 },
    blushOpacity: 0.38,
    bodyTint: { variant: "blue", opacity: 0.35 },
    glow: { color: "#7DD3FC", opacity: 0.24 },
    hands: { kind: "right", opacity: 1 },
    pose: {
      y: -3,
      tilt: 6,
      transformOrder: "rotate-translate",
    },
    motion: {
      breathingAmplitude: 0.025,
      periodSeconds: 3,
      floatDistancePx: -7,
      easing: "ease-in-out",
    },
  }),
  focus: makeExpression("core", {
    eyes: {
      variant: "round",
      leftScale: 0.92,
      rightScale: 0.92,
      opacity: 0.85,
    },
    blushOpacity: 0.22,
    glow: { color: "#4F46E5", opacity: 0.05 },
    pose: { y: 2 },
    motion: {
      breathingAmplitude: 0.008,
      periodSeconds: 6,
      floatDistancePx: -1.5,
      easing: "ease-in-out",
    },
  }),
  sleepy: makeExpression("core", {
    eyes: { variant: "sleepy", leftScale: 1, rightScale: 1 },
    blushOpacity: 0.32,
    bodyTint: { variant: "amber", opacity: 0.28 },
    glow: { color: "#FDBA74", opacity: 0.08 },
    pose: { y: 5, scaleX: 1.03, scaleY: 0.97 },
    motion: {
      breathingAmplitude: 0.03,
      periodSeconds: 6.5,
      floatDistancePx: -2,
      easing: "ease-in-out",
    },
  }),
  clarifying: makeExpression("extended", {
    eyes: { variant: "round", leftScale: 1, rightScale: 1.12 },
    blushOpacity: 0.32,
    bodyTint: { variant: "blue", opacity: 0.42 },
    glow: { color: "#7DD3FC", opacity: 0.25 },
    pose: { tilt: 3 },
    motion: { periodSeconds: 3.2 },
  }),
  confirming: makeExpression("extended", {
    blushOpacity: 0.28,
    bodyTint: { variant: "amber", opacity: 0.3 },
    glow: { color: "#F59E0B", opacity: 0.18 },
    pose: { tilt: 2 },
    motion: { periodSeconds: 3.6 },
  }),
  "awaiting-response": makeExpression("extended", {
    blushOpacity: 0.24,
    bodyTint: { variant: "blue", opacity: 0.2 },
    glow: { color: "#60A5FA", opacity: 0.12 },
    pose: { tilt: -1 },
    motion: { periodSeconds: 4 },
  }),
  planning: makeExpression("extended", {
    blushOpacity: 0.32,
    bodyTint: { variant: "purple", opacity: 0.54 },
    glow: { color: "#8B5CF6", opacity: 0.28 },
    rings: { orbit: 0.48, ripple: 0 },
    face: { x: 2, y: -4 },
    motion: { periodSeconds: 2.8 },
  }),
  suggesting: makeExpression("extended", {
    blushOpacity: 0.34,
    bodyTint: { variant: "blue", opacity: 0.42 },
    glow: { color: "#7DD3FC", opacity: 0.25 },
    hands: { kind: "both", opacity: 0.62 },
    pose: { tilt: 3 },
    motion: { periodSeconds: 3 },
  }),
  working: makeExpression("extended", {
    blushOpacity: 0.28,
    bodyTint: { variant: "blue", opacity: 0.38 },
    glow: { color: "#3898FF", opacity: 0.24 },
    badge: { ...pill("#64748B"), opacity: 0.9, scale: 0.92 },
    rings: { orbit: 0.24, ripple: 0 },
    motion: { periodSeconds: 2.5 },
  }),
  researching: makeExpression("extended", {
    blushOpacity: 0.32,
    bodyTint: { variant: "purple", opacity: 0.66 },
    glow: { color: "#8B5CF6", opacity: 0.32 },
    badge: { ...pill("#8B5CF6"), opacity: 0.88, scale: 0.94 },
    rings: { orbit: 0.62, ripple: 0 },
    motion: { periodSeconds: 2.6 },
  }),
  saving: makeExpression("extended", {
    blushOpacity: 0.28,
    bodyTint: { variant: "blue", opacity: 0.36 },
    glow: { color: "#3898FF", opacity: 0.24 },
    badge: { ...pill("#10B981"), scale: 0.95 },
    motion: { periodSeconds: 2.8 },
  }),
  syncing: makeExpression("extended", {
    blushOpacity: 0.22,
    bodyTint: { variant: "blue", opacity: 0.3 },
    glow: { color: "#60A5FA", opacity: 0.2 },
    badge: { ...pill("#10B981"), opacity: 0.9, scale: 0.5 },
    rings: { orbit: 0.3, ripple: 0 },
    motion: { periodSeconds: 3.2 },
  }),
  empathetic: makeExpression("extended", {
    blushOpacity: 0.28,
    bodyTint: { variant: "slate", opacity: 0.28 },
    glow: { color: "#94A3B8", opacity: 0.08 },
    pose: {
      y: 2,
      tilt: -1.5,
      transformOrder: "rotate-translate",
    },
    motion: { periodSeconds: 4.8 },
  }),
  encouraging: makeExpression("extended", {
    eyes: { variant: "happy", leftScale: 1, rightScale: 1 },
    blushOpacity: 0.42,
    bodyTint: { variant: "amber", opacity: 0.22 },
    glow: { color: "#FDBA74", opacity: 0.22 },
    hands: { kind: "both", opacity: 0.48 },
    motion: { periodSeconds: 3.4 },
  }),
  reviewing: makeExpression("extended", {
    blushOpacity: 0.26,
    bodyTint: { variant: "purple", opacity: 0.34 },
    glow: { color: "#8B5CF6", opacity: 0.2 },
    rings: { orbit: 0.34, ripple: 0 },
    face: { x: 1, y: -2 },
    motion: { periodSeconds: 4 },
  }),
  reflecting: makeExpression("extended", {
    blushOpacity: 0.22,
    bodyTint: { variant: "slate", opacity: 0.22 },
    glow: { color: "#94A3B8", opacity: 0.1 },
    face: { x: 2, y: -3 },
    motion: { periodSeconds: 4.5 },
  }),
  uncertain: makeExpression("extended", {
    eyes: { variant: "round", leftScale: 0.94, rightScale: 1.08 },
    blushOpacity: 0.22,
    bodyTint: { variant: "slate", opacity: 0.28 },
    glow: { color: "#94A3B8", opacity: 0.1 },
    pose: { tilt: 2 },
    motion: { periodSeconds: 3.8 },
  }),
  recovering: makeExpression("extended", {
    blushOpacity: 0.3,
    bodyTint: { variant: "blue", opacity: 0.3 },
    glow: { color: "#60A5FA", opacity: 0.22 },
    pose: { y: -1 },
    motion: { periodSeconds: 3 },
  }),
  "schedule-conflict": makeExpression("extended", {
    eyes: { variant: "round", leftScale: 1, rightScale: 1.08 },
    blushOpacity: 0.3,
    bodyTint: { variant: "amber", opacity: 0.36 },
    glow: { color: "#F59E0B", opacity: 0.18 },
    pose: { tilt: -3 },
    motion: { periodSeconds: 3.4 },
  }),
  "text-mode": makeExpression("extended", {
    blushOpacity: 0.1,
    bodyTint: { variant: "slate", opacity: 0.2 },
    glow: { color: "#94A3B8", opacity: 0.05 },
    pose: { y: 2 },
    motion: { periodSeconds: 5 },
  }),
};
