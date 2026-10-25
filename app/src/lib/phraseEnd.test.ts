import { describe, it, expect } from "vitest";
import { buildPhraseEnd } from "./timing";

type Token =
  | { kind: "verse"; verse: number }
  | { kind: "word"; text: string; verse: number; book: string; chapter: number };

function word(text: string): Token {
  return { kind: "word", text, verse: 1, book: "John", chapter: 1 };
}

function verse(v: number): Token {
  return { kind: "verse", verse: v };
}

describe("buildPhraseEnd — punctuation-only breaks", () => {
  it("verse marker is its own phrase", () => {
    const tokens: Token[] = [verse(1)];
    expect(buildPhraseEnd(tokens)[0]).toBe(0);
  });

  it("many plain words with no punctuation form one phrase", () => {
    const tokens: Token[] = [
      word("a"), word("b"), word("c"), word("d"), word("e"),
      word("f"), word("g"), word("h"), word("i"), word("j"), word("k"),
    ];
    const result = buildPhraseEnd(tokens);
    expect(result).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
  });

  it("soft punct (comma/semicolon/colon) on 1 word does NOT close phrase", () => {
    // "Yea, though I walk" — "Yea," should not be orphaned alone
    const tokens: Token[] = [word("Yea,"), word("though"), word("I"), word("walk")];
    const result = buildPhraseEnd(tokens);
    expect(result[0]).not.toBe(0);
    expect(result).toEqual([3, 3, 3, 3]);
  });

  it("soft punct on 2+ words closes phrase", () => {
    // "shepherd;" at word 4 should close
    const tokens: Token[] = [word("my"), word("shepherd;"), word("I"), word("shall")];
    const result = buildPhraseEnd(tokens);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(3);
  });

  it("hard punct (period/question/exclamation) on 1 word closes phrase", () => {
    // "want." alone should still close — it's a sentence end
    const tokens: Token[] = [word("want.")];
    expect(buildPhraseEnd(tokens)[0]).toBe(0);
  });

  it("verse marker flushes pending words first", () => {
    const tokens: Token[] = [word("a"), word("b"), verse(2), word("c")];
    const result = buildPhraseEnd(tokens);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(3);
  });

  it("Psalm 23 v2 — 9-word clause stays intact", () => {
    // "He maketh me to lie down in green pastures;" — must NOT split at word 5
    const tokens: Token[] = [
      word("He"), word("maketh"), word("me"), word("to"), word("lie"),
      word("down"), word("in"), word("green"), word("pastures;"),
    ];
    const result = buildPhraseEnd(tokens);
    expect(result[0]).toBe(8); // whole clause is one phrase
    expect(result[8]).toBe(8);
  });

  it("Psalm 23 v1 — title phrase, shepherd phrase, want phrase each close cleanly", () => {
    const tokens: Token[] = [
      word("A"), word("Psalm"), word("of"), word("David."),       // closes at 3
      word("Jehovah"), word("is"), word("my"), word("shepherd;"), // closes at 7
      word("I"), word("shall"), word("not"), word("want."),       // closes at 11
    ];
    const result = buildPhraseEnd(tokens);
    expect(result[0]).toBe(3);
    expect(result[3]).toBe(3);
    expect(result[4]).toBe(7);
    expect(result[7]).toBe(7);
    expect(result[8]).toBe(11);
    expect(result[11]).toBe(11);
  });
});
