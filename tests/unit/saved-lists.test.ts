import { beforeEach, describe, expect, it } from "vitest";

import {
  getSavedLists,
  removeSavedList,
  saveList,
} from "@/lib/saved-lists";

describe("saved lists", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores a shared list locally and makes it retrievable", () => {
    const selection = { v: 1 as const, t: "למשפחה", s: [[12, [1, 5]] as [number, number[]]] };
    const saved = saveList(selection);
    const duplicate = saveList(selection);

    expect(getSavedLists()).toEqual([
      expect.objectContaining({
        id: saved.id,
        selection,
      }),
    ]);
    expect(duplicate.id).toBe(saved.id);

    removeSavedList(saved.id);
    expect(getSavedLists()).toEqual([]);
  });
});
