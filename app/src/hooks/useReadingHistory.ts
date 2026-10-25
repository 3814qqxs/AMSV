import { useState } from "react";
import { storage as defaultStorage, type StorageAdapter } from "@/lib/storage";

export const HISTORY_KEY = "amsv-history";
const MAX = 3;

export interface HistoryEntry {
  book: string;
  chapter: number;
}

export function readHistory(s: StorageAdapter = defaultStorage): HistoryEntry[] {
  try {
    const raw = s.get(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function pushHistory(
  prev: HistoryEntry[],
  entry: HistoryEntry,
  s: StorageAdapter = defaultStorage,
): HistoryEntry[] {
  const deduped = prev.filter((h) => !(h.book === entry.book && h.chapter === entry.chapter));
  const next = [entry, ...deduped].slice(0, MAX);
  s.set(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());

  function push(entry: HistoryEntry) {
    setHistory((prev) => pushHistory(prev, entry));
  }

  function clear() {
    defaultStorage.remove(HISTORY_KEY);
    setHistory([]);
  }

  return { history, push, clear };
}
