import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearEventSelections,
  EVENT_SELECTIONS_STORAGE_KEY,
  readEventSelections,
  saveEventSelections,
} from "@/lib/event-selections";
import { StepSchema, type Step } from "@/lib/schema";
import { saveProfile } from "@/lib/profile";
import { getProgress, toggleTask } from "@/lib/progress";

function step(
  id: string,
  eligibility: "profile" | "explicit-event",
  status?: "coming-soon",
): Step {
  return StepSchema.parse({
    categoryId: "family",
    emoji: "📋",
    id,
    keywords: [],
    lastReviewed: "2026-01-01",
    nid: id === "event" ? 1 : 2,
    recommendationEligibility: { kind: eligibility },
    sections: [
      {
        id: "section",
        nid: 1,
        tasks: [{ id: "task", nid: 1, title: "משימה לדוגמה" }],
        title: "שלב לדוגמה",
      },
    ],
    sources: [{ label: "מקור", url: "https://www.gov.il/" }],
    status,
    summary: "תיאור קצר",
    title: "צעד לדוגמה",
  });
}

const publishedEvent = step("event", "explicit-event");
const profileStep = step("profile", "profile");
const upcomingEvent = step("upcoming", "explicit-event", "coming-soon");
const steps = [publishedEvent, profileStep, upcomingEvent];

describe("event selections", () => {
  beforeEach(() => localStorage.clear());

  it("stores only published explicit-event guide IDs and keeps its key isolated", () => {
    expect(
      saveEventSelections(
        ["event", "event", "profile", "upcoming", "unknown"],
        steps,
      ),
    ).toBe(true);
    expect(readEventSelections(steps)).toEqual(["event"]);
    expect(localStorage.getItem(EVENT_SELECTIONS_STORAGE_KEY)).toBe(
      JSON.stringify({ version: 1, stepIds: ["event"] }),
    );
    expect(localStorage.getItem("ls_profile_v1")).toBeNull();
  });

  it("safely discards malformed and unavailable storage", () => {
    localStorage.setItem(EVENT_SELECTIONS_STORAGE_KEY, "not json");
    expect(readEventSelections(steps)).toEqual([]);
    localStorage.setItem(
      EVENT_SELECTIONS_STORAGE_KEY,
      JSON.stringify({ version: 1, stepIds: ["unknown"] }),
    );
    expect(readEventSelections(steps)).toEqual([]);

    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(readEventSelections(steps)).toEqual([]);
    get.mockRestore();
  });

  it("clears selections and removes the storage key for an empty valid set", () => {
    saveEventSelections(["event"], steps);
    expect(clearEventSelections()).toBe(true);
    expect(localStorage.getItem(EVENT_SELECTIONS_STORAGE_KEY)).toBeNull();

    saveEventSelections(["profile"], steps);
    expect(localStorage.getItem(EVENT_SELECTIONS_STORAGE_KEY)).toBeNull();
  });

  it("clears event selections without affecting profile or progress", () => {
    saveProfile({ housing: "renting" });
    toggleTask("event", "task");
    saveEventSelections(["event"], steps);

    clearEventSelections();

    expect(readEventSelections(steps)).toEqual([]);
    expect(localStorage.getItem("ls_profile_v1")).toBe(
      JSON.stringify({ housing: "renting" }),
    );
    expect(getProgress("event")).toEqual(new Set(["task"]));
  });
});
