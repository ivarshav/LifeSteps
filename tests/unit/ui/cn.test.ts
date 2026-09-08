import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins conditional class names", () => {
    expect(cn("base", false, { active: true, hidden: false })).toBe(
      "base active",
    );
  });
});
