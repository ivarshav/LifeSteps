import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "@/components/ui";

describe("Checkbox", () => {
  it("announces mixed state and toggles with Space only", () => {
    const onChange = vi.fn();
    render(<Checkbox checked="mixed" label="בחירת סעיף" onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "בחירת סעיף" });

    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(checkbox.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(checkbox, { key: " " });
    expect(onChange).toHaveBeenCalledWith(true);

    fireEvent.keyDown(checkbox, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("removes disabled controls from the tab order", () => {
    render(
      <Checkbox
        checked={false}
        disabled
        label="לא זמין"
        onChange={() => undefined}
      />,
    );
    expect(
      screen
        .getByRole("checkbox", { name: "לא זמין" })
        .getAttribute("tabindex"),
    ).toBe("-1");
  });
});
