import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip } from "@/components/ui";

describe("Tooltip", () => {
  it("opens for keyboard focus with an accessible relationship", () => {
    render(
      <Tooltip content="מידע נוסף">
        <button type="button">עזרה</button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "עזרה" });
    fireEvent.focus(button);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toBe("מידע נוסף");
    expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
  });

  it("dismisses on Escape without moving focus", () => {
    const { container } = render(
      <Tooltip content="מידע נוסף">
        <button type="button">עזרה במקלדת</button>
      </Tooltip>,
    );
    const { getByRole, queryByRole } = within(container);
    const button = getByRole("button", { name: "עזרה במקלדת" });
    button.focus();
    fireEvent.focus(button);
    expect(getByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(button, { key: "Escape" });
    expect(queryByRole("tooltip")).toBeNull();
    expect(document.activeElement).toBe(button);
  });
});
