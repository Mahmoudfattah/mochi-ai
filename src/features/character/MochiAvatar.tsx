import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import { defaultConfig } from "@/config/defaultConfig";
import { EXPRESSIONS } from "./expressions.config";
import type { MochiAvatarHandle, MochiAvatarProps, MochiSize } from "./types";
import { useMochiBehavior } from "./behavior/useMochiBehavior";
import {
  DEFAULT_MOCHI_MOTION_PRESET,
  MOTION_PRESETS,
  POINTER_FOLLOW_CONFIG,
  type MochiMotionPreset,
} from "./behavior/motionPresets";
import "./MochiAvatar.css";

type MochiStyle = CSSProperties & Record<`--${string}`, string | number>;

interface MochiDefsProps {
  idPrefix: string;
}

function MochiDefs({ idPrefix }: MochiDefsProps) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <defs>
      <path
        id={id("squircle-path")}
        d="M 120 46 C 171 46, 200 66, 200 108 C 200 150, 171 170, 120 170 C 69 170, 40 150, 40 108 C 40 66, 69 46, 120 46 Z"
      />
      <clipPath id={id("body-clip")}>
        <use href={`#${id("squircle-path")}`} />
      </clipPath>
      <radialGradient
        id={id("base-grad")}
        cx="64%"
        cy="32%"
        r="72%"
        fx="64%"
        fy="30%"
      >
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="42%" stopColor="#F5F6F9" />
        <stop offset="82%" stopColor="#D8DCE6" />
        <stop offset="100%" stopColor="#C2C7D4" />
      </radialGradient>
      <radialGradient id={id("specular-grad")} cx="67%" cy="30%" r="36%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("tint-blue")} cx="50%" cy="88%" r="75%">
        <stop offset="0%" stopColor="#58A6FF" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#8EC5FF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("tint-purple")} cx="50%" cy="88%" r="75%">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.92" />
        <stop offset="55%" stopColor="#C4B5FD" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("tint-amber")} cx="50%" cy="88%" r="75%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
        <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("tint-slate")} cx="50%" cy="80%" r="75%">
        <stop offset="0%" stopColor="#64748B" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.15" />
      </radialGradient>
      <radialGradient id={id("blush-grad")} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F472B6" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("hand-grad")} cx="62%" cy="32%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#E5E7EB" />
        <stop offset="100%" stopColor="#C6CBD6" />
      </radialGradient>
      <radialGradient id={id("shadow-grad")} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" stopOpacity="0.72" />
        <stop offset="60%" stopColor="#000000" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id("glow-grad")} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="var(--glow-color)" stopOpacity="0.65" />
        <stop offset="55%" stopColor="var(--glow-color)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--glow-color)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function clampAudioLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(1, level));
}

function getAvatarStyle(
  state: MochiAvatarProps["state"],
  size: MochiSize,
  motionPreset: MochiMotionPreset,
): MochiStyle {
  const expression = EXPRESSIONS[state];
  const motion = MOTION_PRESETS[motionPreset];
  const compact = size === "compact";
  const breathingAmplitude = compact
    ? Math.min(expression.motion.breathingAmplitude, 0.012)
    : expression.motion.breathingAmplitude;
  const floatDistancePx = compact
    ? Math.max(expression.motion.floatDistancePx, -2.5)
    : expression.motion.floatDistancePx;

  return {
    "--look-transition-duration": `${POINTER_FOLLOW_CONFIG.transitionDurationMs}ms`,
    "--look-transition-easing": POINTER_FOLLOW_CONFIG.transitionEasing,
    "--motion-blink-duration": `${motion.doubleBlink.durationMs}ms`,
    "--motion-blink-closed-scale-y": motion.doubleBlink.closedScaleY,
    "--motion-blink-transition-duration": `${motion.doubleBlink.transitionDurationMs}ms`,
    "--motion-blink-transition-easing": motion.doubleBlink.transitionEasing,
    "--motion-wink-duration": `${motion.wink.durationMs}ms`,
    "--motion-wink-tilt": `${motion.wink.tiltDegrees}deg`,
    "--motion-wink-easing": motion.wink.easing,
    "--motion-look-duration": `${motion.look.durationMs}ms`,
    "--motion-look-left-x": `${-motion.look.horizontalOffsetPx}px`,
    "--motion-look-right-x": `${motion.look.horizontalOffsetPx}px`,
    "--motion-look-y": `${motion.look.verticalOffsetPx}px`,
    "--motion-look-left-tilt": `${-motion.look.tiltDegrees}deg`,
    "--motion-look-right-tilt": `${motion.look.tiltDegrees}deg`,
    "--motion-look-easing": motion.look.easing,
    "--motion-deep-breath-duration": `${motion.deepBreath.durationMs}ms`,
    "--motion-deep-breath-rise": `${motion.deepBreath.risePx}px`,
    "--motion-deep-breath-scale-x": motion.deepBreath.scaleX,
    "--motion-deep-breath-scale-y": motion.deepBreath.scaleY,
    "--motion-deep-breath-eye-scale-y": motion.deepBreath.eyeScaleY,
    "--motion-deep-breath-easing": motion.deepBreath.easing,
    "--motion-jelly-duration": `${motion.jelly.durationMs}ms`,
    "--motion-jelly-peak-scale-x": motion.jelly.peakScaleX,
    "--motion-jelly-peak-scale-y": motion.jelly.peakScaleY,
    "--motion-jelly-settle-scale-x": motion.jelly.settleScaleX,
    "--motion-jelly-settle-scale-y": motion.jelly.settleScaleY,
    "--motion-jelly-easing": motion.jelly.easing,
    "--motion-happy-duration": `${motion.microHappy.durationMs}ms`,
    "--motion-happy-easing": motion.microHappy.easing,
    "--glow-color": expression.glow.color,
    "--glow-opacity": expression.glow.opacity,
    "--blush-opacity": expression.blushOpacity,
    "--badge-color": expression.badge.color,
    "--badge-opacity": expression.badge.opacity,
    "--badge-scale": expression.badge.scale,
    "--hands-opacity": expression.hands.opacity,
    "--orbit-opacity": expression.rings.orbit,
    "--ripple-opacity": expression.rings.ripple,
    "--ripple-duration": `${expression.rings.ripplePeriodSeconds}s`,
    "--particles-opacity": expression.particles === 0 ? 0 : 1,
    "--tint-blue-opacity":
      expression.bodyTint.variant === "blue" ? expression.bodyTint.opacity : 0,
    "--tint-purple-opacity":
      expression.bodyTint.variant === "purple"
        ? expression.bodyTint.opacity
        : 0,
    "--tint-amber-opacity":
      expression.bodyTint.variant === "amber" ? expression.bodyTint.opacity : 0,
    "--tint-slate-opacity":
      expression.bodyTint.variant === "slate" ? expression.bodyTint.opacity : 0,
    "--pose-x": `${expression.pose.x}px`,
    "--pose-y": `${expression.pose.y}px`,
    "--pose-scale-x": expression.pose.scaleX,
    "--pose-scale-y": expression.pose.scaleY,
    "--pose-tilt": `${expression.pose.tilt}deg`,
    "--face-x": `${expression.face.x}px`,
    "--face-y": `${expression.face.y}px`,
    "--eye-left-scale": expression.eyes.leftScale,
    "--eye-right-scale": expression.eyes.rightScale,
    "--eye-opacity": expression.eyes.opacity,
    "--breathing-amplitude": breathingAmplitude,
    "--float-distance": `${floatDistancePx}px`,
    "--breath-duration": `${expression.motion.periodSeconds}s`,
    "--breath-easing": expression.motion.easing,
    "--arc-stroke": compact ? "8" : "6.5",
  };
}

export const MochiAvatar = forwardRef<MochiAvatarHandle, MochiAvatarProps>(
  function MochiAvatar(
    {
      state,
      size = "full",
      motionPreset = DEFAULT_MOCHI_MOTION_PRESET,
      audioLevel = 0,
      onInteract,
      label = defaultConfig.accessibility.characterLabel,
      reducedMotion,
      className,
    },
    ref,
  ) {
    const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const expression = EXPRESSIONS[state];
    const accessibleLabel = label.trim()
      ? label
      : defaultConfig.accessibility.characterLabel;
    const svgRef = useRef<SVGSVGElement>(null);
    const writeAudioLevelRef = useRef<(level: number) => void>(() => undefined);
    const lastAudioWriteRef = useRef(Number.NEGATIVE_INFINITY);
    const pendingAudioLevelRef = useRef(clampAudioLevel(audioLevel));
    const audioTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    );

    const writeAudioLevel = useCallback(
      (level: number) => {
        const svg = svgRef.current;
        if (!svg) return;

        pendingAudioLevelRef.current = clampAudioLevel(level);
        const now = performance.now();
        const minimumFrameInterval = 1000 / 30;
        const remaining =
          minimumFrameInterval - (now - lastAudioWriteRef.current);

        if (remaining <= 0) {
          const nextLevel = pendingAudioLevelRef.current;
          svg.style.setProperty("--audio-level", String(nextLevel));
          svg.style.setProperty(
            "--audio-face-y",
            `${expression.audioReactive ? nextLevel * -3.5 : 0}px`,
          );
          if (expression.audioReactive) {
            svg.style.setProperty(
              "--breathing-amplitude",
              String(0.03 + nextLevel * 0.035),
            );
          }
          lastAudioWriteRef.current = now;
          if (audioTimerRef.current !== undefined) {
            clearTimeout(audioTimerRef.current);
            audioTimerRef.current = undefined;
          }
          return;
        }

        if (audioTimerRef.current === undefined) {
          audioTimerRef.current = setTimeout(() => {
            audioTimerRef.current = undefined;
            writeAudioLevelRef.current(pendingAudioLevelRef.current);
          }, remaining);
        }
      },
      [expression.audioReactive],
    );

    useImperativeHandle(
      ref,
      () => ({
        setAudioLevel: writeAudioLevel,
      }),
      [writeAudioLevel],
    );

    useEffect(() => {
      writeAudioLevelRef.current = writeAudioLevel;
    }, [writeAudioLevel]);

    useEffect(() => {
      writeAudioLevel(audioLevel);
    }, [audioLevel, writeAudioLevel]);

    useEffect(
      () => () => {
        if (audioTimerRef.current !== undefined) {
          clearTimeout(audioTimerRef.current);
        }
      },
      [],
    );

    useMochiBehavior({ svgRef, state, size, motionPreset, reducedMotion });

    const style = getAvatarStyle(state, size, motionPreset);
    const systemReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const classes = ["mochi-avatar", `mochi-avatar--${size}`, className]
      .filter(Boolean)
      .join(" ");
    const svg = (
      <svg
        ref={svgRef}
        className="mochi-svg"
        data-state={state}
        data-size={size}
        data-motion-preset={motionPreset}
        data-eye-variant={expression.eyes.variant}
        data-badge-kind={expression.badge.kind}
        data-badge-content={expression.badge.content}
        data-pose-order={expression.pose.transformOrder}
        data-hands-kind={expression.hands.kind}
        data-reduced-hands={expression.hands.reducedMotion}
        data-particles={expression.particles}
        data-ripple={expression.rings.ripple > 0}
        data-audio-reactive={expression.audioReactive}
        data-reduced-motion={reducedMotion ?? systemReducedMotion}
        viewBox="0 0 240 220"
        role={onInteract ? undefined : "img"}
        aria-label={onInteract ? undefined : accessibleLabel}
        aria-hidden={onInteract ? true : undefined}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
      >
        <MochiDefs idPrefix={`mochi-${generatedId}`} />

        <circle
          className="mochi-ambient-glow"
          cx="120"
          cy="108"
          r="96"
          fill={`url(#mochi-${generatedId}-glow-grad)`}
        />
        <circle
          className="mochi-orbit-ring"
          cx="120"
          cy="108"
          r="92"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.2"
        />
        <circle
          className="mochi-ripple-ring"
          cx="120"
          cy="108"
          r="82"
          fill="none"
          stroke="rgba(96,165,250,0.45)"
          strokeWidth="2"
        />

        <g className="mochi-particles-group">
          <circle
            className="particle-dot particle-dot-1"
            cx="28"
            cy="68"
            r="2.3"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-2"
            cx="46"
            cy="40"
            r="1.7"
            fill="#E2E8F0"
          />
          <circle
            className="particle-dot particle-dot-3"
            cx="195"
            cy="42"
            r="2.4"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-4"
            cx="214"
            cy="78"
            r="1.8"
            fill="#CBD5E1"
          />
          <circle
            className="particle-dot particle-dot-5"
            cx="208"
            cy="138"
            r="2.2"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-6"
            cx="32"
            cy="144"
            r="1.8"
            fill="#E2E8F0"
          />
          <circle
            className="particle-dot particle-dot-7"
            cx="85"
            cy="28"
            r="1.6"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-8"
            cx="158"
            cy="30"
            r="2"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-9"
            cx="22"
            cy="106"
            r="1.5"
            fill="#CBD5E1"
          />
          <circle
            className="particle-dot particle-dot-10"
            cx="218"
            cy="110"
            r="1.6"
            fill="#E2E8F0"
          />
          <circle
            className="particle-dot particle-dot-11"
            cx="58"
            cy="168"
            r="1.7"
            fill="#FFFFFF"
          />
          <circle
            className="particle-dot particle-dot-12"
            cx="184"
            cy="166"
            r="1.8"
            fill="#FFFFFF"
          />
        </g>

        <ellipse
          className="mochi-floor-shadow"
          cx="120"
          cy="194"
          rx="52"
          ry="8.5"
          fill={`url(#mochi-${generatedId}-shadow-grad)`}
        />

        <g className="mochi-float-group">
          <g className="mochi-pose-group">
            <g clipPath={`url(#mochi-${generatedId}-body-clip)`}>
              <use
                href={`#mochi-${generatedId}-squircle-path`}
                fill={`url(#mochi-${generatedId}-base-grad)`}
              />
              <rect
                className="tint-blue"
                x="35"
                y="40"
                width="170"
                height="135"
                fill={`url(#mochi-${generatedId}-tint-blue)`}
              />
              <rect
                className="tint-purple"
                x="35"
                y="40"
                width="170"
                height="135"
                fill={`url(#mochi-${generatedId}-tint-purple)`}
              />
              <rect
                className="tint-amber"
                x="35"
                y="40"
                width="170"
                height="135"
                fill={`url(#mochi-${generatedId}-tint-amber)`}
              />
              <rect
                className="tint-slate"
                x="35"
                y="40"
                width="170"
                height="135"
                fill={`url(#mochi-${generatedId}-tint-slate)`}
              />
              <use
                href={`#mochi-${generatedId}-squircle-path`}
                fill={`url(#mochi-${generatedId}-specular-grad)`}
              />
            </g>

            <g className="mochi-hands-group">
              <circle
                className="mochi-hand-left"
                cx="38"
                cy="148"
                r="15.5"
                fill={`url(#mochi-${generatedId}-hand-grad)`}
              />
              <circle
                className="mochi-hand-right"
                cx="201"
                cy="86"
                r="15.5"
                fill={`url(#mochi-${generatedId}-hand-grad)`}
              />
            </g>

            <g className="mochi-face-group">
              <g className="mochi-blush-group">
                <ellipse
                  cx="76"
                  cy="121"
                  rx="14"
                  ry="6.5"
                  fill={`url(#mochi-${generatedId}-blush-grad)`}
                />
                <ellipse
                  cx="164"
                  cy="121"
                  rx="14"
                  ry="6.5"
                  fill={`url(#mochi-${generatedId}-blush-grad)`}
                />
              </g>

              <g className="mochi-eye-left">
                <ellipse
                  className="eye-dot"
                  cx="95"
                  cy="114"
                  rx="8.4"
                  ry="9.5"
                  fill="#181619"
                />
                <path
                  className="eye-happy-arc"
                  d="M 83 114 C 87 102, 103 102, 107 114"
                  fill="none"
                  stroke="#181619"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                <line
                  className="eye-flat-line"
                  x1="85"
                  y1="115"
                  x2="105"
                  y2="115"
                  stroke="#181619"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <path
                  className="eye-sleepy-arc"
                  d="M 85 112 C 89 120, 101 120, 105 112"
                  fill="none"
                  stroke="#181619"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
              </g>

              <g className="mochi-eye-right">
                <ellipse
                  className="eye-dot"
                  cx="145"
                  cy="114"
                  rx="8.4"
                  ry="9.5"
                  fill="#181619"
                />
                <path
                  className="eye-happy-arc"
                  d="M 133 114 C 137 102, 153 102, 157 114"
                  fill="none"
                  stroke="#181619"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                <line
                  className="eye-flat-line"
                  x1="135"
                  y1="115"
                  x2="155"
                  y2="115"
                  stroke="#181619"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <path
                  className="eye-sleepy-arc"
                  d="M 135 112 C 139 120, 151 120, 155 112"
                  fill="none"
                  stroke="#181619"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
              </g>
            </g>

            <g className="mochi-badge-group">
              <g className="badge-pill-shape">
                <rect
                  className="badge-pill-bg"
                  x="42"
                  y="42"
                  width="52"
                  height="28"
                  rx="14"
                  fill="var(--badge-color)"
                  stroke="#0B0C10"
                  strokeWidth="5"
                />
                <circle
                  className="badge-dot badge-dot-1"
                  cx="55"
                  cy="56"
                  r="4.2"
                  fill="#FFFFFF"
                />
                <circle
                  className="badge-dot badge-dot-2"
                  cx="68"
                  cy="56"
                  r="3.4"
                  fill="#FFFFFF"
                />
                <circle
                  className="badge-dot badge-dot-3"
                  cx="81"
                  cy="56"
                  r="3.4"
                  fill="#FFFFFF"
                />
              </g>
              <g className="badge-circle-shape">
                <circle
                  className="badge-circle-bg"
                  cx="68"
                  cy="56"
                  r="18"
                  fill="var(--badge-color)"
                  stroke="#0B0C10"
                  strokeWidth="5"
                />
                <rect
                  x="65.8"
                  y="45.5"
                  width="4.4"
                  height="12"
                  rx="2.2"
                  fill="#FFFFFF"
                />
                <circle cx="68" cy="63" r="2.4" fill="#FFFFFF" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    );

    if (onInteract) {
      return (
        <button
          type="button"
          className={classes}
          aria-label={accessibleLabel}
          onClick={onInteract}
        >
          {svg}
        </button>
      );
    }

    return <span className={classes}>{svg}</span>;
  },
);
