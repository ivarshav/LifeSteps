import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pill } from "@/components/ui";

describe("Pill", () => {
  it("renders metadata", () => {
    render(<Pill>22 משימות</Pill>);
    expect(screen.getByText("22 משימות")).toBeTruthy();
  });
});
