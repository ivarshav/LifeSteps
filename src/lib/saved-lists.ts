import { decodeShare, encodeShare, type ShareSelection } from "./share";

const STORAGE_KEY = "ls_saved_lists_v1";
const MAX_SAVED_LISTS = 50;

type StoredList = {
  id: string;
  payload: string;
  savedAt: string;
};

export type SavedList = StoredList & {
  selection: ShareSelection;
};

function isStoredList(value: unknown): value is StoredList {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const list = value as Record<string, unknown>;
  return (
    typeof list.id === "string" &&
    typeof list.payload === "string" &&
    typeof list.savedAt === "string"
  );
}

function readStore(): StoredList[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredList).slice(0, MAX_SAVED_LISTS);
  } catch {
    return [];
  }
}

function writeStore(lists: StoredList[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // Saving remains in the open share link when browser storage is unavailable.
  }
}

export function getSavedLists(): SavedList[] {
  const seenPayloads = new Set<string>();
  return readStore().flatMap((list) => {
    if (seenPayloads.has(list.payload)) return [];
    seenPayloads.add(list.payload);
    const selection = decodeShare(list.payload);
    return selection ? [{ ...list, selection }] : [];
  });
}

export function isListSaved(selection: ShareSelection): boolean {
  const payload = encodeShare(selection);
  return getSavedLists().some((list) => list.payload === payload);
}

export function saveList(selection: ShareSelection): SavedList {
  const payload = encodeShare(selection);
  const existing = getSavedLists().find((list) => list.payload === payload);
  if (existing) return existing;

  const saved: SavedList = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    savedAt: new Date().toISOString(),
    selection,
  };
  writeStore([saved, ...readStore()].slice(0, MAX_SAVED_LISTS));
  return saved;
}

export function removeSavedList(id: string) {
  writeStore(readStore().filter((list) => list.id !== id));
}
