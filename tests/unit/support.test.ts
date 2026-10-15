import { afterEach, describe, expect, it, vi } from "vitest";

import { getKofiUrl, isKofiSupportEnabled } from "@/lib/support";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getKofiUrl", () => {
  it("hides Ko-fi support by default", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_KOFI_SUPPORT", "");
    expect(isKofiSupportEnabled()).toBe(false);
    expect(getKofiUrl(undefined)).toBeNull();
  });

  it("uses the LifeSteps Ko-fi profile when support is enabled without an override", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_KOFI_SUPPORT", "true");
    expect(isKofiSupportEnabled()).toBe(true);
    expect(getKofiUrl(undefined)).toBe("https://ko-fi.com/lifesteps");
  });

  it("accepts a Ko-fi creator profile URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_KOFI_SUPPORT", "true");
    expect(getKofiUrl("https://ko-fi.com/lifesteps")).toBe(
      "https://ko-fi.com/lifesteps",
    );
  });

  it.each([
    "http://ko-fi.com/lifesteps",
    "https://example.com/lifesteps",
    "https://ko-fi.com/",
    "https://ko-fi.com/lifesteps/extra",
    "https://ko-fi.com.evil.example/lifesteps",
    "https://ko-fi.com/lifesteps#support",
  ])("rejects an unsafe or non-profile URL: %s", (url) => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_KOFI_SUPPORT", "true");
    expect(getKofiUrl(url)).toBeNull();
  });
});