export type PermissionStatus = "unknown" | "granted" | "denied";

export type RecognitionEvent =
  | { type: "interimTranscript"; text: string }
  | { type: "finalTranscript"; text: string }
  | { type: "speechStarted" }
  | { type: "speechEnded" }
  | { type: "error"; cause: "recognition" | "permission" }
  | { type: "ended" };

export type SpeechEvent =
  { type: "started" } | { type: "ended" } | { type: "error" };

export interface RecognitionProvider {
  start(): void;
  stop(): void;
  onEvent(listener: (event: RecognitionEvent) => void): () => void;
}

export interface SpeechProvider {
  speak(text: string): void;
  cancel(): void;
  onEvent(listener: (event: SpeechEvent) => void): () => void;
  onAudioLevel(listener: (level: number) => void): () => void;
}

export interface PermissionProvider {
  query(): Promise<PermissionStatus>;
  request(): Promise<PermissionStatus>;
  onChange(listener: (status: PermissionStatus) => void): () => void;
}
