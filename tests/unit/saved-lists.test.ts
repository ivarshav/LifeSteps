import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSavedLists, removeSavedList, saveList } from "@/lib/saved-lists";
import { encodeShare, type ShareSelection } from "@/lib/share";

const selection: ShareSelection = {
  v: 1,
  t: "למשפחה",
  s: [[12, [1, 5]]],
};

describe("saved lists", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("stores a shared list locally and makes it retrievable", () => {
    const saved = saveList(selection);
    const duplicate = saveList(selection);
    if (!saved || !duplicate) {
      throw new Error("Expected local storage writes to succeed");
    }

    expect(getSavedLists()).toEqual([
      expect.objectContaining({
        id: saved.id,
        selection,
      }),
    ]);
    expect(duplicate.id).toBe(saved.id);

    expect(removeSavedList(saved.id)).toBe(true);
    expect(getSavedLists()).toEqual([]);
  });

  it("reports failed saves and removals without changing persisted data", () => {
    const failedWrite = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      });

    expect(saveList(selection)).toBeNull();
    expect(getSavedLists()).toEqual([]);

    failedWrite.mockRestore();
    const saved = saveList(selection);
    if (!saved) {
      throw new Error("Expected local storage write to succeed");
    }

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    });

    expect(removeSavedList(saved.id)).toBe(false);
    expect(getSavedLists()).toEqual([
      expect.objectContaining({ id: saved.id, selection }),
    ]);
  });

  it("ignores corrupt payloads and invalid saved timestamps", () => {
    localStorage.setItem(
      "ls_saved_lists_v1",
      JSON.stringify([
        {
          id: "invalid-date",
          payload: encodeShare(selection),
          savedAt: "not-a-date",
        },
        {
          id: "stale-payload",
          payload: "not-a-share",
          savedAt: new Date().toISOString(),
        },
      ]),
    );

    expect(getSavedLists()).toEqual([]);
  });
});
