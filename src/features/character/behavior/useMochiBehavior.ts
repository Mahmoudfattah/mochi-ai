import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { MochiSize, MochiState } from "../types";
import {
  createMicroExpressionScheduler,
  type TimerHandle,
} from "./microExpressionScheduler";
import {
  DEFAULT_MOCHI_MOTION_PRESET,
  POINTER_FOLLOW_CONFIG,
  REFERENCE_DOUBLE_BLINK_PHASES_MS,
  type MochiMotionPreset,
} from "./motionPresets";

interface UseMochiBehaviorOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  state: MochiState;
  size: MochiSize;
  motionPreset: MochiMotionPreset;
  reducedMotion?: boolean;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

export function useMochiBehavior({
  svgRef,
  state,
  size,
  motionPreset = DEFAULT_MOCHI_MOTION_PRESET,
  reducedMotion,
}: UseMochiBehaviorOptions): void {
  const reducedMotionRef = useRef(false);
  const microTimersRef = useRef<TimerHandle[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : undefined;
    const updateMotionPreference = () => {
      reducedMotionRef.current = reducedMotion ?? mediaQuery?.matches ?? false;
      svg.dataset.reducedMotion = String(reducedMotionRef.current);
    };

    const clearMicroTimers = () => {
      microTimersRef.current.forEach((timer) => clearTimeout(timer));
      microTimersRef.current = [];
    };

    updateMotionPreference();
    mediaQuery?.addEventListener("change", updateMotionPreference);

    const scheduler = createMicroExpressionScheduler({
      getState: () => state,
      getSize: () => size,
      getReducedMotion: () => reducedMotionRef.current,
      visibility: document,
      motionPreset,
      onMicroExpression(id, durationMs) {
        clearMicroTimers();
        svg.dataset.micro = id;
        if (motionPreset === "reference" && id === "double-blink") {
          const [reopenAtMs, closeAgainAtMs, finishAtMs] =
            REFERENCE_DOUBLE_BLINK_PHASES_MS;
          microTimersRef.current = [
            window.setTimeout(() => {
              delete svg.dataset.micro;
            }, reopenAtMs),
            window.setTimeout(() => {
              svg.dataset.micro = id;
            }, closeAgainAtMs),
            window.setTimeout(() => {
              delete svg.dataset.micro;
              microTimersRef.current = [];
            }, finishAtMs),
          ];
          return;
        }

        microTimersRef.current = [
          window.setTimeout(() => {
            delete svg.dataset.micro;
            microTimersRef.current = [];
          }, durationMs),
        ];
      },
    });

    scheduler.start();

    const resetPointer = () => {
      svg.style.setProperty(
        "--look-x",
        `${POINTER_FOLLOW_CONFIG.neutralOffsetPx}px`,
      );
      svg.style.setProperty(
        "--look-y",
        `${POINTER_FOLLOW_CONFIG.neutralOffsetPx}px`,
      );
      svg.style.setProperty(
        "--look-tilt",
        `${POINTER_FOLLOW_CONFIG.neutralTiltDegrees}deg`,
      );
    };

    const handlePreferenceChange = () => {
      updateMotionPreference();
      if (reducedMotionRef.current) {
        scheduler.pause();
        clearMicroTimers();
        delete svg.dataset.micro;
        resetPointer();
      } else {
        scheduler.resume();
      }
    };
    mediaQuery?.addEventListener("change", handlePreferenceChange);

    const handlePointerMove = (event: PointerEvent) => {
      if (
        reducedMotionRef.current ||
        size === "compact" ||
        !["idle", "listening", "followup"].includes(state)
      ) {
        return;
      }

      const bounds = svg.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const normalizedX = clamp(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -1,
        1,
      );
      const normalizedY = clamp(
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
        -1,
        1,
      );

      svg.style.setProperty(
        "--look-x",
        `${(normalizedX * POINTER_FOLLOW_CONFIG.maxHorizontalOffsetPx).toFixed(1)}px`,
      );
      svg.style.setProperty(
        "--look-y",
        `${(normalizedY * POINTER_FOLLOW_CONFIG.maxVerticalOffsetPx).toFixed(1)}px`,
      );
      svg.style.setProperty(
        "--look-tilt",
        `${(normalizedX * POINTER_FOLLOW_CONFIG.maxTiltDegrees).toFixed(1)}deg`,
      );
    };

    svg.addEventListener("pointermove", handlePointerMove);
    svg.addEventListener("pointerleave", resetPointer);

    return () => {
      scheduler.stop();
      clearMicroTimers();
      mediaQuery?.removeEventListener("change", updateMotionPreference);
      mediaQuery?.removeEventListener("change", handlePreferenceChange);
      svg.removeEventListener("pointermove", handlePointerMove);
      svg.removeEventListener("pointerleave", resetPointer);
      resetPointer();
    };
  }, [motionPreset, reducedMotion, size, state, svgRef]);
}
