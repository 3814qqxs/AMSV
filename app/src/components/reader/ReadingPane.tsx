import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { buildPhraseEnd, buildPhraseEndFromOverrides, buildPoetryLineBreaks, computeFgScrollTarget, computeTokenDelay, exitStaggerMs, lineTurnHold, tokenInterval, xrefWordRanges, type PhraseMetadata } from "@/lib/timing";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import type { Verse, XrefPhrasesEntry } from "@/lib/api";

type Token =
  | { kind: "verse"; verse: number }
  | { kind: "word"; text: string; verse: number; book: string; chapter: number };

/** Absolute token indices covered by per-verse anchor phrases (xref `phrase` /
 * commentary `» anchor ::`), converted from xrefWordRanges' verse-local indices. */
function absoluteAnchorRanges(verses: Verse[], entries?: XrefPhrasesEntry[]): Set<number> {
  const out = new Set<number>();
  if (!entries || entries.length === 0) return out;
  let pos = 0;
  for (const v of verses) {
    pos++; // verse token
    const words = v.text.split(/\s+/).filter(Boolean);
    const phrases = entries.find((e) => e.verse === v.verse)?.phrases;
    if (phrases?.length) {
      for (const li of xrefWordRanges(words, phrases)) out.add(pos + li);
    }
    pos += words.length;
  }
  return out;
}

export function ReadingPane({
  verses,
  wpm,
  playing,
  onActiveVerseChange,
  onRevealedChange,
  resetKey,
  highlightPhrase,
  onTogglePlay,
  onNext,
  onPrev,
  phraseMode = false,
  phraseOverrides,
  xrefPhrases,
  commentaryPhrases,
}: {
  verses: Verse[];
  wpm: number;
  playing: boolean;
  onActiveVerseChange: (v: number) => void;
  onRevealedChange?: (n: number, total: number) => void;
  resetKey: string;
  highlightPhrase?: string | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  phraseMode?: boolean;
  phraseOverrides?: string[];
  /** Cross-ref anchor phrases — words in range render in the emphasize style. */
  xrefPhrases?: XrefPhrasesEntry[];
  /** Commentary anchor phrases — words in range render in the dim style. */
  commentaryPhrases?: XrefPhrasesEntry[];
}) {
  const tokens = useMemo<Token[]>(() => {
    const out: Token[] = [];
    for (const v of verses) {
      out.push({ kind: "verse", verse: v.verse });
      for (const w of v.text.split(/\s+/).filter(Boolean))
        out.push({ kind: "word", text: w, verse: v.verse, book: v.book, chapter: v.chapter });
    }
    return out;
  }, [verses]);

  // phraseEnd[i] = index of the last token in token i's phrase.
  // clearAt / sectionBreakAt = token indices after which the stage resets.
  // phraseMeta = per-phrase elocution data keyed by phraseEnd index.
  const { phraseEnd, clearAt, sectionBreakAt, paragraphBreakAt, lineBreakAt, phraseMeta } = useMemo<{
    phraseEnd: number[];
    clearAt: Set<number>;
    sectionBreakAt: Set<number>;
    paragraphBreakAt: Set<number>;
    lineBreakAt: Set<number>;
    phraseMeta: Map<number, PhraseMetadata>;
  }>(() => {
    const empty = {
      clearAt: new Set<number>(),
      sectionBreakAt: new Set<number>(),
      paragraphBreakAt: new Set<number>(),
      lineBreakAt: new Set<number>(),
      phraseMeta: new Map<number, PhraseMetadata>(),
    };
    if (!phraseMode) return { phraseEnd: Array.from({ length: tokens.length }, (_, i) => i), ...empty };
    if (phraseOverrides && phraseOverrides.length > 0) return buildPhraseEndFromOverrides(tokens, phraseOverrides);
    return { phraseEnd: buildPhraseEnd(tokens), ...empty };
  }, [tokens, phraseMode, phraseOverrides]);

  // Tier 2 poetic lineation: soft line breaks at Hebrew-verse cola, from the
  // canonical text's `lines` — independent of phrase curation.
  const poetryBreakAt = useMemo(() => buildPoetryLineBreaks(verses), [verses]);

  // Semantic styling (Phase E): word ranges covered by cross-ref / commentary
  // anchors, applied persistently from reveal — independent of phraseMeta.
  const xrefEmphasizeAt = useMemo(() => absoluteAnchorRanges(verses, xrefPhrases), [verses, xrefPhrases]);
  const commentaryDimAt = useMemo(() => absoluteAnchorRanges(verses, commentaryPhrases), [verses, commentaryPhrases]);

  // exitWordOrders[i] = sequential word index for token i (used for stagger delay)
  const exitWordOrders = useMemo(() => {
    const orders = new Array(tokens.length).fill(0);
    let n = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].kind === "word") orders[i] = n++;
    }
    return orders;
  }, [tokens]);

  const [revealed, setRevealed] = useState(0);
  const [stageStart, setStageStart] = useState(0);
  const stageStartRef = useRef(0);
  // Non-null while words are animating out before a stage clear
  const [clearingStageStart, setClearingStageStart] = useState<number | null>(null);
  const clearingRef = useRef<number | null>(null);
  // Non-null while a [selah] phrase is fading out (phraseEnd index of the phrase)
  const [selahFadingPhraseEnd, setSelahFadingPhraseEnd] = useState<number | null>(null);

  // Background scroll: updates once per verse boundary (not per word)
  const [bgScrollVerse, setBgScrollVerse] = useState(0);
  const [bgOffset, setBgOffset] = useState(0);
  const [bgTurnKey, setBgTurnKey] = useState(0);
  const [showTopMask, setShowTopMask] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const lastWordRef = useRef<HTMLSpanElement>(null);
  const fgScrollTarget = useRef(0);
  const [lineHeightPx, setLineHeightPx] = useState(0);
  const lineHeightMeasured = useRef(false);
  // Locking the measurement is only safe once the scripture font has actually
  // loaded — font-display: swap means the first word can render (and get
  // measured) in the fallback serif before Cormorant Garamond swaps in,
  // baking in the wrong line-height for the rest of the session. Re-measure
  // on every reveal until fonts.ready resolves, then lock as before.
  const fontsReady = useRef(false);
  const [fontsReadyTick, setFontsReadyTick] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      fontsReady.current = true;
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      fontsReady.current = true;
      setFontsReadyTick((n) => n + 1);
    });
    return () => { cancelled = true; };
  }, []);

  // First word-token order in the current stage — stagger delays are relative to this.
  const stageFirstWordOrder = useMemo(() => {
    for (let i = stageStart; i < tokens.length; i++) {
      if (tokens[i].kind === "word") return exitWordOrders[i];
    }
    return 0;
  }, [stageStart, tokens, exitWordOrders]);

  // Per-word exit stagger (seconds) for the stage being cleared — must match
  // the fadeMs computed in scheduleNext so the timer and animation agree.
  const exitStaggerS = useMemo(() => {
    if (clearingStageStart === null) return 0.075;
    const wordCount = tokens
      .slice(clearingStageStart, revealed)
      .filter((t) => t.kind === "word").length;
    return exitStaggerMs(wordCount) / 1000;
  }, [clearingStageStart, revealed, tokens]);

  useLayoutEffect(() => {
    if (revealed < 1 || lineHeightMeasured.current) return;
    const el = lastWordRef.current;
    if (!el) return;
    const lh = parseFloat(window.getComputedStyle(el).lineHeight);
    if (!isNaN(lh) && lh > 0) {
      setLineHeightPx(lh);
      if (fontsReady.current) lineHeightMeasured.current = true;
    }
  }, [revealed, fontsReadyTick]);

  // Reset on chapter change
  useEffect(() => {
    setRevealed(0);
    setStageStart(0);
    stageStartRef.current = 0;
    setClearingStageStart(null);
    clearingRef.current = null;
    setSelahFadingPhraseEnd(null);
    setBgScrollVerse(0);
    setBgOffset(0);
    setBgTurnKey(0);
    setShowTopMask(false);
    lineHeightMeasured.current = false;
    fgScrollTarget.current = 0;
    if (fgRef.current) fgRef.current.scrollTop = 0;
  }, [resetKey]);

  // Reset foreground scroll when stage clears mid-chapter.
  // Also reset lineHeight measurement so the first body word re-measures at its actual size
  // rather than inheriting an inflated value from a title phrase (which is 1.15× base size).
  useEffect(() => {
    fgScrollTarget.current = 0;
    setShowTopMask(false);
    if (fgRef.current) fgRef.current.scrollTop = 0;
    lineHeightMeasured.current = false;
  }, [stageStart]);

  // Playback timer — setTimeout chain, advances by phrase in phraseMode
  const revealedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const verseBaseRef = useRef<number>(0);

  const scheduleNext = useCallback((current: number, globalBase: number) => {
    if (current >= tokens.length) return;
    // If playback resumed mid-clear, snap the stage forward immediately
    if (clearingRef.current !== null) {
      clearingRef.current = null;
      setClearingStageStart(null);
      stageStartRef.current = current;
      setStageStart(current);
    }
    const token = tokens[current];

    if (token.kind === "verse") {
      verseBaseRef.current = globalBase;
      revealedRef.current = current + 1;
      setRevealed(current + 1);
      // If the next word opens a title phrase, hold 50ms so the reading frame renders
      // before the title words begin their entrance animation.
      const nextIsTitle =
        current + 1 < tokens.length &&
        tokens[current + 1].kind === "word" &&
        phraseMeta.get(phraseEnd[current + 1])?.style === "title";
      if (nextIsTitle) {
        timerRef.current = setTimeout(() => scheduleNext(current + 1, globalBase), 50);
      } else {
        scheduleNext(current + 1, globalBase);
      }
      return;
    }

    // Title phrase: batch-reveal ALL words (including boundary) as a single block.
    // Non-boundary words are advanced synchronously — React 18 batches the setRevealed calls
    // into one render so all words enter the DOM simultaneously.
    // The boundary word is also revealed synchronously, completing the block, then we
    // apply [pause:Xs] and clear the stage. This keeps pause handling inside this branch
    // so the isClear path below cannot swallow the pause.
    if (phraseMeta.get(phraseEnd[current])?.style === "title") {
      if (phraseEnd[current] !== current) {
        revealedRef.current = current + 1;
        setRevealed(current + 1);
        scheduleNext(current + 1, globalBase);
        return;
      }
      // Boundary word: complete the block reveal synchronously, then pause then clear.
      const next = current + 1;
      revealedRef.current = next;
      setRevealed(next);
      const meta = phraseMeta.get(current);
      const holdMs = meta?.pause ?? 0;
      const ss = stageStartRef.current;
      const wordCount = tokens.slice(ss, next).filter((t) => t.kind === "word").length;
      const fadeMs = Math.max(0, wordCount - 1) * exitStaggerMs(wordCount) + 375;
      timerRef.current = setTimeout(() => {
        clearingRef.current = ss;
        setClearingStageStart(ss);
        timerRef.current = setTimeout(() => {
          clearingRef.current = null;
          setClearingStageStart(null);
          stageStartRef.current = next;
          setStageStart(next);
          scheduleNext(next, globalBase);
        }, fadeMs + 500);
      }, Math.max(500, holdMs));
      return;
    }

    const base = verseBaseRef.current || globalBase;
    const isPhraseBoundary = phraseEnd[current] === current;
    const meta = phraseMeta.get(phraseEnd[current]);
    // Per-phrase tempo multiplier: [0.65] at 250 WPM → ~163 WPM effective for that phrase
    const effectiveBase = meta?.tempo ? base * meta.tempo : base;

    // In phraseMode, boundary words appear at within-phrase speed (pre-delay = effectiveBase*0.9).
    // The punctuation pause fires AFTER the boundary word is visible, not before.
    const preDelay = phraseMode && isPhraseBoundary
      ? effectiveBase * 0.9
      : computeTokenDelay(token.text, effectiveBase, isPhraseBoundary, phraseMode);

    timerRef.current = setTimeout(() => {
      const next = current + 1;
      revealedRef.current = next;
      setRevealed(next);

      const isClear = clearAt.has(current);
      const isSectionBreak = sectionBreakAt.has(current);
      const isParagraphBreak = paragraphBreakAt.has(current);

      if (isClear || isSectionBreak || isParagraphBreak) {
        // Staggered word exit: each word fades out in reveal order, then stage clears.
        // Section breaks (===) add an 800ms hold; paragraph breaks (>>>) add 400ms.
        const ss = stageStartRef.current;
        const wordCount = tokens.slice(ss, next).filter((t) => t.kind === "word").length;
        const fadeMs = Math.max(0, wordCount - 1) * exitStaggerMs(wordCount) + 375;
        const holdMs = isSectionBreak ? 800 : isParagraphBreak ? 400 : 0;
        timerRef.current = setTimeout(() => {
          clearingRef.current = ss;
          setClearingStageStart(ss);
          timerRef.current = setTimeout(() => {
            clearingRef.current = null;
            setClearingStageStart(null);
            stageStartRef.current = next;
            setStageStart(next);
            if (holdMs > 0) {
              timerRef.current = setTimeout(() => scheduleNext(next, globalBase), holdMs);
            } else {
              scheduleNext(next, globalBase);
            }
          }, fadeMs + 500);
        }, 500);
      } else if (meta?.style === "selah" && phraseMode && isPhraseBoundary) {
        // Selah: hold 1.2s (fixed, WPM-independent), fade out 300ms, then advance
        timerRef.current = setTimeout(() => {
          setSelahFadingPhraseEnd(current);
          timerRef.current = setTimeout(() => {
            setSelahFadingPhraseEnd(null);
            scheduleNext(next, globalBase);
          }, 300);
        }, 1200);
      } else if (phraseMode && isPhraseBoundary) {
        // Post-boundary pause: boundary word is on screen; hold, then optional extra pause.
        const boundaryPause = tokenInterval(token.text, effectiveBase);
        const extraPause = meta?.pause ?? 0;
        timerRef.current = setTimeout(() => {
          if (extraPause > 0) {
            timerRef.current = setTimeout(() => scheduleNext(next, globalBase), extraPause);
          } else {
            scheduleNext(next, globalBase);
          }
        }, Math.max(60, boundaryPause));
      } else if (phraseMode && poetryBreakAt.has(current)) {
        // Poetic line turn mid-phrase: the phrase continues onto the next line,
        // so no boundary pause fires — hold a comma-scale beat so the reveal
        // doesn't snap to the new line at full word tempo.
        timerRef.current = setTimeout(
          () => scheduleNext(next, globalBase),
          lineTurnHold(effectiveBase),
        );
      } else {
        scheduleNext(next, globalBase);
      }
    }, Math.max(60, preDelay));
  }, [tokens, verses, phraseEnd, phraseMode, clearAt, sectionBreakAt, phraseMeta, poetryBreakAt]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!playing || wpm === 0) return;
    const base = 60000 / wpm;
    scheduleNext(revealedRef.current, base);
    return () => clearTimeout(timerRef.current);
  }, [playing, wpm, scheduleNext]);

  useEffect(() => {
    revealedRef.current = 0;
    verseBaseRef.current = 0;
  }, [resetKey]);

  // Active verse + revealed callbacks; also drives background scroll verse state
  useEffect(() => {
    const last = tokens.slice(0, revealed).reverse().find((t) => t.kind === "word") as
      Extract<Token, { kind: "word" }> | undefined;
    if (last) {
      onActiveVerseChange(last.verse);
      setBgScrollVerse((prev) => (prev !== last.verse ? last.verse : prev));
    }
    onRevealedChange?.(revealed, tokens.length);
  }, [revealed, tokens, onActiveVerseChange, onRevealedChange]);

  // Background page-turn — fires at verse boundaries once ~150 words have accumulated.
  // Word-count threshold is screen-size independent; scrollHeight measurement was
  // unreliable because large font + small screens filled the page in just 2–4 verses.
  useEffect(() => {
    const wordsSinceTurn = tokens
      .slice(bgOffset, revealedRef.current)
      .filter((t) => t.kind === "word").length;
    if (wordsSinceTurn >= 150) {
      setBgOffset(revealedRef.current);
      setBgTurnKey((k) => k + 1);
    }
  }, [bgScrollVerse, bgOffset, tokens]);

  // Foreground scroll — 3-line window: keep newest line at bottom of window.
  // Document-space math via the LIVE scrollTop (see computeFgScrollTarget): the
  // word's docY is invariant while a smooth scroll is in flight, so rapid line
  // completions (poetic lineation breaks every few words) no longer overshoot.
  useEffect(() => {
    const fg = fgRef.current;
    const lastWord = lastWordRef.current;
    if (!fg || !lastWord || lineHeightPx <= 0) return;
    const fgRect = fg.getBoundingClientRect();
    const wordRect = lastWord.getBoundingClientRect();
    const target = computeFgScrollTarget(
      wordRect.top - fgRect.top,
      fg.scrollTop,
      lineHeightPx,
      fgScrollTarget.current,
    );
    if (target !== null) {
      fgScrollTarget.current = target;
      fg.scrollTo({ top: target, behavior: "smooth" });
      if (target > 0) setShowTopMask(true);
    }
  }, [revealed, lineHeightPx]);

  // Highlight phrase matching
  const phraseWords = useMemo(
    () => highlightPhrase ? highlightPhrase.toLowerCase().split(/\s+/).filter(Boolean) : [],
    [highlightPhrase],
  );

  function isInHighlight(tokenIndex: number): boolean {
    if (phraseWords.length === 0) return false;
    const wordTokens: { i: number; lower: string }[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.kind === "word")
        wordTokens.push({ i, lower: t.text.toLowerCase().replace(/[^a-z]/g, "") });
    }
    for (let s = 0; s <= wordTokens.length - phraseWords.length; s++) {
      let match = true;
      for (let k = 0; k < phraseWords.length; k++) {
        if (!wordTokens[s + k].lower.includes(phraseWords[k].replace(/[^a-z]/g, ""))) {
          match = false; break;
        }
      }
      if (match) {
        const start = wordTokens[s].i;
        const end = wordTokens[s + phraseWords.length - 1].i;
        if (tokenIndex >= start && tokenIndex <= end) return true;
      }
    }
    return false;
  }

  // Play/pause icon flash feedback
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const flashFirstRender = useRef(true);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (flashFirstRender.current) { flashFirstRender.current = false; return; }
    clearTimeout(flashTimerRef.current);
    setFlashKey((k) => k + 1);
    setFlashVisible(true);
    flashTimerRef.current = setTimeout(() => setFlashVisible(false), 500);
    return () => clearTimeout(flashTimerRef.current);
  }, [playing]);

  // Tap-to-play-pause: only fires on genuine taps (< 5px movement), not drags
  const tapDownPos = useRef<{ x: number; y: number } | null>(null);

  function handlePanePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    tapDownPos.current = { x: e.clientX, y: e.clientY };
  }

  function handlePanePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!tapDownPos.current) return;
    const dx = Math.abs(e.clientX - tapDownPos.current.x);
    const dy = Math.abs(e.clientY - tapDownPos.current.y);
    tapDownPos.current = null;
    if (dx < 5 && dy < 5) onTogglePlay();
  }

  // Cap the rendered slice to the most recent tokens so Framer Motion never tracks
  // hundreds of settled motion.spans. 80 tokens covers the 3-line window plus buffer
  // for exit animations; earlier words have scrolled out of view and need no DOM presence.
  // Emergency DOM valve only. Curated stages stay well under this (largest
  // generated thought-unit stage ≈ 130 tokens); trimming below the cap causes
  // scroll clamping (content shrinks under the scroll container), so it must
  // never engage in normal reading.
  const MAX_RENDERED_TOKENS = 400;
  const renderStart = Math.max(stageStart, revealed - MAX_RENDERED_TOKENS);
  const revealedSlice = tokens.slice(renderStart, revealed);
  const isComplete = revealed >= tokens.length && tokens.length > 0;
  const isClearingOut = clearingStageStart !== null;

  return (
    <div
      className="relative h-full"
      onPointerDown={handlePanePointerDown}
      onPointerUp={handlePanePointerUp}
    >

      {/* ── BACKGROUND LAYER ─────────────────────────────────────── */}
      {/* bgRef on a stable outer div so React's unmount cleanup of AnimatePresence
          children never nulls it out — fixes the single-fire page-turn bug. */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <AnimatePresence>
          <motion.div
            key={bgTurnKey}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{ willChange: "transform" }}
          >
            <div className="h-full overflow-hidden">
              <div
                className="scripture px-8 pt-12 text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.55] tracking-tight md:px-20"
                style={{ filter: "blur(10px)", opacity: 0.15 }}
              >
                <p>
                  {tokens.slice(bgOffset, revealed).map((t, i) =>
                    t.kind === "verse" ? (
                      <sup key={i} className="mx-1 text-[0.42em] text-primary/60">
                        {t.verse}
                      </sup>
                    ) : (
                      <span key={i}>{t.text} </span>
                    ),
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── PULL-DOWN HANDLE ─────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-12 items-center justify-center">
        <div className="h-1.5 w-12 rounded-full bg-primary/30" />
      </div>

      {/* ── PLAY/PAUSE FLASH FEEDBACK ────────────────────────────── */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            key={flashKey}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            {playing
              ? <Play size={28} className="text-primary/70" />
              : <Pause size={28} className="text-primary/70" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOREGROUND STAGE — 3-line reading zone ───────────────── */}
      <div
        className="absolute inset-x-6 z-10 md:inset-x-16"
        style={{ top: "28%" }}
      >
        <div
          ref={fgRef}
          className="relative overflow-hidden"
          style={{
            height: lineHeightPx > 0 ? `${lineHeightPx * 3}px` : "4.65em",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <p
            className="scripture text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.55] tracking-tight"
            style={{ overflowWrap: "break-word" }}
          >
            {revealedSlice.map((t, i) => {
              const absIdx = renderStart + i;
              const isLast = i === revealedSlice.length - 1 && !isComplete;
              const highlighted = t.kind === "word" && isInHighlight(absIdx);

              if (t.kind === "verse") {
                // Hide verse number if the first word of this verse is a title phrase —
                // superscriptions carry a verse index in the data but shouldn't be labelled.
                const nextWordIdx = tokens.findIndex((tok, j) => j > absIdx && tok.kind === "word");
                const nextIsTitle = nextWordIdx >= 0 && phraseMeta.get(phraseEnd[nextWordIdx])?.style === "title";
                return (
                  <motion.sup
                    key={absIdx}
                    className="mx-1 text-[0.42em] font-sans font-semibold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isClearingOut || nextIsTitle ? 0 : 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {t.verse}
                  </motion.sup>
                );
              }

              const pm = phraseMeta.get(phraseEnd[absIdx]);
              const phraseStyle = pm?.style;
              const isSelahFading = selahFadingPhraseEnd !== null && phraseEnd[absIdx] === selahFadingPhraseEnd;
              // Semantic styling: xref-emphasize wins over commentary-dim on
              // overlap; the live current-word glow (isLast) wins over both.
              const isEmphasized = xrefEmphasizeAt.has(absIdx);
              const isDimmed = commentaryDimAt.has(absIdx) && !isEmphasized;

              const exitOrder = exitWordOrders[absIdx];
              const isLineBreak =
                (phraseEnd[absIdx] === absIdx && lineBreakAt.has(absIdx)) ||
                poetryBreakAt.has(absIdx);
              const wordSpan = (
                <span className="relative">
                  <motion.span
                    ref={isLast ? lastWordRef : undefined}
                    initial={{ opacity: 0, y: 6, filter: "blur(2px)", scale: 0.98 }}
                    animate={isClearingOut ? {
                      opacity: 0,
                      y: -6,
                      filter: "blur(2px)",
                      scale: 0.98,
                      color: "var(--color-foreground)",
                      textShadow: "none",
                    } : {
                      opacity: isSelahFading ? 0
                               : phraseStyle === "selah" ? 0.38
                               : isLast ? 1
                               : isDimmed ? 0.38
                               : 1,
                      y: 0,
                      filter: "blur(0px)",
                      scale: 1,
                      color: highlighted
                        ? "var(--color-link)"
                        : isLast && phraseStyle !== "title"
                          ? "var(--color-primary)"
                          : "var(--color-foreground)",
                      textShadow: highlighted
                        ? "0 0 14px oklch(0.72 0.17 245 / 0.5)"
                        : isLast && phraseStyle !== "title"
                          ? "0 0 28px oklch(0.82 0.13 80 / 0.45)"
                          : isEmphasized
                            ? "0 0 14px oklch(0.82 0.13 80 / 0.35)"
                            : "none",
                    }}
                    transition={isClearingOut
                      ? { delay: phraseStyle === "title" ? 0 : (exitOrder - stageFirstWordOrder) * exitStaggerS, duration: 0.375, ease: "easeIn" }
                      : isSelahFading
                        ? { opacity: { duration: 0.3, ease: "easeIn" } }
                        : {
                            duration: phraseStyle === "title" ? 0.75 : phraseMode && phraseEnd[absIdx] !== absIdx ? 0.3 : 0.75,
                            ease: [0.16, 1, 0.3, 1],
                          }
                    }
                    className={phraseStyle === "title" ? "text-[1.15em] tracking-wide" : undefined}
                    style={{
                      display: "inline-block",
                      // Layer promotion is only worth it while a word is actually
                      // animating (entering as the live word, exiting in the stage-
                      // clear cascade, or fading for [selah]). Settled words that
                      // just scrolled out of "last" status only ever transition
                      // color/text-shadow (paint, not filter/transform) and don't
                      // need a standing composited layer — holding willChange on
                      // every rendered word (up to MAX_RENDERED_TOKENS) was pinning
                      // dozens of blur-filter layers open at once.
                      willChange: isLast || isClearingOut || isSelahFading ? "transform, opacity, filter" : "auto",
                    }}
                  >
                    {t.text}
                  </motion.span>{" "}
                </span>
              );
              // Canonical poetic lineation gets an indented continuation line;
              // elocution [br] breaks stay flush (styling, not text structure).
              const isPoetryBreak = poetryBreakAt.has(absIdx);
              return isLineBreak
                ? (
                  <span key={absIdx}>
                    {wordSpan}
                    <br />
                    {isPoetryBreak && <span aria-hidden className="inline-block w-[1.5em]" />}
                  </span>
                )
                : <span key={absIdx}>{wordSpan}</span>;
            })}
          </p>
        </div>

        {showTopMask && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: lineHeightPx > 0 ? `${lineHeightPx * 1.1}px` : "1.7em",
              background: "linear-gradient(to bottom, oklch(0.20 0.013 70 / 0.95) 0%, transparent 100%)",
            }}
          />
        )}

        {isComplete && (
          <div className="mt-8 flex items-center justify-center gap-8">
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-primary"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
