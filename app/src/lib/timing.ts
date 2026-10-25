const PUNCT_MULTIPLIERS: [RegExp, number][] = [
  [/[.?!]$/, 2.5],
  [/[,;:]$/, 1.5],
  [/[—\-]$/, 1.3],
];

export function tokenInterval(token: string, baseInterval: number): number {
  for (const [re, mult] of PUNCT_MULTIPLIERS) {
    if (re.test(token)) return baseInterval * mult;
  }
  return baseInterval;
}

export function verseMarkerInterval(baseInterval: number): number {
  return baseInterval * 1.8;
}

type PhraseToken =
  | { kind: "verse"; verse: number }
  | { kind: "word"; text: string; verse: number; book: string; chapter: number };

export function buildPhraseEnd(tokens: PhraseToken[]): number[] {
  const result = new Array<number>(tokens.length);
  let phraseStart = 0;
  let wordCount = 0;

  const closePhrase = (end: number) => {
    for (let j = phraseStart; j <= end; j++) result[j] = end;
    phraseStart = end + 1;
    wordCount = 0;
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind === "verse") {
      if (wordCount > 0) closePhrase(i - 1);
      result[i] = i;
      phraseStart = i + 1;
      continue;
    }
    wordCount++;
    const hardPunct = /[.?!]/.test(t.text);
    const softPunct = /[,;:]/.test(t.text);
    if (hardPunct || (softPunct && wordCount >= 2)) {
      closePhrase(i);
    }
  }
  if (wordCount > 0) closePhrase(tokens.length - 1);
  return result;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

export type PhraseMetadata = {
  tempo?: number;                                          // [0.3]–[2.0] — multiplied against base WPM
  pause?: number;                                          // ms — extra hold after phrase boundary pause
  style?: "title" | "selah";                               // visual and timing variant
  lineBreak?: boolean;                                     // [br] — soft line break after phrase, no stage clear
};

// dim/emphasize are no longer authored markers (Phase E) — dim now comes from
// commentary `» anchor :: text` phrases, emphasize from `→ ref :: phrase`
// xrefs, both resolved via xrefWordRanges() and applied in ReadingPane/
// HistoryPane directly, bypassing phraseMeta entirely.
function parsePhraseMarkers(phrase: string): PhraseMetadata {
  const meta: PhraseMetadata = {};

  // Named style markers — checked before numeric to avoid false matches
  if (/\[title\]/i.test(phrase)) meta.style = "title";
  else if (/\[selah\]/i.test(phrase)) meta.style = "selah";

  // Pause: [pause] → 1500ms, [pause:Xs] → X*1000ms
  const pauseMatch = phrase.match(/\[pause(?::(\d+(?:\.\d+)?)s)?\]/);
  if (pauseMatch) {
    meta.pause = pauseMatch[1] ? Math.round(parseFloat(pauseMatch[1]) * 1000) : 1500;
  }

  // Line break: [br] — soft line break after phrase, no stage clear
  if (/\[br\]/i.test(phrase)) meta.lineBreak = true;

  // Tempo: purely numeric bracket e.g. [0.65], [1.2], [2.0]
  // Only values in [0.3, 2.0] are treated as tempo; others are ignored
  const tempoMatch = phrase.match(/\[(\d+(?:\.\d+)?)\]/);
  if (tempoMatch) {
    const t = parseFloat(tempoMatch[1]);
    if (t >= 0.3 && t <= 2.0) meta.tempo = t;
  }

  return meta;
}

export function buildPhraseEndFromOverrides(
  tokens: PhraseToken[],
  phrases: string[],
): {
  phraseEnd: number[];
  clearAt: Set<number>;
  sectionBreakAt: Set<number>;
  paragraphBreakAt: Set<number>;
  lineBreakAt: Set<number>;
  phraseMeta: Map<number, PhraseMetadata>;
} {
  // Default: every token is its own phrase end (safe fallback for unmatched tokens)
  const phraseEnd = Array.from({ length: tokens.length }, (_, i) => i);
  const clearAt = new Set<number>();
  const sectionBreakAt = new Set<number>();
  const paragraphBreakAt = new Set<number>();
  const lineBreakAt = new Set<number>();
  const phraseMeta = new Map<number, PhraseMetadata>();

  // Build ordered list of word token indices for sequential matching
  const wordIdxs: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].kind === "word") wordIdxs.push(i);
  }

  let wordCursor = 0;
  let prevEnd = -1;

  for (const phrase of phrases) {
    const trimmed = phrase.trim();

    if (trimmed === "---") {
      if (prevEnd >= 0) clearAt.add(prevEnd);
      continue;
    }

    if (trimmed === "===") {
      if (prevEnd >= 0) sectionBreakAt.add(prevEnd);
      continue;
    }

    if (trimmed === ">>>") {
      if (prevEnd >= 0) paragraphBreakAt.add(prevEnd);
      continue;
    }

    // Strip inline markers before word matching
    const cleanPhrase = phrase.replace(/\[.*?\]/g, "").trim();
    const phraseWords = cleanPhrase.split(/\s+/).filter(Boolean);
    if (phraseWords.length === 0) continue;

    const matchedIdxs: number[] = [];
    let cursor = wordCursor;

    for (const pw of phraseWords) {
      const normPw = norm(pw);
      while (cursor < wordIdxs.length) {
        const tok = tokens[wordIdxs[cursor]];
        cursor++;
        if (tok.kind === "word" && norm(tok.text) === normPw) {
          matchedIdxs.push(wordIdxs[cursor - 1]);
          break;
        }
      }
    }

    if (matchedIdxs.length !== phraseWords.length) {
      // Stale wording, a split editor line, or a missing space — the sequential
      // matcher silently drops unmatched words rather than throwing, so this is
      // the only signal a phrase author gets that a chunk didn't fully match.
      console.warn(
        `[timing] phrase partial match (${matchedIdxs.length}/${phraseWords.length} words): ${JSON.stringify(trimmed)}`,
      );
    }

    if (matchedIdxs.length > 0) {
      const end = matchedIdxs[matchedIdxs.length - 1];
      for (const idx of matchedIdxs) phraseEnd[idx] = end;
      prevEnd = end;
      wordCursor = cursor;

      // Extract and store marker metadata keyed by the last token of the phrase
      const meta = parsePhraseMarkers(phrase);
      if (meta.tempo !== undefined || meta.pause !== undefined || meta.style !== undefined) {
        phraseMeta.set(end, meta);
      }
      // [title] implicitly clears the stage after itself — no need to write --- in the .md
      if (meta.style === "title") clearAt.add(end);
      if (meta.lineBreak) lineBreakAt.add(end);
    }
  }

  return { phraseEnd, clearAt, sectionBreakAt, paragraphBreakAt, lineBreakAt, phraseMeta };
}

/**
 * Tier 2 poetic lineation: token indices (in the ReadingPane stream — one
 * verse token, then one token per whitespace word) that end a poetic line,
 * excluding each verse's final line. Rendered like [br]: a soft line break,
 * independent of phrase boundaries.
 */
export function buildPoetryLineBreaks(
  verses: { verse: number; text: string; lines?: string[] }[],
): Set<number> {
  const breaks = new Set<number>();
  let pos = 0; // token index of the current verse token
  for (const v of verses) {
    const wordCount = v.text.split(/\s+/).filter(Boolean).length;
    if (v.lines && v.lines.length > 1) {
      let last = pos; // last consumed token index (verse token)
      for (let i = 0; i < v.lines.length - 1; i++) {
        last += v.lines[i].split(/\s+/).filter(Boolean).length;
        breaks.add(last);
      }
    }
    pos += 1 + wordCount;
  }
  return breaks;
}

/**
 * 3-line reading-window scroll target.
 *
 * `wordTopInContainer` is the word's top relative to the container's viewport
 * box (wordRect.top - containerRect.top); adding the LIVE scrollTop converts it
 * to document space, which is invariant while a smooth scroll is in flight.
 * (Computing against the scroll *target* instead overestimates the line index
 * mid-animation and overshoots — visible as the stage jumping.)
 *
 * Returns the new scroll target (keep newest line at the window's third row),
 * or null when no forward scroll is needed.
 */
export function computeFgScrollTarget(
  wordTopInContainer: number,
  liveScrollTop: number,
  lineHeightPx: number,
  currentTarget: number,
): number | null {
  if (lineHeightPx <= 0) return null;
  const docY = wordTopInContainer + liveScrollTop;
  const lineIndex = Math.floor(docY / lineHeightPx);
  const target = Math.max(0, (lineIndex - 2) * lineHeightPx);
  return target > currentTarget ? target : null;
}

/**
 * Hold after the last word of a poetic line before the next line begins.
 * A line turn is a rhythmic event even when the phrase continues across it —
 * without this beat the reveal point snaps to the new line at full word
 * tempo, which reads as the text lurching. Comma-scale (1.5×), matching the
 * soft-punctuation weight in PUNCT_MULTIPLIERS.
 */
export function lineTurnHold(baseInterval: number): number {
  return baseInterval * 1.5;
}

/**
 * Per-word stagger (ms) for the stage-clear exit cascade.
 * Classic feel is 75ms/word, but thought-unit stages can hold 100+ words —
 * uncapped that's a 9-second fade. The cascade's total span is capped at
 * 1.5s and the per-word delay compresses to fit.
 */
export function exitStaggerMs(wordCount: number): number {
  const gaps = Math.max(1, wordCount - 1);
  return Math.min(75, 1500 / gaps);
}

/**
 * Verse-local word indices (0-based) that end a poetic line — every line's
 * last word except the final line. Display layers use this to place a break
 * and indent after those words.
 */
/**
 * Word indices (0-based, within one verse) covered by a contiguous match of
 * any cross-reference phrase. Replaces the UAT-era flat word-set approach,
 * which bolded every chapter-wide occurrence of common words like "the".
 */
export function xrefWordRanges(verseWords: string[], phrases: string[]): Set<number> {
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");
  const words = verseWords.map(clean);
  const out = new Set<number>();
  for (const phrase of phrases) {
    const target = phrase.split(/\s+/).map(clean).filter(Boolean);
    if (!target.length) continue;
    for (let s = 0; s <= words.length - target.length; s++) {
      let ok = true;
      for (let k = 0; k < target.length; k++) {
        if (words[s + k] !== target[k]) { ok = false; break; }
      }
      if (ok) for (let k = 0; k < target.length; k++) out.add(s + k);
    }
  }
  return out;
}

export function lineEndWordIndices(lines: string[]): Set<number> {
  const out = new Set<number>();
  let count = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    count += lines[i].split(/\s+/).filter(Boolean).length;
    out.add(count - 1);
  }
  return out;
}

export function computeTokenDelay(
  token: string,
  base: number,
  isPhraseBoundary: boolean,
  phraseMode: boolean,
): number {
  if (!phraseMode || isPhraseBoundary) return tokenInterval(token, base) + 150;
  return base * 0.9;
}
