import { describe, it, expect, beforeAll, vi } from "vitest";

// Per-book fixtures matching app/prod/data/books/<slug>.json produced by
// scripts/ingest_bible_md.py
const GENESIS_BOOK = {
  book: "Genesis",
  chapters: {
    "1": {
      verses: [
        { verse: 1, text: "In the beginning God created the heavens and the earth." },
        { verse: 2, text: "And the earth was waste and void." },
      ],
    },
    "25": {
      verses: [
        { verse: 27, text: "and Jacob was a complete man, dwelling in tents." },
      ],
      notes: {
        "27": ['*ish tam* — *tam* means "complete, whole, blameless".'],
      },
    },
    "49": {
      verses: [
        {
          verse: 9,
          text: "Judah is a lion’s whelp; From the prey, my son, you are gone up:",
          lines: ["Judah is a lion’s whelp;", "From the prey, my son, you are gone up:"],
        },
      ],
    },
  },
};

const JOHN_BOOK = {
  book: "John",
  chapters: {
    "3": {
      verses: [
        { verse: 16, text: "For God so loved the world." },
        { verse: 17, text: "For God sent not the Son into the world to judge the world." },
      ],
      phrases: ["For God so loved the world.", "---"],
      commentary: {
        "16": { initials: "DBH", text: "The hinge of the gospel.", links: [] },
      },
      commentary_phrases: {
        "16": ["so loved the world"],
      },
      xrefs: {
        "16": [{ ref: "Romans 5:8", phrase: "loved", preview: "But God commends his own love." }],
      },
    },
  },
};

beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const fixtures: Record<string, unknown> = {
        "/data/books/genesis.json": GENESIS_BOOK,
        "/data/books/john.json": JOHN_BOOK,
      };
      const body = fixtures[url];
      if (!body) return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }),
  );
});

// Import after stubbing fetch
const mod = await import("./staticData");

describe("staticData — bible", () => {
  it("returns a known verse", async () => {
    const verses = await mod.staticFetchChapter("Genesis", 1);
    expect(verses).toHaveLength(2);
    expect(verses[0].verse).toBe(1);
    expect(verses[0].text).toContain("beginning");
  });

  it("returns verses ordered by verse number", async () => {
    const verses = await mod.staticFetchChapter("John", 3);
    const nums = verses.map((v) => v.verse);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("returns empty array for unknown chapter", async () => {
    const verses = await mod.staticFetchChapter("Genesis", 999);
    expect(verses).toEqual([]);
  });

  it("returns empty array for unknown book", async () => {
    const verses = await mod.staticFetchChapter("Amos", 1);
    expect(verses).toEqual([]);
  });

  it("normalises book casing", async () => {
    const a = await mod.staticFetchChapter("Genesis", 1);
    const b = await mod.staticFetchChapter("genesis", 1);
    expect(a).toEqual(b);
  });
});

describe("staticData — commentary", () => {
  it("returns known commentary entry", async () => {
    const entry = await mod.staticFetchCommentary("John", 3, 16);
    expect(entry?.initials).toBe("DBH");
  });

  it("returns null for unknown verse", async () => {
    const entry = await mod.staticFetchCommentary("Genesis", 1, 1);
    expect(entry).toBeNull();
  });

  it("returns entries for a chapter", async () => {
    const entries = await mod.staticFetchChapterCommentary("John", 3);
    expect(entries).toHaveLength(1);
    expect(entries[0].verse).toBe(16);
  });
});

describe("staticData — cross-refs", () => {
  it("returns refs for known verse with baked preview", async () => {
    const refs = await mod.staticFetchCrossRefs("John", 3, 16);
    expect(refs.length).toBeGreaterThan(0);
    expect(refs[0].ref).toBe("Romans 5:8");
    expect(refs[0].preview).toContain("commends");
  });

  it("returns empty for unknown verse", async () => {
    const refs = await mod.staticFetchCrossRefs("Amos", 1, 1);
    expect(refs).toEqual([]);
  });

  it("chapter cross-refs includes verse number", async () => {
    const entries = await mod.staticFetchChapterCrossRefs("John", 3);
    expect(entries[0].verse).toBe(16);
  });

  it("commentary phrases returns anchor phrase for verse", async () => {
    const entries = await mod.staticFetchChapterCommentaryPhrases("John", 3);
    expect(entries[0].verse).toBe(16);
    expect(entries[0].phrases).toContain("so loved the world");
  });

  it("commentary phrases returns empty for chapter with no anchors", async () => {
    const entries = await mod.staticFetchChapterCommentaryPhrases("Genesis", 1);
    expect(entries).toEqual([]);
  });

  it("xref phrases returns phrase words for chapter", async () => {
    const phrases = await mod.staticFetchChapterXrefPhrases("John", 3);
    expect(phrases[0].phrases).toContain("loved");
  });
});

describe("staticData — phrases and curation notes", () => {
  it("returns phrase overrides from the book file", async () => {
    const phrases = await mod.staticFetchChapterPhraseOverrides("John", 3);
    expect(phrases).toContain("---");
  });

  it("returns empty phrases for uncurated chapter", async () => {
    const phrases = await mod.staticFetchChapterPhraseOverrides("Genesis", 1);
    expect(phrases).toEqual([]);
  });

  it("returns curation notes for a chapter", async () => {
    const notes = await mod.staticFetchVerseNotes("Genesis", 25);
    expect(notes["27"]?.[0]).toContain("ish tam");
  });
});

describe("staticData — poetic lineation", () => {
  it("passes lines through on lineated verses", async () => {
    const verses = await mod.staticFetchChapter("Genesis", 49);
    expect(verses[0].lines).toHaveLength(2);
    expect(verses[0].lines?.[0]).toBe("Judah is a lion’s whelp;");
  });

  it("omits lines on plain verses", async () => {
    const verses = await mod.staticFetchChapter("Genesis", 1);
    expect(verses[0].lines).toBeUndefined();
  });
});
