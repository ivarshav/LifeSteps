import { beforeEach, describe, expect, it } from "vitest";

import {
  FEEDBACK_STORAGE_KEY,
  formatFeedbackIssue,
  getFeedbackDraft,
  getFeedbackIssueUrl,
  getTaskFeedback,
  saveFeedbackDraft,
  saveTaskFeedback,
} from "@/lib/feedback";

describe("browser-local feedback", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps drafts and task signals in a versioned local store", () => {
    saveFeedbackDraft("rent-apartment", "חסר קישור רשמי");
    saveTaskFeedback("rent-apartment", "sign-contract", "helpful");

    expect(getFeedbackDraft("rent-apartment")).toBe("חסר קישור רשמי");
    expect(getTaskFeedback("rent-apartment", "sign-contract")).toBe("helpful");
    expect(
      JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? ""),
    ).toEqual({
      drafts: { "rent-apartment": "חסר קישור רשמי" },
      taskFeedback: { "rent-apartment:sign-contract": "helpful" },
      version: 1,
    });
  });

  it("formats an explicit GitHub draft without submitting it", () => {
    const issue = formatFeedbackIssue({
      draft: "חסר קישור רשמי",
      stepId: "rent-apartment",
      stepTitle: "שכירת דירה",
    });

    expect(issue.title).toBe("הצעת תוכן: שכירת דירה");
    expect(issue.body).toContain("`rent-apartment`");
    expect(issue.body).toContain("חסר קישור רשמי");
    expect(getFeedbackIssueUrl(issue)).toMatch(
      /^https:\/\/github\.com\/ivarshav\/LifeSteps\/issues\/new\?/,
    );
  });
});
