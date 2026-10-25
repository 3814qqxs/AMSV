import { chapterDisplayName, type Reference } from "@/lib/bible";

export function TopBar({ refData, onTap }: { refData: Reference; onTap?: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex justify-center p-4">
      <button
        onClick={onTap}
        className="pane-surface flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition hover:bg-primary/10"
      >
        <span className="font-serif text-base text-primary">{chapterDisplayName(refData.book)}</span>
        <span className="font-serif text-base tabular-nums text-foreground">{refData.chapter}</span>
      </button>
    </div>
  );
}
