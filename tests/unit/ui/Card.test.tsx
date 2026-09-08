import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "@/components/ui";

describe("Card", () => {
  it("renders its content", () => {
    render(<Card>כרטיס</Card>);
    expect(screen.getByText("כרטיס")).toBeTruthy();
  });
});
