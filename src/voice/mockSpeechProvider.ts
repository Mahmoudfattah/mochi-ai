import {
  MOCK_SPEECH_AUDIO_LEVEL_INTERVAL_MS,
  MOCK_SPEECH_MAX_DURATION_MS,
  MOCK_SPEECH_MIN_DURATION_MS,
  MOCK_SPEECH_MS_PER_CHARACTER,
} from "@/config/sessionTimings";
import type { SpeechEvent, SpeechProvider } from "./providers";

const AUDIO_LEVEL_SEQUENCE = [0.18, 0.54, 0.32, 0.72, 0.4, 0.62, 0.24] as const;

export class MockSpeechProvider implements SpeechProvider {
  private readonly listeners = new Set<(event: SpeechEvent) => void>();
  private readonly levelListeners = new Set<(level: number) => void>();
  private completionTimer: ReturnType<typeof setTimeout> | undefined;
  private levelTimer: ReturnType<typeof setTimeout> | undefined;
  private audioLevelIndex = 0;

  speak(text: string): void {
    this.cancel();
    this.emit({ type: "started" });

    const durationMs = Math.min(
      MOCK_SPEECH_MAX_DURATION_MS,
      Math.max(
        MOCK_SPEECH_MIN_DURATION_MS,
        text.length * MOCK_SPEECH_MS_PER_CHARACTER,
      ),
    );
    this.audioLevelIndex = 0;
    this.emitAudioLevel(AUDIO_LEVEL_SEQUENCE[0]);
    this.scheduleAudioLevel();
    this.completionTimer = globalThis.setTimeout(() => {
      this.clearTimers();
      this.emitAudioLevel(0);
      this.emit({ type: "ended" });
    }, durationMs);
  }

  cancel(): void {
    const wasSpeaking = this.completionTimer !== undefined;
    this.clearTimers();
    this.emitAudioLevel(0);
    if (wasSpeaking) this.emit({ type: "ended" });
  }

  onEvent(listener: (event: SpeechEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onAudioLevel(listener: (level: number) => void): () => void {
    this.levelListeners.add(listener);
    return () => this.levelListeners.delete(listener);
  }

  private emit(event: SpeechEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private emitAudioLevel(level: number): void {
    this.levelListeners.forEach((listener) => listener(level));
  }

  private clearTimers(): void {
    if (this.completionTimer !== undefined) {
      globalThis.clearTimeout(this.completionTimer);
      this.completionTimer = undefined;
    }
    if (this.levelTimer !== undefined) {
      globalThis.clearTimeout(this.levelTimer);
      this.levelTimer = undefined;
    }
  }

  private scheduleAudioLevel(): void {
    this.levelTimer = globalThis.setTimeout(() => {
      if (this.completionTimer === undefined) return;
      this.audioLevelIndex =
        (this.audioLevelIndex + 1) % AUDIO_LEVEL_SEQUENCE.length;
      this.emitAudioLevel(AUDIO_LEVEL_SEQUENCE[this.audioLevelIndex]);
      this.scheduleAudioLevel();
    }, MOCK_SPEECH_AUDIO_LEVEL_INTERVAL_MS);
  }
}
