import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Verse, XrefPhrasesEntry } from "@/lib/api";
import { lineEndWordIndices, xrefWordRanges } from "@/lib/timing";

// Unified with ReadingPane's semantic styling: xref words emphasize (glow),
// commentary words dim — same visual language across both surfaces.
const XREF_STYLE = "[text-shadow:0_0_10px_oklch(0.82_0.13_80_/_0.4)]";
const COMMENTARY_STYLE = "opacity-40";

export function HistoryPane({
  open,
  verses,
  revealed,
  onNavigate,
  reference,
  xrefPhrases,
  commentaryPhrases,
}: {
  open: boolean;
  verses: Verse[];
  revealed: number;
  onNavigate: () => void;
  reference: string;
  xrefPhrases?: XrefPhrasesEntry[];
  commentaryPhrases?: XrefPhrasesEntry[];
}) {
  type WordData = { text: string; done: boolean; xref: boolean; commentary: boolean; lineEnd: boolean };
  const groups: { verse: number; words: WordData[] }[] = [];
  let idx = 0;
  for (const v of verses) {
    idx++;
    // poetic lineation: break + indent after each line-end word
    const lineEnds = v.lines ? lineEndWordIndices(v.lines) : new Set<number>();
    const verseWords = (v.text as string).split(/\s+/).filter(Boolean);
    // xref/commentary cue: only words inside a contiguous anchor-phrase match,
    // in that anchor's own verse — xref-emphasize wins over commentary-dim
    const versePhrases = xrefPhrases?.find((e) => e.verse === v.verse)?.phrases;
    const xrefRange = versePhrases ? xrefWordRanges(verseWords, versePhrases) : new Set<number>();
    const verseNotePhrases = commentaryPhrases?.find((e) => e.verse === v.verse)?.phrases;
    const commentaryRange = verseNotePhrases ? xrefWordRanges(verseWords, verseNotePhrases) : new Set<number>();
    const words = verseWords.map((w: string, wi: number) => {
      const done = idx < revealed;
      idx++;
      return { text: w, done, xref: xrefRange.has(wi), commentary: commentaryRange.has(wi), lineEnd: lineEnds.has(wi) };
    });
    groups.push({ verse: v.verse, words });
  }

  const navStartY = useRef<number | null>(null);

  function handleNavPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    navStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }

  function handleNavPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (navStartY.current === null) return;
    const dy = navStartY.current - e.clientY;
    navStartY.current = null;
    e.stopPropagation();
    if (dy > 40) onNavigate();
  }

  return (
    <div className={`absolute inset-0 z-10 flex flex-col overflow-hidden bg-ink/90 backdrop-blur-md${open ? "" : " pointer-events-none"}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="history-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="shrink-0 px-6 pt-20 pb-4 md:px-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Full chapter
              </p>
            </div>

            <div
              className="flex-1 overflow-y-auto px-6 pb-4 md:px-12"
              style={{ scrollbarWidth: "none" }}
            >
              {groups.length === 0 ? (
                <p className="text-muted-foreground">Loading chapter…</p>
              ) : (
                <article className="scripture text-[clamp(1.1rem,1.8vw,1.35rem)] leading-[1.7]">
                  {groups.map((g) => (
                    <p key={g.verse} className="mb-5">
                      <sup className="mr-1.5 text-primary">{g.verse}</sup>
                      {g.words.map((w, wi) => (
                        <span
                          key={wi}
                          className={[
                            w.done ? "text-foreground/90" : "text-muted-foreground/50",
                            w.xref ? XREF_STYLE : w.commentary ? COMMENTARY_STYLE : "",
                          ].filter(Boolean).join(" ")}
                        >
                          {w.text}{" "}
                          {w.lineEnd && <><br /><span aria-hidden className="inline-block w-[1.5em]" /></>}
                        </span>
                      ))}
                    </p>
                  ))}
                </article>
              )}
            </div>

            <div
              onPointerDown={handleNavPointerDown}
              onPointerUp={handleNavPointerUp}
              className="shrink-0 flex cursor-n-resize touch-none flex-col items-center gap-1.5 pt-2 pb-3"
              aria-label="Swipe up to browse books and chapters"
            >
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/40 select-none">
                swipe up to navigate
              </p>
              <div className="h-1 w-10 rounded-full bg-primary/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
