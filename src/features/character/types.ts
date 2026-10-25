import type { Ref } from "react";
import type { MochiMotionPreset } from "./behavior/motionPresets";

export const MOCHI_STATES = [
  "idle",
  "waiting-permission",
  "listening",
  "hearing",
  "thinking",
  "speaking",
  "followup",
  "paused",
  "interrupted",
  "error",
  "offline",
  "happy",
  "proud",
  "curious",
  "focus",
  "sleepy",
  "clarifying",
  "confirming",
  "awaiting-response",
  "planning",
  "suggesting",
  "working",
  "researching",
  "saving",
  "syncing",
  "empathetic",
  "encouraging",
  "reviewing",
  "reflecting",
  "uncertain",
  "recovering",
  "schedule-conflict",
  "text-mode",
] as const;

export type MochiState = (typeof MOCHI_STATES)[number];
export type MochiSize = "full" | "compact";

export function isMochiState(value: string): value is MochiState {
  return (MOCHI_STATES as readonly string[]).includes(value);
}

export interface MochiAvatarHandle {
  setAudioLevel(level: number): void;
}

export interface MochiAvatarProps {
  state: MochiState;
  size?: MochiSize;
  motionPreset?: MochiMotionPreset;
  audioLevel?: number;
  onInteract?: () => void;
  label?: string;
  reducedMotion?: boolean;
  className?: string;
}

export type MochiAvatarRef = Ref<MochiAvatarHandle>;
