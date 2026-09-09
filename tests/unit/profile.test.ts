import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearProfile,
  isProfileEmpty,
  readProfile,
  saveProfile,
} from "@/lib/profile";
import { getProgress, toggleTask } from "@/lib/progress";

describe("profile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips valid non-identifying choices", () => {
    expect(
      saveProfile({
        employment: "employee",
        interests: ["housing", "career"],
        lifeStage: "early-career",
        maritalStatus: "other",
      }),
    ).toBe(true);
    expect(readProfile()).toEqual({
      employment: "employee",
      interests: ["housing", "career"],
      lifeStage: "early-career",
      maritalStatus: "other",
    });
  });

  it("discards malformed, unknown, and invalid stored values", () => {
    localStorage.setItem("ls_profile_v1", "not json");
    expect(readProfile()).toEqual({});

    localStorage.setItem(
      "ls_profile_v1",
      JSON.stringify({ lifeStage: "studies", name: "not allowed" }),
    );
    expect(readProfile()).toEqual({});

    localStorage.setItem(
      "ls_profile_v1",
      JSON.stringify({ interests: ["not-a-category"] }),
    );
    expect(readProfile()).toEqual({});

    localStorage.setItem(
      "ls_profile_v1",
      JSON.stringify({ interests: ["housing", "housing"] }),
    );
    expect(readProfile()).toEqual({});
  });

  it("migrates retired sensitive values without creating an event selection", () => {
    localStorage.setItem(
      "ls_profile_v1",
      JSON.stringify({
        employment: "job-seeking",
        housing: "renting",
        maritalStatus: "divorced",
      }),
    );

    expect(readProfile()).toEqual({ housing: "renting" });
    expect(localStorage.getItem("ls_profile_v1")).toBe(
      JSON.stringify({ housing: "renting" }),
    );
    expect(localStorage.getItem("ls_event_selections_v1")).toBeNull();
  });

  it("clears the profile without affecting task progress", () => {
    saveProfile({ housing: "renting" });
    toggleTask("buy-used-car", "research-budget");

    clearProfile();

    expect(readProfile()).toEqual({});
    expect(getProgress("buy-used-car")).toEqual(new Set(["research-budget"]));
    expect(isProfileEmpty(readProfile())).toBe(true);
  });

  it("removes empty profiles instead of retaining an empty storage value", () => {
    saveProfile({ interests: [] });

    expect(localStorage.getItem("ls_profile_v1")).toBeNull();
  });

  it("survives unavailable browser storage", () => {
    const set = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(saveProfile({ kids: "young" })).toBe(false);
    set.mockRestore();

    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(readProfile()).toEqual({});
    get.mockRestore();

    const remove = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(clearProfile()).toBe(false);
    remove.mockRestore();
  });
});
