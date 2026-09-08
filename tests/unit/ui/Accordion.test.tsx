import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Accordion } from "@/components/ui";

describe("Accordion", () => {
  it("connects its trigger and makes collapsed content non-interactive", () => {
    render(
      <Accordion defaultOpen title="שאלה">
        <a href="/answer">תשובה</a>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: "שאלה" });
    const panelId = trigger.getAttribute("aria-controls");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId ?? "")).toBeTruthy();
    expect(screen.getByRole("link", { name: "תשובה" })).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(panelId ?? "")?.hidden).toBe(true);
    expect(screen.queryByRole("link", { name: "תשובה" })).toBeNull();
  });
});
