import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  exportAll,
  getProgress,
  getStepCompletion,
  importAll,
  isTaskDone,
  resetAll,
  resetStep,
  toggleTask,
} from "@/lib/progress";

describe("progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty set for an unknown step", () => {
    expect(getProgress("unknown")).toEqual(new Set());
  });

  it("toggles tasks and stores only true values", () => {
    toggleTask("step", "one");
    expect(isTaskDone("step", "one")).toBe(true);
    expect(JSON.parse(localStorage.getItem("ls_progress_v1") ?? "")).toEqual({
      step: { one: true },
    });
    toggleTask("step", "one");
    expect(isTaskDone("step", "one")).toBe(false);
    expect(localStorage.getItem("ls_progress_v1")).toBeNull();
  });

  it("calculates completion and clamps stale tasks", () => {
    toggleTask("step", "one");
    toggleTask("step", "two");
    expect(getStepCompletion("step", 1)).toEqual({
      done: 1,
      total: 1,
      pct: 100,
    });
  });

  it("resets one step without changing another", () => {
    toggleTask("first", "one");
    toggleTask("second", "two");
    resetStep("first");
    expect(getProgress("first")).toEqual(new Set());
    expect(getProgress("second")).toEqual(new Set(["two"]));
    resetAll();
    expect(exportAll()).toBe("{}");
  });

  it("round-trips valid exports and rejects malformed imports", () => {
    expect(importAll('{"step":{"one":true}}')).toBe(true);
    expect(exportAll()).toBe('{"step":{"one":true}}');
    expect(importAll('{"step":{"one":false}}')).toBe(false);
    expect(importAll("[]")).toBe(false);
    expect(importAll("bad")).toBe(false);
  });

  it("survives localStorage failures", () => {
    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(getProgress("step")).toEqual(new Set());
    get.mockRestore();

    const set = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("blocked");
      });
    expect(() => toggleTask("step", "one")).not.toThrow();
    set.mockRestore();
  });
});
