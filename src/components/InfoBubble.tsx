"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface InfoBubbleProps {
  /** The message shown inside the bubble */
  text: string;
}

interface Point {
  x: number;
  y: number;
}

const MARGIN = 12;

export default function InfoBubble({ text }: InfoBubbleProps) {
  const [point, setPoint] = useState<Point | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Any other click on the page pops the bubble open at that spot. Two
  // exceptions: a click inside the bubble itself (so selecting its text
  // doesn't move/reopen it — the close button additionally stops
  // propagation, see below, so it never even reaches this listener), and a
  // click on anything marked `data-info-bubble-ignore` — the Menu (see
  // src/components/Menu.tsx) and the camera on/off switch (see
  // src/components/ascii-camera/Webcam.tsx) both carry that attribute so
  // using them doesn't also pop this bubble open.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (bubbleRef.current?.contains(target)) return;
      if (target.closest("[data-info-bubble-ignore]")) return;
      setPoint({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Clamp the bubble fully inside the viewport right after it (re)mounts at
  // the raw click point — runs before paint, so a click near an edge just
  // places it inline from the start instead of visibly jumping afterward.
  useLayoutEffect(() => {
    const el = bubbleRef.current;
    if (!el || !point) return;
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(window.innerWidth - rect.width - MARGIN, MARGIN);
    const maxTop = Math.max(window.innerHeight - rect.height - MARGIN, MARGIN);
    el.style.left = `${Math.min(Math.max(point.x, MARGIN), maxLeft)}px`;
    el.style.top = `${Math.min(Math.max(point.y, MARGIN), maxTop)}px`;
  }, [point]);

  if (!point) return null;

  return (
    <div
      ref={bubbleRef}
      style={{ left: point.x, top: point.y }}
      className="fixed z-40 w-64 max-w-[calc(100vw-1.5rem)] border-2 border-foreground bg-background text-foreground shadow-[4px_4px_0_0_var(--foreground)]"
    >
      <div className="flex items-center justify-between border-b-2 border-foreground px-2 py-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
          Info
        </span>
        <button
          type="button"
          onClick={(e) => {
            // Stop this click from also reaching the window listener above
            // — otherwise it immediately reopens the bubble it just closed.
            e.stopPropagation();
            setPoint(null);
          }}
          aria-label="Close"
          className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M1 1l8 8M9 1l-8 8" />
          </svg>
        </button>
      </div>

      <p className="p-3 text-sm leading-snug">{text}</p>
    </div>
  );
}
