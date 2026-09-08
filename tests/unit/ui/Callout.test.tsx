import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "@/components/ui";

describe("Callout", () => {
  it("renders warning and info variants", () => {
    const { rerender } = render(<Callout variant="warn">זהירות</Callout>);
    expect(screen.getByText("⚠").getAttribute("aria-hidden")).toBe("true");

    rerender(<Callout variant="info">מידע</Callout>);
    expect(screen.getByText("מידע")).toBeTruthy();
  });
});
