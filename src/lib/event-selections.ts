import { z } from "zod";

import type { Step } from "./schema";

export const EVENT_SELECTIONS_STORAGE_KEY = "ls_event_selections_v1";

export const EventSelectionsSchema = z
  .object({
    version: z.literal(1),
    stepIds: z.array(z.string().min(1)),
  })
  .strict();

export type EventSelections = z.infer<typeof EventSelectionsSchema>;

function isStorageError(error: unknown): error is DOMException {
  return error instanceof DOMException;
}

export function isPublishedExplicitEventStep(step: Step): boolean {
  return (
    step.status !== "coming-soon" &&
    step.recommendationEligibility?.kind === "explicit-event"
  );
}

export function normalizeEventSelectionIds(
  value: unknown,
  steps: readonly Step[],
): string[] {
  const parsed = EventSelectionsSchema.safeParse(value);
  if (!parsed.success) return [];

  const eligibleIds = new Set(
    steps.filter(isPublishedExplicitEventStep).map((step) => step.id),
  );
  return [...new Set(parsed.data.stepIds)].filter((id) => eligibleIds.has(id));
}

export function readEventSelections(steps: readonly Step[]): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENT_SELECTIONS_STORAGE_KEY);
    if (!raw) return [];
    return normalizeEventSelectionIds(JSON.parse(raw), steps);
  } catch (error) {
    if (error instanceof SyntaxError || isStorageError(error)) return [];
    throw error;
  }
}

export function saveEventSelections(
  stepIds: readonly string[],
  steps: readonly Step[],
): boolean {
  const validIds = normalizeEventSelectionIds({ version: 1, stepIds }, steps);
  if (typeof window === "undefined") return false;
  try {
    if (validIds.length === 0) {
      window.localStorage.removeItem(EVENT_SELECTIONS_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        EVENT_SELECTIONS_STORAGE_KEY,
        JSON.stringify({ version: 1, stepIds: validIds }),
      );
    }
    return true;
  } catch (error) {
    if (isStorageError(error)) return false;
    throw error;
  }
}

export function clearEventSelections(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(EVENT_SELECTIONS_STORAGE_KEY);
    return true;
  } catch (error) {
    if (isStorageError(error)) return false;
    throw error;
  }
}
