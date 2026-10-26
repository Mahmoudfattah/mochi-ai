import type { MochiState } from "../character/types";
import type { SessionEvent, SessionModel, SessionStatus } from "./types";

export const INITIAL_SESSION: SessionModel = {
  status: { kind: "idle" },
  micCapture: "off",
  service: "online",
  interimTranscript: "",
  finalTranscript: "",
  reply: "",
  captionOverflow: false,
  typingOpen: false,
  recognitionFailures: 0,
  announcement: "stateIdle",
};

export function sessionStatusName(status: SessionStatus): string {
  return status.kind;
}

function isKind(status: SessionStatus, ...kinds: SessionStatus["kind"][]) {
  return kinds.includes(status.kind);
}

function withStatus(
  model: SessionModel,
  status: SessionStatus,
  micCapture = model.micCapture,
): SessionModel {
  return { ...model, status, micCapture };
}

export function sessionReducer(
  model: SessionModel,
  event: SessionEvent,
): SessionModel {
  switch (event.type) {
    case "BEGIN_PERMISSION_REQUEST":
      if (
        !isKind(
          model.status,
          "idle",
          "error",
          "pausedMuted",
          "interrupted",
          "followUpWindow",
        )
      ) {
        return model;
      }
      return {
        ...withStatus(
          model,
          { kind: "waitingPermission" },
          "permissionPending",
        ),
        announcement: "stateWaitingPermission",
      };
    case "PERMISSION_GRANTED":
      if (model.status.kind !== "waitingPermission") return model;
      return {
        ...withStatus(model, { kind: "listening" }, "active"),
        announcement: "stateListening",
      };
    case "PERMISSION_DENIED":
      if (model.status.kind !== "waitingPermission") return model;
      return {
        ...withStatus(
          model,
          { kind: "error", cause: "permissionDenied" },
          "off",
        ),
        announcement: "stateError",
      };
    case "PERMISSION_DISMISSED":
      if (model.status.kind !== "waitingPermission") return model;
      return {
        ...withStatus(model, { kind: "error", cause: "dismissed" }, "off"),
        announcement: "stateError",
      };
    case "PERMISSION_REVOKED":
      if (model.status.kind === "idle") return model;
      return {
        ...withStatus(
          model,
          { kind: "error", cause: "permissionRevoked" },
          "off",
        ),
        announcement: "stateError",
      };
    case "START_LISTENING":
      if (!isKind(model.status, "idle", "interrupted", "followUpWindow")) {
        return model;
      }
      return {
        ...withStatus(model, { kind: "listening" }, "active"),
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        captionOverflow: false,
        announcement: "stateListening",
      };
    case "RESUME":
      if (model.status.kind !== "pausedMuted") return model;
      return {
        ...withStatus(model, { kind: "listening" }, "active"),
        interimTranscript: "",
        announcement: "stateListening",
      };
    case "RETRY":
      if (model.status.kind !== "error") return model;
      return {
        ...withStatus(
          model,
          { kind: "waitingPermission" },
          "permissionPending",
        ),
        announcement: "stateWaitingPermission",
      };
    case "SPEECH_STARTED":
      if (!isKind(model.status, "listening", "followUpWindow")) return model;
      return {
        ...withStatus(model, { kind: "hearingSpeech" }, "active"),
        announcement: "stateHearingSpeech",
      };
    case "INTERIM_TRANSCRIPT":
      if (!isKind(model.status, "listening", "hearingSpeech")) return model;
      return {
        ...withStatus(model, { kind: "hearingSpeech" }, "active"),
        interimTranscript: event.text,
        announcement: "stateHearingSpeech",
      };
    case "FINAL_TRANSCRIPT":
      if (!isKind(model.status, "listening", "hearingSpeech")) return model;
      return {
        ...withStatus(model, { kind: "thinking" }, "off"),
        interimTranscript: "",
        finalTranscript: event.text,
        recognitionFailures: 0,
        announcement: "stateThinking",
      };
    case "SPEECH_CONTINUES":
      if (model.status.kind !== "hearingSpeech") return model;
      return {
        ...withStatus(model, { kind: "listening" }, "active"),
        announcement: "stateListening",
      };
    case "LISTENING_TIMEOUT":
      if (!isKind(model.status, "listening", "hearingSpeech")) return model;
      return {
        ...withStatus(model, { kind: "idle" }, "off"),
        interimTranscript: "",
        finalTranscript: "",
        announcement: "stateIdle",
      };
    case "RESPONSE_READY":
      if (model.status.kind !== "thinking") return model;
      return {
        ...withStatus(model, { kind: "speaking" }, "off"),
        finalTranscript: "",
        reply: event.text,
        captionOverflow: event.captionOverflow,
        announcement: "stateSpeaking",
      };
    case "SPEECH_FINISHED":
      if (model.status.kind !== "speaking") return model;
      return {
        ...withStatus(model, { kind: "followUpWindow" }, "followup"),
        announcement: "stateFollowUpWindow",
      };
    case "FOLLOWUP_STARTED":
      if (model.status.kind !== "followUpWindow") return model;
      return {
        ...withStatus(model, { kind: "listening" }, "active"),
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        announcement: "stateListening",
      };
    case "FOLLOWUP_EXPIRED":
      if (model.status.kind !== "followUpWindow") return model;
      return {
        ...withStatus(model, { kind: "idle" }, "off"),
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        captionOverflow: false,
        announcement: "stateIdle",
      };
    case "PAUSE":
      if (model.status.kind === "offline" && model.micCapture !== "off") {
        return { ...model, micCapture: "off" };
      }
      if (
        !isKind(
          model.status,
          "listening",
          "hearingSpeech",
          "speaking",
          "followUpWindow",
          "interrupted",
        )
      ) {
        return model;
      }
      return {
        ...withStatus(model, { kind: "pausedMuted" }, "off"),
        announcement: "statePausedMuted",
      };
    case "INTERRUPT":
      if (model.status.kind !== "speaking") return model;
      return {
        ...withStatus(model, { kind: "interrupted" }, "off"),
        announcement: "stateInterrupted",
      };
    case "RECOGNITION_ERROR":
      if (!isKind(model.status, "listening", "hearingSpeech")) return model;
      return {
        ...withStatus(model, { kind: "error", cause: "recognition" }, "off"),
        recognitionFailures: model.recognitionFailures + 1,
        announcement: "stateError",
      };
    case "SPEECH_ERROR":
      if (model.status.kind !== "speaking") return model;
      return {
        ...withStatus(model, { kind: "error", cause: "speech" }, "off"),
        announcement: "stateError",
      };
    case "SERVICE_ERROR":
      if (model.status.kind === "idle") return model;
      return {
        ...model,
        status: { kind: "error", cause: "service" },
        announcement: "stateError",
      };
    case "NETWORK_OFFLINE":
      return {
        ...model,
        status: { kind: "offline" },
        service: "offline",
        announcement: "stateOffline",
      };
    case "NETWORK_ONLINE":
      if (model.status.kind !== "offline") {
        return { ...model, service: "online" };
      }
      return {
        ...model,
        status: { kind: "error", cause: "service" },
        service: "online",
        announcement: "stateError",
      };
    case "EXIT_RECOVERY":
      if (!isKind(model.status, "error", "offline", "pausedMuted"))
        return model;
      return {
        ...withStatus(model, { kind: "idle" }, "off"),
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        captionOverflow: false,
        typingOpen: false,
        announcement: "stateIdle",
      };
    case "OPEN_TYPING":
      if (model.status.kind === "idle") {
        return {
          ...withStatus(model, { kind: "pausedMuted" }, "off"),
          typingOpen: true,
          announcement: "statePausedMuted",
        };
      }
      return { ...model, typingOpen: true };
    case "CLOSE_TYPING":
      if (model.status.kind === "pausedMuted") {
        return {
          ...withStatus(model, { kind: "idle" }, "off"),
          typingOpen: false,
          announcement: "stateIdle",
        };
      }
      return { ...model, typingOpen: false };
    case "SUBMIT_TEXT":
      if (
        !isKind(
          model.status,
          "idle",
          "pausedMuted",
          "error",
          "waitingPermission",
          "offline",
        )
      ) {
        return model;
      }
      return {
        ...withStatus(model, { kind: "hearingSpeech" }, "off"),
        interimTranscript: "",
        finalTranscript: event.text,
        typingOpen: false,
        announcement: "stateHearingSpeech",
      };
    case "PAGE_HIDDEN":
      return {
        ...withStatus(model, { kind: "idle" }, "off"),
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        captionOverflow: false,
        typingOpen: false,
        announcement: "stateIdle",
      };
    case "CLEAR_TRANSIENT":
      return {
        ...model,
        interimTranscript: "",
        finalTranscript: "",
        reply: "",
        captionOverflow: false,
      };
  }
}

const SESSION_EXPRESSION: Record<SessionStatus["kind"], MochiState> = {
  idle: "idle",
  waitingPermission: "waiting-permission",
  listening: "listening",
  hearingSpeech: "hearing",
  thinking: "thinking",
  speaking: "speaking",
  followUpWindow: "followup",
  pausedMuted: "paused",
  interrupted: "interrupted",
  error: "error",
  offline: "offline",
};

export function sessionToExpression(
  status: SessionStatus,
  context: Readonly<Record<string, never>> = {},
): MochiState {
  void context;
  return SESSION_EXPRESSION[status.kind];
}
