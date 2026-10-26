import { describe, expect, it } from "vitest";
import { isMochiState, MOCHI_STATES } from "../character/types";
import {
  INITIAL_SESSION,
  sessionReducer,
  sessionToExpression,
} from "./sessionMachine";
import type { SessionEvent, SessionModel, SessionStatus } from "./types";

interface TransitionCase {
  name: string;
  from: SessionStatus;
  event: SessionEvent;
  to: SessionStatus["kind"];
}

const cases: TransitionCase[] = [
  {
    name: "Idle to WaitingPermission",
    from: { kind: "idle" },
    event: { type: "BEGIN_PERMISSION_REQUEST" },
    to: "waitingPermission",
  },
  {
    name: "Idle to Listening",
    from: { kind: "idle" },
    event: { type: "START_LISTENING" },
    to: "listening",
  },
  {
    name: "WaitingPermission to Listening",
    from: { kind: "waitingPermission" },
    event: { type: "PERMISSION_GRANTED" },
    to: "listening",
  },
  {
    name: "WaitingPermission to Error",
    from: { kind: "waitingPermission" },
    event: { type: "PERMISSION_DENIED" },
    to: "error",
  },
  {
    name: "WaitingPermission dismissed to Error",
    from: { kind: "waitingPermission" },
    event: { type: "PERMISSION_DISMISSED" },
    to: "error",
  },
  {
    name: "Error to WaitingPermission",
    from: { kind: "error", cause: "permissionDenied" },
    event: { type: "RETRY" },
    to: "waitingPermission",
  },
  {
    name: "Error to Offline",
    from: { kind: "error", cause: "service" },
    event: { type: "NETWORK_OFFLINE" },
    to: "offline",
  },
  {
    name: "Error to Idle",
    from: { kind: "error", cause: "service" },
    event: { type: "EXIT_RECOVERY" },
    to: "idle",
  },
  {
    name: "Listening to HearingSpeech",
    from: { kind: "listening" },
    event: { type: "SPEECH_STARTED" },
    to: "hearingSpeech",
  },
  {
    name: "Listening to Idle",
    from: { kind: "listening" },
    event: { type: "LISTENING_TIMEOUT" },
    to: "idle",
  },
  {
    name: "Listening to PausedMuted",
    from: { kind: "listening" },
    event: { type: "PAUSE" },
    to: "pausedMuted",
  },
  {
    name: "HearingSpeech to Thinking",
    from: { kind: "hearingSpeech" },
    event: { type: "FINAL_TRANSCRIPT", text: "hello" },
    to: "thinking",
  },
  {
    name: "HearingSpeech to Listening",
    from: { kind: "hearingSpeech" },
    event: { type: "SPEECH_CONTINUES" },
    to: "listening",
  },
  {
    name: "HearingSpeech to Error",
    from: { kind: "hearingSpeech" },
    event: { type: "RECOGNITION_ERROR" },
    to: "error",
  },
  {
    name: "Thinking to Speaking",
    from: { kind: "thinking" },
    event: { type: "RESPONSE_READY", text: "reply", captionOverflow: false },
    to: "speaking",
  },
  {
    name: "Thinking to Offline",
    from: { kind: "thinking" },
    event: { type: "NETWORK_OFFLINE" },
    to: "offline",
  },
  {
    name: "Thinking to Error",
    from: { kind: "thinking" },
    event: { type: "SERVICE_ERROR" },
    to: "error",
  },
  {
    name: "Speaking to FollowUpWindow",
    from: { kind: "speaking" },
    event: { type: "SPEECH_FINISHED" },
    to: "followUpWindow",
  },
  {
    name: "Speaking to Interrupted",
    from: { kind: "speaking" },
    event: { type: "INTERRUPT" },
    to: "interrupted",
  },
  {
    name: "Speaking to PausedMuted",
    from: { kind: "speaking" },
    event: { type: "PAUSE" },
    to: "pausedMuted",
  },
  {
    name: "Speaking to Error",
    from: { kind: "speaking" },
    event: { type: "SPEECH_ERROR" },
    to: "error",
  },
  {
    name: "Interrupted to Listening",
    from: { kind: "interrupted" },
    event: { type: "START_LISTENING" },
    to: "listening",
  },
  {
    name: "Interrupted to PausedMuted",
    from: { kind: "interrupted" },
    event: { type: "PAUSE" },
    to: "pausedMuted",
  },
  {
    name: "FollowUpWindow to Listening",
    from: { kind: "followUpWindow" },
    event: { type: "FOLLOWUP_STARTED" },
    to: "listening",
  },
  {
    name: "FollowUpWindow to Idle",
    from: { kind: "followUpWindow" },
    event: { type: "FOLLOWUP_EXPIRED" },
    to: "idle",
  },
  {
    name: "FollowUpWindow to PausedMuted",
    from: { kind: "followUpWindow" },
    event: { type: "PAUSE" },
    to: "pausedMuted",
  },
  {
    name: "PausedMuted to Listening",
    from: { kind: "pausedMuted" },
    event: { type: "RESUME" },
    to: "listening",
  },
  {
    name: "PausedMuted to Idle",
    from: { kind: "pausedMuted" },
    event: { type: "EXIT_RECOVERY" },
    to: "idle",
  },
  {
    name: "Offline to Error",
    from: { kind: "offline" },
    event: { type: "NETWORK_ONLINE" },
    to: "error",
  },
  {
    name: "Offline to Idle",
    from: { kind: "offline" },
    event: { type: "EXIT_RECOVERY" },
    to: "idle",
  },
];

function modelIn(status: SessionStatus): SessionModel {
  return {
    ...INITIAL_SESSION,
    status,
    micCapture:
      status.kind === "listening" || status.kind === "hearingSpeech"
        ? "active"
        : status.kind === "followUpWindow"
          ? "followup"
          : "off",
    service: status.kind === "offline" ? "offline" : "online",
  };
}

describe("sessionReducer transitions", () => {
  it.each(cases)("$name", ({ from, event, to }) => {
    expect(sessionReducer(modelIn(from), event).status.kind).toBe(to);
  });

  it("ignores invalid transitions without changing the model", () => {
    const idle = INITIAL_SESSION;
    expect(sessionReducer(idle, { type: "RESUME" })).toBe(idle);
    expect(
      sessionReducer(idle, { type: "FINAL_TRANSCRIPT", text: "not listening" }),
    ).toBe(idle);
    expect(
      sessionReducer(modelIn({ kind: "speaking" }), {
        type: "FINAL_TRANSCRIPT",
        text: "too late",
      }).status.kind,
    ).toBe("speaking");
  });

  it("keeps the microphone capture state separate from service availability", () => {
    const listening = modelIn({ kind: "listening" });
    const offline = sessionReducer(listening, { type: "NETWORK_OFFLINE" });
    expect(offline.status.kind).toBe("offline");
    expect(offline.service).toBe("offline");
    expect(offline.micCapture).toBe("active");

    const serviceError = sessionReducer(listening, { type: "SERVICE_ERROR" });
    expect(serviceError.status).toEqual({ kind: "error", cause: "service" });
    expect(serviceError.micCapture).toBe("active");
  });

  it("maps every session state to a valid Mochi expression", () => {
    const statuses: SessionStatus[] = [
      { kind: "idle" },
      { kind: "waitingPermission" },
      { kind: "listening" },
      { kind: "hearingSpeech" },
      { kind: "thinking" },
      { kind: "speaking" },
      { kind: "followUpWindow" },
      { kind: "pausedMuted" },
      { kind: "interrupted" },
      { kind: "error", cause: "service" },
      { kind: "offline" },
    ];
    const mapped = statuses.map((status) => sessionToExpression(status));
    expect(mapped).toHaveLength(statuses.length);
    expect(mapped.every(isMochiState)).toBe(true);
    expect(MOCHI_STATES).toContain(sessionToExpression({ kind: "offline" }));
  });
});
