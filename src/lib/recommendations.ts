import { getProfileValueLabel, type LifeProfile } from "./profile";
import type { Condition, Match, ProfileKey, Step } from "./schema";

export type Completion = { done: number; total: number };

export type PathItemKind = "recommended" | "in-progress" | "discovery";

export type MatchedProfileEvidence = {
  key: ProfileKey;
  value: string;
};

type PathItemBase = {
  completion: Completion;
  kind: PathItemKind;
  step: Step;
};

export type RecommendedPathItem = PathItemBase & {
  explanation: string;
  kind: "recommended";
  matchedEvidence: MatchedProfileEvidence | { eventStepId: string };
  score: number;
};

export type InProgressPathItem = PathItemBase & {
  explanation: string;
  kind: "in-progress";
};

export type DiscoveryPathItem = PathItemBase & {
  kind: "discovery";
};

export type StepRecommendation = PathItem;
export type PathItem =
  | RecommendedPathItem
  | InProgressPathItem
  | DiscoveryPathItem;

type MatchResult = "match" | "mismatch" | "unknown";

function matchCondition(
  condition: Condition,
  profile: LifeProfile,
): MatchResult {
  const profileValue = profile[condition.key];
  if (profileValue === undefined) return "unknown";

  const values = Array.isArray(condition.value)
    ? condition.value
    : [condition.value];
  const selected = Array.isArray(profileValue) ? profileValue : [profileValue];
  const overlaps = selected.some((value) => values.includes(value));

  switch (condition.op) {
    case "eq":
    case "in":
    case "has":
      return overlaps ? "match" : "mismatch";
    case "notIn":
      return overlaps ? "mismatch" : "match";
  }
}

function evaluateGroup(
  conditions: Condition[] | undefined,
  profile: LifeProfile,
  kind: "all" | "any" | "none",
): { matched: Condition[]; viable: boolean } {
  if (!conditions?.length) return { matched: [], viable: true };

  const results = conditions.map((condition) => ({
    condition,
    result: matchCondition(condition, profile),
  }));
  const matched = results
    .filter(({ result }) => result === "match")
    .map(({ condition }) => condition);

  if (kind === "all") {
    return {
      matched,
      viable: !results.some(({ result }) => result === "mismatch"),
    };
  }
  if (kind === "any") {
    return {
      matched,
      viable: !results.every(({ result }) => result === "mismatch"),
    };
  }
  return {
    matched,
    viable: !results.some(({ result }) => result === "match"),
  };
}

export function evaluateAudience(
  audience: Match | undefined,
  profile: LifeProfile,
): { matched: Condition[]; viable: boolean } {
  if (!audience) return { matched: [], viable: true };

  const groups = [
    evaluateGroup(audience.all, profile, "all"),
    evaluateGroup(audience.any, profile, "any"),
    evaluateGroup(audience.none, profile, "none"),
  ];
  return {
    matched: groups.flatMap((group) => group.matched),
    viable: groups.every((group) => group.viable),
  };
}

function completionFor(step: Step, completed: ReadonlySet<string>): Completion {
  const taskIds = step.sections.flatMap((section) =>
    section.tasks.map((task) => task.id),
  );
  const currentTaskIds = new Set(taskIds);
  return {
    // Progress can outlive a content revision, so only current task IDs count.
    done: [...completed].filter((taskId) => currentTaskIds.has(taskId)).length,
    total: taskIds.length,
  };
}

function positiveProfileEvidence(
  audience: Match | undefined,
  profile: LifeProfile,
): MatchedProfileEvidence | undefined {
  const evaluation = evaluateAudience(audience, profile);
  if (!evaluation.viable) return undefined;

  for (const condition of evaluation.matched) {
    if (condition.op === "notIn") continue;
    const profileValue = profile[condition.key];
    const selected = Array.isArray(profileValue) ? profileValue : [profileValue];
    const values = Array.isArray(condition.value)
      ? condition.value
      : [condition.value];
    const value = selected.find(
      (candidate): candidate is string =>
        candidate !== undefined && values.includes(candidate),
    );
    if (value) return { key: condition.key, value };
  }
}

function profileExplanation(evidence: MatchedProfileEvidence): string {
  return `הצעד מוצג משום שציינתם: ${getProfileValueLabel(evidence.key, evidence.value)}.`;
}

function eventExplanation(step: Step): string {
  return `הצעד מוצג כי בחרתם לטפל ב: ${step.title}.`;
}

type RankedRecommendation = RecommendedPathItem & { index: number };

function compareRanked(
  left: RankedRecommendation,
  right: RankedRecommendation,
): number {
  return right.score - left.score || left.index - right.index;
}

function orderRecommended(
  recommendations: readonly RankedRecommendation[],
): RankedRecommendation[] {
  const byId = new Map(recommendations.map((item) => [item.step.id, item]));
  const outgoing = new Map<string, Set<string>>();
  const incomingCount = new Map<string, number>();

  for (const item of recommendations) {
    outgoing.set(item.step.id, new Set());
    incomingCount.set(item.step.id, 0);
  }
  const addEdge = (before: string, after: string) => {
    if (!byId.has(before) || !byId.has(after)) return;
    const targets = outgoing.get(before)!;
    if (targets.has(after)) return;
    targets.add(after);
    incomingCount.set(after, incomingCount.get(after)! + 1);
  };

  for (const item of recommendations) {
    for (const prerequisite of item.step.recommendationSequence?.after ?? []) {
      addEdge(prerequisite, item.step.id);
    }
  }

  const bySequence = new Map<string, RankedRecommendation[]>();
  for (const item of recommendations) {
    const sequence = item.step.recommendationSequence?.sequence;
    if (!sequence) continue;
    const members = bySequence.get(sequence.id) ?? [];
    members.push(item);
    bySequence.set(sequence.id, members);
  }
  for (const members of bySequence.values()) {
    const ordered = [...members].sort(
      (left, right) =>
        left.step.recommendationSequence!.sequence!.order -
          right.step.recommendationSequence!.sequence!.order ||
        left.index - right.index,
    );
    for (let index = 1; index < ordered.length; index += 1) {
      addEdge(ordered[index - 1]!.step.id, ordered[index]!.step.id);
    }
  }

  const ready = recommendations
    .filter((item) => incomingCount.get(item.step.id) === 0)
    .sort(compareRanked);
  const result: RankedRecommendation[] = [];

  while (ready.length > 0) {
    const current = ready.shift()!;
    result.push(current);
    for (const target of outgoing.get(current.step.id)!) {
      const remaining = incomingCount.get(target)! - 1;
      incomingCount.set(target, remaining);
      if (remaining === 0) {
        ready.push(byId.get(target)!);
        ready.sort(compareRanked);
      }
    }
  }

  // Content validation rejects cycles. Retaining authored order is a safe,
  // deterministic fallback for callers using synthetic test or preview data.
  return result.length === recommendations.length
    ? result
    : [...recommendations].sort(compareRanked);
}

export function getRecommendations({
  completedByStep = new Map<string, ReadonlySet<string>>(),
  eventSelectionStepIds = new Set<string>(),
  profile,
  steps,
}: {
  completedByStep?: ReadonlyMap<string, ReadonlySet<string>>;
  eventSelectionStepIds?: ReadonlySet<string>;
  profile: LifeProfile;
  steps: readonly Step[];
}): PathItem[] {
  const inProgress: InProgressPathItem[] = [];
  const recommended: RankedRecommendation[] = [];
  const discovery: DiscoveryPathItem[] = [];

  steps.forEach((step, index) => {
    if (step.status === "coming-soon") return;
    const completion = completionFor(
      step,
      completedByStep.get(step.id) ?? new Set<string>(),
    );
    const isStarted = completion.done > 0 && completion.done < completion.total;
    if (isStarted) {
      inProgress.push({
        completion,
        explanation: "התחלתם את הצעד הזה בדפדפן זה.",
        kind: "in-progress",
        step,
      });
      return;
    }
    if (completion.done > 0) return;

    if (step.recommendationEligibility.kind === "explicit-event") {
      if (eventSelectionStepIds.has(step.id)) {
        recommended.push({
          completion,
          explanation: eventExplanation(step),
          index,
          kind: "recommended",
          matchedEvidence: { eventStepId: step.id },
          score: 100,
          step,
        });
      }
      return;
    }

    const evidence = positiveProfileEvidence(step.audience, profile);
    if (evidence) {
      recommended.push({
        completion,
        explanation: profileExplanation(evidence),
        index,
        kind: "recommended",
        matchedEvidence: evidence,
        score: 100,
        step,
      });
    } else {
      discovery.push({ completion, kind: "discovery", step });
    }
  });

  return [...orderRecommended(recommended), ...inProgress, ...discovery];
}
