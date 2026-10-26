import { MOCK_RECOGNITION_FINALIZATION_MS } from "@/config/sessionTimings";
import type { RecognitionEvent, RecognitionProvider } from "./providers";

export class MockRecognitionProvider implements RecognitionProvider {
  private readonly listeners = new Set<(event: RecognitionEvent) => void>();
  private active = false;
  private finalizationTimer: ReturnType<typeof setTimeout> | undefined;

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
    this.clearFinalizationTimer();
    this.emit({ type: "ended" });
  }

  onEvent(listener: (event: RecognitionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  simulateSpeech(text: string): void {
    if (!this.active) return;
    this.emit({ type: "speechStarted" });
    this.emit({ type: "interimTranscript", text });
    this.clearFinalizationTimer();
    this.finalizationTimer = globalThis.setTimeout(() => {
      this.finalizationTimer = undefined;
      if (!this.active) return;
      this.emit({ type: "finalTranscript", text });
      this.emit({ type: "speechEnded" });
    }, MOCK_RECOGNITION_FINALIZATION_MS);
  }

  simulateError(cause: "recognition" | "permission" = "recognition"): void {
    if (!this.active) return;
    this.active = false;
    this.clearFinalizationTimer();
    this.emit({ type: "error", cause });
  }

  private emit(event: RecognitionEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private clearFinalizationTimer(): void {
    if (this.finalizationTimer !== undefined) {
      globalThis.clearTimeout(this.finalizationTimer);
      this.finalizationTimer = undefined;
    }
  }
}
