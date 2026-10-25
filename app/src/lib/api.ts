// Centralised data client — static per-book JSON served from /data
// (Vite publicDir "prod"; files fetched at runtime, never bundled).
// See staticData.ts for the per-book lazy loader.

import {
  staticFetchChapter,
  staticFetchCrossRefs,
  staticFetchChapterXrefPhrases,
  staticFetchChapterCommentaryPhrases,
  staticFetchCommentary,
  staticFetchChapterCrossRefs,
  staticFetchChapterCommentary,
  staticFetchChapterPhraseOverrides,
} from "./staticData";

export type Verse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  /** Poetic lineation (Tier 2): text split into Hebrew-verse cola; space-join equals text */
  lines?: string[];
};
export type LinkedRef = { ref: string; phrase?: string; preview?: string };
export type CommentaryEntry = { initials: string; text: string; links?: LinkedRef[] };
export type XrefPhrasesEntry = { verse: number; phrases: string[] };
export type ChapterXrefEntry = { verse: number; refs: LinkedRef[] };
export type ChapterCommentaryEntry = { verse: number; entry: CommentaryEntry };

export function fetchChapter(book: string, chapter: number, signal?: AbortSignal): Promise<Verse[]> {
  return staticFetchChapter(book, chapter, signal);
}

export function fetchCrossRefs(book: string, chapter: number, verse: number): Promise<LinkedRef[]> {
  return staticFetchCrossRefs(book, chapter, verse);
}

export function fetchChapterXrefPhrases(book: string, chapter: number): Promise<XrefPhrasesEntry[]> {
  return staticFetchChapterXrefPhrases(book, chapter);
}

export function fetchChapterCommentaryPhrases(book: string, chapter: number): Promise<XrefPhrasesEntry[]> {
  return staticFetchChapterCommentaryPhrases(book, chapter);
}

export function fetchCommentary(book: string, chapter: number, verse: number): Promise<CommentaryEntry | null> {
  return staticFetchCommentary(book, chapter, verse);
}

export function fetchChapterCrossRefs(book: string, chapter: number): Promise<ChapterXrefEntry[]> {
  return staticFetchChapterCrossRefs(book, chapter);
}

export function fetchChapterCommentary(book: string, chapter: number): Promise<ChapterCommentaryEntry[]> {
  return staticFetchChapterCommentary(book, chapter);
}

export function fetchChapterPhraseOverrides(book: string, chapter: number): Promise<string[]> {
  return staticFetchChapterPhraseOverrides(book, chapter);
}
