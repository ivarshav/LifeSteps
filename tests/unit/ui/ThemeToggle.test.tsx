import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/ui";
import { THEME_STORAGE_KEY } from "@/lib/theme";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("applies and persists the explicit theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "מעבר למצב כהה" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "מעבר למצב בהיר" })).toBeTruthy();
  });
});
