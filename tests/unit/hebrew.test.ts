import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  foldFinals,
  normalize,
  stripNiqqud,
  stripPrefixes,
} from "@/lib/hebrew";
import { searchContent, type SearchIndexEntry } from "@/lib/search";

const generatedIndex = JSON.parse(
  readFileSync(join(process.cwd(), "public", "search-index.json"), "utf8"),
) as SearchIndexEntry[];

describe("Hebrew normalization", () => {
  it("strips niqqud", () => {
    expect(stripNiqqud("שָׁלוֹם")).toBe("שלום");
    expect(normalize("שָׁלוֹם")).toBe(normalize("שלום"));
  });

  it("folds final letters without stripping prefixes", () => {
    expect(foldFinals("ךםןףץ")).toBe("כמנפצ");
    expect(normalize("בבית")).toBe("בבית");
  });

  it("strips one Hebrew prefix particle per token only as an explicit fallback", () => {
    expect(stripPrefixes("בבית")).toBe("בית");
    expect(stripPrefixes("בית")).toBe("ית");
  });

  it("finds inflected terms, task titles, niqqud, and prefixed queries", () => {
    const entries: SearchIndexEntry[] = [
      {
        id: "end-employment",
        title: "סיום העסקה",
        titleN: normalize("סיום העסקה"),
        summary: "השלמת הזכויות והמסמכים בסיום עבודה.",
        categoryId: "career",
        emoji: "💼",
        keywords: [normalize("פיצויים")],
        tasks: [
          {
            id: "form-161",
            title: "קבלת טופס 161",
            titleN: normalize("קבלת טופס 161"),
          },
        ],
      },
      {
        id: "home",
        title: "בית",
        titleN: normalize("בית"),
        summary: "מעבר לבית חדש.",
        categoryId: "housing",
        emoji: "🏠",
        keywords: [normalize("דיור")],
        tasks: [],
      },
      {
        id: "car",
        title: "רכב",
        titleN: normalize("רכב"),
        summary: "טיפול ברכב.",
        categoryId: "vehicle",
        emoji: "🚗",
        keywords: [normalize("רכבים")],
        tasks: [],
      },
    ];

    expect(searchContent(entries, "טֹפֶס 161")[0]?.item.id).toBe(
      "end-employment",
    );
    expect(searchContent(entries, "בבית")[0]?.item.id).toBe("home");
    expect(searchContent(entries, "רכבים")[0]?.item.id).toBe("car");
    expect(searchContent(entries, "טפסים")[0]?.item.id).toBe("end-employment");
  });

  it.each([
    ["בתאוריה", "תאוריה", "get-drivers-license"],
    ["בשעבוד", "שעבוד", "buy-used-car"],
    ["בארנונה", "ארנונה", "moving-home"],
    ["בחתונה", "חתונה", "getting-married"],
    ["ברבנות", "רבנות", "getting-married"],
  ])(
    "ranks the prefix-stripped exact match for %s using the generated index",
    (prefixed, exact, expectedId) => {
      const prefixedResults = searchContent(generatedIndex, prefixed);
      const exactResults = searchContent(generatedIndex, exact);

      expect(prefixedResults[0]?.item.id).toBe(expectedId);
      expect(exactResults.some((result) => result.item.id === expectedId)).toBe(
        true,
      );
      expect(
        new Set(prefixedResults.map((result) => result.item.id)).size,
      ).toBe(prefixedResults.length);
    },
  );
});
