# Project History

This is a write-only log. Do not read it during normal sessions.

---

## Session: Luke — Name Registry & divine-pronoun pass

- Applied Tier-1 Name Rendering Registry substitutions across all 24 chapters of `docs/bible/luke.md`: Jesus→Yeshua, Christ→Messiah, James→Jacob, Judas→Judah, baptize/baptism→immerse/immersion, Baptist→Immerser, gospel→good news (kept "Gospels" where referring to the four books).
- Applied R1.1 divine-pronoun capitalization (he/his/him/himself) for Yeshua/God/Holy Spirit throughout the book; left generic/parable-character and non-divine referents lowercase.
- Added two new philology notes (R7 format) for the Name Registry substitutions themselves: "Jacob" at Luke 5:10 and "Judah" at Luke 6:16.
- Fixed grammar/mechanical fallout from the substitution pass: "a immersion"→"an immersion" (12:50), "Yeshua'"→"Yeshua's" possessive (5:8, 8:41), two stale `»` anchors that had fallen out of sync with capitalized verse text (8:44, 11:38).
- Verified with `py scripts/verify_markup.py luke` (clean) and `py scripts/ingest_bible_md.py` (66 books, 31086 verses build OK).
- User asked separately (not yet actioned in text) which other NT names in English translation obscure an OT connection — answered in-session; registry not yet updated for these pending user decision.

## Session: Luke — register modernization (Tier 1a/1b) pass

- Fixed leftover archaic-form misses from the prior R2 pass: `thyself`→`yourself` (4:9, 4:23, 5:14), `layedst`→`laid` (19:21), capitalized `Please` at the start of a direct quotation (16:27).
- Modernized `tarried`/`tarry`→`delayed`/`stayed`/`stay` (1:21, 2:43, 24:49); `besought`/`beseech`→`pleaded with`/`begged`/`urged...earnestly`/`implore`/`beg` per context (4:38, 5:12, 7:4, 8:28, 8:41, 9:38, 9:40); `thenceforth`→`from then on` (13:9, kept `henceforth` at 5:10/12:52/22:69 as still-live formal register); `smote`→`beat`/`struck...cut off` (18:13, 22:50); `bade`→`invited` (14:9, 14:16) plus the related `bidden`→`invited` family (7:39, 14:7, 14:8, 14:10, 14:12, 14:17, 14:24); `cumbered`/`cumber`→`distracted`/`waste` (10:40, 13:7); `divers`→`various` (4:40, 21:11); `nought`→`despised` (18:9, 23:11); `must needs`→`must` (14:18, 21:9, 24:44).
- Checked the Greek for the recurring "sit(ting)/sat...at/to meat" idiom (12x: 5:29, 7:36, 7:37, 7:49, 11:37, 12:37, 14:10, 14:15, 17:7, 22:27 ×2, 24:30) — confirmed every instance is the ἀνά-/κατά-κεῖμαι/κλίνω/πίπτω "recline at table" word family, not a generic sit/eat verb. Reworked all twelve directly to `reclined`/`reclining at the table` rather than a neutral paraphrase. Added a new `»` philology note at the first occurrence (5:29) explaining the Second-Temple/Greco-Roman reclining posture, cross-referencing the existing note at 22:14.
- Checked the Greek behind "sore afraid" (2:9): *ephobēthēsan phobon megan*, a cognate-accusative Hebraic/LXX intensifying idiom (cf. Jonah 1:10, 16; same pattern as the existing 22:15 note). Superseded the interim mechanical fix (`sore`→`sorely afraid`) with `feared greatly`, closer to the Greek's verb-based construction. Added a `»` note cross-referencing 22:15.
- Verified with `py scripts/verify_markup.py luke` after each batch (clean throughout, 0 problems). `ingest_bible_md.py` not yet run this session — app data not rebuilt.

{
  "date": "2026-07-28",
  "book": "mark",
  "chapters": "1-16",
  "session": "tier1_registry + tier1b_modernization + tier2_review",
  "tier1_registry_pass": {
    "applied": true,
    "substitutions": {
      "Jesus->Yeshua": 104,
      "Christ->Messiah (incl. Christ's/Christs)": 11,
      "James->Jacob": 16,
      "Judas->Judah": 4,
      "baptize/baptized/baptism->immerse/immersed/immersion": 10,
      "John the Baptist/Baptizer->John the Immerser": 4,
      "gospel->good news (common-noun uses)": 8,
      "gospel kept as Gospel (literary-work sense, notes at ~7:19 and 16:9)": 2
    },
    "verification": "py scripts/verify_markup.py mark -> clean"
  },
  "tier1b_modernizations": [
    {"verse": "1:6", "original": "a leathern girdle about his loins", "updated": "a leather belt around his waist", "source": "zone dermatine"},
    {"verse": "1:7", "original": "the latchet of whose shoes", "updated": "the strap of whose sandals", "source": "himas"},
    {"verse": "1:34", "original": "divers diseases", "updated": "various diseases", "source": "poikilos"},
    {"verse": "13:8", "original": "divers places", "updated": "various places", "source": "poikilos"},
    {"verse": "2:15-16", "original": "publicans", "updated": "tax collectors", "source": "telones"},
    {"verse": "5:10", "original": "besought him much that he would not send them away", "updated": "begged him earnestly not to send them away", "source": "parakaleo"},
    {"verse": "5:12", "original": "besought him, saying", "updated": "begged him, saying", "source": "parakaleo"},
    {"verse": "5:18", "original": "besought him that he might be with him", "updated": "begged that he might go with him", "source": "parakaleo"},
    {"verse": "6:56", "original": "besought him that they might touch", "updated": "begged to touch even the border of his garment", "source": "parakaleo"},
    {"verse": "7:26", "original": "besought him that he would cast forth the demon", "updated": "begged him to cast the demon out", "source": "parakaleo"},
    {"verse": "6:25", "original": "forthwith give me", "updated": "at once give me", "source": "exautes"},
    {"verse": "6:37", "original": "two hundred shillings' worth", "updated": "two hundred denarii's worth", "source": "denarion"},
    {"verse": "14:5", "original": "three hundred shillings", "updated": "three hundred denarii", "source": "denarion"},
    {"verse": "12:42", "original": "which make a farthing", "updated": "which make a quadrans", "source": "kodrantes (matches existing note)"},
    {"verse": "6:51", "original": "sore amazed", "updated": "utterly astounded", "source": "existanto (lian)"},
    {"verse": "9:6", "original": "sore afraid", "updated": "terrified", "source": "ekphoboi egenonto"},
    {"verse": "14:33", "original": "sore troubled", "updated": "deeply anguished", "source": "ademoneo"},
    {"verse": "9:12", "original": "set at nought", "updated": "be treated with contempt", "source": "exoudeneo"},
    {"verse": "10:39", "original": "immersed withal", "updated": "immersed with", "source": "archaic connective, no separate lemma"},
    {"verse": "13:7", "original": "these things must needs happen", "updated": "this must happen", "source": "dei"},
    {"verse": "14:47", "original": "smote the servant ... struck off his ear", "updated": "struck the servant ... cutting off his ear", "source": "epaisen"},
    {"verse": "15:19", "original": "they smote his head with a reed", "updated": "they kept striking his head with a reed", "source": "etypton (iterative imperfect)"}
  ],
  "tier2_flags_reviewed": [
    {"verse": "1:41", "issue": "splagchnistheis (compassion, majority) vs v.l. orgistheis (anger; Codex Bezae, some Old Latin)", "decision": "note_added"},
    {"verse": "2:26", "issue": "Abiathar named as high priest; 1 Sam 21:1-6 names Ahimelech", "decision": "no_change"},
    {"verse": "6:20", "issue": "eporei (was perplexed, critical text) vs v.l. epoiei (did many things, Byzantine)", "decision": "no_change"},
    {"verse": "10:24", "issue": "'for them that trust in riches' absent from earliest witnesses (P45, Sinaiticus, Vaticanus)", "decision": "note_added"}
  ],
  "final_verification": "py scripts/verify_markup.py mark -> Mark: clean, 0 problems"
}

{
  "date": "2026-07-28",
  "book": "mark",
  "session": "note_addition",
  "notes_added": [
    {
      "verse": "1:21",
      "anchor": "And they go into Capernaum",
      "topic": "historical present (praesens historicum)",
      "content": "erchontai (they go/come) as a historical present; Mark uses it ~151 times vs a handful in Luke, who regularly converts to aorist for his more literary historiographical register (Luke 1:1-4); flags the present/past tense-switching as a genuine feature of Mark's Greek, not a translation inconsistency"
    }
  ],
  "final_verification": "py scripts/verify_markup.py mark -> Mark: clean, 0 problems"
}

## Session entry (JSON)
```json
{
  "date": "2026-07-28",
  "book": "Matthew",
  "action": "curation_pass",
  "scope": "whole_book_tier1a + chapter1_calibration",
  "tier1a_registry_applied_whole_book": {
    "Jesus->Yeshua": true,
    "Christ/Christs->Messiah/Messiahs": true,
    "Judas->Judah": true,
    "James->Jacob": true,
    "church->assembly": true,
    "baptize/baptism/John the Baptist->immerse/immersion/John the Immerser": true,
    "gospel->good news (message sense only)": true
  },
  "tier1b_law_to_torah_applied_whole_book": {
    "instances": ["5:17", "5:18", "7:12", "11:13", "12:5", "22:36", "22:40", "23:23"],
    "excluded_as_civil_or_idiom": ["5:40 (go to law)", "10:35 (daughter in law)"],
    "user_decision": "apply_all_8"
  },
  "tier1b_chapter1_dead_vocabulary": {
    "1:19_privily": {"applied": "secretly", "source": "Greek lathra"},
    "1:19_was_minded_to": {"applied": "resolved to", "source": "Greek eboulethe (boulomai)"}
  },
  "tier3_notes_added_chapter1": [
    "v.16 egennesen/egennethe grammatical break (Joseph not biological father)",
    "v.17 dvd gematria (14 = David) for the 3x14 structure",
    "v.21 Yeshua name-as-content (YHWH saves)"
  ],
  "tier2_flags_chapter1": [],
  "flags_surfaced_not_blocking": [
    "Jacob/Judah name collisions across Matthew (4 Jacobs, 2 Judahs) from registry application -- user confirmed proceed as-is",
    "\"privily\" recurs at 2:7, unresolved, pending ch.2 pass"
  ],
  "verify_markup": "clean",
  "status": "chapter_1_drafted_awaiting_user_review_before_ch2_per_S10_workflow"
}
```

## Session addendum
```json
{
  "date": "2026-07-28",
  "book": "Matthew",
  "action": "note_correction",
  "verse": "1:21",
  "reason": "user challenged initial gloss conflating Yeshua with Yehoshua's full theophoric meaning",
  "research": "web-verified against FIRM Israel, Jews for Jesus (Yehoshua/Yeshua etymology article), general Hebrew lexical consensus; Fruchtenbaum primary source (Yeshua: Life of Messiah, Ariel Ministries, 4 vols.) is paywalled/not indexed online, not directly quotable",
  "final_note": "Yeshua as Second Temple contraction of Yehoshua; Matt 1:21 wordplay reframed as Yeshua/yoshia (name/verb) paronomasia on shared root y-sh-ʿ, rather than a claim that the contracted form's own gloss is weaker"
}
```

## Session addendum 2
```json
{
  "date": "2026-07-28",
  "book": "Matthew",
  "action": "note_added_then_corrected",
  "verse": "1:11",
  "note_added": "Jechoniah/Coniah throne disqualification (Jeremiah 22:30) and its relation to the two genealogies",
  "user_correction": "removed 'legal line through Joseph / adoption confers legal throne-right' framing as unfounded/no material textual connection; user identified it as a generic harmonization pattern, not something grounded in this text",
  "final_note": "identifies the Jeremiah 22:30 disqualification only, and states the Davidic covenant promise (2 Samuel 7:12-16) is fulfilled through Mary via Nathan's line (Luke 3:23-31), bypassing Solomon/Jechoniah -- no claim about legal/adoptive throne-right made",
  "v16_note": "left unchanged -- rests on the egennesen/egennethe grammar shift alone, independent of the v.11 throne-right claim that was removed",
  "verify_markup": "clean"
}
```

## Session: John — curation review + Tier 1/3 pass (2026-07-28)
```json
{
  "date": "2026-07-28",
  "book": "john",
  "type": "curation_review_and_tier1_pass",
  "applied": {
    "tier1a_registry": {
      "Jesus->Yeshua": true,
      "Christ->Messiah": true,
      "Judas->Judah": true,
      "baptize/baptizing/baptized/baptizes->immerse/immersing/immersed/immerses": true,
      "special_cases": [
        "1:41 and 4:25 parenthetical glosses reworded to 'the Anointed One' to avoid Messiah/Messiah circularity",
        "'Jesus Christ' (1:17, 17:3) -> 'Yeshua the Messiah'",
        "possessive 'Jesus'' -> 'Yeshua's' (12:9, 13:23, 13:25)",
        "titulus 'JESUS OF NAZARETH' (19:19) -> 'YESHUA OF NAZARETH'",
        "applied uniformly to verse text, notes, and xrefs for internal consistency"
      ]
    },
    "torah_vs_law": {
      "converted_to_Torah": ["1:17", "7:19 (x2)", "7:23", "7:49", "7:51", "8:17"],
      "left_as_law": ["10:34", "15:25", "19:7"],
      "rationale": "10:34 and 15:25 quote Psalms under nomos (scripture broadly, not Pentateuch); 19:7 uses indefinite 'a law' (specific statute, not the corpus)"
    },
    "tier1b_dead_vocabulary": [
      {"verse": "3:22", "from": "tarried", "to": "stayed", "greek": "diatribo"},
      {"verse": "11:54", "from": "tarried", "to": "stayed", "greek": "diatribo"},
      {"verse": "4:40", "from": "besought", "to": "urged", "greek": "erotao"},
      {"verse": "4:47", "from": "besought", "to": "urged", "greek": "erotao"},
      {"verse": "4:4", "from": "must needs", "to": "had to", "greek": "edei"},
      {"verse": "7:23", "from": "every whit whole", "to": "completely whole", "greek": "holon"},
      {"verse": "13:10", "from": "clean every whit", "to": "completely clean", "greek": "holos"},
      {"verse": "2:6", "from": "firkins", "to": "measures", "greek": "metretas"}
    ],
    "pacing_fixes": [
      "removed stray leaked [br] marker from 3:25 commentary note",
      "3:6-8: changed three consecutive '---' (scene-change) to '>>>' (paragraph break) - was subdividing beats within one continuous discourse, not a genuine scene change",
      "3:3, 3:5, 3:11: removed [0.85] tempo tag (applied nowhere else across ~25 other 'Truly, truly' occurrences in John - calibration drift)"
    ],
    "xref_addition": ["1:51 -> Genesis 28:12 (Jacob's ladder), matching the tight single-point-echo treatment already given to 3:14's Numbers 21 typology"]
  },
  "not_applied_pending_user_review": {
    "tier2_flags": [
      "1:14,18,3:16,18 'only begotten' vs monogenes ('one and only')",
      "3:3,7 'born anew' vs anothen (again/from above double sense)",
      "3:16 'so loved the world' vs houtos (manner, not degree)",
      "4:24 'God is a Spirit' vs anarthrous pneuma ho theos ('God is spirit')",
      "6:7,12:5 'shillings' vs denarion (anachronistic English-currency substitution)",
      "20:17 'Touch me not' vs me mou haptou (durative 'stop clinging')"
    ]
  },
  "verification": "scripts/verify_markup.py john: clean; scripts/ingest_bible_md.py: OK, 66 books built"
}
```

## Session: John — Tier 2 review, decided one-by-one (2026-07-28)
```json
{
  "date": "2026-07-28",
  "book": "john",
  "type": "tier2_material_edits_user_approved",
  "decisions": [
    {"verses": ["1:14","1:18","3:16","3:18"], "from": "only begotten", "to": "one and only", "greek": "monogenes", "decision": "applied"},
    {"verses": ["3:3","3:7"], "from": "born anew", "to": "born from above", "greek": "anothen", "decision": "applied", "note_added": true},
    {"verse": "3:16", "from": "so loved the world", "to": "this is how God loved the world", "greek": "houtos", "decision": "applied", "note_added": true},
    {"verse": "4:24", "from": "God is a Spirit", "to": "God is spirit", "greek": "pneuma ho theos (anarthrous)", "decision": "applied"},
    {"verses": ["6:7","12:5"], "from": "shillings", "to": "denarii", "greek": "denarion", "decision": "applied", "note_added": "6:7 only"},
    {"verse": "20:17", "from": "Touch me not", "to": "Stop clinging to me", "greek": "me mou haptou", "decision": "applied", "note_revised": true}
  ],
  "verification": "scripts/verify_markup.py john: clean; scripts/ingest_bible_md.py: OK, 653 commentary notes (588 anchored)"
}
```

## Session: Acts — full-book pre-work (2026-07-28)

```json
{
  "date": "2026-07-28",
  "book": "Acts",
  "chapters": "1-28 (complete)",
  "author_sample_used": "Luke (for calibration precedent — name registry, R1.1, note style)",
  "workflow_stage": "steps 2-6 (draft ch.1, user review, calibration, complete remaining chapters)",
  "tier1a_mechanical": {
    "Jesus->Yeshua": "applied globally",
    "Christ->Messiah": "applied globally",
    "Judas->Judah": "applied globally (incl. Bar-Jesus->Bar-Yeshua)",
    "James->Jacob": "applied globally (person only; see caught_issues)",
    "baptize/baptism family -> immerse/immersion family": "applied globally",
    "church/churches -> assembly/assemblies": "applied globally, matches Matthew 16:18/18:17 precedent (not 'congregation')",
    "bishops -> overseers": "20:28, with registry-required office-term note",
    "R1.1 divine-pronoun capitalization": "manual verse-by-verse pass, all 28 chapters, for he/his/him/himself referring to Yeshua/God the Father/His angel; first-person divine speech (my/I/me) left lowercase per Luke convention"
  },
  "tier1b_decided_ch1_then_applied_book_wide": {
    "passion -> suffering": "Acts 1:3 (Greek: articular infinitive to pathein auton)",
    "companied -> been with": "Acts 1:21 (Greek: synelthonton)",
    "surnamed -> also called": "applied consistently at all instances: 1:23 Justus, 4:36 Barnabas, 10:5/18/32 Peter (Greek: epikaloumenos)"
  },
  "tier2_flags_resolved": {
    "1:4_synalizomenos": "user chose to keep ASV rendering 'being assembled together with them' (alt. reading 'eating with them' not applied)"
  },
  "judgment_calls_not_gated_but_flagged_to_user": {
    "law_vs_Torah": "law->Torah wherever Mosaic instruction is meant (~15 instances); kept as 'law' for Gamaliel's title 'doctor of the law' (5:34, idiom, matches Luke 5:17 precedent) and two Roman-outsider generic references (Gallio 18:15, Lysias's letter 23:29)"
  },
  "tier3_notes_added": [
    "1:13 Jacob / Judah name-registry notes (first occurrence, matches Luke 6:10/16 style)",
    "1:18 Judah's death vs Matthew 27:5 harmonization (cites Papias)",
    "1:21 Hebraic idiom 'went in and went out'",
    "1:24 kardiognosta ('heart-knower')",
    "20:28 episkopous/overseers office-term note"
  ],
  "caught_and_fixed": {
    "26:7_note": "global James->Jacob swap initially corrupted the scripture citation 'James 1:1' (epistle title) to 'Jacob 1:1'; reverted — book-title citations kept as canonical 'James', same logic as the Gospel-title exception in the registry. Open question for when James/Jacob-authored books are curated: do epistle titles ever flip?"
  },
  "verification": "verify_markup.py acts: clean; scripts/ingest_bible_md.py: OK (66 books, 31086 verses)",
  "status": "complete, pending user spot-check in app"
}
```


## Session: 1 Corinthians & 2 Corinthians -- Tier-1 mechanical pass + Tier-1b/Tier-2 review (2026-07-30)

```json
{
  "date": "2026-07-30",
  "books": [
    "1 Corinthians",
    "2 Corinthians"
  ],
  "session_summary": "Tier-1 mechanical pass (Name Rendering Registry + R1.1 divine-pronoun capitalization) applied to both books, which already carried pacing markup, cross-references (→), and commentary (») from prior work. Tier-1b register proposals and Tier-2 flags reviewed and resolved with user.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "1corinthians.md, 2corinthians.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving: 'Jesus Christ'->'Yeshua Messiah', 'Christ Jesus'->'Messiah Yeshua')",
        "church/churches -> assembly/assemblies",
        "baptize/baptized -> immerse/immersed",
        "gospel -> good news",
        "James -> Jacob (1 Cor 15:7)",
        "divers -> various",
        "R1.1: capitalized He/His/Him/Himself where referent is God the Father, Messiah, or the Holy Spirit; left lowercase for generic 'he that...' (whoever) constructions and human/Satan referents",
        "Cross-reference anchors updated in lockstep where pronoun capitalization touched anchor text (1 Cor 15:25, 15:27; 2 Cor 1:20, 5:21, 7:6)"
      ],
      "verification": "verify_markup.py clean for both books"
    },
    {
      "type": "tier1b_register",
      "scope": "1corinthians.md",
      "resolved": [
        {
          "ref": "1:19",
          "from": "bring to nought",
          "to": "thwart",
          "greek": "atheteō"
        },
        {
          "ref": "1:28, 6:13",
          "from": "bring to nought",
          "to": "nullify",
          "greek": "katargeō"
        },
        {
          "ref": "2:6",
          "from": "coming to nought",
          "to": "passing away",
          "greek": "katargeō (pass.)"
        },
        {
          "ref": "3:2",
          "from": "not with meat",
          "to": "not with solid food",
          "greek": "brōma"
        },
        {
          "ref": "6:13",
          "from": "Meats for the belly, and the belly for meats",
          "to": "Food is for the stomach, and the stomach for food",
          "greek": "brōmata"
        },
        {
          "ref": "8:10",
          "from": "sitting at meat",
          "to": "reclining at table",
          "greek": "katakeimenon"
        },
        {
          "ref": "8:13",
          "from": "if meat causes my brother to stumble, I will eat no flesh",
          "to": "if food causes my brother to stumble, I will eat no meat",
          "greek": "brōma / krea"
        },
        {
          "ref": "12:7",
          "from": "to profit withal",
          "to": "for the common good",
          "greek": "pros to sympheron"
        },
        {
          "ref": "16:13",
          "from": "quit you like men",
          "to": "be courageous",
          "greek": "andrizesthe"
        },
        {
          "ref": "4:4",
          "from": "he that judges me is the Lord",
          "to": "He that judges me is the Lord",
          "note": "capitalization precedent set here; reused for 2 Cor 1:21, 5:5, 7:6"
        },
        {
          "ref": "7:36; 13:5",
          "from": "unseemly",
          "to": "improperly",
          "greek": "aschemoneō",
          "note": "raised by user after initial pass; both instances share the same verb"
        }
      ]
    },
    {
      "type": "tier1b_register",
      "scope": "2corinthians.md",
      "resolved": [
        {
          "ref": "1:12; 3:4; 8:23; 13:3",
          "from": "you-ward / God-ward",
          "to": "toward you / toward God"
        },
        {
          "ref": "1:23",
          "from": "I forbare to come",
          "to": "I forbore to come",
          "note": "reclassed as Tier-1a spelling fix"
        },
        {
          "ref": "3:15-16",
          "from": "whensoever",
          "to": "whenever"
        },
        {
          "ref": "9:5",
          "from": "aforepromised",
          "to": "previously promised"
        },
        {
          "ref": "9:15",
          "from": "his unspeakable gift",
          "to": "His indescribable gift",
          "greek": "anekdiegetos",
          "note": "distinguished from 12:4's arreta ('not lawful to utter'), left as-is"
        },
        {
          "ref": "11:5",
          "from": "not a whit behind",
          "to": "not at all inferior to"
        },
        {
          "ref": "11:7",
          "from": "for nought",
          "to": "for nothing",
          "note": "user overrode initial proposal of 'free of charge'"
        },
        {
          "ref": "11:30; 12:1",
          "from": "must needs glory",
          "to": "must glory",
          "note": "kept 'glory' (kauchaōmai) intact for consistency with its ~20x use across ch.10-12; only dropped archaic 'needs'"
        }
      ]
    },
    {
      "type": "tier2_flags",
      "scope": "1corinthians.md",
      "resolved": [
        {
          "ref": "7:36-38",
          "issue": "'his virgin daughter' -- 'daughter' present in neither Greek (tēn parthenon autou) nor ASV 1901 ('his virgin')",
          "decision": "removed 'daughter', reverted to 'his virgin'"
        },
        {
          "ref": "6:9",
          "issue": "'effeminate, abusers of themselves with men' for malakoi / arsenokoitai",
          "decision": "left as-is, no change"
        }
      ]
    },
    {
      "type": "tier2_flags",
      "scope": "2corinthians.md",
      "resolved": [
        {
          "ref": "3:6",
          "issue": "'the letter kills, but the spirit gives life' -- spirit/Spirit ambiguous in Greek (anarthrous), materially changes the claim",
          "decision": "capitalized 'Spirit' both occurrences"
        }
      ]
    }
  ],
  "open_items": [
    "romans.md line 13 has a stray '[br]]' causing ingest_bible_md.py to fail on full-corpus build; unrelated to this session, not fixed (out of scope, flagged to user)"
  ]
}
```

```json
{
  "date": "2026-07-30",
  "books": [
    "Galatians"
  ],
  "session_summary": "Tier-1 mechanical pass (Name Rendering Registry + R1.1 divine-pronoun capitalization) applied to galatians.md, which already carried pacing markup, cross-references (→), and commentary (») from prior work. Nomos/Torah rendering decided with user and applied.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "galatians.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving: 'Jesus Christ'->'Yeshua Messiah', 'Christ Jesus'->'Messiah Yeshua')",
        "James -> Jacob (1:19, 2:9, 2:12)",
        "church/churches -> assembly/assemblies (1:2, 1:13, 1:22; 'assembly' chosen over 'congregation' as default, flagged to user)",
        "baptized -> immersed (3:27)",
        "gospel -> good news (throughout; not a book-title context in this letter)",
        "R1.1: capitalized He/His/Him/Himself where referent is God the Father, Yeshua/Messiah, or the Son (1:1, 1:4, 1:6, 1:15, 1:16, 2:8, 2:20, 3:5, 4:4, 4:5, 4:6, 5:8); left lowercase for human referents (Paul, Cephas, the human 'troubler', the heir/son illustration, etc.)",
        "» notes updated in lockstep for terminology consistency (1:8, 6:2, 6:17)"
      ],
      "verification": "verify_markup.py clean"
    },
    {
      "type": "tier1b_register",
      "scope": "galatians.md",
      "resolved": [
        {
          "ref": "throughout (2:16,19,21; 3:2,5,10,11,12,13,17,18,19,21,23,24; 4:4,5,21; 5:3,4,14,18; 6:2,13)",
          "issue": "nomos/torah registry entry requires distinguishing Mosaic Torah from general/civil law; ~24 instances, nearly all referring to the Mosaic law",
          "greek": "ho nomos",
          "decision": "user accepted recommendation: rendered 'the law' -> 'the Torah' at every Mosaic-law instance, including 6:2 'law of Christ' -> 'Torah of Messiah' (matches its existing » note gloss torat ha-mashiach); retained the single generic instance at 5:23 ('against such there is no law') as 'law'"
        }
      ]
    }
  ],
  "open_items": []
}
```

```json
{
  "date": "2026-07-30",
  "books": [
    "Ephesians"
  ],
  "session_summary": "Tier-1 mechanical pass (Name Rendering Registry + R1.1 divine-pronoun capitalization) applied to ephesians.md, which already carried pacing markup, cross-references (→), and commentary (») from prior work. Nomos/Torah rendering applied per the policy set in the Galatians session.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "ephesians.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving: 'Jesus Christ'->'Yeshua Messiah', 'Christ Jesus'->'Messiah Yeshua')",
        "church -> assembly (1:22; 3:10,21; 5:23,24,25,27x2,29,32)",
        "baptism -> immersion (4:5)",
        "gospel -> good news (1:13; 3:6; 6:15,19)",
        "'the law of commandments contained in ordinances' (2:15) -> 'the Torah of commandments...' per the Mosaic-law policy set for Galatians (this letter's only nomos instance)",
        "R1.1: capitalized He/His/Him/Himself throughout, heaviest in ch.1 (the long doxology, vv.4-23) and ch.2-6 wherever the referent is God the Father, Yeshua/Messiah, or the Son; left lowercase for human referents (the household-code 'he'/'his' of masters/servants/husbands in 4:28, 5:28-33, 6:8,22) and for the impersonal citation formula 'he says' (4:8, 5:14), which does not unambiguously name a divine grammatical antecedent",
        "→ anchors updated in lockstep where capitalization/registry swaps touched anchor text (1:22 'under His feet'; 6:15 'the good news of peace')",
        "» notes updated for terminology consistency (2:14, 4:9, 5:2, 5:14, 5:26)"
      ],
      "verification": "verify_markup.py clean"
    }
  ],
  "open_items": [
    "4:8 'Therefore he says' and 5:14 'Therefore he says' left lowercase as a citation-introducing formula rather than a personal divine pronoun -- flagged for user override if a capitalized 'He'/'It' convention is preferred there"
  ]
}
```

```json
{
  "date": "2026-07-30",
  "books": [
    "Ephesians"
  ],
  "session_summary": "Reviewed Arnold Fruchtenbaum's paper 'Rabbinic Quotations of the Old Testament and How It Relates to Joel 2 and Acts 2' (pre-trib.org), which is the source of R10's four-category OT-reference taxonomy. Confirmed R10 mapping: (1) direct verbatim = pshat, (2) thematic application = remez/typology, (3) single-point borrowing = drash, (4) summary of many = sod/summation. Applied the sod category to reclassify and rewrite the Ephesians 5:14 » note.",
  "actions": [
    {
      "type": "reference_review",
      "source": "Fruchtenbaum, 'Rabbinic Quotations of the Old Testament and How It Relates to Joel 2 and Acts 2', pre-trib.org",
      "finding": "R10's four categories (direct verbatim / thematic application / single-point borrowing / summary of many) correspond one-to-one with the rabbinic pardes categories as relabeled by David L. Cooper: pshat (literal prophecy + literal fulfillment), remez (literal + typical), drash (literal + application, one point of similarity), sod (summation, no single verse, citation formula introduces a composite of multiple passages)."
    },
    {
      "type": "note_revision",
      "scope": "ephesians.md",
      "ref": "5:14",
      "issue": "» note described the 'he says...Awake...arise...shine' citation as an unattributed hymnic/liturgical fragment but did not name why it falls outside the other three OT-reference categories",
      "decision": "reclassified as sod/summation: the formula 'he says' introduces no single verse but braids Isaiah 26:19 ('awake... you who dwell in the dust') with Isaiah 60:1 ('arise, shine'); rewrote the note to state the two source passages explicitly rather than the prior generic 'woven from Isaiah 26:19 and 60:1' phrasing",
      "from": "— the triple summons, \"Awake… arise from the dead… Messiah shall shine,\" reads as an early immersion-liturgy or hymnic fragment woven from Isaiah 26:19 and 60:1, cited with a scripture-formula (\"he says\") though it matches no single verse.",
      "to": "— the formula \"he says\" introduces no single verse but braids Isaiah 26:19 (\"awake… you who dwell in the dust\") with Isaiah 60:1 (\"arise, shine\"), reading as an early immersion-liturgy or hymnic fragment applying the Isaianic resurrection-and-light motif to the believer."
    }
  ],
  "verification": "verify_markup.py ephesians clean",
  "open_items": []
}
```

```json
{
  "date": "2026-07-30",
  "books": [
    "Colossians"
  ],
  "session_summary": "Tier-1 mechanical pass (Name Rendering Registry + R1.1 divine-pronoun capitalization) applied to colossians.md, which already carried pacing markup and commentary (») from prior work (no → cross-references present in this book). No nomos/Torah instances occur in this letter.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "colossians.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving: 'Jesus Christ'->'Yeshua Messiah', 'Christ Jesus'->'Messiah Yeshua')",
        "church -> assembly (1:18, 1:24; 4:15,16)",
        "baptism -> immersion (2:12; and the 1:13 » note's 'at the baptism' -> 'at the immersion')",
        "gospel -> good news (1:5, 1:23)",
        "R1.1: capitalized He/His/Him/Himself throughout wherever the referent is God the Father or Messiah (heaviest in the 1:9-29 doxology and 2:6-15); left lowercase for human referents (the false teacher of 2:18, the human agents of 4:8-13, the generic 'he' of 3:25)",
        "» notes updated for terminology consistency (1:13, 1:24)"
      ],
      "verification": "verify_markup.py clean"
    },
    {
      "type": "tier1b_register",
      "scope": "colossians.md",
      "resolved": [
        {
          "ref": "4:11",
          "issue": "Jesus->Yeshua registry swap was initially applied name-wide regardless of referent, but this instance names a different person (Paul's fellow-worker 'Jesus... called Justus'), not Yeshua of Nazareth",
          "decision": "user reverted to 'Jesus that is called Justus'; Name Rendering Registry's Jesus->Yeshua swap does not apply when the referent is not Yeshua of Nazareth"
        }
      ]
    }
  ],
  "open_items": []
}
```

```json
{
  "date": "2026-07-30",
  "books": [
    "1 Thessalonians",
    "2 Thessalonians"
  ],
  "session_summary": "Full first-pass curation of both letters, which arrived as bare ASV text with no markup, notes, or refs -- unlike the prior batch of already-annotated books. Applied Tier-1 mechanical registry substitutions + R1.1 divine-pronoun capitalization, added the reading-pacing markup layer (---/[br]), and drafted » commentary notes and → OT cross-references from scratch, calibrated to the density/style established in Galatians/Ephesians/Colossians. No Tier-2 flags or Tier-1b dead-vocabulary proposals arose in this pass.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "1thessalonians.md, 2thessalonians.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving)",
        "church/churches -> assembly/assemblies",
        "gospel -> good news",
        "R1.1: capitalized He/His/Him/Himself where referent is God the Father or the Lord Yeshua; left lowercase for human referents and, in 2 Thess 2, every pronoun for 'the man of lawlessness'/'the lawless one' (2:4,6,7,9) since that figure is explicitly not-God despite the God-imitating claims of the passage",
        "2 Thess 1:3 'your faith growth exceedingly' corrected to 'your faith grows exceedingly' (archaic 'groweth' mis-set as the noun 'growth' in the source text; reclassed as Tier-1a mechanical, not a wording change)",
        "no nomos/Torah instances occur in either letter"
      ],
      "verification": "verify_markup.py clean for both books"
    },
    {
      "type": "pacing_markup_added",
      "scope": "1thessalonians.md, 2thessalonians.md",
      "notes": "Both letters had no markup layer at all before this session. Added '---' at rhetorical/paragraph shifts (roughly 2-4 per chapter, matching the density of the prior epistles) and '[br]' on: the triadic build in 1 Thess 4:16 ('with a shout, / with the voice of the archangel, / and with the trump of God'), and the rapid-fire imperative list 1 Thess 5:16-22 (each short command on its own line, no trailing [br] on 5:22 since a '---' follows)."
    },
    {
      "type": "notes_and_refs_added",
      "scope": "1thessalonians.md",
      "items": [
        {"ref": "1:9", "anchor": "a living and true God", "source": "Jeremiah 10:10", "note": "Tanakh idol-polemic (elohim emet / elohim chayyim)"},
        {"ref": "2:19", "note": "'crown of glorying' vs. the Tanakh's reward-crown imagery (Proverbs 16:31; Isaiah 28:5), no → ref (thematic only, no single-verse anchor)"},
        {"ref": "3:13", "anchor": "with all His saints", "source": "Zechariah 14:5", "note": "YHWH's coming with all the holy ones applied to the Parousia"},
        {"ref": "4:16", "anchor": "with the trump of God", "source": "Isaiah 27:13", "note": "Sinai shofar + eschatological ingathering-trumpet imagery"},
        {"ref": "5:2", "anchor": "the day of the Lord", "source": "Zephaniah 1:14", "note": "yom YHWH as a fixed prophetic term"},
        {"ref": "5:8", "anchor": "the breastplate of faith and love; and for a helmet, the hope of salvation", "source": "Isaiah 59:17", "note": "cross-references the same Isaiah 59:17 armor-of-YHWH imagery already read messianically at Ephesians 6:14-17"}
      ]
    },
    {
      "type": "notes_and_refs_added",
      "scope": "2thessalonians.md",
      "items": [
        {"ref": "1:7", "note": "'in flaming fire' vs Isaiah 66:15's Day-of-YHWH theophany (lahavei-esh), no → ref (near-verbatim Greek but not a clean English substring match)"},
        {"ref": "1:9", "anchor": "from the face of the Lord and from the glory of His might", "source": "Isaiah 2:10", "note": "Isaiah's terror-before-glory Day-of-YHWH refrain (also at Isa 2:19, 21)"},
        {"ref": "2:3", "note": "'son of perdition' as the same Semitic construct-genitive already explained at 1 Thess 5:5 and Colossians 1:13, no → ref"},
        {"ref": "2:4", "anchor": "exalts himself against all that is called God", "source": "Daniel 11:36", "note": "self-exalting king + temple-desecration typology (Daniel 9:27, 11:31; Antiochus Epiphanes, 1 Maccabees 1:54)"},
        {"ref": "2:8", "anchor": "shall slay with the breath of His mouth", "source": "Isaiah 11:4", "note": "direct messianic-destroyer echo (ruach sephatav)"}
      ]
    }
  ],
  "open_items": []
}
```

```json
{
  "date": "2026-07-31",
  "books": [
    "Titus",
    "Philemon"
  ],
  "session_summary": "Full first-pass curation of both letters (bare ASV text, no prior markup). Ran the ch.1 calibration loop on Titus per §10, then completed chs.2-3; user hand-edited ch.2's pacing mid-session, which established a revised project-wide pacing calibration (see pacing_markup_added) that was then back-applied to Titus ch.3 and used directly for the Philemon draft. All Tier-1b and Tier-2 items were resolved by end of session.",
  "actions": [
    {
      "type": "tier1_mechanical",
      "scope": "titus.md, philemon.md",
      "changes": [
        "Jesus->Yeshua, Christ->Messiah (order-preserving: 'Jesus Christ'->'Yeshua Messiah', 'Christ Jesus'->'Messiah Yeshua')",
        "bishop -> overseer (Titus 1:7), with office-term » note",
        "church -> assembly (Philemon 1:2)",
        "gospel -> good news (Philemon 1:13)",
        "law -> Torah (Titus 3:9, 'fightings about the Torah'), with » note distinguishing Torah-interpretation disputes from civil law per the registry",
        "R1.1: capitalized He/His/Him/Himself throughout wherever the referent is God/Messiah (Titus 1:16, 3:4-7)",
        "R9: curly quotes added around the Epimenides quotation, Titus 1:12",
        "source-text fixes (not tier changes): Titus 3:15 missing space ('faith.Grace' -> 'faith. Grace'); 'intrusted' -> 'entrusted' (spelling modernization, no judgment required)"
      ],
      "verification": "verify_markup.py clean for both books"
    },
    {
      "type": "tier1b_register",
      "scope": "titus.md, philemon.md",
      "resolved": [
        {"ref": "Titus 1:5", "original": "wanting", "decision": "deficient", "source": "Gk leiponta (λείποντα), 'left over, deficient, lacking'"},
        {"ref": "Titus 1:6", "original": "riot", "decision": "dissolute living", "source": "Gk asōtia (ἀσωτίᾳ), 'reckless, dissolute living'; » note added tying it to the same root at Luke 15:13 (the prodigal son)"},
        {"ref": "Titus 1:7", "original": "soon angry", "decision": "quick-tempered", "source": "Gk orgilon (ὀργίλον), 'prone to anger, irascible'"},
        {"ref": "Titus 1:7, 1:11", "original": "filthy lucre", "decision": "left unchanged (user declined the swap)", "source": "Gk aischrokerdē / aischrou kerdous, 'shameful/dishonest gain'"},
        {"ref": "Titus 1:9", "original": "convict / gainsayers", "decision": "refute / objectors", "source": "Gk elenchein (ἐλέγχειν) 'expose, refute'; antilegontas (ἀντιλέγοντας) 'those speaking against'"},
        {"ref": "Titus 1:16", "original": "reprobate", "decision": "disqualified", "source": "Gk adokimoi (ἀδόκιμοι), 'failing the test, unapproved'"},
        {"ref": "Titus 2:9", "original": "gainsaying", "decision": "talking back", "source": "Gk antilegontas, same root as 1:9"},
        {"ref": "Titus 2:10", "original": "purloining", "decision": "pilfering", "source": "Gk nosphizomenous (νοσφιζομένους), 'misappropriating' (cf. Acts 5:2-3)"},
        {"ref": "Titus 3:3", "original": "divers", "decision": "various", "source": "Gk poikilais (ποικίλαις), 'various, diverse'"},
        {"ref": "Titus 3:11", "original": "is perverted", "decision": "is warped", "source": "Gk exestraptai (ἐξέστραπται), 'turned inside out, distorted'; modern 'perverted' now reads primarily as sexual, which is not the sense meant"},
        {"ref": "Titus 3:13", "original": "wanting", "decision": "lacking", "source": "Gk leipē, same root as 1:5 but 'deficient' didn't fit this construction"},
        {"ref": "Titus 3:15 / project-wide", "original": "salute", "decision": "greet", "source": "Gk aspazontai (ἀσπάζονται). Flagged and approved as a standing decision since this word recurs in nearly every NT epistle closing; applied directly to Philemon 1:23 without re-flagging"},
        {"ref": "Philemon 1:9, 1:10", "original": "beseech", "decision": "appeal / appeal to", "source": "Gk parakalō (παρακαλῶ), 'call alongside, appeal to, urge' -- contrasts with the command Paul says he could give instead (v8)"},
        {"ref": "Philemon 1:22", "original": "withal", "decision": "dropped (verse already contained 'also'; kept that rather than doubling up)", "source": "Gk hama de kai (ἅμα δὲ καί), 'and at the same time also'"}
      ]
    },
    {
      "type": "tier2_flags",
      "scope": "titus.md, philemon.md",
      "resolved": [
        {"ref": "Titus 1:6", "asv": "having children that believe", "decision": "having faithful/obedient children", "source": "Gk tekna echōn pista (τέκνα ἔχων πιστά) -- pistos spans 'believing'/'faithful'; the following clause (conduct, not creed) favors 'faithful/obedient'"},
        {"ref": "Titus 1:7", "asv": "no brawler", "decision": "not given to wine", "source": "Gk paroinon (πάροινον), lit. 'addicted to wine' -- the violence sense is already covered by the next term, plēktēn ('striker')"},
        {"ref": "Philemon 1:16", "asv": "no longer as a servant, but more than a servant", "decision": "no longer as a slave, but more than a slave", "source": "Gk doulon (δοῦλον), a legal-status term; the letter's entire argument turns on Onesimus's actual status as Philemon's slave"}
      ]
    },
    {
      "type": "pacing_markup_added",
      "scope": "titus.md",
      "notes": "Ch.1 drafted with dense [br] on formal lists (elder-qualification checklist, vv6-9). User then hand-edited ch.2's pacing, establishing a revised calibration: (1) bare short-item lists (adjective strings for a demographic exhortation, e.g. 2:2, 2:5) merge with no [br] -- reserved for genuine vice-catalogs/formal-qualification lists, which stay dense; (2) address-group shifts within one continuous passage (household code) downgrade '>>>' to '---'; (3) sentences opening with a grammatical connective (For/But/and) get no stage-clear at all, just a trailing [br] on the prior verse, since they're explaining/continuing rather than starting a new topic. This calibration was then back-applied to ch.3 (removed '>>>' before 3:3 'For', 3:4 'But', 3:9 'but'; merged the bare lists in 3:1-2; kept 3:3's vice list and 3:5-3:8's clause-length items dense, matching the carve-outs)."
    },
    {
      "type": "pacing_markup_added",
      "scope": "philemon.md",
      "notes": "Drafted directly under the revised calibration (no separate thinning pass needed): sparse '>>>' (salutation/thanksgiving/appeal/closing-greetings boundaries only), '---' for beat shifts within the appeal (introducing Onesimus by name at v10; the pivot to concrete requests at v17; the personal-note beat at v21), trailing [br] before v8 and v22 since those verses open with 'Therefore'/'But'."
    },
    {
      "type": "notes_and_refs_added",
      "scope": "titus.md",
      "items": [
        {"ref": "1:2", "anchor": "who cannot lie", "source": "Numbers 23:19"},
        {"ref": "1:5", "anchor": "appoint elders in every city", "source": "Acts 14:23"},
        {"ref": "1:6", "anchor": "the husband of one wife", "source": "1 Timothy 3:2", "note": "mias gynaikos andra, 'a one-woman man' -- form-test note, idiom kept in text"},
        {"ref": "1:6", "anchor": "dissolute living", "source": "Luke 15:13", "note": "asōtia, same root as the prodigal son's 'wasteful living'"},
        {"ref": "1:7", "note": "overseer/episkopon vs. elder/presbyteros synonymy, Second-Temple synagogue eldership background, no → ref"},
        {"ref": "1:10", "note": "'they of the circumcision' = Judaizing teachers (cf. Acts 15; Galatians 2), no → ref"},
        {"ref": "1:12", "note": "Epimenides of Knossos quotation, cf. Acts 17:28, no → ref"},
        {"ref": "1:14", "anchor": "Jewish fables", "source": "1 Timothy 1:4"},
        {"ref": "1:15", "note": "moral purity (katharos) vs. Levitical ritual purity, cf. Mark 7:15, no → ref"},
        {"ref": "2:3", "note": "'slanderers' = diabolous, same root as 'devil', no → ref"},
        {"ref": "2:9", "anchor": "servants to be in subjection to their own masters", "source": "Ephesians 6:5"},
        {"ref": "2:11", "note": "'all men' = anthrōpois, generic/gender-neutral, no → ref"},
        {"ref": "2:13", "note": "Granville Sharp construction ('the great God and our Saviour'), one article for both titles -- deity of Yeshua, no → ref"},
        {"ref": "2:14", "anchor": "a people for His own possession", "source": "Exodus 19:5", "note": "laon periousion / LXX am segullah applied to the redeemed community"},
        {"ref": "3:1", "anchor": "subjection to rulers, to authorities", "source": "Romans 13:1"},
        {"ref": "3:5", "note": "palingenesias ('washing of regeneration') used elsewhere only at Matthew 19:28 of cosmic messianic renewal, no → ref"},
        {"ref": "3:6", "anchor": "poured out", "source": "Joel 2:28", "note": "fulfilled at Pentecost, Acts 2:17"},
        {"ref": "3:8", "note": "'Faithful is the saying' (pistos ho logos), recurring Pastoral-Epistles formula (1 Tim 1:15; 3:1; 4:9; 2 Tim 2:11), no → ref"}
      ]
    },
    {
      "type": "notes_and_refs_added",
      "scope": "philemon.md",
      "items": [
        {"ref": "1:7", "note": "ta splanchna ('the inward parts'), recurs at v12 ('my very heart') and v20 ('let me have joy of you'), no → ref"},
        {"ref": "1:9", "note": "'Paul the aged' (presbytēs) vs. a near-homograph textual variant 'ambassador' (presbeutēs), no → ref"},
        {"ref": "1:10", "anchor": "Onesimus", "source": "Colossians 4:9"},
        {"ref": "1:11", "note": "achrēston/euchrēston wordplay on Onesimus's own name (Onēsimos, 'useful'), no → ref"},
        {"ref": "1:16", "anchor": "no longer as a slave, but more than a slave", "source": "Galatians 3:28"},
        {"ref": "1:19", "note": "'I Paul write it with my own hand' -- autograph-guarantee/promissory-note formula, cf. Galatians 6:11, 2 Thessalonians 3:17, no → ref"},
        {"ref": "1:20", "note": "onaimēn, second wordplay on Onesimus's name, echoing v11, no → ref"},
        {"ref": "1:24", "anchor": "Mark, Aristarchus, Demas, Luke", "source": "Colossians 4:10-14"}
      ]
    }
  ],
  "open_items": []
}
```

{"date":"2026-07-31","book":"Hebrews","chapters_completed":"1-13 (full book)","calibration":{"name_registry":["Jesus->Yeshua","Christ->Messiah","Jesus Christ->Yeshua Messiah","church->assembly/congregation","law/nomos/torah->Torah where Mosaic instruction is meant (7:5,11,12,16,19,28x2; 8:4,10; 9:19,22; 10:1,28)"],"mechanical":["R1.1 divine-pronoun capitalization (he/his/him/himself for God/LORD/Messiah/Holy Spirit) applied throughout","R9 curly quotation marks on direct speech and OT citations, multi-verse quotes opened once","To-day->Today orthographic modernization"],"markup":"pacing markers (---/>>>/[br]) calibrated at moderate density, roughly 1 break per 5-7 verses; enumerative content (ch.11 faith roll-call, ch.9 tabernacle furnishings) given full [br] treatment per list-content rule","notes_density":"roughly 1 note per 2-5 verses, higher in citation-dense chapters (1, 7, 9); Fruchtenbaum-style Messianic-Jewish/Second-Temple/rabbinic background emphasized per book's Jewish-audience framing"},"tier1b_decisions":{"kept_for_register":["effulgence (1:3)","succor (2:18)"],"modernized":["divers->many/various (1:1, 9:10, 13:9)","behooved->was fitting for (2:17)","goodly->beautiful (11:23)","assaying->attempting (11:29)","compassed about->encircled/surrounded (11:30, 12:1)","sawn asunder->sawn in two (11:37)"]},"tier2_flags_applied":["1:3 'the very image of his substance' -> 'the exact imprint of His nature' (charakter/hypostasis, Greek die-stamp imagery)","1:6 'when he again brings in the firstborn' -> 'And again, when He brings the firstborn' (discourse-marker vs eschatological reading of palin)"],"notable_notes":["10:5 Psalm 40:6 quote: LXX 'a body You prepared' vs MT 'ears You have dug' - author's argument runs on the Greek text he quotes, not the Hebrew","9:16-17 diathekes covenant/testament wordplay is native to Greek, no Hebrew brit equivalent","11:21 Genesis 47:31 mittah/matteh unpointed Hebrew homograph (bed vs staff) explains LXX vs MT reading","7:1-3 Melchizedek: El Elyon note, Malki-Tzedek/Shalem Hebrew etymology, argument from scriptural silence on genealogy","11:35,37 Maccabean martyrs (2 Maccabees 6-7) and Isaiah-martyrdom tradition allusions flagged for Second-Temple background"],"open_items_discussed":["User raised LXX's wide 1st-century circulation and NT quotation patterns; proposed CLAUDE.md addition on LXX/MT divergence flagging plus rabbinic-disuse history; historical claim nuanced (Aquila's corrective translation, post-70 CE Hebrew-text standardization, rather than NT Greek circulation displacing LXX); decided: no CLAUDE.md change, continue ad hoc »-note flagging of LXX/MT divergences per instance"],"status":"Hebrews complete, verify_markup.py clean, ingest_bible_md.py builds cleanly (66 books, 31086 verses, 758 commentary notes, 713 inline xrefs)"}
{"date": "2026-08-02", "session": "1 Peter & 2 Peter curation + corpus-wide archaism sweep", "books": {"1peter": "Full curation, chapters 1-5: Yeshua/Messiah substitutions, R1.1 divine-pronoun caps, R9 quote marks, » notes, → refs, pacing markup ([br]/>>>). Tier-2 edits approved: 1:3 begat (consistency w/ 1:23, same Greek anagennao), 1:9 telos->culmination (tied to tetelestai, John 19:30), 1:17 each one's work (gender-neutral hekastou, not aner).", "2peter": "Full curation, chapters 1-3, same calibration. Key notes: Symeon Petros (1:1), Granville Sharp construction 'our God and Saviour' (1:1), sorites virtue-chain (1:5-7), tartarosas/Tartarus hapax (2:4), literary parallel to Jude noted throughout ch2, Paul's epistles called graphas/'scriptures' (3:15-16)."}, "corpus_wide_archaism_sweep": {"mechanical_1a_applied": ["stedfast/stedfastly/stedfastness/unstedfast -> steadfast family, ~30 instances across 19 books", "ensample(s) -> example(s), 7 instances across 6 books", "forasmuch -> since, 2 instances (1 Peter 4:1, Amos 11:86), reworded to fit"], "contextual_1b_applied": ["froward -> harsh (1 Peter 2:18, Greek skolios) / shrewd (2 Samuel 22:27, Psalm 18:26, Hebrew wordplay)", "revellings -> wild parties, komos-sense only (1 Peter 4:3, Galatians 5:21, Romans 13:13); 2 Peter 2:13's unrelated tryphe-sense 'revel in' left untouched", "sore [verb-modifying subset] -> 17 instances individually verified against Hebrew via interlinear lookup and re-worded per instance; corrected Job 5:18 to 'hurts' (not 'wounds', to avoid false duplicate - yakhiv vs yimhats are distinct roots)", "Psalm 118:18 'chastened me sore' -> 'has surely chastened me' - identified as infinitive-absolute construction (yassor yissarani), matched to the established corpus-wide 'shall surely X' rendering convention (cf. Genesis 2:17 'you shall surely die', 20+ other instances)"], "kept_as_established_precedent": ["filthy lucre (explicit exception, not touched)", "privily (~13 instances, consistently means 'secretly' regardless of source word)", "-ward construction: you-ward/us-ward/God-ward (~9 instances)", "wilfully (spelling variant only, 2 instances)", "in the which (1 instance found)"], "deferred_not_yet_executed": ["sore: remaining ~60 instances across other sense-clusters (sore afraid, sore distressed/troubled, sore wounded, sore displeased, wept sore, famine was sore, adjective-noun uses) - scoped and categorized but needs the same per-verse interlinear verification before execution"]}, "declined_this_session": ["Genesis 2:17 infinitive-absolute » note (proposed, explicitly declined - Genesis not to be touched)"], "methodology_note": "Confirmed that Tier-1b source-language grounding must be verified per-instance via actual lookup (biblehub interlinear), not inferred from context - several initial contextual guesses were corrected after verification (Job 5:18 word choice, Genesis 31:30 grammatical mechanism, Psalm 118:18 construction type)."}

## Session: "The Commands of Christ" position paper — restructure + AMSV footnoting (2026-08-07)
```json
{
  "date": "2026-08-07",
  "artifact": "The Commands of Messiah.md",
  "source": "The Commands of Christ.md (project root, not docs/bible)",
  "type": "non-bible position-paper revision, not a docs/bible curation pass",
  "action": "full single-pass rewrite per user instruction",
  "structural_changes": {
    "new_section": "III. Two Phases of Messiah's Earthly Ministry: The Kingdom Offer and Its Withdrawal (Matt 12:22-32 unpardonable-sin hinge; parables + faith-conditioned miracles as post-rejection ministry mode; Acts 3:19-21 postponed-not-cancelled)",
    "renumbered": "old III-VII -> IV-VIII",
    "IV_systematizing": "phase-tagged each category (A/B offer-period+apostolic-carryover, C post-resurrection church-age, D set-aside), added new IV.E bridging Matt 28:20 to apostolic enumeration",
    "V_apostolic": "split into V.A (direct commands restated, 1 John/James/Paul) and new V.B (apostolic example vs. command distinction: 1-2 Cor material as authoritative-but-occasional, principle over particular)",
    "VI_liberty": "retitled 'Apostolic Example, Personal Conviction, and Christian Liberty'; added VI.B personal-conviction framework (James 4:17 + Rom 12:3 measure-of-faith + 1 Cor 12:11)",
    "VII_reconnecting": "added 'love one another as I have loved you' (John 13:34) as unifying NT axiom tying all categories together"
  },
  "name_registry_applied_to_papers_own_prose": {
    "title": "The Commands of Christ -> The Commands of Messiah",
    "substitutions": ["Christ->Messiah", "Jesus->Yeshua", "baptiz->immers", "church(as ekklesia sense)->assembly"],
    "note": "flagged as Open Item #1 - easily reverted"
  },
  "footnote_apparatus": {
    "count": 108,
    "format": "markdown reference-style [^label], Notes section at end",
    "source": "AMSV docs/bible/*.md live text, quoted at point of citation",
    "verification": "cross-checked all inline refs vs definitions - 108/108 matched, no orphans, no dangling refs",
    "live_curated_books": ["1john.md (raw ASV, Jesus Christ->Yeshua Messiah applied to quoted clauses only)", "2john.md (raw ASV, no name-bearing clauses among cited verses)"],
    "underlying_files_NOT_modified": ["docs/bible/1john.md", "docs/bible/2john.md"]
  },
  "editorial_cleanup": ["fixed em-dash mojibake (\u00e2 -> \u2014) throughout", "fixed typos: liberity->liberty, tneds->tends, Pharisism->Pharisaism, promlugated->promulgated (integrated into full sentence)", "left the unverified 'three-quarters of church leaders' statistic caveat untouched per original author's own flag"],
  "open_items_appended_to_paper": 7,
  "user_directed_content": "kingdom-offer/withdrawal doctrine, command-vs-example distinction for occasional NT material, James 4:17/measure-of-faith personal-conviction framework -- all explicitly specified by user; AI supplied textual architecture and specific verse anchors, flagged as such",
  "files_touched": ["The Commands of Messiah.md (new)", "The Commands of Christ.md (original, left unmodified for comparison)"],
  "verification_note": "not a docs/bible file -- verify_markup.py / ingest_bible_md.py not applicable"
}
```

## Session addendum: "The Commands of Messiah" — John 17 added to Section IV (2026-08-07)
```json
{
  "date": "2026-08-07",
  "artifact": "The Commands of Messiah.md",
  "action": "added new Section IV.D: the High Priestly Prayer (John 17)",
  "user_instruction": "user flagged John 17 as 'the most explicit and extended discourse Christ commands His disciples... and the most important section for this topic'",
  "editorial_note": "kept the substantive point (John 17 is the fullest Upper Room statement concerning the disciples/church, explicitly extended to future believers at 17:20) but preserved the grammatical distinction that the chapter is prayer addressed to the Father, not second-person imperatives to the disciples -- framed as stating the outcome IV.A-C's commands aim at (unity, sanctification-through-truth, sent-not-removed mission, shared love/glory) rather than as a fifth command list; flagged as Open Item #8 for user confirmation of that framing",
  "renumbering": "old IV.D (What Was Set Aside) -> IV.E; old IV.E (Matt 28:20 bridge) -> IV.F; fixed one stale cross-reference in Section V (Section IV.E -> IV.F)",
  "new_footnotes": ["john1720", "john1711", "john1721", "john1717", "john1719", "john1715", "john1722", "john1726", "john173"],
  "footnote_count": 117,
  "verification": "cross-checked all inline refs vs definitions - 117/117 matched, no orphans, no dangling refs"
}
```

## Session addendum: "The Commands of Messiah" — Summary revised, John 2/Cana caution + Textual Example restructure (2026-08-07)
```json
{
  "date": "2026-08-07",
  "artifact": "The Commands of Messiah.md",
  "action": "applied user-revised Summary paragraph and cascaded the resulting content/structure changes through the paper",
  "summary_changes": [
    "register-harmonized user's draft (Christ->Messiah, Jesus->Yeshua), grammar cleaned up, split into 3 paragraphs",
    "explicit named citation of Fruchtenbaum's framework removed from the Summary abstract per user draft -- full attribution retained in Sec II and colophon (flagged, not silently generalized)",
    "added John 2 (Cana, water-to-wine) as a new methodological caution: Messiah's own narrative instructions/actions are not automatically commands for the church",
    "renamed 'apostolic example' category to 'textual example of practical living', broadened to include both Gospel narrative (Cana) and apostolic occasional epistle (1-2 Corinthians)"
  ],
  "structural_changes": {
    "Section_I": "roadmap paragraph updated to describe the new textual-example/liberty/conviction triad and drop the old 'apostolic example (Section V)' framing",
    "Section_III": "fixed several apparent pre-existing typos/corruptions found in the file (fulcrom->hinge, 'Sonm attested'->'Son, attested', dropped clause restored, 'leadership official deliberate verdict'->\"leadership's official, deliberate verdict\") -- these were present in the file before this turn's edits, not introduced by this session",
    "Section_IV": "added new unlettered caution paragraph before IV.A: John 2:7,11 (Cana) as the test case for narrative vs. command, with explicit criteria (addressed to disciples generally, repeated/apostolically confirmed, stated purpose beyond the scene); no relettering needed (A-F unchanged)",
    "Section_V": "removed subsection lettering (was A/B, now unlettered single flow); deleted the Corinthians 'apostolic example' subsection entirely (content moved to VI.A); fixed transition sentences",
    "Section_VI": "retitled 'What Is Not a Command: Textual Example, Christian Liberty, and Personal Conviction'; new VI.A merges Cana + Corinthians under 'Textual Example of Practical Living'; old VI.A (Christian Liberty) relettered VI.B; old VI.B (Personal Conviction) relettered VI.C, with 1 Cor 8:7 conscience citation added per user's bracketed anchor",
    "Section_VII_VIII": "updated all cross-references (§V.B->§VI.A, §VI.A->§VI.B, §VI.B->§VI.C, 'apostolic example'->'textual example' throughout)"
  },
  "new_footnotes": ["john27b", "john211", "john27c", "john211b", "1cor87"],
  "footnote_count": 122,
  "verification": "cross-checked all inline refs vs definitions - 122/122 matched, no orphans, no dangling refs; verified no stray §V.A/§V.B/old-lettering references remain outside the Open Items table's historical description",
  "open_items_added": ["#9 Summary rewrite / Fruchtenbaum citation", "#10 Textual Example restructuring", "#11 category order (Summary vs. body sequence)"],
  "open_items_updated": ["#4 (was §VI.B anchors, now §VI.C)", "#5 (was §V.B anchors, now §VI.A anchors)"]
}
```

## Session: 1-2 Timothy, 1-3 John, Jude — full first-pass curation from bare ASV (2026-08-14)

```json
{
  "date": "2026-08-14",
  "books": ["1 Timothy", "2 Timothy", "1 John", "2 John", "3 John", "Jude"],
  "context": "these six books had zero notes/markup and, on inspection, had never received even the Tier-1a Name Registry pass -- fully bare ASV text (R2 thee/thou modernization was already present in the Johannine letters and Jude, but not in the Timothy letters). Drafted directly at established calibration (Pastorals matched to Titus; Johannine letters/Jude matched to John/2 Peter) rather than running a fresh ch.1 calibration loop, given genre precedent already exists.",
  "tier1a_mechanical_applied_all_six": ["Jesus->Yeshua, Christ->Messiah order-preserving", "James->Jacob (persons only)", "church->assembly", "gospel->good news", "bishop->overseer", "R1.1 divine-pronoun capitalization (verse-by-verse referent judgment; method note added at 1 John 2:3 given how dense and ambiguous the he/him/his switching is throughout that letter)", "R2: 5 stray thyself->yourself misses in 1-2 Timothy", "R9 curly quotes on direct speech/citations", "3 mechanical source-text fixes (doe->do typo in 3 John, missing space in 1 Tim 6:21, have grew->have grown grammar slip in 1 Tim 5:11, same class as the Titus 3:15/2 Thess 1:3 precedent)"],
  "tier3_additive": "68 new commentary notes, 29 new cross-references, full pacing markup, across all six books",
  "process_note": "initial draft mistakenly applied several new Tier-1b/Tier-2 judgment calls directly to text rather than holding them for review, against the S10 rule that a first draft carries only Tier-1a + Tier-3 + already-decided precedent; caught before presenting to user, reverted to original ASV wording with the proposal preserved as an unapplied » note, then re-presented as a review table",
  "tier2_flags_resolved": [
    {"ref": "Jude 1:1", "issue": "Jude vs Judah -- same underlying name (Ioudas) the registry renders Judah elsewhere", "decision": "apply Judah to the in-text self-identification; book's # heading stays Jude (doubles as the ingest system's book-identity key against verse_manifest.json -- renaming it breaks the build); same open question as the James/Jacob book-title case", "registry": "T013"},
    {"ref": "Jude 1:5", "issue": "the Lord vs Yeshua -- P72/Sinaiticus/Vaticanus/Alexandrinus read Iesous, ASV follows majority text", "decision": "adopted Yeshua", "registry": "T014"},
    {"ref": "Jude 1:8", "issue": "dignities (doxas, 'glories') risks being read as civic rank rather than angelic powers", "decision": "the glorious ones", "registry": "T015"},
    {"ref": "2 Timothy 3:6", "issue": "silly women (gynaikaria, a diminutive for weak/gullible) now reads as mocking, a connotation the Greek doesn't carry", "decision": "weak-willed women", "registry": "T016"},
    {"ref": "1 John 5:18", "issue": "keeps himself (heauton) vs keeps him (auton) manuscript split; 'he that was begotten of God' is a distinct aorist participle from the believer's perfect participle earlier in the verse", "decision": "keeps him (Messiah keeping the believer)", "registry": "T017"}
  ],
  "registry_invocation_decided": {
    "item": "1 Timothy 3:8-13 deacon material -- first invocation of CLAUDE.md §6's diakonos->servant policy anywhere in the corpus",
    "decision": "servant in text, with an office-term note at first occurrence (v8), matching the episkopos->overseer pattern already set at Titus 1:7",
    "registry": "T012"
  },
  "tier1b_proposals_resolved": [
    {"ref": "1 Timothy 1:4", "from": "minister questionings", "to": "give rise to speculation", "source": "ekzeteseis parechousin", "decision": "applied", "registry": "V028"},
    {"ref": "1 Timothy 1:18", "from": "war the good warfare", "to": "fight the good fight", "source": "strateuse ten kalen strateian, matches 6:12 and 2 Tim 4:7's existing rendering of the same idiom", "decision": "applied"},
    {"ref": "1 Timothy 5:13; 3 John 1:5", "from": "withal", "to": "besides", "decision": "applied", "registry": "V024"},
    {"ref": "1 Timothy 6:9", "from": "minded to be rich", "to": "determined to be rich", "source": "boulomai, matches Matthew 1:19 precedent", "decision": "applied", "registry": "V025"},
    {"ref": "1 Timothy 6:17", "from": "highminded", "to": "arrogant", "source": "hypsēlophronein", "decision": "declined -- kept ASV wording, not judged dead enough yet", "registry": "V026"},
    {"ref": "2 John 1:5", "from": "beseech", "to": "urge", "source": "erotao, matches John 4:40/4:47's rendering of the same lemma", "decision": "applied (user overrode the initially-proposed 'ask', chose consistency with the existing erotao->urged precedent instead)", "registry": "V003 updated"},
    {"ref": "Jude 1:8", "from": "set at nought [dominion]", "to": "reject authority", "source": "athetousin, a different Greek word from Mark 9:12's exoudeneo despite the identical English phrase in ASV", "decision": "applied", "registry": "V007 updated"},
    {"ref": "Jude 1:11", "from": "ran riotously", "to": "rushed headlong", "source": "exechythesan", "decision": "applied", "registry": "V027"}
  ],
  "registries_updated": ["docs/registry/vocabulary.md (V024-V028, V003/V007 updated)", "docs/registry/tier2_precedents.md (T011-T017)"],
  "verification": "verify_markup.py clean on all six books; ingest_bible_md.py OK, 66 books, 31086 verses, 878 commentary notes (799 anchored), 779 inline xrefs, 251 inline phrase chapters",
  "open_items": []
}
```

## Session addendum: book-title policy settled (2026-08-14)

```json
{
  "date": "2026-08-14",
  "action": "policy_confirmed",
  "issue": "James/Jacob and Jude/Judah book-title question, open since the Acts session (2026-07-28) and re-surfaced by this session's Jude work",
  "user_decision": "book names/titles never change; only in-text/internal references to the person do",
  "applied": "CLAUDE.md §6 given a new 'Book titles never change' rule; docs/registry/tier2_precedents.md T007 rewritten as the settled general policy (was citation-only), T013 simplified to cite it as an applied instance",
  "effect": "closes the open question for James ahead of that book's own curation -- no further flagging needed when its turn comes"
}
```
