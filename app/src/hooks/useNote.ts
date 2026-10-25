import { useState, useCallback } from "react";
import { storage as defaultStorage, type StorageAdapter } from "@/lib/storage";

export const NOTE_INDEX_KEY = "amsv-notes-index";

export function noteKey(ref: string): string {
  return `amsv-note:${ref}`;
}

function refStr(book: string, chapter: number, verse: number): string {
  return `${book} ${chapter}:${verse}`;
}

function readIndex(s: StorageAdapter): string[] {
  try {
    const raw = s.get(NOTE_INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(refs: string[], s: StorageAdapter): void {
  s.set(NOTE_INDEX_KEY, JSON.stringify(refs));
}

export function readNote(ref: string, s: StorageAdapter = defaultStorage): string {
  return s.get(noteKey(ref)) ?? "";
}

export function saveNote(ref: string, text: string, s: StorageAdapter = defaultStorage): void {
  s.set(noteKey(ref), text);
  const index = readIndex(s);
  if (!index.includes(ref)) writeIndex([ref, ...index], s);
}

export function deleteNote(ref: string, s: StorageAdapter = defaultStorage): void {
  s.remove(noteKey(ref));
  writeIndex(readIndex(s).filter((r) => r !== ref), s);
}

export function readChapterNoteVerses(
  book: string,
  chapter: number,
  s: StorageAdapter = defaultStorage,
): Set<number> {
  const prefix = `${book} ${chapter}:`;
  const result = new Set<number>();
  for (const ref of readIndex(s)) {
    if (!ref.startsWith(prefix)) continue;
    const v = parseInt(ref.slice(prefix.length), 10);
    if (!isNaN(v)) result.add(v);
  }
  return result;
}

export function useNote(book: string, chapter: number, verse: number) {
  const ref = refStr(book, chapter, verse);
  const [text, setText] = useState(() => readNote(ref));

  const save = useCallback(
    (newText: string) => {
      setText(newText);
      if (newText.trim()) {
        saveNote(ref, newText);
      } else {
        deleteNote(ref);
      }
    },
    [ref],
  );

  return { text, save, hasNote: Boolean(text.trim()) };
}

export function useChapterNoteVerses(book: string, chapter: number): Set<number> {
  const [verses] = useState(() => readChapterNoteVerses(book, chapter));
  return verses;
}
