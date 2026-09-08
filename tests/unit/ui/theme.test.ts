import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyTheme, getTheme, setTheme, THEME_STORAGE_KEY } from "@/lib/theme";

describe("theme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("uses the OS preference until an explicit theme is persisted", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    expect(getTheme()).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    setTheme("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
