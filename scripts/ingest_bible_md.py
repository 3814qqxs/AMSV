"""Build script: docs/bible/*.md -> app/prod/data/books/*.json.

The curated per-book markdown is the canonical text (R7). This script:
  1. parses each book file (verse lines, `»` note lines, `→ phrase :: ref`
     xref lines, indented continuations, and INLINE single-source markers —
     `[br]`/`[title]`/`[pause]`/tempo, plus standalone `---`/`===`/`>>>`
     stage breaks — from which it derives clean reading `text` (markers stripped)
     and the phrase segmentation, so text and phrasing live on one line and cannot
     drift; editorial `[...]` brackets in the ASV source are preserved as text),
  2. validates loudly — malformed lines, verse order, counts vs
     scripts/verse_manifest.json,
  3. validates inline phrases against the curated text with the same sequential
     matcher the app uses (timing.ts), so a marker-stripping bug fails the build,
  4. writes app/prod/data/books/<slug>.json (xref previews resolved at build time).

Run whenever docs/bible/*.md change:

    py scripts/ingest_bible_md.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIBLE_DIR = ROOT / "docs" / "bible"
MANIFEST = Path(__file__).resolve().parent / "verse_manifest.json"
OUT_DIR = ROOT / "app" / "prod" / "data"


class IngestError(Exception):
    pass


# ------------------------------------------------------------- md parsing

VERSE_RX = re.compile(r"^(\d+)  (.+)$")
CHAPTER_RX = re.compile(r"^## (.+?) (\d+)$")
XREF_RX = re.compile(r"^→\s*(.+?)\s*::\s*(.+)$")
# `→ <anchor phrase> :: <reference>` — same `::` convention and anchor-first
# order as `»` commentary notes.
NOTE_PREFIX = "» "
# `» <anchor phrase> :: <note text>` — anchor is optional; a bare `»  <text>`
# note (no `::`) carries no word cue. Same `::` convention as xrefs.
NOTE_ANCHOR_RX = re.compile(r"^(.+?)\s*::\s*(.+)$")

# inline single-source markers: a FIXED marker vocabulary
# ([br], [title], [selah], [pause]/[pause:Xs], tempo [N.N]) stays attached to
# its phrase chunk; standalone `---`/`===`/`>>>` are stage breaks. Only these
# are stripped from the clean reading `text` — arbitrary `[...]` in the ASV
# source (editorial brackets: [forty], [Selah], supplied words, the John 7:53
# pericope) is real text and must be preserved.
BREAK_TOKENS = ("---", "===", ">>>")
KNOWN_MARKER_RX = re.compile(
    r"\[(?:br|title|selah|pause(?::\d+(?:\.\d+)?s)?|\d+(?:\.\d+)?)\]",
    re.IGNORECASE)
TRAILING_BREAK_RX = re.compile(r"^(.*?)\s+(---|===|>>>)\s*$")


def _clean_text(s: str) -> str:
    """Reading text: drop known inline markers + break tokens, collapse
    whitespace. Editorial `[...]` brackets in the ASV source are preserved."""
    s = KNOWN_MARKER_RX.sub("", s)
    s = re.sub(r"(?:(?<=\s)|^)(?:---|===|>>>)(?=\s|$)", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _split_trailing_break(s: str):
    """('text …', '---') if a break token trails the line, else (s, None)."""
    m = TRAILING_BREAK_RX.match(s)
    if m:
        return m.group(1).rstrip(), m.group(2)
    return s, None


def parse_book_md(text: str):
    """Parse one book file. Returns (book, {chapter: {...}}). Each chapter dict
    carries: "verses" [(n, clean_text)], "notes" {n:[str]}, "lines" {n:[str]},
    "xrefs" {n:[{ref,phrase}]}, "inline_phrases" [str] (single-source phrase
    segmentation derived from inline markers), and "has_inline" bool (whether
    any inline marker/break was present). Raises IngestError on anything
    malformed."""
    book: str | None = None
    chapters: dict[int, dict] = {}
    chapter: int | None = None
    last_verse: int | None = None

    def add_phrase_line(raw_seg: str) -> None:
        """Append a marked text line as a phrase chunk, splitting off any
        trailing break token as its own standalone entry."""
        body, brk = _split_trailing_break(raw_seg.strip())
        ch = chapters[chapter]
        if body.strip():
            ch["inline_phrases"].append(body.strip())
        if brk:
            ch["inline_phrases"].append(brk)
            ch["has_inline"] = True
        if KNOWN_MARKER_RX.search(raw_seg):
            ch["has_inline"] = True

    for lineno, raw in enumerate(text.splitlines(), 1):
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("# ") and not line.startswith("## "):
            book = line[2:].strip()
            continue
        m = CHAPTER_RX.match(line)
        if m:
            chapter = int(m.group(2))
            if chapter in chapters:
                raise IngestError(f"line {lineno}: duplicate chapter {chapter}")
            chapters[chapter] = {"verses": [], "notes": defaultdict(list),
                                 "lines": {}, "xrefs": defaultdict(list),
                                 "commentary_phrases": defaultdict(list),
                                 "inline_phrases": [], "has_inline": False}
            last_verse = None
            continue
        if line.startswith(NOTE_PREFIX):
            if chapter is None or last_verse is None:
                raise IngestError(f"line {lineno}: note with no preceding verse")
            raw_note = line[len(NOTE_PREFIX):].strip()
            m2 = NOTE_ANCHOR_RX.match(raw_note)
            if m2:
                chapters[chapter]["commentary_phrases"][last_verse].append(
                    m2.group(1).strip())
                chapters[chapter]["notes"][last_verse].append(m2.group(2).strip())
            else:
                chapters[chapter]["notes"][last_verse].append(raw_note)
            continue
        m = XREF_RX.match(line)
        if m:
            if chapter is None or last_verse is None:
                raise IngestError(f"line {lineno}: xref with no preceding verse")
            chapters[chapter]["xrefs"][last_verse].append(
                {"phrase": m.group(1).strip(), "ref": m.group(2).strip()})
            continue
        if line.strip() in BREAK_TOKENS:
            if chapter is None:
                raise IngestError(f"line {lineno}: break before any chapter heading")
            chapters[chapter]["inline_phrases"].append(line.strip())
            chapters[chapter]["has_inline"] = True
            continue
        m = VERSE_RX.match(line)
        if m:
            if chapter is None:
                raise IngestError(f"line {lineno}: verse before any chapter heading")
            n = int(m.group(1))
            if last_verse is not None and n <= last_verse:
                raise IngestError(
                    f"line {lineno}: verse {n} out of order (after {last_verse})")
            marked = m.group(2).strip()
            chapters[chapter]["verses"].append((n, _clean_text(marked)))
            add_phrase_line(marked)
            last_verse = n
            continue
        if raw.startswith((" ", "\t")) and chapter is not None \
                and chapters[chapter]["verses"]:
            if chapters[chapter]["notes"].get(last_verse):
                raise IngestError(
                    f"line {lineno}: verse continuation after a » note")
            v, t = chapters[chapter]["verses"][-1]
            marked = line.strip()
            seg = _clean_text(marked)
            chapters[chapter]["verses"][-1] = (v, (t + " " + seg).strip())
            # poetic lineation: first continuation splits the verse into lines
            chapters[chapter]["lines"].setdefault(v, [t]).append(seg)
            add_phrase_line(marked)
            continue
        raise IngestError(f"line {lineno}: unrecognized line: {line[:60]!r}")

    if book is None:
        raise IngestError("no `# Book` heading found")
    return book, chapters


# ------------------------------------------------------- phrase validation

MARKER_RX = re.compile(r"\[.*?\]")
STANDALONE = {"---", "===", ">>>"}


def _norm(s: str) -> str:
    return re.sub(r"[^a-z]", "", s.lower())


def validate_phrases(chapter_words: list[str], phrases: list[str]) -> list[str]:
    """Mirror of timing.ts buildPhraseEndFromOverrides matching. Returns a list
    of error strings for phrases that do not fully match in sequence."""
    norm_words = [_norm(w) for w in chapter_words]
    errors: list[str] = []
    cursor = 0
    for phrase in phrases:
        trimmed = phrase.strip()
        if not trimmed or trimmed in STANDALONE or trimmed.startswith("#"):
            continue
        clean = MARKER_RX.sub("", phrase).strip()
        pwords = [_norm(w) for w in clean.split() if _norm(w)]
        if not pwords:
            continue
        matched = 0
        c = cursor
        for pw in pwords:
            while c < len(norm_words):
                c += 1
                if norm_words[c - 1] == pw:
                    matched += 1
                    break
        if matched == len(pwords):
            cursor = c
        else:
            errors.append(
                f"phrase matched {matched}/{len(pwords)} words: {trimmed!r}")
            # do not advance cursor — same behavior review needs to see
    return errors


# ------------------------------------------------------------------ build

def slug(book: str) -> str:
    return re.sub(r"[^a-z0-9]", "", book.lower())


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    errors: list[str] = []
    books: dict[str, dict] = {}          # book -> parsed chapters
    book_files = sorted(BIBLE_DIR.glob("*.md"))

    for path in book_files:
        try:
            book, chapters = parse_book_md(path.read_text(encoding="utf-8"))
        except IngestError as e:
            errors.append(f"{path.name}: {e}")
            continue
        books[book] = chapters
        expected = manifest.get(book)
        if expected is None:
            errors.append(f"{path.name}: book {book!r} not in manifest")
            continue
        for ch, data in chapters.items():
            want = expected.get(str(ch))
            got = len(data["verses"])
            if want is not None and got != want:
                errors.append(
                    f"{book} {ch}: {got} verses, manifest expects {want}")
        missing = set(expected) - {str(c) for c in chapters}
        if missing:
            errors.append(f"{book}: missing chapters {sorted(missing, key=int)}")

    # inline phrase validation against curated text (self-consistency check:
    # derived from the same text, so a failure means a marker-stripping bug)
    inline_ok = 0
    for book, chapters in books.items():
        for ch, data in chapters.items():
            if not data["has_inline"]:
                continue
            words: list[str] = []
            for _, vtext in data["verses"]:
                words.extend(vtext.split())
            bad = validate_phrases(words, data["inline_phrases"])
            if bad:
                for b in bad:
                    errors.append(f"inline phrases {book} {ch}: {b}")
            else:
                inline_ok += 1

    if errors:
        print(f"INGEST FAILED — {len(errors)} error(s):", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    # verse lookup for xref preview resolution
    def find_verse(ref: str) -> str | None:
        m = re.match(r"^(.+?) (\d+):(\d+)$", ref)
        if not m:
            return None
        b, c, v = m.group(1), int(m.group(2)), int(m.group(3))
        for n, t in books.get(b, {}).get(c, {}).get("verses", []):
            if n == v:
                return t
        return None

    # per-book output
    out_books = OUT_DIR / "books"
    out_books.mkdir(parents=True, exist_ok=True)
    for path in book_files:
        book, _ = parse_book_md(path.read_text(encoding="utf-8"))
        chapters = books[book]
        payload_chapters: dict[str, dict] = {}
        for ch in sorted(chapters):
            data = chapters[ch]
            entry: dict = {"verses": [
                {"verse": n, "text": t,
                 **({"lines": data["lines"][n]} if n in data["lines"] else {})}
                for n, t in data["verses"]]}
            if data["notes"]:
                entry["notes"] = {str(v): ns for v, ns in
                                  sorted(data["notes"].items())}
            if data["commentary_phrases"]:
                entry["commentary_phrases"] = {str(v): ps for v, ps in
                                               sorted(data["commentary_phrases"].items())}
            if data["has_inline"]:
                entry["phrases"] = data["inline_phrases"]
            if data["xrefs"]:
                entry["xrefs"] = {
                    str(v): [{**r, **({"preview": find_verse(r["ref"])}
                                      if find_verse(r["ref"]) else {})}
                             for r in refs]
                    for v, refs in sorted(data["xrefs"].items())}
            payload_chapters[str(ch)] = entry

        payload = {"book": book, "chapters": payload_chapters}
        (out_books / f"{slug(book)}.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8")

    total_verses = sum(len(d["verses"]) for b in books.values()
                       for d in b.values())
    total_notes = sum(len(ns) for b in books.values()
                      for d in b.values() for ns in d["notes"].values())
    total_xrefs = sum(len(xs) for b in books.values()
                      for d in b.values() for xs in d["xrefs"].values())
    total_anchored = sum(len(ps) for b in books.values()
                         for d in b.values() for ps in d["commentary_phrases"].values())
    print(f"OK: {len(books)} books, {total_verses} verses, "
          f"{total_notes} commentary notes ({total_anchored} anchored), "
          f"{total_xrefs} inline xrefs, "
          f"{inline_ok} inline phrase chapters validated")
    print(f"Output: {out_books}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
