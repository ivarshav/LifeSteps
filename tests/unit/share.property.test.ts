import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { decodeShare, encodeShare, type ShareSelection } from "@/lib/share";

const selectionArbitrary: fc.Arbitrary<ShareSelection> = fc
  .record({
    t: fc.option(fc.string({ maxLength: 60 }), { nil: undefined }),
    m: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    s: fc.uniqueArray(
      fc.tuple(
        fc.integer({ min: 1, max: 10_000 }),
        fc.uniqueArray(fc.integer({ min: 1, max: 10_000 }), { maxLength: 30 }),
      ),
      { minLength: 1, maxLength: 40, selector: ([stepNid]) => stepNid },
    ),
  })
  .map((value) => ({ v: 1, ...value }));

describe("share-link property", () => {
  it("losslessly decodes every valid encoded selection", () => {
    fc.assert(
      fc.property(selectionArbitrary, (selection) => {
        expect(decodeShare(encodeShare(selection))).toEqual(selection);
      }),
    );
  });
});
