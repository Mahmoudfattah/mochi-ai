import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MochiGallery } from "./MochiGallery";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("MochiGallery", () => {
  it("switches the preview between the spec and reference motion presets", () => {
    const { container } = render(<MochiGallery />);
    const avatar = container.querySelector(
      ".mochi-gallery__preview .mochi-svg",
    );

    expect(avatar?.getAttribute("data-motion-preset")).toBe("spec");

    fireEvent.click(screen.getByRole("button", { name: "reference" }));

    expect(avatar?.getAttribute("data-motion-preset")).toBe("reference");
    expect(avatar?.getAttribute("style")).toContain(
      "--motion-look-duration: 1500ms",
    );
  });
});
