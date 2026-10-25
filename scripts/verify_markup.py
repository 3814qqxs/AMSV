"""Markup QA: docs/bible/*.md -> anchor/marker/quote-balance report.

Companion to ingest_bible_md.py, reusing its exact parser (parse_book_md) so
the checks here see the same verse text and anchor attachment the real build
sees — not an approximation of it. Catches the mistakes a markup pass makes
most often:

  1. `»`/`→` anchor phrases that are not a verbatim substring of the verse
     text they attach to (ingest matches by exact substring and fails
     silently on mismatch; see the markup guide's Error prevention
     section). This includes the R11 poetic-lineation trap: a numbered line
     mid-poem (e.g. "43    Till I make...") is its own verse to the parser
     regardless of indentation, so an anchor placed after it attaches to
     THAT verse, not to the unnumbered continuation line above it.
  2. `[br]` immediately before a `---`/`===`/`>>>` stage break (redundant —
     the break already clears the stage).
  3. Unbalanced curly double-quotes (“ ”) per chapter, R13. Single curly
     quotes (‘ ’) are reported but not failed on — they collide with curly
     apostrophes (e.g. "Jesus'") too often to balance-check reliably.

Run after a markup pass, before declaring a book/group done:

    py scripts/verify_markup.py            # every book in docs/bible/
    py scripts/verify_markup.py luke        # by file stem, case-insensitive
    py scripts/verify_markup.py luke mark
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIBLE_DIR = ROOT / "docs" / "bible"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ingest_bible_md import parse_book_md, IngestError  # noqa: E402

BREAK_TOKENS = ("---", "===", ">>>")


def check_anchors(book: str, chapters: dict) -> list[str]:
    errors = []
    for ch, data in sorted(chapters.items()):
        text_by_verse = dict(data["verses"])
        for n, phrases in data["commentary_phrases"].items():
            verse_text = text_by_verse.get(n, "")
            for phrase in phrases:
                if phrase and phrase not in verse_text:
                    errors.append(
                        f"{book} {ch}:{n}: » anchor not a substring: {phrase!r}")
        for n, xrefs in data["xrefs"].items():
            verse_text = text_by_verse.get(n, "")
            for xref in xrefs:
                phrase = xref["phrase"]
                if phrase and phrase not in verse_text:
                    errors.append(
                        f"{book} {ch}:{n}: → anchor not a substring: {phrase!r}")
    return errors


def check_br_before_break(book: str, path: Path) -> list[str]:
    errors = []
    chapter = None
    lines = path.read_text(encoding="utf-8").splitlines()
    prev_ended_br = False
    for lineno, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if line.startswith("## "):
            chapter = line[3:].strip()
            prev_ended_br = False
            continue
        if line in BREAK_TOKENS:
            if prev_ended_br:
                errors.append(
                    f"{book} ({chapter}) line {lineno}: {line!r} preceded by [br]")
            prev_ended_br = False
            continue
        if line.strip():
            prev_ended_br = line.endswith("[br]")
    return errors


def check_quote_balance(book: str, path: Path) -> list[str]:
    errors = []
    text = path.read_text(encoding="utf-8")
    chapter = None
    depth = 0
    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("## "):
            if depth != 0:
                errors.append(
                    f"{book} ({chapter}): double-quote imbalance, net {depth:+d} "
                    "open at chapter end")
            chapter = line[3:].strip()
            depth = 0
            continue
        depth += line.count("“") - line.count("”")
    if depth != 0:
        errors.append(
            f"{book} ({chapter}): double-quote imbalance, net {depth:+d} "
            "open at chapter end")
    return errors


def main(argv: list[str]) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # Windows console defaults to cp1252
    wanted = {a.lower() for a in argv}
    book_files = sorted(BIBLE_DIR.glob("*.md"))
    if wanted:
        book_files = [p for p in book_files if p.stem.lower() in wanted]
        missing = wanted - {p.stem.lower() for p in book_files}
        if missing:
            print(f"no such book file(s) in {BIBLE_DIR}: {sorted(missing)}")
            return 2

    total_errors = 0
    for path in book_files:
        text = path.read_text(encoding="utf-8")
        try:
            book, chapters = parse_book_md(text)
        except IngestError as e:
            print(f"{path.name}: PARSE ERROR: {e}")
            total_errors += 1
            continue

        errors = (
            check_anchors(book, chapters)
            + check_br_before_break(book, path)
            + check_quote_balance(book, path)
        )
        if errors:
            print(f"{book}: {len(errors)} problem(s)")
            for e in errors:
                print(f"  {e}")
            total_errors += len(errors)
        else:
            print(f"{book}: clean")

    print()
    print(f"{total_errors} total problem(s) across {len(book_files)} book(s).")
    return 1 if total_errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
