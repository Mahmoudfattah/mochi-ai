import type { MochiState } from "../character/types";
import type { LocaleKey } from "@/config/locale/ar-EG";

export type SessionStatus =
  | { kind: "idle" }
  | { kind: "waitingPermission" }
  | { kind: "listening" }
  | { kind: "hearingSpeech" }
  | { kind: "thinking" }
  | { kind: "speaking" }
  | { kind: "followUpWindow" }
  | { kind: "pausedMuted" }
  | { kind: "interrupted" }
  | {
      kind: "error";
      cause:
        | "permissionDenied"
        | "permissionRevoked"
        | "recognition"
        | "speech"
        | "service"
        | "dismissed";
    }
  | { kind: "offline" };

export type MicCaptureState =
  "off" | "permissionPending" | "active" | "followup";

export type ServiceState = "online" | "offline";

export interface SessionModel {
  status: SessionStatus;
  micCapture: MicCaptureState;
  service: ServiceState;
  interimTranscript: string;
  finalTranscript: string;
  reply: string;
  captionOverflow: boolean;
  typingOpen: boolean;
  recognitionFailures: number;
  announcement: LocaleKey;
}

export type SessionEvent =
  | { type: "BEGIN_PERMISSION_REQUEST" }
  | { type: "PERMISSION_GRANTED" }
  | { type: "PERMISSION_DENIED" }
  | { type: "PERMISSION_DISMISSED" }
  | { type: "PERMISSION_REVOKED" }
  | { type: "START_LISTENING" }
  | { type: "SPEECH_STARTED" }
  | { type: "INTERIM_TRANSCRIPT"; text: string }
  | { type: "FINAL_TRANSCRIPT"; text: string }
  | { type: "SPEECH_CONTINUES" }
  | { type: "LISTENING_TIMEOUT" }
  | { type: "RESPONSE_READY"; text: string; captionOverflow: boolean }
  | { type: "SPEECH_FINISHED" }
  | { type: "FOLLOWUP_STARTED" }
  | { type: "FOLLOWUP_EXPIRED" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "INTERRUPT" }
  | { type: "RECOGNITION_ERROR" }
  | { type: "SPEECH_ERROR" }
  | { type: "SERVICE_ERROR" }
  | { type: "NETWORK_OFFLINE" }
  | { type: "NETWORK_ONLINE" }
  | { type: "RETRY" }
  | { type: "EXIT_RECOVERY" }
  | { type: "OPEN_TYPING" }
  | { type: "CLOSE_TYPING" }
  | { type: "SUBMIT_TEXT"; text: string }
  | { type: "PAGE_HIDDEN" }
  | { type: "CLEAR_TRANSIENT" };

export type SessionExpressionContext = Readonly<Record<string, never>>;

export type SessionExpression = MochiState;
