import { describe, it, expect, beforeEach } from "vitest";
import { pushHistory, readHistory, HISTORY_KEY } from "./useReadingHistory";
import type { StorageAdapter } from "@/lib/storage";

function memStorage(): StorageAdapter & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    get: (k) => store[k] ?? null,
    set: (k, v) => { store[k] = v; },
    remove: (k) => { delete store[k]; },
  };
}

describe("readHistory", () => {
  it("returns empty array when nothing stored", () => {
    const s = memStorage();
    expect(readHistory(s)).toEqual([]);
  });

  it("returns stored history", () => {
    const s = memStorage();
    s.set(HISTORY_KEY, JSON.stringify([{ book: "John", chapter: 1 }]));
    expect(readHistory(s)).toEqual([{ book: "John", chapter: 1 }]);
  });

  it("returns empty array on corrupt data", () => {
    const s = memStorage();
    s.set(HISTORY_KEY, "not-json");
    expect(readHistory(s)).toEqual([]);
  });
});

describe("pushHistory", () => {
  let s: ReturnType<typeof memStorage>;
  beforeEach(() => { s = memStorage(); });

  it("adds a new entry at the front", () => {
    const result = pushHistory([], { book: "John", chapter: 1 }, s);
    expect(result[0]).toEqual({ book: "John", chapter: 1 });
  });

  it("deduplicates identical entries", () => {
    const prev = [{ book: "John", chapter: 1 }, { book: "Genesis", chapter: 1 }];
    const result = pushHistory(prev, { book: "John", chapter: 1 }, s);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ book: "John", chapter: 1 });
  });

  it("caps at 3 entries", () => {
    const prev = [
      { book: "Genesis", chapter: 1 },
      { book: "John", chapter: 1 },
      { book: "Romans", chapter: 8 },
    ];
    const result = pushHistory(prev, { book: "Psalms", chapter: 23 }, s);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ book: "Psalms", chapter: 23 });
    expect(result).not.toContainEqual({ book: "Romans", chapter: 8 });
  });

  it("persists to storage", () => {
    pushHistory([], { book: "John", chapter: 3 }, s);
    expect(s.store[HISTORY_KEY]).toBeDefined();
    const stored = JSON.parse(s.store[HISTORY_KEY]);
    expect(stored[0]).toEqual({ book: "John", chapter: 3 });
  });
});
