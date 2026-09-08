import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar, ProgressRing } from "@/components/ui";

describe("ProgressBar", () => {
  it("reports bounded progress values", () => {
    render(<ProgressBar label="התקדמות" value={35} />);
    const progress = screen.getByRole("progressbar", { name: "התקדמות" });
    expect(progress.getAttribute("aria-valuenow")).toBe("35");
    expect(progress.getAttribute("aria-valuemin")).toBe("0");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
  });
});

describe("ProgressRing", () => {
  it("renders an accessible percentage", () => {
    render(<ProgressRing label="השלמת הצעד" value={42} />);
    expect(
      screen
        .getByRole("progressbar", { name: "השלמת הצעד" })
        .getAttribute("aria-valuenow"),
    ).toBe("42");
    expect(screen.getByText("42%")).toBeTruthy();
  });
});
