/**
 * Runtime static-file data layer — per-book lazy loading.
 *
 * Fetches /data/books/<slug>.json on first access to a book (promise-cached),
 * so opening the app loads only the book being read, not the whole Bible.
 * Each book file co-locates text, phrases, curation notes, commentary, and
 * cross-references (xref previews are baked in at build time by
 * scripts/ingest_bible_md.py).
 *
 * The source files in prod/data/ are fetched at runtime — never compiled into
 * the JS bundle — so a rebuild of the data is picked up on next load.
 */

import type {
  Verse,
  LinkedRef,
  CommentaryEntry,
  XrefPhrasesEntry,
  ChapterXrefEntry,
  ChapterCommentaryEntry,
} from "./api";

type ChapterData = {
  verses: Array<{ verse: number; text: string; lines?: string[] }>;
  phrases?: string[];
  notes?: Record<string, string[]>;
  commentary?: Record<string, CommentaryEntry>;
  commentary_phrases?: Record<string, string[]>;
  xrefs?: Record<string, LinkedRef[]>;
};

type BookData = {
  book: string;
  chapters: Record<string, ChapterData>;
};

// Promise-cached per-book singletons — each book fetched once, reused everywhere
const _books = new Map<string, Promise<BookData | null>>();

function slug(book: string): string {
  return book.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function loadBook(book: string): Promise<BookData | null> {
  const key = slug(book);
  let cached = _books.get(key);
  if (!cached) {
    cached = fetch(`/data/books/${key}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<BookData>) : null))
      .catch(() => null);
    _books.set(key, cached);
  }
  return cached;
}

function getChapter(data: BookData | null, chapter: number): ChapterData | null {
  return data?.chapters[String(chapter)] ?? null;
}

export async function staticFetchChapter(
  book: string,
  chapter: number,
  _signal?: AbortSignal,
): Promise<Verse[]> {
  const data = await loadBook(book);
  const ch = getChapter(data, chapter);
  if (!data || !ch) return [];
  return ch.verses.map((v) => ({
    book: data.book,
    chapter,
    verse: v.verse,
    text: v.text,
    ...(v.lines ? { lines: v.lines } : {}),
  }));
}

export async function staticFetchCrossRefs(
  book: string,
  chapter: number,
  verse: number,
): Promise<LinkedRef[]> {
  const ch = getChapter(await loadBook(book), chapter);
  return ch?.xrefs?.[String(verse)] ?? [];
}

export async function staticFetchChapterXrefPhrases(
  book: string,
  chapter: number,
): Promise<XrefPhrasesEntry[]> {
  const ch = getChapter(await loadBook(book), chapter);
  if (!ch?.xrefs) return [];
  const result: XrefPhrasesEntry[] = [];
  for (const [verseKey, refs] of Object.entries(ch.xrefs)) {
    const phrases = refs.map((r) => r.phrase).filter((p): p is string => Boolean(p));
    if (phrases.length) result.push({ verse: Number(verseKey), phrases });
  }
  return result.sort((a, b) => a.verse - b.verse);
}

/**
 * Commentary word/phrase anchors (`» <anchor> :: <text>` in docs/bible/*.md),
 * keyed by verse — same shape as xref phrases, so ReadingPane/HistoryPane
 * reuse xrefWordRanges() to find the covered word indices for the dim cue.
 */
export async function staticFetchChapterCommentaryPhrases(
  book: string,
  chapter: number,
): Promise<XrefPhrasesEntry[]> {
  const ch = getChapter(await loadBook(book), chapter);
  if (!ch?.commentary_phrases) return [];
  const result: XrefPhrasesEntry[] = [];
  for (const [verseKey, phrases] of Object.entries(ch.commentary_phrases)) {
    if (phrases.length) result.push({ verse: Number(verseKey), phrases });
  }
  return result.sort((a, b) => a.verse - b.verse);
}

export async function staticFetchCommentary(
  book: string,
  chapter: number,
  verse: number,
): Promise<CommentaryEntry | null> {
  const ch = getChapter(await loadBook(book), chapter);
  return ch?.commentary?.[String(verse)] ?? null;
}

export async function staticFetchChapterCrossRefs(
  book: string,
  chapter: number,
): Promise<ChapterXrefEntry[]> {
  const ch = getChapter(await loadBook(book), chapter);
  if (!ch?.xrefs) return [];
  return Object.entries(ch.xrefs)
    .map(([verseKey, refs]) => ({ verse: Number(verseKey), refs }))
    .sort((a, b) => a.verse - b.verse);
}

export async function staticFetchChapterPhraseOverrides(
  book: string,
  chapter: number,
): Promise<string[]> {
  const ch = getChapter(await loadBook(book), chapter);
  return ch?.phrases ?? [];
}

export async function staticFetchChapterCommentary(
  book: string,
  chapter: number,
): Promise<ChapterCommentaryEntry[]> {
  const ch = getChapter(await loadBook(book), chapter);
  if (!ch?.commentary) return [];
  return Object.entries(ch.commentary)
    .map(([verseKey, entry]) => ({ verse: Number(verseKey), entry }))
    .sort((a, b) => a.verse - b.verse);
}

/**
 * Curation notes (`»` lines in docs/bible/*.md) for a chapter, keyed by verse
 * number string. Feeds the V7 commentary layer; not yet rendered in the UI.
 */
export async function staticFetchVerseNotes(
  book: string,
  chapter: number,
): Promise<Record<string, string[]>> {
  const ch = getChapter(await loadBook(book), chapter);
  return ch?.notes ?? {};
}
