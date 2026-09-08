import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "@/components/ui";

describe("Chip", () => {
  it("renders and exposes an accessible remove action", () => {
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} removeLabel="הסרת שכיר/ה">
        שכיר/ה
      </Chip>,
    );

    fireEvent.click(screen.getByRole("button", { name: "הסרת שכיר/ה" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
