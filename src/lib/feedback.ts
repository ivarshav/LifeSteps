export const FEEDBACK_STORAGE_KEY = "ls_feedback_v1";
export const MAX_FEEDBACK_LENGTH = 1500;

export type TaskFeedback = "helpful" | "not-helpful";

type FeedbackStore = {
  drafts: Record<string, string>;
  taskFeedback: Record<string, TaskFeedback>;
  version: 1;
};

const emptyStore = (): FeedbackStore => ({
  drafts: {},
  taskFeedback: {},
  version: 1,
});

function readStore(): FeedbackStore {
  if (typeof window === "undefined") return emptyStore();

  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? "null",
    );
    if (
      !stored ||
      typeof stored !== "object" ||
      !("version" in stored) ||
      stored.version !== 1 ||
      !("drafts" in stored) ||
      !("taskFeedback" in stored) ||
      typeof stored.drafts !== "object" ||
      stored.drafts === null ||
      typeof stored.taskFeedback !== "object" ||
      stored.taskFeedback === null
    ) {
      return emptyStore();
    }

    return {
      drafts: Object.fromEntries(
        Object.entries(stored.drafts).filter(
          ([, value]) =>
            typeof value === "string" && value.length <= MAX_FEEDBACK_LENGTH,
        ),
      ),
      taskFeedback: Object.fromEntries(
        Object.entries(stored.taskFeedback).filter(
          ([, value]) => value === "helpful" || value === "not-helpful",
        ),
      ) as Record<string, TaskFeedback>,
      version: 1,
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: FeedbackStore) {
  window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(store));
}

export function getFeedbackDraft(stepId: string): string {
  return readStore().drafts[stepId] ?? "";
}

export function saveFeedbackDraft(stepId: string, draft: string) {
  const store = readStore();
  store.drafts[stepId] = draft.slice(0, MAX_FEEDBACK_LENGTH);
  writeStore(store);
}

export function getTaskFeedback(
  stepId: string,
  taskId: string,
): TaskFeedback | null {
  return readStore().taskFeedback[`${stepId}:${taskId}`] ?? null;
}

export function saveTaskFeedback(
  stepId: string,
  taskId: string,
  feedback: TaskFeedback,
) {
  const store = readStore();
  store.taskFeedback[`${stepId}:${taskId}`] = feedback;
  writeStore(store);
}

export function formatFeedbackIssue({
  draft,
  stepId,
  stepTitle,
}: {
  draft: string;
  stepId: string;
  stepTitle: string;
}) {
  const title = `הצעת תוכן: ${stepTitle}`;
  const body = [
    "## הצעת שיפור ל-LifeSteps",
    "",
    "### לאיזה צעד ההצעה קשורה?",
    `- צעד: ${stepTitle}`,
    `- מזהה צעד: \`${stepId}\``,
    "",
    "### ההצעה",
    draft.trim(),
    "",
    "---",
    "נוצר על ידי טופס המשוב המקומי באתר. יש לבדוק ולערוך לפני שליחה.",
  ].join("\n");

  return { body, title };
}

export function getFeedbackIssueUrl(issue: { body: string; title: string }) {
  const query = new URLSearchParams({
    body: issue.body,
    title: issue.title,
  });
  return `https://github.com/ivarshav/LifeSteps/issues/new?${query.toString()}`;
}
