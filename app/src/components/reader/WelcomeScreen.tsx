import { Component, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NavSheet } from "./NavSheet";
import { readHistory, type HistoryEntry } from "@/hooks/useReadingHistory";

export class WelcomeErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onError: () => void; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn(
      "[AMSV] WelcomeScreen render error — falling back to John 1:",
      err,
    );
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Deliberately in-memory only — no localStorage. Every fresh load (or
// return visit) starts at the Welcome screen, like opening a physical Bible:
// nothing to resume, nothing for the server to guess and get wrong on
// hydration. A `welcomed=true` mid-session (after the user picks a starting
// point) just keeps the splash from reappearing while they navigate around
// within that same load.
export function useWelcomed() {
  const [welcomed, setWelcomed] = useState(false);
  function markWelcomed() {
    setWelcomed(true);
  }
  return { welcomed, markWelcomed };
}

export function WelcomeScreen({
  onBegin,
}: {
  onBegin: (book: string, chapter: number) => void;
}) {
  const [showNav, setShowNav] = useState(false);
  const [navTestament, setNavTestament] = useState<
    "Old Testament" | "New Testament"
  >("New Testament");
  const history: HistoryEntry[] = readHistory();

  function handleTestamentTap(t: "Old Testament" | "New Testament") {
    setNavTestament(t);
    setShowNav(true);
  }

  function handleNavCommit(book: string, chapter: number) {
    setShowNav(false);
    setTimeout(() => onBegin(book, chapter), 180);
  }

  return (
    <>
      <AnimatePresence>
        {!showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink px-8 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                Welcome to
              </p>
              <h1 className="mb-1 font-serif text-5xl text-primary">AMSV</h1>
              <p className="mb-10 text-sm text-muted-foreground">
                A dynamic Bible reading experience
              </p>

              {/* Continue Reading — shown only when history exists */}
              {history.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                    Continue reading
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    {history.map((entry) => (
                      <button
                        key={`${entry.book}-${entry.chapter}`}
                        onClick={() => onBegin(entry.book, entry.chapter)}
                        className="w-56 rounded-full bg-primary/10 px-6 py-2.5 font-serif text-sm text-primary transition hover:bg-primary/20"
                      >
                        {entry.book} {entry.chapter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mb-4 text-xs text-muted-foreground/60 uppercase tracking-[0.25em]">
                {history.length > 0
                  ? "Or start somewhere new"
                  : "Where would you like to begin?"}
              </p>

              <div className="flex flex-col items-center gap-3">
                {(["Old Testament", "New Testament"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTestamentTap(t)}
                    className="w-56 rounded-full border border-border px-6 py-3 font-serif text-base text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <p className="mt-12 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
                AMSV · Public domain
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavSheet
        open={showNav}
        onCommit={handleNavCommit}
        onClose={() => setShowNav(false)}
        currentBook=""
        initialTestament={navTestament}
      />
    </>
  );
}
