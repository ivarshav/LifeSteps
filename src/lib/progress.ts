const STORAGE_KEY = "ls_progress_v1";

type ProgressStore = Record<string, Record<string, true>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStore(): ProgressStore {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};

    const store: ProgressStore = {};
    for (const [stepId, tasks] of Object.entries(parsed)) {
      if (!isRecord(tasks)) continue;
      const completed = Object.entries(tasks).filter(
        (entry) => entry[1] === true,
      );
      if (completed.length > 0) {
        store[stepId] = Object.fromEntries(
          completed.map(([taskId]) => [taskId, true as const]),
        );
      }
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  try {
    if (typeof window === "undefined") return;
    if (Object.keys(store).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage can be unavailable in private browsing; progress remains usable in memory.
  }
}

export function getProgress(stepId: string): Set<string> {
  return new Set(Object.keys(readStore()[stepId] ?? {}));
}

export function toggleTask(stepId: string, taskId: string): void {
  const store = readStore();
  const step = { ...(store[stepId] ?? {}) };
  if (step[taskId]) {
    delete step[taskId];
  } else {
    step[taskId] = true;
  }
  if (Object.keys(step).length === 0) {
    delete store[stepId];
  } else {
    store[stepId] = step;
  }
  writeStore(store);
}

export function isTaskDone(stepId: string, taskId: string): boolean {
  return getProgress(stepId).has(taskId);
}

export function getStepCompletion(
  stepId: string,
  totalTasks: number,
): { done: number; total: number; pct: number } {
  const total = Math.max(0, totalTasks);
  const done = Math.min(getProgress(stepId).size, total);
  return {
    done,
    total,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function resetStep(stepId: string): void {
  const store = readStore();
  delete store[stepId];
  writeStore(store);
}

export function resetAll(): void {
  writeStore({});
}

export function exportAll(): string {
  return JSON.stringify(readStore());
}

export function importAll(json: string): boolean {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isRecord(parsed)) return false;

    const store: ProgressStore = {};
    for (const [stepId, tasks] of Object.entries(parsed)) {
      if (!isRecord(tasks)) return false;
      const completed: Record<string, true> = {};
      for (const [taskId, done] of Object.entries(tasks)) {
        if (done !== true) return false;
        completed[taskId] = true;
      }
      if (Object.keys(completed).length > 0) store[stepId] = completed;
    }
    writeStore(store);
    return true;
  } catch {
    return false;
  }
}
