import { decodeShare, encodeShare, type ShareSelection } from "./share";

const STORAGE_KEY = "ls_saved_lists_v1";
const MAX_SAVED_LISTS = 50;

type StoredList = {
  id: string;
  payload: string;
  savedAt: string;
};

type StoreRead = {
  lists: StoredList[];
  error: boolean;
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
    typeof list.savedAt === "string" &&
    Number.isFinite(Date.parse(list.savedAt))
  );
}

function readStoreResult(): StoreRead {
  try {
    if (typeof window === "undefined") return { lists: [], error: false };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lists: [], error: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { lists: [], error: true };
    return {
      lists: parsed.filter(isStoredList).slice(0, MAX_SAVED_LISTS),
      error: false,
    };
  } catch {
    return { lists: [], error: true };
  }
}

function readStore(): StoredList[] {
  return readStoreResult().lists;
}

function writeStore(lists: StoredList[]): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    return true;
  } catch {
    return false;
  }
}

export function getSavedLists(): SavedList[] {
  return getSavedListsResult().lists;
}

export function getSavedListsResult(): {
  lists: SavedList[];
  error: boolean;
} {
  const seenPayloads = new Set<string>();
  const result = readStoreResult();
  const lists = result.lists.flatMap((list) => {
    if (seenPayloads.has(list.payload)) return [];
    seenPayloads.add(list.payload);
    const selection = decodeShare(list.payload);
    return selection ? [{ ...list, selection }] : [];
  });
  return { lists, error: result.error };
}

export function isListSaved(selection: ShareSelection): boolean {
  const payload = encodeShare(selection);
  return getSavedLists().some((list) => list.payload === payload);
}

export function saveList(selection: ShareSelection): SavedList | null {
  const payload = encodeShare(selection);
  const existing = getSavedLists().find((list) => list.payload === payload);
  if (existing) return existing;

  const saved: SavedList = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    savedAt: new Date().toISOString(),
    selection,
  };
  return writeStore([saved, ...readStore()].slice(0, MAX_SAVED_LISTS))
    ? saved
    : null;
}

export function removeSavedList(id: string): boolean {
  return writeStore(readStore().filter((list) => list.id !== id));
}
