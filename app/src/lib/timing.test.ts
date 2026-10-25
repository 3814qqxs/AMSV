import { describe, it, expect, vi, afterEach } from "vitest";
import {
  tokenInterval,
  computeTokenDelay,
  buildPhraseEndFromOverrides,
  buildPoetryLineBreaks,
  computeFgScrollTarget,
  lineTurnHold,
  exitStaggerMs,
  lineEndWordIndices,
  xrefWordRanges,
} from "./timing";

type WordToken = { kind: "word"; text: string; verse: number; book: string; chapter: number };
const w = (text: string): WordToken => ({ kind: "word", text, verse: 1, book: "Romans", chapter: 1 });
const tokens = [
  { kind: "verse" as const, verse: 1 },
  w("fornication,"),
  w("wickedness,"),
  w("covetousness,"),
  w("full"),
  w("of"),
  w("envy;"),
];

describe("tokenInterval — JEJ multipliers", () => {
  const base = 1000;

  it("period ends at 2.5×", () => {
    expect(tokenInterval("word.", base)).toBe(2500);
  });

  it("question mark ends at 2.5×", () => {
    expect(tokenInterval("word?", base)).toBe(2500);
  });

  it("exclamation ends at 2.5×", () => {
    expect(tokenInterval("word!", base)).toBe(2500);
  });

  it("comma ends at 1.5×", () => {
    expect(tokenInterval("word,", base)).toBe(1500);
  });

  it("semicolon ends at 1.5×", () => {
    expect(tokenInterval("word;", base)).toBe(1500);
  });

  it("colon ends at 1.5×", () => {
    expect(tokenInterval("word:", base)).toBe(1500);
  });

  it("em-dash ends at 1.3×", () => {
    expect(tokenInterval("word—", base)).toBe(1300);
  });

  it("hyphen ends at 1.3×", () => {
    expect(tokenInterval("word-", base)).toBe(1300);
  });

  it("plain word returns base", () => {
    expect(tokenInterval("word", base)).toBe(base);
  });
});

describe("buildPoetryLineBreaks — Tier 2 lineation", () => {
  // Token stream mirrors ReadingPane: one verse token, then one token per word.
  it("marks the last word of each poetic line except the verse's final line", () => {
    const verses = [
      {
        verse: 1,
        text: "YHWH is my shepherd; I shall not want.",
        lines: ["YHWH is my shepherd;", "I shall not want."],
      },
    ];
    // tokens: 0=verse, 1..4 = "YHWH is my shepherd;", 5..8 = "I shall not want."
    const breaks = buildPoetryLineBreaks(verses);
    expect(breaks).toEqual(new Set([4]));
  });

  it("handles a mix of lineated and plain verses with correct offsets", () => {
    const verses = [
      { verse: 1, text: "In the beginning" },                       // tokens 0..3
      {
        verse: 2,
        text: "Two nations are in your womb, And the elder shall serve the younger.",
        lines: [
          "Two nations are in your womb,",                          // tokens 5..10
          "And the elder shall serve the younger.",                 // tokens 11..17
        ],
      },
    ];
    const breaks = buildPoetryLineBreaks(verses);
    expect(breaks).toEqual(new Set([10]));
  });

  it("returns an empty set when no verse has lines", () => {
    const verses = [{ verse: 1, text: "In the beginning God created" }];
    expect(buildPoetryLineBreaks(verses).size).toBe(0);
  });
});

describe("xrefWordRanges — contiguous phrase match within a verse", () => {
  const verse = "In the beginning was the Word, and the Word was with God.".split(" ");

  it("marks only the words of a contiguous phrase match", () => {
    expect(xrefWordRanges(verse, ["In the beginning"])).toEqual(new Set([0, 1, 2]));
  });

  it("does NOT mark stray common words outside the phrase", () => {
    const marked = xrefWordRanges(verse, ["In the beginning"]);
    expect(marked.has(4)).toBe(false); // second "the"
    expect(marked.has(7)).toBe(false); // third "the"
  });

  it("matches case-insensitively and ignores punctuation, at every occurrence", () => {
    expect(xrefWordRanges(verse, ["the word"])).toEqual(new Set([4, 5, 7, 8]));
  });

  it("empty when the phrase is absent", () => {
    expect(xrefWordRanges(verse, ["green pastures"])).toEqual(new Set());
  });

  it("single-word phrases mark each occurrence", () => {
    expect(xrefWordRanges("YHWH is my shepherd; I shall not want.".split(" "), ["shepherd"]))
      .toEqual(new Set([3]));
  });
});

describe("lineEndWordIndices — verse-local line ends for lineated display", () => {
  it("returns the word index ending each line except the last", () => {
    expect(lineEndWordIndices(["A Psalm of David.", "YHWH is my shepherd;", "I shall not want."]))
      .toEqual(new Set([3, 7]));
  });

  it("empty for single-line verses", () => {
    expect(lineEndWordIndices(["one line only"])).toEqual(new Set());
  });
});

describe("exitStaggerMs — stage-clear stagger with total-time cap", () => {
  it("uses the classic 75ms per word for small stages", () => {
    expect(exitStaggerMs(10)).toBe(75);
    expect(exitStaggerMs(21)).toBe(75); // 20 gaps × 75 = 1500, exactly at cap
  });

  it("compresses so the full cascade never exceeds ~1.5s", () => {
    const per = exitStaggerMs(121); // 120 gaps
    expect(per * 120).toBeLessThanOrEqual(1500);
    expect(per).toBeCloseTo(12.5);
  });

  it("handles one-word stages", () => {
    expect(exitStaggerMs(1)).toBe(75);
  });
});

describe("lineTurnHold — poetic line-turn beat", () => {
  it("is a comma-scale pause on the base interval", () => {
    expect(lineTurnHold(240)).toBe(360); // 1.5×, matches PUNCT ,;: weight
  });
});

describe("computeFgScrollTarget — 3-line window scroll", () => {
  const lh = 40; // px line height

  it("no scroll while the word is within the first three lines", () => {
    // word on line 0/1/2 (docY 0..119) → target stays 0
    expect(computeFgScrollTarget(85, 0, lh, 0)).toBeNull();
  });

  it("scrolls one line when the word enters line 3", () => {
    // container top 0, settled scrollTop 0, word viewport-top 130 → docY 130, line 3
    expect(computeFgScrollTarget(130, 0, lh, 0)).toBe(40);
  });

  it("is invariant mid-animation: same docY regardless of how far the scroll has settled", () => {
    // The word sits at docY 170 (line 4 → target 80). Measured at three moments of
    // an in-flight smooth scroll toward 40, the viewport-top differs but the live
    // scrollTop compensates exactly.
    const settled = computeFgScrollTarget(170 - 40, 40, lh, 40);   // animation done
    const midway = computeFgScrollTarget(170 - 25, 25, lh, 40);   // halfway there
    const justStarted = computeFgScrollTarget(170 - 2, 2, lh, 40); // barely moved
    expect(settled).toBe(80);
    expect(midway).toBe(80);
    expect(justStarted).toBe(80);
  });

  it("never scrolls backwards", () => {
    // word back on an earlier line than the current target → no change
    expect(computeFgScrollTarget(90, 120, lh, 120)).toBeNull();
  });
});

describe("buildPhraseEndFromOverrides — --- stage clear / === section break", () => {
  it("--- adds prevEnd to clearAt only", () => {
    const phrases = ["fornication,", "wickedness,", "---", "covetousness,"];
    const { clearAt, sectionBreakAt, paragraphBreakAt } = buildPhraseEndFromOverrides(tokens, phrases);
    expect(clearAt.has(2)).toBe(true);
    expect(sectionBreakAt.has(2)).toBe(false);
    expect(paragraphBreakAt.has(2)).toBe(false);
  });

  it("=== adds prevEnd to sectionBreakAt only", () => {
    const phrases = ["fornication,", "wickedness,", "==="];
    const { clearAt, sectionBreakAt } = buildPhraseEndFromOverrides(tokens, phrases);
    expect(sectionBreakAt.has(2)).toBe(true);
    expect(clearAt.has(2)).toBe(false);
  });
});

describe("buildPhraseEndFromOverrides — named styles", () => {
  it("[title] sets style and implicitly clears the stage", () => {
    const { phraseMeta, clearAt } = buildPhraseEndFromOverrides(tokens, ["fornication,  [title]"]);
    expect(phraseMeta.get(0)?.style).toBe("title");
    expect(clearAt.has(0)).toBe(true);
  });

  it("[selah] sets style, no implicit clear", () => {
    const { phraseMeta, clearAt } = buildPhraseEndFromOverrides(tokens, ["fornication,  [selah]"]);
    expect(phraseMeta.get(0)?.style).toBe("selah");
    expect(clearAt.has(0)).toBe(false);
  });

  it("[dim] and [emphasize] are retired — no longer parsed as a style", () => {
    const a = buildPhraseEndFromOverrides(tokens, ["fornication,  [dim]"]);
    const b = buildPhraseEndFromOverrides(tokens, ["wickedness,  [emphasize]"]);
    expect(a.phraseMeta.get(0)?.style).toBeUndefined();
    expect(b.phraseMeta.get(1)?.style).toBeUndefined();
  });
});

describe("buildPhraseEndFromOverrides — >>> paragraph break", () => {
  it("adds prevEnd to paragraphBreakAt, not clearAt or sectionBreakAt", () => {
    const phrases = ["fornication,", "wickedness,", ">>>", "covetousness,"];
    const { clearAt, sectionBreakAt, paragraphBreakAt } = buildPhraseEndFromOverrides(tokens, phrases);
    // "wickedness," is at token index 2; it becomes prevEnd before >>>
    expect(paragraphBreakAt.has(2)).toBe(true);
    expect(clearAt.has(2)).toBe(false);
    expect(sectionBreakAt.has(2)).toBe(false);
  });

  it("ignores >>> when there is no preceding phrase (prevEnd === -1)", () => {
    const phrases = [">>>", "fornication,"];
    const { paragraphBreakAt } = buildPhraseEndFromOverrides(tokens, phrases);
    expect(paragraphBreakAt.size).toBe(0);
  });
});

describe("buildPhraseEndFromOverrides — [br] line break", () => {
  it("adds phraseEnd index to lineBreakAt for [br]-tagged phrase", () => {
    const phrases = ["fornication,  [br]", "wickedness,"];
    const { lineBreakAt } = buildPhraseEndFromOverrides(tokens, phrases);
    // "fornication," is at token index 1
    expect(lineBreakAt.has(1)).toBe(true);
    expect(lineBreakAt.has(2)).toBe(false);
  });

  it("[br] alongside [pause] — both parsed", () => {
    const phrases = ["fornication,  [br] [pause:1s]"];
    const { lineBreakAt, phraseMeta } = buildPhraseEndFromOverrides(tokens, phrases);
    expect(lineBreakAt.has(1)).toBe(true);
    expect(phraseMeta.get(1)?.pause).toBe(1000);
  });

  it("[br] alongside tempo — both parsed", () => {
    const phrases = ["fornication,  [br] [0.8]"];
    const { lineBreakAt, phraseMeta } = buildPhraseEndFromOverrides(tokens, phrases);
    expect(lineBreakAt.has(1)).toBe(true);
    expect(phraseMeta.get(1)?.tempo).toBe(0.8);
  });
});

describe("buildPhraseEndFromOverrides — partial-match warning", () => {
  afterEach(() => vi.restoreAllMocks());

  it("warns when a phrase word is not found (stale/split wording)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // "wikedness," (typo) never matches any token — partial match of 0/1
    buildPhraseEndFromOverrides(tokens, ["fornication,", "wikedness,"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/partial match/i);
    expect(warn.mock.calls[0][0]).toContain("wikedness,");
  });

  it("does not warn on a full match", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    buildPhraseEndFromOverrides(tokens, ["fornication,", "wickedness,"]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn on stage-break tokens (---, ===, >>>)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    buildPhraseEndFromOverrides(tokens, ["fornication,", "---", "wickedness,", "==="]);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("computeTokenDelay — JEJ musical phrasing", () => {
  const base = 1000;

  it("phrase boundary, plain word: tokenInterval + 150ms", () => {
    expect(computeTokenDelay("word", base, true, true)).toBe(1150);
  });

  it("phrase boundary, period: 2.5× + 150ms", () => {
    expect(computeTokenDelay("word.", base, true, true)).toBe(2650);
  });

  it("within phrase: base × 0.9", () => {
    expect(computeTokenDelay("word", base, false, true)).toBe(900);
    expect(computeTokenDelay("word,", base, false, true)).toBe(900);
  });

  it("phraseMode off: always tokenInterval + 150ms regardless of boundary", () => {
    expect(computeTokenDelay("word", base, false, false)).toBe(1150);
    expect(computeTokenDelay("word.", base, false, false)).toBe(2650);
    expect(computeTokenDelay("word", base, true, false)).toBe(1150);
  });
});
