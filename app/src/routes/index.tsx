import { createFileRoute } from "@tanstack/react-router";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import {
  nextChapter,
  prevChapter,
  parseRef,
  chapterDisplayName,
  type Reference,
} from "@/lib/bible";

import {
  fetchChapter,
  fetchChapterCrossRefs,
  fetchChapterCommentary,
  fetchChapterPhraseOverrides,
  fetchChapterXrefPhrases,
  fetchChapterCommentaryPhrases,
  type LinkedRef,
  type CommentaryEntry,
} from "@/lib/api";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { BackgroundPane } from "@/components/reader/BackgroundPane";
import { ReadingPane } from "@/components/reader/ReadingPane";
import { SidePane } from "@/components/reader/SidePane";
import { TopBar } from "@/components/reader/TopBar";
import { HistoryPane } from "@/components/reader/HistoryPane";
import { NavSheet } from "@/components/reader/NavSheet";
import { CrossRefTransition } from "@/components/reader/CrossRefTransition";
import {
  WelcomeScreen,
  WelcomeErrorBoundary,
  useWelcomed,
} from "@/components/reader/WelcomeScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AMSV" },
      {
        name: "description",
        content:
          "A paced reader for the American Majority Standard Version. Words approach in tempo, with cross-references, commentary, and annotation a swipe away.",
      },
    ],
  }),
  component: ReaderPage,
});

// Speed presets for 4-D
const SPEED_PRESETS = [150, 250, 350];
const SPEED_KEY = "amsv-speed";

function readSpeed(): number {
  try {
    const v =
      typeof localStorage !== "undefined"
        ? Number(localStorage.getItem(SPEED_KEY))
        : NaN;
    return SPEED_PRESETS.includes(v) ? v : 250;
  } catch {
    return 250;
  }
}
function writeSpeed(wpm: number): void {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(SPEED_KEY, String(wpm));
  } catch {
    /* storage blocked */
  }
}
function nextPreset(current: number): number {
  const idx = SPEED_PRESETS.indexOf(current);
  return SPEED_PRESETS[(idx + 1) % SPEED_PRESETS.length];
}
function stepPreset(current: number, dir: 1 | -1): number {
  const idx = SPEED_PRESETS.indexOf(current);
  const next = idx + dir;
  if (next < 0 || next >= SPEED_PRESETS.length) return current;
  return SPEED_PRESETS[next];
}
function presetLabel(wpm: number): string {
  const labels: Record<number, string> = {
    150: "Low",
    250: "Med",
    350: "High",
  };
  return labels[wpm] ?? `${wpm}`;
}

function ReaderPage() {
  const { welcomed, markWelcomed } = useWelcomed();
  const { push: pushHistory } = useReadingHistory();

  // No auto-resume, no placeholder book: every session opens on the Welcome
  // screen and the reader only mounts once the user explicitly picks a
  // starting point there (fresh reading, or one of their "Continue reading"
  // entries) — nothing to default to server-side, so nothing can flash.
  const [refData, setRef] = useState<Reference | null>(null);
  const [targetWpm, setTargetWpm] = useState(readSpeed);
  const [wpm, setWpm] = useState(250);

  function changeSpeed(newWpm: number) {
    setWpm(newWpm);
    setTargetWpm(newWpm);
  }
  const [playing, setPlaying] = useState(false);
  const [activeVerse, setActiveVerse] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [side, setSide] = useState<null | "left" | "right">(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySettled, setHistorySettled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navInitialBook, setNavInitialBook] = useState<string | undefined>(
    undefined,
  );
  const wasPlayingRef = useRef(false);
  const wasPlayingBeforeSide = useRef(false);
  const prevHistoryOpenRef = useRef(false);
  const navOpenedFromHistoryRef = useRef(false);
  const reopenHistoryAfterNavRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [openY, setOpenY] = useState(0);
  const historySettleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const navSwipeStartY = useRef<number | null>(null);
  const speedSwipeStartY = useRef<number | null>(null);
  const speedSwipeHandled = useRef(false);
  const lastSpeedWheelTime = useRef(0);
  const [highlight, setHighlight] = useState<{
    phrase: string;
    targetRef?: string;
  } | null>(null);

  const [xrefTransition, setXrefTransition] = useState<{
    active: boolean;
    targetRef: string;
  }>({
    active: false,
    targetRef: "",
  });

  const {
    data: verses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapter", refData?.book, refData?.chapter],
    queryFn: ({ signal }) =>
      fetchChapter(refData!.book, refData!.chapter, signal),
    staleTime: 10 * 60 * 1000,
    enabled: !!refData,
  });

  const { data: chapterRefs = [] } = useQuery({
    queryKey: ["cross-refs-chapter", refData?.book, refData?.chapter],
    queryFn: () => fetchChapterCrossRefs(refData!.book, refData!.chapter),
    staleTime: 60 * 60 * 1000,
    enabled: !!refData && side === "left",
  });

  const { data: chapterNotes = [] } = useQuery({
    queryKey: ["commentary-chapter", refData?.book, refData?.chapter],
    queryFn: () => fetchChapterCommentary(refData!.book, refData!.chapter),
    staleTime: 60 * 60 * 1000,
    enabled: !!refData && side === "right",
  });

  const { data: chapterXrefPhrases = [] } = useQuery({
    queryKey: ["xref-phrases", refData?.book, refData?.chapter],
    queryFn: () => fetchChapterXrefPhrases(refData!.book, refData!.chapter),
    staleTime: 60 * 60 * 1000,
    enabled: !!refData,
  });

  const { data: chapterCommentaryPhrases = [] } = useQuery({
    queryKey: ["commentary-phrases", refData?.book, refData?.chapter],
    queryFn: () =>
      fetchChapterCommentaryPhrases(refData!.book, refData!.chapter),
    staleTime: 60 * 60 * 1000,
    enabled: !!refData,
  });

  const { data: phraseOverrides = [] } = useQuery({
    queryKey: ["phrase-overrides", refData?.book, refData?.chapter],
    queryFn: () => fetchChapterPhraseOverrides(refData!.book, refData!.chapter),
    staleTime: 60 * 60 * 1000,
    enabled: !!refData,
  });

  function handleNavCommit(book: string, chapter: number) {
    const fromHistory = navOpenedFromHistoryRef.current;
    navOpenedFromHistoryRef.current = false;
    if (fromHistory) {
      reopenHistoryAfterNavRef.current = true;
    } else {
      setPlaying(true);
    }
    setRef({ book, chapter });
    setNavOpen(false);
  }

  function handleWelcomeBegin(book: string, chapter: number) {
    setRef({ book, chapter });
    markWelcomed();
    setPlaying(true);
  }

  function handleNavHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    navSwipeStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleNavHandlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (navSwipeStartY.current === null) return;
    const dy = navSwipeStartY.current - e.clientY;
    if (dy > 40) {
      navOpenedFromHistoryRef.current = historyOpen;
      setNavInitialBook(undefined);
      setNavOpen(true);
    }
    navSwipeStartY.current = null;
  }

  const handleNext = useCallback(() => {
    setRef((r) => (r ? nextChapter(r) : r));
    setPlaying(true);
  }, []);
  const handlePrev = useCallback(() => {
    setRef((r) => (r ? prevChapter(r) : r));
    setPlaying(true);
  }, []);
  const openSide = useCallback(
    (s: "left" | "right") => {
      wasPlayingBeforeSide.current = playing;
      setPlaying(false);
      setSide(s);
    },
    [playing],
  );
  const closeSide = useCallback(() => {
    setSide(null);
    if (wasPlayingBeforeSide.current) {
      setWpm(150);
      setPlaying(true);
    }
  }, []);
  const openRefs = useCallback(() => openSide("left"), [openSide]);
  const openNotes = useCallback(() => openSide("right"), [openSide]);
  const handleTogglePlay = useCallback(() => setPlaying((p) => !p), []);

  // Track reading history whenever chapter changes
  useEffect(() => {
    if (!refData) return;
    pushHistory({ book: refData.book, chapter: refData.chapter });
  }, [refData?.book, refData?.chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    writeSpeed(targetWpm);
  }, [targetWpm]);

  // Reset to Low on every chapter navigation
  useEffect(() => {
    if (!refData) return;
    setWpm(150);
  }, [refData]);

  // Ramp: while playing, step wpm toward targetWpm every 3s
  useEffect(() => {
    if (!playing || wpm >= targetWpm) return;
    const timer = setTimeout(() => {
      setWpm((w) => {
        const next = stepPreset(w, 1);
        return next <= targetWpm ? next : targetWpm;
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [playing, wpm, targetWpm]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "PageDown") handleNext();
      else if (e.key === "PageUp") handlePrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setOpenY(window.innerHeight - rect.top - 48 - 24);
  }, []);

  useEffect(() => {
    clearTimeout(historySettleTimer.current);
    if (reopenHistoryAfterNavRef.current) {
      reopenHistoryAfterNavRef.current = false;
      setHistorySettled(false);
      setHistoryOpen(true);
      historySettleTimer.current = setTimeout(
        () => setHistorySettled(true),
        350,
      );
    } else {
      setHistoryOpen(false);
      setHistorySettled(false);
    }
  }, [refData?.book, refData?.chapter]);

  const chapterKey = refData ? `${refData.book}-${refData.chapter}` : "";

  // Cross-ref navigation with cinematic transition (4-C)
  function jumpToRef(targetRef: string, phrase?: string) {
    const parsed = parseRef(targetRef);
    if (!parsed) return;
    setSide(null);
    setXrefTransition({ active: true, targetRef });
    setTimeout(() => {
      setRef({ book: parsed.book, chapter: parsed.chapter });
      if (phrase) setHighlight({ phrase, targetRef });
      setTimeout(
        () => setXrefTransition({ active: false, targetRef: "" }),
        300,
      );
    }, 1100);
  }

  function highlightInSource(phrase: string) {
    setHighlight({ phrase });
  }

  return (
    <>
      <main
        className="relative h-screen w-screen overflow-hidden"
        data-reading={playing ? "true" : undefined}
      >
        {/* Nothing to show until the Welcome screen hands us a starting
            reference — no default book, no placeholder fetch. */}
        {refData && (
          <>
            {/* Background */}
            <AnimatePresence mode="wait">
              <motion.div
                key={chapterKey + "-bg"}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <BackgroundPane verses={verses} />
              </motion.div>
            </AnimatePresence>

            {/* Foreground reading card — draggable wrapper */}
            <motion.div
              ref={cardRef}
              className="absolute inset-x-2 top-20 bottom-6 z-20 md:inset-x-10 md:top-24 md:bottom-8"
              animate={{ y: historyOpen ? openY : 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: openY }}
              dragElastic={{ top: 0, bottom: 0.05 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              style={{ willChange: "transform" }}
              onDragStart={() => {
                clearTimeout(historySettleTimer.current);
                prevHistoryOpenRef.current = historyOpen;
                wasPlayingRef.current = playing;
                setPlaying(false);
                setHistoryOpen(true);
                setHistorySettled(false);
              }}
              onDragEnd={(_, info: PanInfo) => {
                const wasOpen = prevHistoryOpenRef.current;
                if (!wasOpen) {
                  const opened = info.offset.y > 80 || info.velocity.y > 500;
                  setHistoryOpen(opened);
                  if (opened) {
                    historySettleTimer.current = setTimeout(
                      () => setHistorySettled(true),
                      350,
                    );
                  } else {
                    setHistorySettled(false);
                    if (wasPlayingRef.current) setPlaying(true);
                  }
                } else {
                  const closed = info.offset.y < -80 || info.velocity.y < -500;
                  if (closed) {
                    setHistoryOpen(false);
                    setHistorySettled(false);
                    if (wasPlayingRef.current) setPlaying(true);
                  } else {
                    historySettleTimer.current = setTimeout(
                      () => setHistorySettled(true),
                      350,
                    );
                  }
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapterKey + "-fg"}
                  initial={{
                    opacity: 0,
                    y: 30,
                    scale: 0.96,
                    filter: "blur(8px)",
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    y: -20,
                    scale: 0.98,
                    filter: "blur(8px)",
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <div className="pane-surface relative h-full overflow-hidden rounded-[28px]">
                    {isLoading && (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Loading scripture…
                      </div>
                    )}
                    {error && (
                      <div className="flex h-full items-center justify-center px-6 text-center text-destructive">
                        Couldn't load this chapter. Check your connection and
                        try again.
                      </div>
                    )}
                    {!isLoading && !error && (
                      <ReadingPane
                        verses={verses}
                        wpm={wpm}
                        playing={playing}
                        onActiveVerseChange={setActiveVerse}
                        onRevealedChange={(n) => setRevealedCount(n)}
                        resetKey={chapterKey}
                        highlightPhrase={highlight?.phrase ?? null}
                        onTogglePlay={handleTogglePlay}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        phraseMode={true}
                        phraseOverrides={phraseOverrides}
                        xrefPhrases={chapterXrefPhrases}
                        commentaryPhrases={chapterCommentaryPhrases}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
                    {/* Verse badge */}
                    <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-ink/60 px-3 py-1 font-serif text-xs text-primary backdrop-blur">
                      v. {activeVerse}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <TopBar
              refData={refData}
              onTap={() => {
                navOpenedFromHistoryRef.current = historyOpen;
                setNavInitialBook(refData!.book);
                setNavOpen(true);
              }}
            />

            {/* Side pane pills — only visible when history pane is open */}
            {historyOpen && (
              <>
                <button
                  onClick={openRefs}
                  className="chrome-element absolute left-2 top-20 bottom-6 z-30 flex w-7 items-center justify-start pl-1"
                  aria-label="Open cross-references"
                >
                  <div className="h-10 w-1 rounded-full bg-primary/30" />
                </button>
                <button
                  onClick={openNotes}
                  className="chrome-element absolute right-2 top-20 bottom-6 z-30 flex w-7 items-center justify-end pr-1"
                  aria-label="Open commentary"
                >
                  <div className="h-10 w-1 rounded-full bg-primary/30" />
                </button>
              </>
            )}

            {/* Cross-references */}
            <SidePane
              open={side === "left"}
              side="left"
              title="Cross-references"
              onClose={closeSide}
            >
              <p className="mb-5 font-serif text-sm text-muted-foreground">
                {chapterDisplayName(refData.book)} {refData.chapter}
              </p>
              {chapterRefs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No curated references for this chapter yet. Try John 1, John
                  3, Genesis 1, Romans 8, or Psalm 23.
                </p>
              ) : (
                <div className="space-y-6">
                  {chapterRefs.map(({ verse, refs }) => (
                    <div key={verse}>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                        verse {verse}
                      </p>
                      <ul className="space-y-3">
                        {refs.map((r) => (
                          <li
                            key={r.ref}
                            className="rounded-xl border border-border bg-secondary/40 px-4 py-3"
                          >
                            {r.preview && (
                              <p className="mb-2 font-serif text-sm leading-relaxed text-foreground/80">
                                {r.preview}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => jumpToRef(r.ref, r.phrase)}
                                className="font-serif text-xs text-muted-foreground transition hover:text-primary"
                              >
                                {r.ref} →
                              </button>
                              {r.phrase && (
                                <button
                                  onClick={() => highlightInSource(r.phrase!)}
                                  className="text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary"
                                >
                                  Highlight
                                </button>
                              )}
                            </div>
                            {r.phrase && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                                shared phrase:{" "}
                                <span className="link-word normal-case tracking-normal">
                                  {r.phrase}
                                </span>
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {highlight?.targetRef && (
                <p className="mt-4 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                  Match from{" "}
                  <span className="link-word">{highlight.phrase}</span>{" "}
                  highlighted in the reading pane.
                </p>
              )}
            </SidePane>

            {/* Commentary */}
            <SidePane
              open={side === "right"}
              side="right"
              title="Commentary"
              onClose={closeSide}
            >
              <p className="mb-5 font-serif text-sm text-muted-foreground">
                {chapterDisplayName(refData.book)} {refData.chapter}
              </p>
              {chapterNotes.length === 0 ? (
                <p className="scripture text-base leading-relaxed text-muted-foreground">
                  No editorial notes for this chapter yet.
                </p>
              ) : (
                <div className="space-y-8">
                  {chapterNotes.map(({ verse, entry }) => (
                    <div key={verse}>
                      <div className="mb-3 flex items-baseline justify-between">
                        <p className="font-serif text-sm text-muted-foreground">
                          {chapterDisplayName(refData.book)} {refData.chapter}:
                          {verse}
                        </p>
                        {entry.initials && (
                          <span className="rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                            {entry.initials}
                          </span>
                        )}
                      </div>
                      <CommentaryBody
                        text={entry.text}
                        links={entry.links ?? []}
                        onLinkClick={(l) => jumpToRef(l.ref, l.phrase)}
                        onHover={(phrase) =>
                          phrase && highlightInSource(phrase)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </SidePane>

            {/* Swipe-up handle below reading card */}
            <div
              onPointerDown={handleNavHandlePointerDown}
              onPointerUp={handleNavHandlePointerUp}
              className="chrome-element absolute inset-x-0 bottom-0 z-30 flex h-6 cursor-n-resize touch-none items-center justify-center"
              aria-label="Swipe up to select book and chapter"
            >
              <div className="h-1 w-10 rounded-full bg-primary/25" />
            </div>

            {/* Speed preset cycle button — always visible, bottom-centre */}
            <button
              onClick={() => {
                if (speedSwipeHandled.current) {
                  speedSwipeHandled.current = false;
                  return;
                }
                changeSpeed(nextPreset(wpm));
              }}
              onWheel={(e) => {
                const now = Date.now();
                if (now - lastSpeedWheelTime.current < 200) return;
                lastSpeedWheelTime.current = now;
                changeSpeed(stepPreset(wpm, e.deltaY > 0 ? -1 : 1));
              }}
              onPointerDown={(e) => {
                speedSwipeStartY.current = e.clientY;
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                if (speedSwipeStartY.current === null) return;
                const dy = speedSwipeStartY.current - e.clientY;
                speedSwipeStartY.current = null;
                if (Math.abs(dy) > 30) {
                  speedSwipeHandled.current = true;
                  changeSpeed(stepPreset(wpm, dy > 0 ? 1 : -1));
                }
              }}
              className={`absolute bottom-8 left-1/2 z-30 -translate-x-1/2 cursor-ns-resize touch-none px-2 py-1 text-[11px] font-medium text-primary/70 transition hover:text-primary/90${historyOpen ? " invisible" : ""}`}
              aria-label="Cycle reading speed preset"
            >
              {playing ? presetLabel(wpm) : "paused"}
            </button>

            {/* Navigation sheet */}
            <NavSheet
              open={navOpen}
              onCommit={handleNavCommit}
              onClose={() => {
                setNavOpen(false);
                setNavInitialBook(undefined);
                navOpenedFromHistoryRef.current = false;
              }}
              currentBook={refData.book}
              initialBook={navInitialBook}
            />

            {/* History overlay */}
            <HistoryPane
              open={historySettled}
              verses={verses}
              revealed={revealedCount}
              onNavigate={() => {
                navOpenedFromHistoryRef.current = true;
                setNavOpen(true);
              }}
              reference={`${chapterDisplayName(refData.book)} ${refData.chapter}`}
              xrefPhrases={chapterXrefPhrases}
              commentaryPhrases={chapterCommentaryPhrases}
            />

            {/* Watermark — AMSV (3-A) */}
            <div className="chrome-element pointer-events-none absolute bottom-2 left-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              AMSV
            </div>
          </>
        )}
      </main>

      {/* Cinematic cross-ref transition overlay (4-C) */}
      <CrossRefTransition
        active={xrefTransition.active}
        targetRef={xrefTransition.targetRef}
        verses={verses}
      />

      {/* Welcome splash (4-E) */}
      <AnimatePresence>
        {!welcomed && (
          <WelcomeErrorBoundary onError={() => handleWelcomeBegin("John", 1)}>
            <WelcomeScreen onBegin={handleWelcomeBegin} />
          </WelcomeErrorBoundary>
        )}
      </AnimatePresence>
    </>
  );
}

function CommentaryBody({
  text,
  links,
  onLinkClick,
  onHover,
}: {
  text: string;
  links: LinkedRef[];
  onLinkClick: (l: LinkedRef) => void;
  onHover: (phrase: string | null) => void;
}) {
  if (!links.length) {
    return (
      <p className="scripture text-lg leading-relaxed text-foreground">
        {text}
      </p>
    );
  }
  const escaped = links
    .map((l) => l.phrase ?? l.ref)
    .filter(Boolean)
    .map((s) => s!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);

  return (
    <p className="scripture text-lg leading-relaxed text-foreground">
      {parts.map((p, i) => {
        const match = links.find(
          (l) => (l.phrase ?? l.ref).toLowerCase() === p.toLowerCase(),
        );
        if (!match) return <span key={i}>{p}</span>;
        return (
          <button
            key={i}
            onClick={() => onLinkClick(match)}
            onMouseEnter={() => onHover(match.phrase ?? null)}
            onFocus={() => onHover(match.phrase ?? null)}
            className="link-word underline decoration-dotted underline-offset-4 hover:opacity-80"
            title={`Open ${match.ref}`}
          >
            {p}
          </button>
        );
      })}{" "}
      <span className="mt-2 block text-[11px] text-muted-foreground">
        Tap a blue phrase to jump · matching words highlight in the source.
      </span>
    </p>
  );
}
