import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import {
  CAPTION_MAX_LINES,
  FOLLOW_UP_WINDOW_MS,
  INTERRUPTED_REACTION_MS,
  LISTENING_TIMEOUT_MS,
} from "@/config/sessionTimings";
import { defaultConfig } from "@/config/defaultConfig";
import { t } from "@/config/locale/ar-EG";
import { sessionReducer, INITIAL_SESSION } from "./sessionMachine";
import type { SessionEvent, SessionModel } from "./types";
import { MockPermissionProvider } from "@/voice/mockPermissionProvider";
import { MockRecognitionProvider } from "@/voice/mockRecognitionProvider";
import { MockSpeechProvider } from "@/voice/mockSpeechProvider";
import type {
  PermissionProvider,
  RecognitionProvider,
  SpeechProvider,
} from "@/voice/providers";
import { MockConversationResponder } from "@/conversation/mockResponder";
import type { ConversationResponder } from "@/conversation/responder";

export interface SessionControllerOptions {
  permission?: PermissionProvider;
  recognition?: RecognitionProvider;
  speech?: SpeechProvider;
  responder?: ConversationResponder;
  onAudioLevel?: (level: number) => void;
}

export interface SessionController {
  model: SessionModel;
  activate: () => void;
  toggleMic: () => void;
  submitText: (text: string) => void;
  openTyping: () => void;
  closeTyping: () => void;
  retry: () => void;
  exitRecovery: () => void;
  simulateSpeech: (text: string) => void;
  simulateRecognitionError: () => void;
  simulateServiceError: () => void;
  setOffline: (offline: boolean) => void;
  grantPermission: () => void;
  denyPermission: () => void;
  revokePermission: () => void;
  speakLongReply: () => void;
}

export function useSessionController(
  options: SessionControllerOptions = {},
): SessionController {
  if (!defaultConfig.demoMode) {
    throw new Error("Only mock providers are supported in M2.");
  }

  const [model, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);
  const modelRef = useRef(model);
  const { onAudioLevel } = options;
  useLayoutEffect(() => {
    modelRef.current = model;
  }, [model]);

  const permissionRef = useRef<PermissionProvider>(
    options.permission ?? new MockPermissionProvider(),
  );
  const recognitionRef = useRef<RecognitionProvider>(
    options.recognition ?? new MockRecognitionProvider(),
  );
  const speechRef = useRef<SpeechProvider>(
    options.speech ?? new MockSpeechProvider(),
  );
  const responderRef = useRef<ConversationResponder>(
    options.responder ?? new MockConversationResponder(),
  );
  const ignoreSpeechEndRef = useRef(false);
  const speechIsRunningRef = useRef(false);
  const responseRequestIdRef = useRef(0);
  const recognitionIsRunningRef = useRef(false);
  const dispatchEvent = useCallback((event: SessionEvent) => {
    dispatch(event);
  }, []);

  const stopRecognition = useCallback(() => {
    if (!recognitionIsRunningRef.current) return;
    recognitionIsRunningRef.current = false;
    recognitionRef.current.stop();
  }, []);

  const cancelSpeech = useCallback(() => {
    ignoreSpeechEndRef.current = speechIsRunningRef.current;
    speechRef.current.cancel();
    speechIsRunningRef.current = false;
  }, []);

  const beginRecognition = useCallback(() => {
    if (modelRef.current.service === "offline") {
      dispatchEvent({ type: "NETWORK_OFFLINE" });
      return;
    }
    recognitionIsRunningRef.current = true;
    recognitionRef.current.start();
  }, [dispatchEvent]);

  const requestListening = useCallback(async () => {
    const permission = permissionRef.current;
    const current = await permission.query();
    const previousStatus = modelRef.current.status.kind;

    if (current === "granted" && previousStatus !== "error") {
      switch (previousStatus) {
        case "idle":
        case "interrupted":
          dispatchEvent({ type: "START_LISTENING" });
          break;
        case "pausedMuted":
          dispatchEvent({ type: "RESUME" });
          break;
        case "followUpWindow":
          dispatchEvent({ type: "FOLLOWUP_STARTED" });
          break;
        case "waitingPermission":
          return;
        default:
          return;
      }
      beginRecognition();
      return;
    }
    if (
      previousStatus !== "idle" &&
      previousStatus !== "error" &&
      previousStatus !== "pausedMuted" &&
      previousStatus !== "interrupted" &&
      previousStatus !== "followUpWindow"
    ) {
      return;
    }
    dispatchEvent({ type: "BEGIN_PERMISSION_REQUEST" });
    const result = current === "unknown" ? await permission.request() : current;
    if (result === "granted") {
      dispatchEvent({ type: "PERMISSION_GRANTED" });
      beginRecognition();
    } else if (result === "denied") {
      dispatchEvent({ type: "PERMISSION_DENIED" });
    }
  }, [beginRecognition, dispatchEvent]);

  const answer = useCallback(
    async (text: string, long = false, allowOfflineMock = false) => {
      if (modelRef.current.service === "offline" && !allowOfflineMock) {
        dispatchEvent({ type: "NETWORK_OFFLINE" });
        return;
      }
      const requestId = ++responseRequestIdRef.current;
      try {
        const reply = long
          ? await responderRef.current.respondLong(text)
          : await responderRef.current.respond(text);
        if (requestId !== responseRequestIdRef.current) return;
        const captionOverflow =
          long || reply.split(/\r?\n/).length > CAPTION_MAX_LINES;
        dispatchEvent({
          type: "RESPONSE_READY",
          text: reply,
          captionOverflow,
        });
        speechRef.current.speak(reply);
      } catch {
        if (requestId !== responseRequestIdRef.current) return;
        dispatchEvent({ type: "SERVICE_ERROR" });
      }
    },
    [dispatchEvent],
  );

  const activate = useCallback(() => {
    const status = modelRef.current.status.kind;
    dispatchEvent({ type: "CLOSE_TYPING" });
    if (status === "speaking") {
      dispatchEvent({ type: "INTERRUPT" });
      cancelSpeech();
      window.setTimeout(() => {
        void requestListening();
      }, INTERRUPTED_REACTION_MS);
      return;
    }
    if (
      status === "listening" ||
      status === "hearingSpeech" ||
      status === "waitingPermission"
    ) {
      return;
    }
    stopRecognition();
    cancelSpeech();
    void requestListening();
  }, [cancelSpeech, dispatchEvent, requestListening, stopRecognition]);

  const toggleMic = useCallback(() => {
    const status = modelRef.current.status.kind;
    if (status === "offline") {
      if (modelRef.current.micCapture !== "off") {
        dispatchEvent({ type: "PAUSE" });
        stopRecognition();
      } else {
        dispatchEvent({ type: "OPEN_TYPING" });
      }
      return;
    }
    if (status === "listening" || status === "hearingSpeech") {
      dispatchEvent({ type: "PAUSE" });
      stopRecognition();
      return;
    }
    if (status === "speaking" || status === "followUpWindow") {
      dispatchEvent({ type: "PAUSE" });
      stopRecognition();
      cancelSpeech();
      return;
    }
    if (status === "pausedMuted") {
      dispatchEvent({ type: "CLOSE_TYPING" });
      void requestListening();
      return;
    }
    if (status === "waitingPermission") return;
    if (status === "error") {
      dispatchEvent({ type: "OPEN_TYPING" });
      return;
    }
    void requestListening();
  }, [cancelSpeech, dispatchEvent, requestListening, stopRecognition]);

  const submitText = useCallback(
    (text: string) => {
      const cleanText = text.trim();
      if (!cleanText) return;
      stopRecognition();
      dispatchEvent({ type: "SUBMIT_TEXT", text: cleanText });
      dispatchEvent({ type: "FINAL_TRANSCRIPT", text: cleanText });
      void answer(cleanText, false, true);
    },
    [answer, dispatchEvent, stopRecognition],
  );

  const openTyping = useCallback(() => {
    const status = modelRef.current.status.kind;
    if (status === "listening" || status === "hearingSpeech") {
      stopRecognition();
      dispatchEvent({ type: "PAUSE" });
    }
    dispatchEvent({ type: "OPEN_TYPING" });
  }, [dispatchEvent, stopRecognition]);
  const closeTyping = useCallback(
    () => dispatchEvent({ type: "CLOSE_TYPING" }),
    [dispatchEvent],
  );
  const retry = useCallback(() => {
    if (modelRef.current.status.kind === "offline") {
      dispatchEvent({ type: "NETWORK_ONLINE" });
      return;
    }
    void requestListening();
  }, [dispatchEvent, requestListening]);
  const exitRecovery = useCallback(
    () => dispatchEvent({ type: "EXIT_RECOVERY" }),
    [dispatchEvent],
  );

  const simulateSpeech = useCallback((text: string) => {
    const mock = recognitionRef.current;
    if (mock instanceof MockRecognitionProvider) mock.simulateSpeech(text);
  }, []);
  const simulateRecognitionError = useCallback(() => {
    const mock = recognitionRef.current;
    if (mock instanceof MockRecognitionProvider) mock.simulateError();
  }, []);
  const simulateServiceError = useCallback(() => {
    const mock = responderRef.current;
    if (mock instanceof MockConversationResponder) mock.failNext();
    if (modelRef.current.status.kind === "thinking") {
      responseRequestIdRef.current += 1;
      dispatchEvent({ type: "SERVICE_ERROR" });
    }
  }, [dispatchEvent]);
  const setOffline = useCallback(
    (offline: boolean) => {
      if (offline) responseRequestIdRef.current += 1;
      dispatchEvent({
        type: offline ? "NETWORK_OFFLINE" : "NETWORK_ONLINE",
      });
    },
    [dispatchEvent],
  );
  const grantPermission = useCallback(() => {
    const mock = permissionRef.current;
    if (mock instanceof MockPermissionProvider) mock.grant();
  }, []);
  const denyPermission = useCallback(() => {
    const mock = permissionRef.current;
    if (mock instanceof MockPermissionProvider) mock.deny();
  }, []);
  const revokePermission = useCallback(() => {
    const mock = permissionRef.current;
    if (mock instanceof MockPermissionProvider) mock.revoke();
  }, []);
  const speakLongReply = useCallback(() => {
    if (modelRef.current.status.kind === "thinking") {
      void answer(modelRef.current.finalTranscript, true);
      return;
    }
    const sample = t("toolbarTranscript");
    dispatchEvent({ type: "SUBMIT_TEXT", text: sample });
    dispatchEvent({ type: "FINAL_TRANSCRIPT", text: sample });
    void answer(sample, true);
  }, [answer, dispatchEvent]);

  useEffect(() => {
    const permission = permissionRef.current;
    const recognition = recognitionRef.current;
    const speech = speechRef.current;
    const unsubscribePermission = permission.onChange((status) => {
      if (
        status === "granted" &&
        modelRef.current.status.kind === "waitingPermission"
      ) {
        dispatchEvent({ type: "PERMISSION_GRANTED" });
        beginRecognition();
      } else if (
        status === "denied" &&
        modelRef.current.status.kind === "waitingPermission"
      ) {
        dispatchEvent({ type: "PERMISSION_DENIED" });
      } else if (
        status === "denied" &&
        modelRef.current.status.kind !== "idle" &&
        modelRef.current.status.kind !== "error"
      ) {
        responseRequestIdRef.current += 1;
        dispatchEvent({ type: "PERMISSION_REVOKED" });
        stopRecognition();
      }
    });
    const unsubscribeRecognition = recognition.onEvent((event) => {
      switch (event.type) {
        case "speechStarted":
          dispatchEvent({ type: "SPEECH_STARTED" });
          break;
        case "interimTranscript":
          dispatchEvent({ type: "INTERIM_TRANSCRIPT", text: event.text });
          break;
        case "finalTranscript":
          stopRecognition();
          dispatchEvent({ type: "FINAL_TRANSCRIPT", text: event.text });
          void answer(event.text);
          break;
        case "speechEnded":
          dispatchEvent({ type: "SPEECH_CONTINUES" });
          break;
        case "error":
          stopRecognition();
          dispatchEvent(
            event.cause === "permission"
              ? { type: "PERMISSION_REVOKED" }
              : { type: "RECOGNITION_ERROR" },
          );
          break;
        case "ended":
          break;
      }
    });
    const unsubscribeSpeech = speech.onEvent((event) => {
      if (event.type === "started") {
        speechIsRunningRef.current = true;
      } else if (event.type === "ended") {
        speechIsRunningRef.current = false;
        if (ignoreSpeechEndRef.current) {
          ignoreSpeechEndRef.current = false;
          return;
        }
        dispatchEvent({ type: "SPEECH_FINISHED" });
      } else if (event.type === "error") {
        dispatchEvent({ type: "SPEECH_ERROR" });
      }
    });
    const unsubscribeAudioLevel = speech.onAudioLevel((level) => {
      onAudioLevel?.(level);
    });

    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      responseRequestIdRef.current += 1;
      stopRecognition();
      cancelSpeech();
      dispatchEvent({ type: "PAGE_HIDDEN" });
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      unsubscribePermission();
      unsubscribeRecognition();
      unsubscribeSpeech();
      unsubscribeAudioLevel();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopRecognition();
      cancelSpeech();
    };
  }, [
    answer,
    beginRecognition,
    cancelSpeech,
    dispatchEvent,
    onAudioLevel,
    stopRecognition,
  ]);

  useEffect(() => {
    if (
      model.status.kind === "listening" ||
      model.status.kind === "hearingSpeech"
    ) {
      const timer = window.setTimeout(
        () => dispatchEvent({ type: "LISTENING_TIMEOUT" }),
        LISTENING_TIMEOUT_MS,
      );
      return () => window.clearTimeout(timer);
    }
    if (model.status.kind === "followUpWindow") {
      const timer = window.setTimeout(
        () => dispatchEvent({ type: "FOLLOWUP_EXPIRED" }),
        FOLLOW_UP_WINDOW_MS,
      );
      return () => window.clearTimeout(timer);
    }
  }, [dispatchEvent, model.status.kind]);

  return {
    model,
    activate,
    toggleMic,
    submitText,
    openTyping,
    closeTyping,
    retry,
    exitRecovery,
    simulateSpeech,
    simulateRecognitionError,
    simulateServiceError,
    setOffline,
    grantPermission,
    denyPermission,
    revokePermission,
    speakLongReply,
  };
}
