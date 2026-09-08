import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Toast, ToastProvider, useToast } from "@/components/ui";

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("is dismissible and auto-dismisses", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <Toast duration={3500} onDismiss={onDismiss}>
        נשמר
      </Toast>,
    );
    expect(screen.getByRole("status").textContent).toContain("נשמר");

    act(() => vi.advanceTimersByTime(3500));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

function ToastConsumer() {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("עודכן")} type="button">
      הצגה
    </button>
  );
}

describe("ToastProvider", () => {
  it("exposes a live, stacked toast region", () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "הצגה" }));
    expect(screen.getByText("עודכן")).toBeTruthy();
    expect(
      screen.getByText("עודכן").closest('[aria-live="polite"]'),
    ).toBeTruthy();
  });
});
