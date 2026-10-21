import type { TaskFeedback } from "./feedback";

export type ClarityEvent = {
  appVersion: string | null;
  event: "step_clarity";
  stepId: string;
  taskId: string;
  ts: string;
  value: TaskFeedback;
};

type FeedbackLogConfig = {
  token: string;
  url: string;
};

const AXIOM_HOST = /(?:^|\.)axiom\.co$/;

export function getFeedbackLogConfig(): FeedbackLogConfig | null {
  const url = process.env.NEXT_PUBLIC_AXIOM_INGEST_URL?.trim();
  const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN?.trim();
  if (!url || !token) return null;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      !AXIOM_HOST.test(parsed.hostname)
    ) {
      return null;
    }

    return { token, url: parsed.toString() };
  } catch {
    return null;
  }
}

export function buildClarityEvent({
  appVersion = null,
  stepId,
  taskId,
  value,
}: {
  appVersion?: string | null;
  stepId: string;
  taskId: string;
  value: TaskFeedback;
}): ClarityEvent {
  return {
    appVersion,
    event: "step_clarity",
    stepId,
    taskId,
    ts: new Date().toISOString(),
    value,
  };
}

export function sendClarityEvent(event: ClarityEvent): void {
  if (typeof window === "undefined") return;

  const config = getFeedbackLogConfig();
  if (!config) return;

  void fetch(config.url, {
    body: JSON.stringify([event]),
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
  }).catch(() => {
    // Best-effort logging; failures must never reach the user.
  });
}

export function logTaskClarity({
  stepId,
  taskId,
  value,
}: {
  stepId: string;
  taskId: string;
  value: TaskFeedback;
}): void {
  sendClarityEvent(
    buildClarityEvent({
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
      stepId,
      taskId,
      value,
    }),
  );
}
