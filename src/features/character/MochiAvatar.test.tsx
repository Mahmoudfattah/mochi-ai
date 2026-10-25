import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MochiAvatar } from "./MochiAvatar";
import { MOCHI_STATES, type MochiAvatarHandle } from "./types";
import { createRef } from "react";

afterEach(cleanup);

describe("MochiAvatar", () => {
  it.each(MOCHI_STATES)(
    "renders %s with the accessible persona name",
    (state) => {
      render(<MochiAvatar state={state} label="موتشي" />);

      const character = screen.getByRole("img", { name: "موتشي" });
      expect(character.getAttribute("data-state")).toBe(state);
      expect(character.querySelector("svg")).toBeNull();
    },
  );

  it("uses a native button when interaction is provided", () => {
    const onInteract = () => undefined;
    render(<MochiAvatar state="idle" label="موتشي" onInteract={onInteract} />);

    expect(
      screen.getByRole("button", { name: "موتشي" }).getAttribute("type"),
    ).toBe("button");
  });

  it("namespaces gradient ids for coexisting instances", () => {
    const { container } = render(
      <>
        <MochiAvatar state="idle" />
        <MochiAvatar state="happy" />
      </>,
    );
    const ids = [...container.querySelectorAll("svg [id]")].map((node) =>
      node.getAttribute("id"),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("updates audio level imperatively on the SVG root", async () => {
    const ref = createRef<MochiAvatarHandle>();
    const { container } = render(<MochiAvatar ref={ref} state="speaking" />);
    const svg = container.querySelector("svg");

    await new Promise((resolve) => setTimeout(resolve, 40));
    act(() => ref.current?.setAudioLevel(0.72));

    expect(svg?.style.getPropertyValue("--audio-level")).toBe("0.72");
  });
});
