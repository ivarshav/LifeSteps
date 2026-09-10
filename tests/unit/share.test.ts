import { describe, expect, it } from "vitest";

import { decodeShare, encodeShare, estimateLength, type ShareSelection } from "@/lib/share";

const selection: ShareSelection = {
  v: 1,
  t: "רשימה בעברית",
  m: "בהצלחה",
  s: [[7, []], [12, [1, 2, 5]]],
};

describe("share links", () => {
  it("round-trips a valid selection without expanding whole steps", () => {
    expect(decodeShare(encodeShare(selection))).toEqual(selection);
  });

  it("rejects empty, malformed, future-version, and oversized payloads", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("#")).toBeNull();
    expect(decodeShare("not-a-share")).toBeNull();
    expect(decodeShare(encodeShare({ ...selection, v: 2 } as never))).toBeNull();
    expect(decodeShare(encodeShare({ ...selection, t: "א".repeat(61) }))).toBeNull();
    expect(decodeShare(encodeShare({ ...selection, s: Array.from({ length: 101 }, (_, index) => [index + 1, []]) }))).toBeNull();
  });

  it("measures the complete share URL", () => {
    expect(estimateLength(selection, "https://example.test")).toBe(
      `https://example.test/s#${encodeShare(selection)}`.length,
    );
  });
});
