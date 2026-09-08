import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui";

describe("Badge", () => {
  it("renders variant copy and deadline text", () => {
    const { rerender } = render(<Badge variant="optional" />);
    expect(screen.getByText("רשות")).toBeTruthy();

    rerender(<Badge variant="due">תוך 30 יום</Badge>);
    expect(screen.getByText("תוך 30 יום")).toBeTruthy();
  });
});
