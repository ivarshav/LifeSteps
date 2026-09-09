import { describe, expect, it } from "vitest";

import { evaluateAudience, getRecommendations } from "@/lib/recommendations";
import { StepSchema, type Match, type Step } from "@/lib/schema";

function step(
  nid: number,
  options: {
    audience?: Match;
    categoryId?: string;
    eligibility?: "profile" | "explicit-event";
    sequence?: Step["recommendationSequence"];
  } = {},
): Step {
  return StepSchema.parse({
    audience: options.audience,
    categoryId: options.categoryId ?? "housing",
    emoji: "🏠",
    id: `step-${nid}`,
    keywords: [],
    lastReviewed: "2026-01-01",
    nid,
    recommendationEligibility: { kind: options.eligibility ?? "profile" },
    recommendationSequence: options.sequence,
    sections: [{
      id: "first",
      nid: nid * 10,
      tasks: [
        { id: "first-task", nid: nid * 100, title: "משימה ראשונה" },
        { id: "second-task", nid: nid * 100 + 1, title: "משימה שנייה" },
      ],
      title: "מתחילים",
    }],
    sources: [{ label: "מקור", url: "https://www.gov.il/" }],
    summary: "תיאור קצר",
    title: `צעד ${nid}`,
  });
}

const profileMatch: Match = {
  any: [{ key: "housing", op: "eq", value: "renting" }],
};

describe("recommendations", () => {
  it("evaluates all, any, and none groups independently with incomplete profiles", () => {
    const audience: Match = {
      all: [{ key: "housing", op: "eq", value: "renting" }],
      any: [{ key: "employment", op: "eq", value: "employee" }],
      none: [{ key: "kids", op: "eq", value: "none" }],
    };
    expect(evaluateAudience(audience, { housing: "renting" }).viable).toBe(true);
    expect(
      evaluateAudience(audience, {
        employment: "employee",
        housing: "renting",
        kids: "none",
      }).viable,
    ).toBe(false);
  });

  it("recommends profile-eligible steps only for an actual positive profile match", () => {
    const matched = step(1, { audience: profileMatch });
    const neutral = step(2);
    const results = getRecommendations({
      profile: { housing: "renting" },
      steps: [matched, neutral],
    });

    expect(results.map((item) => [item.step.id, item.kind])).toEqual([
      ["step-1", "recommended"],
      ["step-2", "discovery"],
    ]);
    expect(results[0]).toMatchObject({
      explanation: expect.stringContaining("בשכירות"),
      matchedEvidence: { key: "housing", value: "renting" },
    });
  });

  it("does not make a recommendation from negative-only audience logic", () => {
    const results = getRecommendations({
      profile: { kids: "young" },
      steps: [step(1, { audience: { none: [{ key: "kids", op: "eq", value: "none" }] } })],
    });
    expect(results[0]?.kind).toBe("discovery");
  });

  it("never infers sensitive explicit-event guides from ordinary profile values", () => {
    const sensitive = step(1, { eligibility: "explicit-event" });
    const results = getRecommendations({
      profile: {
        employment: "employee",
        housing: "renting",
        interests: ["housing"],
        kids: "young",
        lifeStage: "midlife",
        maritalStatus: "married",
      },
      steps: [sensitive],
    });
    expect(results).toEqual([]);
  });

  it("recommends a sensitive guide only after its exact voluntary selection", () => {
    const first = step(1, { eligibility: "explicit-event" });
    const second = step(2, { eligibility: "explicit-event" });
    const results = getRecommendations({
      eventSelectionStepIds: new Set(["step-2"]),
      profile: {},
      steps: [first, second],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      explanation: "הצעד מוצג כי בחרתם לטפל ב: צעד 2.",
      kind: "recommended",
      matchedEvidence: { eventStepId: "step-2" },
      step: { id: "step-2" },
    });
  });

  it("keeps started explicit-event content in progress after selection removal", () => {
    const sensitive = step(1, { eligibility: "explicit-event" });
    const results = getRecommendations({
      completedByStep: new Map([["step-1", new Set(["first-task"])]]),
      profile: {},
      steps: [sensitive],
    });
    expect(results[0]).toMatchObject({
      explanation: "התחלתם את הצעד הזה בדפדפן זה.",
      kind: "in-progress",
    });
  });

  it("keeps discovery neutral and limited to unstarted non-sensitive content", () => {
    const neutral = step(1);
    const matched = step(2, { audience: profileMatch });
    const sensitive = step(3, { eligibility: "explicit-event" });
    const started = step(4);
    const results = getRecommendations({
      completedByStep: new Map([["step-4", new Set(["first-task"])]]),
      profile: { housing: "renting" },
      steps: [neutral, matched, sensitive, started],
    });
    const discovery = results.find((item) => item.kind === "discovery");
    expect(discovery).toMatchObject({ kind: "discovery", step: { id: "step-1" } });
    expect(discovery).not.toHaveProperty("explanation");
    expect(discovery).not.toHaveProperty("score");
    expect(discovery).not.toHaveProperty("matchedEvidence");
  });

  it("ignores stale progress and does not surface completed content", () => {
    const item = step(1);
    expect(
      getRecommendations({
        completedByStep: new Map([["step-1", new Set(["removed-task"])]]),
        profile: {},
        steps: [item],
      })[0]?.kind,
    ).toBe("discovery");
    expect(
      getRecommendations({
        completedByStep: new Map([["step-1", new Set(["first-task", "second-task"])]]),
        profile: {},
        steps: [item],
      }),
    ).toEqual([]);
  });

  it("orders concrete recommendations by dependencies before secondary score ties", () => {
    const enlistment = step(70, { audience: profileMatch });
    enlistment.id = "idf-enlistment";
    const academic = step(72, {
      audience: profileMatch,
      sequence: { after: ["idf-enlistment"] },
    });
    academic.id = "academic-studies";
    expect(
      getRecommendations({
        profile: { housing: "renting" },
        steps: [academic, enlistment],
      }).map((item) => item.step.id),
    ).toEqual(["idf-enlistment", "academic-studies"]);
  });

  it("does not gate a dependent recommendation when its prerequisite is absent", () => {
    const academic = step(72, {
      audience: profileMatch,
      sequence: { after: ["idf-enlistment"] },
    });
    expect(
      getRecommendations({
        profile: { housing: "renting" },
        steps: [academic],
      }).map((item) => item.step.id),
    ).toEqual(["step-72"]);
  });

  it("uses reviewed same-sequence order and otherwise retains authored ties", () => {
    const later = step(2, {
      audience: profileMatch,
      sequence: { sequence: { id: "reviewed-path", order: 2 } },
    });
    const first = step(1, {
      audience: profileMatch,
      sequence: { sequence: { id: "reviewed-path", order: 1 } },
    });
    const unordered = step(3, { audience: profileMatch });
    expect(
      getRecommendations({
        profile: { housing: "renting" },
        steps: [later, unordered, first],
      }).map((item) => item.step.id),
    ).toEqual(["step-3", "step-1", "step-2"]);
    expect(
      getRecommendations({
        profile: { housing: "renting" },
        steps: [step(5, { audience: profileMatch }), step(4, { audience: profileMatch })],
      }).map((item) => item.step.id),
    ).toEqual(["step-5", "step-4"]);
  });
});
