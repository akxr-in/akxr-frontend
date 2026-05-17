"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Catch-all 404. Next.js App Router renders this when no route matches.
 *
 * Behaviour: auto-redirect to "/" after a short countdown so users
 * who hit a stale link don't sit on a dead-end page. The redirect can
 * be cancelled by clicking anywhere (focusing the manual button) — the
 * countdown then stops so we don't yank them away mid-decision.
 */

const COUNTDOWN_SECONDS = 5;

export default function NotFound() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (seconds <= 0) {
      router.replace("/");
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds, paused, router]);

  return (
    <main
      className="min-h-screen bg-paper text-ink font-sans flex items-center justify-center px-6"
      onMouseDown={() => setPaused(true)}
      onKeyDown={() => setPaused(true)}
    >
      <div className="w-full max-w-md text-center">
        {/* Big monospaced 404 — quiet, not screaming */}
        <div
          className="font-mono text-ink-4 mb-6"
          style={{ fontSize: 88, letterSpacing: "-0.05em", lineHeight: 1 }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-ink mb-2">
          Page not found
        </h1>

        <p className="text-ink-3 text-[13.5px] leading-[1.55] mb-7">
          The page you were looking for doesn&apos;t exist or has moved.
          {paused
            ? " You can head back to your dashboard whenever you're ready."
            : ` Sending you back to the dashboard in ${seconds}s…`}
        </p>

        <div className="flex items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--r-sm)] text-[12.5px] font-medium bg-gold text-paper hover:bg-gold-deep transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12L12 3l9 9" />
              <path d="M5 10v10h14V10" />
            </svg>
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-3.5 py-2 rounded-[var(--r-sm)] text-[12.5px] font-medium border border-line text-ink-3 hover:border-line-2 hover:text-ink transition-colors"
          >
            Back
          </button>
        </div>

        {!paused && (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-4">
            Click anywhere to stay on this page
          </p>
        )}
      </div>
    </main>
  );
}
