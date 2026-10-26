import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSessionController } from "./useSessionController";

function ControllerHarness() {
  const controller = useSessionController();
  return (
    <div>
      <output data-testid="status">
        {controller.model.status.kind}
        {controller.model.status.kind === "error"
          ? `:${controller.model.status.cause}`
          : ""}
      </output>
      <output data-testid="mic">{controller.model.micCapture}</output>
      <button type="button" onClick={controller.activate}>
        activate
      </button>
      <button type="button" onClick={controller.openTyping}>
        open typing
      </button>
      <button type="button" onClick={controller.grantPermission}>
        grant
      </button>
      <button type="button" onClick={() => controller.simulateSpeech("sample")}>
        simulate
      </button>
      <button type="button" onClick={() => controller.setOffline(true)}>
        offline
      </button>
      <button type="button" onClick={controller.revokePermission}>
        revoke
      </button>
    </div>
  );
}

async function activateWithPermission() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "activate" }));
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => fireEvent.click(screen.getByRole("button", { name: "grant" })));
  expect(screen.getByTestId("status").textContent).toBe("listening");
}

describe("useSessionController", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("returns to Idle when the listening timeout expires", async () => {
    vi.useFakeTimers();
    render(<ControllerHarness />);
    await activateWithPermission();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId("status").textContent).toBe("idle");
    expect(screen.getByTestId("mic").textContent).toBe("off");
  });

  it("expires the follow-up window after the configured duration", async () => {
    vi.useFakeTimers();
    render(<ControllerHarness />);
    await activateWithPermission();
    fireEvent.click(screen.getByRole("button", { name: "simulate" }));
    await act(async () => {
      vi.advanceTimersByTime(0);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId("status").textContent).toBe("speaking");

    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    expect(screen.getByTestId("status").textContent).toBe("followUpWindow");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("status").textContent).toBe("idle");
  });

  it("stops listening and returns to Idle when the page is hidden", async () => {
    render(<ControllerHarness />);
    await activateWithPermission();

    const previousDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByTestId("status").textContent).toBe("idle");
    expect(screen.getByTestId("mic").textContent).toBe("off");
    if (previousDescriptor) {
      Object.defineProperty(document, "visibilityState", previousDescriptor);
    }
  });

  it("turns permission revocation into an immediate mic-off error", async () => {
    render(<ControllerHarness />);
    await activateWithPermission();
    fireEvent.click(screen.getByRole("button", { name: "revoke" }));
    expect(screen.getByTestId("status").textContent).toBe(
      "error:permissionRevoked",
    );
    expect(screen.getByTestId("mic").textContent).toBe("off");
  });

  it("pauses microphone capture before opening typing", async () => {
    render(<ControllerHarness />);
    await activateWithPermission();

    fireEvent.click(screen.getByRole("button", { name: "open typing" }));

    expect(screen.getByTestId("status").textContent).toBe("pausedMuted");
    expect(screen.getByTestId("mic").textContent).toBe("off");
  });

  it("keeps mic capture active when service availability changes", async () => {
    render(<ControllerHarness />);
    await activateWithPermission();
    fireEvent.click(screen.getByRole("button", { name: "offline" }));
    expect(screen.getByTestId("status").textContent).toBe("offline");
    expect(screen.getByTestId("mic").textContent).toBe("active");
  });
});
