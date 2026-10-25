import { useEffect, useRef, useState, type CSSProperties } from "react";
import { defaultConfig } from "@/config/defaultConfig";
import { MochiAvatar } from "../MochiAvatar";
import { EXPRESSIONS } from "../expressions.config";
import {
  DEFAULT_MOCHI_MOTION_PRESET,
  type MochiMotionPreset,
} from "../behavior/motionPresets";
import {
  isMochiState,
  MOCHI_STATES,
  type MochiAvatarHandle,
  type MochiSize,
  type MochiState,
} from "../types";
import "./MochiGallery.css";

const TINT_COLORS: Record<string, string> = {
  none: "#eef0f5",
  blue: "#58a6ff",
  purple: "#a78bfa",
  amber: "#f59e0b",
  slate: "#64748b",
};

function StateThumbnail({ state }: { state: MochiState }) {
  const expression = EXPRESSIONS[state];
  const style = {
    "--thumbnail-tint": TINT_COLORS[expression.bodyTint.variant],
    "--thumbnail-tint-opacity": expression.bodyTint.opacity,
    "--thumbnail-blush-opacity": expression.blushOpacity,
    "--thumbnail-eye-left-scale": expression.eyes.leftScale,
    "--thumbnail-eye-right-scale": expression.eyes.rightScale,
  } as CSSProperties;

  return (
    <svg
      aria-hidden="true"
      className="mochi-gallery__thumbnail"
      data-eye-variant={expression.eyes.variant}
      style={style}
      viewBox="0 0 240 220"
    >
      <path
        d="M 120 46 C 171 46, 200 66, 200 108 C 200 150, 171 170, 120 170 C 69 170, 40 150, 40 108 C 40 66, 69 46, 120 46 Z"
        fill="#e5e8ef"
      />
      <path
        className="mochi-gallery__thumbnail-tint"
        d="M 120 46 C 171 46, 200 66, 200 108 C 200 150, 171 170, 120 170 C 69 170, 40 150, 40 108 C 40 66, 69 46, 120 46 Z"
      />
      <ellipse
        className="mochi-gallery__thumbnail-blush"
        cx="78"
        cy="125"
        rx="18"
        ry="11"
      />
      <ellipse
        className="mochi-gallery__thumbnail-blush"
        cx="162"
        cy="125"
        rx="18"
        ry="11"
      />
      {expression.eyes.variant === "round" ? (
        <>
          <ellipse
            className="mochi-gallery__thumbnail-eye mochi-gallery__thumbnail-eye--left"
            cx="91"
            cy="105"
            rx="5"
            ry="7"
          />
          <ellipse
            className="mochi-gallery__thumbnail-eye mochi-gallery__thumbnail-eye--right"
            cx="149"
            cy="105"
            rx="5"
            ry="7"
          />
        </>
      ) : (
        <>
          <path
            className="mochi-gallery__thumbnail-eye mochi-gallery__thumbnail-eye--left"
            d={
              expression.eyes.variant === "happy"
                ? "M 82 108 Q 91 97 100 108"
                : expression.eyes.variant === "sleepy"
                  ? "M 82 106 Q 91 112 100 106"
                  : "M 82 105 H 100"
            }
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            className="mochi-gallery__thumbnail-eye mochi-gallery__thumbnail-eye--right"
            d={
              expression.eyes.variant === "happy"
                ? "M 140 108 Q 149 97 158 108"
                : expression.eyes.variant === "sleepy"
                  ? "M 140 106 Q 149 112 158 106"
                  : "M 140 105 H 158"
            }
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="5"
          />
        </>
      )}
    </svg>
  );
}

function FrameRateProbe() {
  const [framesPerSecond, setFramesPerSecond] = useState(0);

  useEffect(() => {
    let requestId = 0;
    let frameCount = 0;
    let intervalStart = performance.now();

    const measureFrame = (now: number) => {
      frameCount += 1;
      const elapsed = now - intervalStart;
      if (elapsed >= 1000) {
        setFramesPerSecond(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        intervalStart = now;
      }
      requestId = window.requestAnimationFrame(measureFrame);
    };

    requestId = window.requestAnimationFrame(measureFrame);
    return () => window.cancelAnimationFrame(requestId);
  }, []);

  return (
    <div className="mochi-gallery__fps" aria-live="off">
      Frame rate: <strong>{framesPerSecond || "--"} FPS</strong>
    </div>
  );
}

export function MochiGallery() {
  const avatarRef = useRef<MochiAvatarHandle>(null);
  const [state, setState] = useState<MochiState>("idle");
  const [size, setSize] = useState<MochiSize>("full");
  const [motionPreset, setMotionPreset] = useState<MochiMotionPreset>(
    DEFAULT_MOCHI_MOTION_PRESET,
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [audioLevel, setAudioLevel] = useState(0.45);

  const updateAudioLevel = (value: string) => {
    const level = Number(value);
    setAudioLevel(level);
    avatarRef.current?.setAudioLevel(level);
  };

  return (
    <main className="mochi-gallery" dir="ltr">
      <header className="mochi-gallery__header">
        <div>
          <p className="mochi-gallery__eyebrow">Developer preview</p>
          <h1>{defaultConfig.persona.name} expression gallery</h1>
        </div>
        <a className="mochi-gallery__exit" href="#">
          Back to avatar
        </a>
      </header>

      <section
        className="mochi-gallery__preview"
        aria-label="Character preview"
      >
        <MochiAvatar
          ref={avatarRef}
          state={state}
          size={size}
          motionPreset={motionPreset}
          audioLevel={audioLevel}
          reducedMotion={reducedMotion}
        />
        <FrameRateProbe />
      </section>

      <section
        className="mochi-gallery__controls"
        aria-label="Preview controls"
      >
        <label className="mochi-gallery__field">
          <span>Expression</span>
          <select
            value={state}
            onChange={(event) => {
              if (isMochiState(event.target.value)) {
                setState(event.target.value);
              }
            }}
          >
            {MOCHI_STATES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mochi-gallery__field">
          <legend>Size</legend>
          <div className="mochi-gallery__segmented">
            {(["full", "compact"] as const).map((item) => (
              <button
                aria-pressed={size === item}
                key={item}
                onClick={() => setSize(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mochi-gallery__field">
          <legend>Motion preset</legend>
          <div className="mochi-gallery__segmented">
            {(["spec", "reference"] as const).map((item) => (
              <button
                aria-pressed={motionPreset === item}
                key={item}
                onClick={() => setMotionPreset(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mochi-gallery__field mochi-gallery__motion">
          <input
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
            type="checkbox"
          />
          <span>Reduced motion</span>
        </label>

        <label className="mochi-gallery__field mochi-gallery__audio">
          <span>Audio level: {audioLevel.toFixed(2)}</span>
          <input
            aria-label="Audio level"
            max="1"
            min="0"
            onChange={(event) => updateAudioLevel(event.target.value)}
            step="0.01"
            type="range"
            value={audioLevel}
          />
        </label>
      </section>

      <section className="mochi-gallery__states" aria-label="All expressions">
        {MOCHI_STATES.map((item) => (
          <button
            aria-pressed={state === item}
            className="mochi-gallery__state"
            key={item}
            onClick={() => setState(item)}
            type="button"
          >
            <StateThumbnail state={item} />
            <span>{item}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
