import { describe, expect, it, vi } from "vitest";
import { MockRecognitionProvider } from "./mockRecognitionProvider";

describe("MockRecognitionProvider", () => {
  it("shows an interim transcript before finalizing the utterance", () => {
    vi.useFakeTimers();
    const provider = new MockRecognitionProvider();
    const events: string[] = [];
    provider.onEvent((event) => events.push(event.type));
    provider.start();

    provider.simulateSpeech("sample transcript");
    expect(events).toEqual(["speechStarted", "interimTranscript"]);

    vi.runOnlyPendingTimers();
    expect(events).toEqual([
      "speechStarted",
      "interimTranscript",
      "finalTranscript",
      "speechEnded",
    ]);
    vi.useRealTimers();
  });
});
