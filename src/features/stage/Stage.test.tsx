import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Stage } from "./Stage";
import { ONBOARDING_STORAGE_KEY } from "./storage";
import { MOCK_PERMISSION_STORAGE_KEY } from "@/voice/mockPermissionProvider";

function openToolbar() {
  fireEvent.click(screen.getByRole("button", { name: "أدوات التجربة" }));
}

async function startListening() {
  fireEvent.click(screen.getByRole("button", { name: /شخصية Mochi/ }));
  openToolbar();
  fireEvent.click(screen.getByRole("button", { name: "سماح بالمايك" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /بيسمعك/ })).toBeTruthy(),
  );
}

describe("Stage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("shows first-visit onboarding once and remembers the first interaction", async () => {
    const { unmount } = render(<Stage />);
    expect(screen.getByText(/المس Mochi/)).toBeTruthy();
    expect(screen.getByText(/أو اكتب لو مش حابب/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /شخصية Mochi/ }));
    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(screen.queryByText(/المس Mochi/)).toBeNull();
    unmount();
    render(<Stage />);
    expect(screen.queryByText(/المس Mochi/)).toBeNull();
  });

  it("remembers entering typing from the first-visit hint", () => {
    render(<Stage />);
    fireEvent.click(screen.getByRole("button", { name: /أو اكتب لو مش حابب/ }));

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("true");
    expect(
      screen.getByRole("textbox", { name: "اكتب أمرك لـ Mochi" }),
    ).toBeTruthy();
  });

  it("opens typing from a hotkey and ignores hotkeys inside the input", () => {
    render(<Stage />);
    fireEvent.keyDown(window, { key: "a" });
    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "اكتب أمرك لـ Mochi",
    });
    expect(input.value).toBe("a");

    fireEvent.keyDown(input, { key: "b" });
    expect(input.value).toBe("a");
  });

  it("starts with the mic off", () => {
    render(<Stage />);
    expect(
      screen.getByRole("button", {
        name: "حالة المايك: متوقف، المس Mochi لبدء الاستماع",
      }),
    ).toBeTruthy();
  });

  it("starts listening through the mock permission flow after Mochi is touched", async () => {
    render(<Stage />);
    await startListening();
  });

  it("keeps the mic off on a returning load but starts on the next touch", async () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    window.localStorage.setItem(MOCK_PERMISSION_STORAGE_KEY, "granted");
    render(<Stage />);
    expect(
      screen.getByRole("button", {
        name: "حالة المايك: متوقف، المس Mochi لبدء الاستماع",
      }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /شخصية Mochi/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /بيسمعك/ })).toBeTruthy(),
    );
  });

  it("submits typing through the speech response pipeline", async () => {
    render(<Stage />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /كمّل بالكتابة/ })[0],
    );
    fireEvent.change(screen.getByLabelText("اكتب أمرك لـ Mochi"), {
      target: { value: "راجع API integration" },
    });
    fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
    expect(
      await screen.findByText(
        "تمام، فهمت طلبك. خلّينا نبدأ بخطوة واحدة واضحة.",
      ),
    ).toBeTruthy();
  });

  it("shows the permission recovery card when permission is denied", async () => {
    render(<Stage />);
    fireEvent.click(screen.getByRole("button", { name: /شخصية Mochi/ }));
    openToolbar();
    fireEvent.click(screen.getByRole("button", { name: "رفض الإذن" }));
    expect(await screen.findByText(/إذن المايك مقفول حالياً/)).toBeTruthy();
    expect(
      screen.getByText("🔧 إزاي تفتح إذن المايك؟ (خطوات سريعة)"),
    ).toBeTruthy();
  });

  it("offers visible typing after two recognition failures", async () => {
    render(<Stage />);
    await startListening();
    fireEvent.click(
      screen.getByRole("button", { name: "محاكاة خطأ في التعرف" }),
    );
    let recoveryCard = document.querySelector(".stage-recovery-card");
    expect(recoveryCard?.querySelectorAll("button")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /إعادة المحاولة/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /بيسمعك/ })).toBeTruthy(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "محاكاة خطأ في التعرف" }),
    );
    recoveryCard = document.querySelector(".stage-recovery-card");
    expect(recoveryCard?.querySelectorAll("button")).toHaveLength(2);
  });

  it("shows the offline recovery card without adding a hint to returning idle", () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    render(<Stage />);
    expect(screen.queryByText(/المس Mochi/)).toBeNull();
    openToolbar();
    fireEvent.click(screen.getByRole("button", { name: "فصل الاتصال" }));
    expect(screen.getByText(/مفيش اتصال بالإنترنت/)).toBeTruthy();
  });

  it("routes offline typing through the same mock speech and reply flow", async () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    render(<Stage />);
    openToolbar();
    fireEvent.click(screen.getByRole("button", { name: "فصل الاتصال" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: /كمّل بالكتابة/ })[0],
    );
    fireEvent.change(screen.getByLabelText("اكتب أمرك لـ Mochi"), {
      target: { value: "راجع الخطة" },
    });
    fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
    expect(
      await screen.findByText(
        "تمام، فهمت طلبك. خلّينا نبدأ بخطوة واحدة واضحة.",
      ),
    ).toBeTruthy();
    expect(screen.getByText(/الخدمة مش متاحة، والمايك متوقف/)).toBeTruthy();
  });
});
