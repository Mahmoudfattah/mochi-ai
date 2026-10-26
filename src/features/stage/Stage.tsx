import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { defaultConfig } from "@/config/defaultConfig";
import { t } from "@/config/locale/ar-EG";
import type { LocaleKey } from "@/config/locale/ar-EG";
import {
  CAPTION_MAX_LINES,
  TYPING_LONG_PRESS_MS,
  TYPING_SWIPE_THRESHOLD_PX,
} from "@/config/sessionTimings";
import { MochiAvatar } from "@/features/character/MochiAvatar";
import type { MochiAvatarHandle } from "@/features/character/types";
import { sessionToExpression } from "@/features/session/sessionMachine";
import { useSessionController } from "@/features/session/useSessionController";
import type { MicCaptureState, SessionStatus } from "@/features/session/types";
import { localStorageAdapter, ONBOARDING_STORAGE_KEY } from "./storage";
import "./Stage.css";

function stateNameKey(status: SessionStatus): LocaleKey {
  switch (status.kind) {
    case "idle":
      return "stateNameIdle";
    case "waitingPermission":
      return "stateNameWaitingPermission";
    case "listening":
      return "stateNameListening";
    case "hearingSpeech":
      return "stateNameHearingSpeech";
    case "thinking":
      return "stateNameThinking";
    case "speaking":
      return "stateNameSpeaking";
    case "followUpWindow":
      return "stateNameFollowUpWindow";
    case "pausedMuted":
      return "stateNamePausedMuted";
    case "interrupted":
      return "stateNameInterrupted";
    case "error":
      return "stateNameError";
    case "offline":
      return "stateNameOffline";
  }
}

function isPermissionFailure(status: SessionStatus): boolean {
  return (
    status.kind === "error" &&
    (status.cause === "permissionDenied" ||
      status.cause === "permissionRevoked" ||
      status.cause === "dismissed")
  );
}

function getMicLabelKey(status: SessionStatus): LocaleKey {
  if (status.kind === "waitingPermission") return "microphoneWaitingAction";
  if (status.kind === "listening" || status.kind === "hearingSpeech")
    return "microphoneListeningAction";
  if (status.kind === "followUpWindow") return "microphoneFollowUpAction";
  if (status.kind === "pausedMuted") return "microphonePausedAction";
  if (isPermissionFailure(status)) {
    return "microphoneUnavailableAction";
  }
  if (status.kind === "offline") return "microphoneOffAction";
  return "microphoneOffAction";
}

function getMicStatus(
  status: SessionStatus,
  capture: MicCaptureState,
): SessionStatus {
  if (
    status.kind === "error" &&
    status.cause === "service" &&
    capture === "active"
  ) {
    return { kind: "listening" };
  }
  if (status.kind !== "offline") return status;
  if (capture === "active") return { kind: "listening" };
  if (capture === "followup") return { kind: "followUpWindow" };
  if (capture === "permissionPending") return { kind: "waitingPermission" };
  return { kind: "idle" };
}

function getMicDisplayKey(status: SessionStatus): LocaleKey {
  if (status.kind === "waitingPermission") return "microphoneWaiting";
  if (status.kind === "listening" || status.kind === "hearingSpeech")
    return "microphoneListening";
  if (status.kind === "followUpWindow") return "microphoneFollowUp";
  if (status.kind === "pausedMuted") return "microphonePaused";
  if (isPermissionFailure(status)) {
    return "microphoneUnavailable";
  }
  return "microphoneOff";
}

function getMicSymbolKey(status: SessionStatus): LocaleKey {
  if (status.kind === "waitingPermission") return "microphoneSymbolPermission";
  if (status.kind === "listening" || status.kind === "hearingSpeech")
    return "microphoneSymbolListening";
  if (status.kind === "followUpWindow") return "microphoneSymbolFollowUp";
  if (status.kind === "pausedMuted") return "microphoneSymbolPaused";
  if (isPermissionFailure(status)) {
    return "microphoneSymbolUnavailable";
  }
  return "microphoneSymbolOff";
}

function MicIcon({ status }: { status: SessionStatus }) {
  const iconType = isPermissionFailure(status)
    ? "unavailable"
    : status.kind === "waitingPermission"
      ? "permission"
      : status.kind === "pausedMuted"
        ? "paused"
        : status.kind === "listening" ||
            status.kind === "hearingSpeech" ||
            status.kind === "followUpWindow"
          ? "listening"
          : "off";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`mic-icon mic-icon-${iconType}`}
    >
      {iconType === "off" && (
        <>
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
          <path d="M5 10v2a7 7 0 0 0 12 5" />
          <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
        </>
      )}
      {iconType === "listening" && (
        <>
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </>
      )}
      {iconType === "paused" && (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      )}
      {iconType === "permission" && (
        <>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      )}
      {iconType === "unavailable" && (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      )}
    </svg>
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function getCaption(
  text: string,
  overflow: boolean,
): { text: string; overflow: boolean } {
  const lines = text.split(/\r?\n/);
  if (!overflow && lines.length <= CAPTION_MAX_LINES) {
    return { text, overflow: false };
  }
  return {
    text: t("longReplyCaption"),
    overflow: true,
  };
}

function getRecoveryMessageKey(status: SessionStatus): LocaleKey {
  if (status.kind === "offline") return "offlineMessage";
  if (status.kind !== "error") return "serviceError";
  if (status.cause === "recognition") return "speechError";
  if (status.cause === "speech") return "speechOutputError";
  return "serviceError";
}

export function Stage() {
  const avatarRef = useRef<MochiAvatarHandle>(null);
  const onAudioLevel = useCallback(
    (level: number) => avatarRef.current?.setAudioLevel(level),
    [],
  );
  const controller = useSessionController({ onAudioLevel });
  const inputRef = useRef<HTMLInputElement>(null);
  const pressTimerRef = useRef<number | undefined>(undefined);
  const longPressFiredRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [firstVisit, setFirstVisit] = useState(
    () => localStorageAdapter.get(ONBOARDING_STORAGE_KEY) !== "true",
  );
  const [draft, setDraft] = useState("");
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [sampleTranscript, setSampleTranscript] = useState(
    t("toolbarTranscript"),
  );
  const [devEnabled] = useState(
    () =>
      import.meta.env.DEV ||
      new URLSearchParams(window.location.search).get("dev") === "1",
  );

  const expression = sessionToExpression(controller.model.status);
  const micStatus = getMicStatus(
    controller.model.status,
    controller.model.micCapture,
  );
  const micClass = isPermissionFailure(micStatus)
    ? "unavailable"
    : micStatus.kind;
  const showPermissionRecovery = isPermissionFailure(controller.model.status);
  const showServiceRecovery =
    controller.model.status.kind === "offline" ||
    (controller.model.status.kind === "error" &&
      (controller.model.status.cause === "service" ||
        controller.model.status.cause === "recognition" ||
        controller.model.status.cause === "speech"));
  const caption =
    controller.model.status.kind === "speaking" ||
    controller.model.status.kind === "followUpWindow"
      ? getCaption(controller.model.reply, controller.model.captionOverflow)
      : null;

  const markOnboardingComplete = useCallback(() => {
    if (!firstVisit) return;
    localStorageAdapter.set(ONBOARDING_STORAGE_KEY, "true");
    setFirstVisit(false);
  }, [firstVisit]);

  const activate = useCallback(() => {
    markOnboardingComplete();
    controller.activate();
  }, [controller, markOnboardingComplete]);

  useEffect(() => {
    if (!devEnabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "d" && !isEditableTarget(event.target)) {
        event.preventDefault();
        setToolbarOpen((open) => !open);
        return;
      }
      if (
        /^[a-z0-9]$/i.test(event.key) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isEditableTarget(event.target) &&
        controller.model.status.kind !== "speaking" &&
        controller.model.status.kind !== "thinking"
      ) {
        controller.openTyping();
        setDraft(event.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controller, devEnabled]);

  useEffect(
    () => () => {
      if (pressTimerRef.current !== undefined) {
        window.clearTimeout(pressTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (controller.model.typingOpen) inputRef.current?.focus();
  }, [controller.model.typingOpen]);

  useEffect(() => {
    if (controller.model.announcement) {
      document.title = `${defaultConfig.persona.name} — ${t(
        controller.model.announcement,
        { persona_name: defaultConfig.persona.name },
      )}`;
    }
  }, [controller.model.announcement]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    markOnboardingComplete();
    controller.submitText(draft);
    setDraft("");
  };

  const onMicPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") return;
    longPressFiredRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      controller.openTyping();
    }, TYPING_LONG_PRESS_MS);
  };

  const clearPressTimer = () => {
    if (pressTimerRef.current !== undefined) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = undefined;
    }
  };

  const onMicClick = () => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (showPermissionRecovery || showServiceRecovery) {
      controller.openTyping();
      return;
    }
    if (controller.model.status.kind === "idle") markOnboardingComplete();
    controller.toggleMic();
  };

  const onTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch) return;
    const lowerThird = start.y >= window.innerHeight * (2 / 3);
    if (
      lowerThird &&
      start.y - touch.clientY >= TYPING_SWIPE_THRESHOLD_PX &&
      Math.abs(start.x - touch.clientX) < TYPING_SWIPE_THRESHOLD_PX * 2
    ) {
      controller.openTyping();
    }
  };

  const onTypingKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") controller.closeTyping();
  };

  const showToolbar = devEnabled && toolbarOpen;

  return (
    <main
      className="mochi-stage"
      dir="rtl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={`stage-mic-wrap stage-mic-${micClass}`}>
        <button
          className="stage-mic-button"
          type="button"
          aria-label={t(getMicLabelKey(micStatus), {
            persona_name: defaultConfig.persona.name,
          })}
          onPointerDown={onMicPointerDown}
          onPointerUp={clearPressTimer}
          onPointerCancel={clearPressTimer}
          onPointerLeave={clearPressTimer}
          onClick={onMicClick}
        >
          <MicIcon status={micStatus} />
          <span className="mic-shape" aria-hidden="true">
            {t(getMicSymbolKey(micStatus))}
          </span>
          <span>{t(getMicDisplayKey(micStatus))}</span>
        </button>
      </div>

      <div className="stage-content">
        <section
          className={`stage-character stage-status-${controller.model.status.kind}`}
          aria-label={t("appName", {
            persona_name: defaultConfig.persona.name,
          })}
        >
          <MochiAvatar
            ref={avatarRef}
            state={expression}
            onInteract={activate}
            label={t("characterAccessibleName", {
              persona_name: defaultConfig.persona.name,
            })}
          />
          {firstVisit &&
            controller.model.status.kind === "idle" &&
            !controller.model.typingOpen && (
              <div className="stage-onboarding">
                <p>
                  {t("touchToTalk", {
                    persona_name: defaultConfig.persona.name,
                  })}
                </p>
                <button type="button" onClick={controller.openTyping}>
                  {t("firstVisitTypingHint")}
                </button>
              </div>
            )}
        </section>

        {(controller.model.finalTranscript ||
          controller.model.interimTranscript ||
          caption) && (
          <section className="stage-captions" aria-live="polite">
            {(controller.model.finalTranscript ||
              controller.model.interimTranscript) && (
              <div className="stage-user-caption-wrap">
                <p className="stage-user-caption">
                  «
                  {controller.model.interimTranscript ||
                    controller.model.finalTranscript}
                  »
                </p>
                {controller.model.interimTranscript && (
                  <span className="stage-transcript-meta">
                    {t("interimTranscript")}
                  </span>
                )}
                {(controller.model.interimTranscript ||
                  controller.model.status.kind === "thinking") && (
                  <button
                    type="button"
                    className="stage-correction"
                    onClick={() => {
                      setDraft(
                        controller.model.finalTranscript ||
                          controller.model.interimTranscript,
                      );
                      controller.openTyping();
                    }}
                  >
                    {t("correction")}
                  </button>
                )}
              </div>
            )}
            {caption && (
              <div className="stage-mochi-caption">
                <p>{caption.text}</p>
                {caption.overflow && (
                  <span className="stage-caption-overflow">
                    {t("captionOverflow")}
                  </span>
                )}
              </div>
            )}
            {controller.model.status.kind === "speaking" && (
              <p className="stage-speaking-hint">
                {t("speakingHint", {
                  persona_name: defaultConfig.persona.name,
                })}
              </p>
            )}
          </section>
        )}
        <p className="stage-sr-only" aria-live="polite" aria-atomic="true">
          {t(controller.model.announcement, {
            persona_name: defaultConfig.persona.name,
          })}
        </p>

        {controller.model.status.kind === "waitingPermission" && (
          <section className="stage-recovery-card" role="status">
            <p>{t("permissionExplanation")}</p>
          </section>
        )}

        {controller.model.service === "offline" &&
          controller.model.status.kind !== "offline" && (
            <p className="stage-service-notice" role="status">
              {t("serviceOfflineNotice", {
                mic_state:
                  controller.model.micCapture === "active" ||
                  controller.model.micCapture === "followup"
                    ? t("micActuallyActive")
                    : t("micActuallyOff"),
              })}
            </p>
          )}

        {showPermissionRecovery && (
          <section
            className="stage-recovery-card"
            aria-labelledby="permission-title"
          >
            <h2 id="permission-title">{t("permissionDeniedMessage")}</h2>
            <details open>
              <summary>{t("permissionHelpTitle")}</summary>
              <p>{t("permissionHelpChromeAndroid")}</p>
              <p>{t("permissionHelpSamsungInternet")}</p>
              <p>{t("permissionHelpChromeWindows")}</p>
            </details>
            <div className="stage-recovery-actions">
              <button type="button" onClick={controller.openTyping}>
                {t("continueByTyping")}
              </button>
              <button type="button" onClick={controller.retry}>
                {t("retry")}
              </button>
            </div>
          </section>
        )}

        {showServiceRecovery && (
          <section className="stage-recovery-card" role="status">
            <p>
              {t(
                controller.model.status.kind === "error" &&
                  controller.model.status.cause === "recognition"
                  ? "speechErrorRetry"
                  : getRecoveryMessageKey(controller.model.status),
              )}
            </p>
            <div className="stage-recovery-actions">
              <button type="button" onClick={controller.openTyping}>
                {t("continueByTyping")}
              </button>
              <button type="button" onClick={controller.retry}>
                {t("retry")}
              </button>
            </div>
          </section>
        )}

        {controller.model.typingOpen && (
          <>
            <div className="stage-mochi-caption stage-typing-prompt">
              {t("typingPrompt")}
            </div>
            <form className="stage-typing" onSubmit={onSubmit}>
              <label className="stage-sr-only" htmlFor="stage-typing-input">
                {t("typingLabel", {
                  persona_name: defaultConfig.persona.name,
                })}
              </label>
              <input
                ref={inputRef}
                id="stage-typing-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onTypingKeyDown}
                placeholder={t("typingPlaceholder")}
              />
              <button type="submit" className="stage-typing-submit">
                {t("typingSend")}
              </button>
              <button
                type="button"
                className="stage-typing-close"
                aria-label={t("closeTyping")}
                onClick={controller.closeTyping}
              >
                ×
              </button>
            </form>
          </>
        )}
      </div>

      <button
        type="button"
        className="stage-sr-only-focusable"
        onClick={controller.openTyping}
      >
        {t("continueByTyping")}
      </button>

      {devEnabled && (
        <button
          className="stage-dev-toggle"
          type="button"
          aria-label={t("toolbarToggle")}
          onClick={() => setToolbarOpen((open) => !open)}
        >
          {t("devOnlyBadge")}
        </button>
      )}

      {showToolbar && (
        <aside className="stage-dev-toolbar" aria-label={t("toolbarTitle")}>
          <h2>{t("toolbarTitle")}</h2>
          <p>
            {t("toolbarCurrentState", {
              state: t(stateNameKey(controller.model.status)),
            })}
          </p>
          <div className="toolbar-actions">
            <button type="button" onClick={controller.grantPermission}>
              {t("permissionGrant")}
            </button>
            <button type="button" onClick={controller.denyPermission}>
              {t("permissionDeny")}
            </button>
            <button type="button" onClick={controller.revokePermission}>
              {t("permissionRevoke")}
            </button>
            <label>
              {t("toolbarSampleLabel")}
              <input
                value={sampleTranscript}
                onChange={(event) => setSampleTranscript(event.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={() => controller.simulateSpeech(sampleTranscript)}
            >
              {t("toolbarSimulateSpeech")}
            </button>
            <button type="button" onClick={controller.simulateRecognitionError}>
              {t("toolbarRecognitionError")}
            </button>
            <button type="button" onClick={controller.simulateServiceError}>
              {t("toolbarServiceError")}
            </button>
            <button type="button" onClick={() => controller.setOffline(true)}>
              {t("toolbarGoOffline")}
            </button>
            <button type="button" onClick={() => controller.setOffline(false)}>
              {t("toolbarGoOnline")}
            </button>
            <button type="button" onClick={controller.speakLongReply}>
              {t("toolbarLongReply")}
            </button>
          </div>
        </aside>
      )}
    </main>
  );
}
