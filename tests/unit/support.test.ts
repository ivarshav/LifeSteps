import { describe, expect, it } from "vitest";

import { getKofiUrl } from "@/lib/support";

describe("getKofiUrl", () => {
  it("uses the LifeSteps Ko-fi profile when no override is configured", () => {
    expect(getKofiUrl(undefined)).toBe("https://ko-fi.com/lifesteps");
  });

  it("accepts a Ko-fi creator profile URL", () => {
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
    expect(getKofiUrl(url)).toBeNull();
  });
});