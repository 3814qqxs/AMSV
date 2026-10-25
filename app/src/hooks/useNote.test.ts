import { describe, it, expect, beforeEach } from "vitest";
import {
  saveNote,
  deleteNote,
  readNote,
  readChapterNoteVerses,
  NOTE_INDEX_KEY,
  noteKey,
} from "./useNote";
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

describe("readNote", () => {
  it("returns empty string when no note exists", () => {
    expect(readNote("John 3:16", memStorage())).toBe("");
  });

  it("returns stored note text", () => {
    const s = memStorage();
    s.set(noteKey("John 3:16"), "My note");
    expect(readNote("John 3:16", s)).toBe("My note");
  });
});

describe("saveNote", () => {
  let s: ReturnType<typeof memStorage>;
  beforeEach(() => { s = memStorage(); });

  it("stores note text and adds ref to index", () => {
    saveNote("John 3:16", "Test note", s);
    expect(s.store[noteKey("John 3:16")]).toBe("Test note");
    const index = JSON.parse(s.store[NOTE_INDEX_KEY]);
    expect(index).toContain("John 3:16");
  });

  it("does not duplicate ref in index", () => {
    saveNote("John 3:16", "First", s);
    saveNote("John 3:16", "Updated", s);
    const index = JSON.parse(s.store[NOTE_INDEX_KEY]);
    expect(index.filter((r: string) => r === "John 3:16")).toHaveLength(1);
  });
});

describe("deleteNote", () => {
  it("removes note and ref from index", () => {
    const s = memStorage();
    saveNote("John 3:16", "To delete", s);
    deleteNote("John 3:16", s);
    expect(s.store[noteKey("John 3:16")]).toBeUndefined();
    const index = JSON.parse(s.store[NOTE_INDEX_KEY] ?? "[]");
    expect(index).not.toContain("John 3:16");
  });
});

describe("readChapterNoteVerses", () => {
  it("returns verse numbers that have notes for the given chapter", () => {
    const s = memStorage();
    saveNote("John 3:16", "note", s);
    saveNote("John 3:17", "note", s);
    saveNote("John 4:1", "note", s);
    const verses = readChapterNoteVerses("John", 3, s);
    expect(verses).toContain(16);
    expect(verses).toContain(17);
    expect(verses).not.toContain(1);
  });

  it("returns empty set when no notes exist", () => {
    const verses = readChapterNoteVerses("John", 3, memStorage());
    expect(verses.size).toBe(0);
  });
});
