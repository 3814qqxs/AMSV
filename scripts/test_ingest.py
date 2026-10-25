"""Tests for ingest_bible_md.py.

Run:  py scripts/test_ingest.py
"""
import unittest

from ingest_bible_md import parse_book_md, validate_phrases, IngestError

SAMPLE = """# Genesis

## Genesis 1

1  In the beginning God created the heavens and the earth.
2  And the earth was waste and void.

## Genesis 25

27  And the boys grew; and Jacob was a complete man, dwelling in tents.
» *ish tam* — complete, whole, blameless.
» *yodea tsayid* — literally "knowing hunting".
28  Now Isaac loved Esau.
"""

POETRY = """# Psalms

## Psalms 23

1  YHWH is my shepherd;
   I shall not want.
2  He makes me to lie down.
"""


class TestParse(unittest.TestCase):
    def test_basic_structure(self):
        book, chapters = parse_book_md(SAMPLE)
        self.assertEqual(book, "Genesis")
        self.assertEqual(sorted(chapters), [1, 25])
        self.assertEqual(len(chapters[1]["verses"]), 2)
        self.assertEqual(chapters[1]["verses"][0],
                         (1, "In the beginning God created the heavens and the earth."))

    def test_notes_attach_to_verse(self):
        _, chapters = parse_book_md(SAMPLE)
        notes = chapters[25]["notes"]
        self.assertEqual(sorted(notes), [27])
        self.assertEqual(len(notes[27]), 2)
        self.assertTrue(notes[27][0].startswith("*ish tam*"))

    def test_continuation_lines_join(self):
        _, chapters = parse_book_md(POETRY)
        self.assertEqual(chapters[23]["verses"][0],
                         (1, "YHWH is my shepherd; I shall not want."))

    def test_continuation_lines_preserved_as_lineation(self):
        _, chapters = parse_book_md(POETRY)
        lines = chapters[23]["lines"]
        self.assertEqual(lines[1], ["YHWH is my shepherd;", "I shall not want."])
        self.assertNotIn(2, lines)          # single-line verse: no lines entry

    def test_note_after_lineated_verse(self):
        md = ("# Psalms\n\n## Psalms 23\n\n"
              "1  YHWH is my shepherd;\n"
              "     I shall not want.\n"
              "» A note on the verse.\n")
        _, chapters = parse_book_md(md)
        self.assertEqual(chapters[23]["lines"][1],
                         ["YHWH is my shepherd;", "I shall not want."])
        self.assertEqual(chapters[23]["notes"][1], ["A note on the verse."])

    def test_malformed_line_raises(self):
        bad = "# Genesis\n\n## Genesis 1\n\n1  ok verse\nrogue line no number\n"
        with self.assertRaises(IngestError):
            parse_book_md(bad)

    def test_verse_order_enforced(self):
        bad = "# Genesis\n\n## Genesis 1\n\n2  second\n1  first\n"
        with self.assertRaises(IngestError):
            parse_book_md(bad)


class TestPhraseValidation(unittest.TestCase):
    CHAPTER = "In the beginning God created the heavens and the earth."

    def test_full_match(self):
        phrases = ["In the beginning", "---", "God created  [0.9]",
                   "the heavens and the earth.", "---"]
        bad = validate_phrases(self.CHAPTER.split(), phrases)
        self.assertEqual(bad, [])

    def test_partial_match_reported(self):
        phrases = ["In the beginnning", "---"]        # typo: no full match
        bad = validate_phrases(self.CHAPTER.split(), phrases)
        self.assertEqual(len(bad), 1)
        self.assertIn("beginnning", bad[0])

    def test_stale_asv_wording_reported(self):
        # phrase authored against ASV "hath made" but text now says "has made"
        bad = validate_phrases("he has made all things".split(),
                               ["he hath made", "all things"])
        self.assertEqual(len(bad), 1)
        self.assertIn("hath", bad[0])

    def test_markers_ignored(self):
        bad = validate_phrases("The LORD is my shepherd".split(),
                               ["The LORD  [title] [pause:2s]",
                                "is my shepherd", "==="])
        self.assertEqual(bad, [])


INLINE = """# Luke

## Luke 1

1  Since many have taken in hand to draw up a narrative, [br]
2  even as they delivered them to us. [pause]
---
3  it seemed good to me also. [br]
4  that you might know the certainty. ---
17  And he shall go before His face in the power of Elijah.[br]
» *enōpion autou* — before His face.
→ the power of Elijah :: Malachi 4:5
→ turn the hearts :: Malachi 4:6
18  And Zacharias said to the angel.
"""

PLAIN = """# Genesis

## Genesis 1

1  In the beginning God created the heavens and the earth.
2  And the earth was waste and void.
"""


class TestInlineMarkers(unittest.TestCase):
    def test_clean_text_strips_markers(self):
        _, chapters = parse_book_md(INLINE)
        verses = dict(chapters[1]["verses"])
        # [br], [pause] and trailing --- gone; words untouched
        self.assertEqual(verses[1],
                         "Since many have taken in hand to draw up a narrative,")
        self.assertEqual(verses[2], "even as they delivered them to us.")
        self.assertEqual(verses[4], "that you might know the certainty.")
        self.assertEqual(verses[17],
                         "And he shall go before His face in the power of Elijah.")

    def test_inline_phrases_built_in_order(self):
        _, chapters = parse_book_md(INLINE)
        ph = chapters[1]["inline_phrases"]
        self.assertTrue(chapters[1]["has_inline"])
        # verse lines become chunks (markers kept); standalone/trailing --- emit tokens
        self.assertEqual(ph[0], "Since many have taken in hand to draw up a narrative, [br]")
        self.assertEqual(ph[1], "even as they delivered them to us. [pause]")
        self.assertEqual(ph[2], "---")                       # standalone break line
        self.assertEqual(ph[3], "it seemed good to me also. [br]")
        self.assertEqual(ph[4], "that you might know the certainty.")
        self.assertEqual(ph[5], "---")                       # trailing break split off

    def test_inline_phrases_validate_against_own_text(self):
        _, chapters = parse_book_md(INLINE)
        words: list[str] = []
        for _, t in chapters[1]["verses"]:
            words.extend(t.split())
        self.assertEqual(validate_phrases(words, chapters[1]["inline_phrases"]), [])

    def test_xrefs_parsed(self):
        _, chapters = parse_book_md(INLINE)
        xr = chapters[1]["xrefs"]
        self.assertEqual([r["ref"] for r in xr[17]],
                         ["Malachi 4:5", "Malachi 4:6"])
        self.assertEqual(xr[17][0]["phrase"], "the power of Elijah")
        self.assertEqual(xr[17][0]["ref"], "Malachi 4:5")

    def test_note_and_xref_coexist_before_next_verse(self):
        _, chapters = parse_book_md(INLINE)
        self.assertTrue(chapters[1]["notes"][17][0].startswith("*enōpion"))
        self.assertIn(18, dict(chapters[1]["verses"]))

    def test_plain_book_has_no_inline(self):
        _, chapters = parse_book_md(PLAIN)
        self.assertFalse(chapters[1]["has_inline"])

    def test_editorial_brackets_preserved(self):
        # ASV editorial brackets are real text, not markers — keep them, and do
        # not flag the chapter as inline (a plain book carries no phrase layer).
        md = ("# 1 Samuel\n\n## 1 Samuel 13\n\n"
              "1  Saul was [forty] years old when he began to reign.\n"
              "2  His glory covered the heavens. [Selah\n")
        _, chapters = parse_book_md(md)
        verses = dict(chapters[13]["verses"])
        self.assertEqual(verses[1],
                         "Saul was [forty] years old when he began to reign.")
        self.assertEqual(verses[2], "His glory covered the heavens. [Selah")
        self.assertFalse(chapters[13]["has_inline"])


ANCHORED_NOTES = """# Luke

## Luke 1

7  And they had no child, because Elisabeth was barren, and they both were now well advanced in years.
» well advanced :: (“stricken”); the Hebraic idiom is a euphemism for old age.
» a plain note with no anchor at all.
17  And he shall go before His face in the spirit and power of Elijah.
» the spirit and power of Elijah :: an allusion to Malachi 4:5-6.
"""


class TestCommentaryAnchors(unittest.TestCase):
    def test_anchored_note_splits_phrase_from_text(self):
        _, chapters = parse_book_md(ANCHORED_NOTES)
        self.assertEqual(chapters[1]["commentary_phrases"][7], ["well advanced"])
        self.assertEqual(chapters[1]["notes"][7],
                         ["(“stricken”); the Hebraic idiom is a euphemism for old age.",
                          "a plain note with no anchor at all."])

    def test_unanchored_note_has_no_commentary_phrase_entry(self):
        _, chapters = parse_book_md(ANCHORED_NOTES)
        # only the anchored note contributed a phrase; the plain note did not
        self.assertEqual(len(chapters[1]["commentary_phrases"][7]), 1)

    def test_multiple_verses_each_get_own_anchor(self):
        _, chapters = parse_book_md(ANCHORED_NOTES)
        self.assertEqual(chapters[1]["commentary_phrases"][17],
                         ["the spirit and power of Elijah"])
        self.assertEqual(chapters[1]["notes"][17],
                         ["an allusion to Malachi 4:5-6."])

    def test_dim_and_emphasize_markers_no_longer_stripped(self):
        # [dim]/[emphasize] are retired inline markers (Phase E) — they are now
        # ordinary bracketed text, left untouched like editorial brackets.
        md = ("# Luke\n\n## Luke 1\n\n"
              "1  A word here. [dim]\n"
              "2  Another word. [emphasize]\n")
        _, chapters = parse_book_md(md)
        verses = dict(chapters[1]["verses"])
        self.assertEqual(verses[1], "A word here. [dim]")
        self.assertEqual(verses[2], "Another word. [emphasize]")
        self.assertFalse(chapters[1]["has_inline"])


if __name__ == "__main__":
    unittest.main(verbosity=1)
