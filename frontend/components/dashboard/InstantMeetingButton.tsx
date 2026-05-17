"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { customFetch } from "@akxr/api";

// customFetch wraps the raw fetch response as { data, status, headers }
// where `data` is the parsed body — so the full response type nests:
//   { data: { data: {...}, message } }
interface InstantMeetingFetchResponse {
  data: {
    data: {
      meeting: {
        id: string;
        title: string;
        realtime_kit_room_id: string | null;
        meeting_url: string | null;
      };
      room_id: string | null;
    };
    message: string;
  };
  status: number;
}

interface InstantMeetingButtonProps {
  /** Optional className override on the trigger button. */
  className?: string;
}

/**
 * Start an instant/open meeting (no schedule, no batch).
 *
 * On submit:
 *  1. POST /meeting/instant → returns the realtime room id.
 *  2. Copy the share URL to the host's clipboard.
 *  3. Redirect the host into /meet/<room_id>.
 *
 * Anyone signed in to akxr can join via the share link — auth is still
 * required but batch membership is bypassed by the backend.
 */
export function InstantMeetingButton({ className }: InstantMeetingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setTitle("");
  };

  const handleStart = async () => {
    setSubmitting(true);
    try {
      const res = await customFetch<InstantMeetingFetchResponse>(
        "/meeting/instant",
        {
          method: "POST",
          body: JSON.stringify({ title: title.trim() || undefined }),
        }
      );

      const roomId = res.data?.data?.room_id;
      if (!roomId) {
        throw new Error("Server did not return a room id");
      }

      // Copy the share link before navigating — clipboard APIs only work
      // from a user gesture, so doing it here (still inside the click
      // handler) is the only reliable place.
      const url = `${window.location.origin}/meet/${roomId}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Meeting started — link copied to clipboard");
      } catch {
        toast.success("Meeting started");
      }

      router.push(`/meet/${roomId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start the meeting";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-[12.5px] font-medium bg-gold text-paper hover:bg-gold-deep transition-colors"
        }
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Start meeting
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="bg-card border border-line rounded-[var(--r-lg)] p-5 w-full max-w-md shadow-lg">
            <h3 className="text-[15px] font-semibold text-ink mb-1">Start an instant meeting</h3>
            <p className="text-[12.5px] text-ink-3 mb-4">
              The room opens immediately. Share the link with anyone signed
              in to akxr — no batch enrolment required.
            </p>

            <label htmlFor="instant-meeting-title" className="text-[11.5px] font-medium text-ink-3 block mb-1.5">
              Title (optional)
            </label>
            <input
              id="instant-meeting-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backend office hours"
              maxLength={255}
              autoFocus
              className="w-full bg-paper border border-line rounded-[var(--r-sm)] px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-4 focus:outline-none focus:border-gold transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !submitting) handleStart();
                if (e.key === "Escape" && !submitting) close();
              }}
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="px-3 py-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={submitting}
                className="px-3 py-1.5 text-[12.5px] font-medium bg-gold text-paper rounded-[var(--r-sm)] hover:bg-gold-deep transition-colors disabled:opacity-60"
              >
                {submitting ? "Starting…" : "Start meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
