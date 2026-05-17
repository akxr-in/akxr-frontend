"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
  useRealtimeKitSelector,
  useRealtimeKitMeeting,
} from "@cloudflare/realtimekit-react";
import {
  RtkGrid,
  RtkMicToggle,
  RtkCameraToggle,
  RtkScreenShareToggle,
  RtkParticipantsAudio,
  RtkChat,
  RtkParticipants,
} from "@cloudflare/realtimekit-react-ui";
import { useGetMeetingByRoomId, useGetMeetingToken, useGetUser } from "@akxr/api";
import { customFetch } from "@akxr/api";
import toast from "react-hot-toast";
import { RtkThemeBridge } from "@/components/meet/RtkThemeBridge";

// ── Inner meeting room (needs RealtimeKitProvider context) ────────────────────

function MeetingRoom({
  meetingId,
  isMentorOrAdmin,
}: {
  meetingId: string;
  isMentorOrAdmin: boolean;
}) {
  const router = useRouter();
  const { meeting } = useRealtimeKitMeeting();
  const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);

  const [joinedUserIds, setJoinedUserIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"chat" | "people">("people");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ended, setEnded] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  // Terminal reason for being out of the room — drives a dedicated screen
  // so users don't sit on "Connecting…" after a kick or remote end.
  const [exitReason, setExitReason] = useState<null | "kicked" | "ended" | "failed">(null);

  // Track joined participants reactively via selector — accumulate to capture leavers too
  const joinedParticipants = useRealtimeKitSelector((m) => (m as any).participants?.joined);
  const activeParticipants = useRealtimeKitSelector((m) => (m as any).participants?.active);

  useEffect(() => {
    if (!joinedParticipants) return;
    const ids: string[] = (joinedParticipants.toArray?.() ?? [])
      .map((p: any) => p.userId || p.customParticipantId)
      .filter(Boolean);
    if (ids.length > 0) {
      setJoinedUserIds((prev) => new Set([...prev, ...ids]));
    }
  }, [joinedParticipants]);

  // Listen for involuntary room exits.
  //
  // The RtK SDK fires `meeting.self.roomLeft` with a `state` field whenever
  // the local user leaves — voluntarily ("left"), ended-by-host ("ended"),
  // kicked by host ("kicked"), or a hard failure ("failed"/"disconnected").
  // Without this listener the user just sees roomJoined flip to false and
  // gets stuck on our "Connecting…" placeholder forever (the screenshot
  // bug). Stash the reason and render a terminal screen below.
  useEffect(() => {
    if (!meeting?.self) return;
    const handleRoomLeft = (payload: { state: string }) => {
      // Voluntary leaves are handled inline by handleLeave / handleEndMeeting
      // so we don't double-handle them here.
      if (payload.state === "left" || payload.state === "stageLeft") return;
      if (payload.state === "kicked") setExitReason("kicked");
      else if (payload.state === "ended") setExitReason("ended");
      else if (payload.state === "failed" || payload.state === "disconnected") setExitReason("failed");
    };
    meeting.self.on("roomLeft", handleRoomLeft);
    return () => {
      meeting.self.off("roomLeft", handleRoomLeft);
    };
  }, [meeting]);

  // Allow ESC to cancel the "Confirm end" state.
  useEffect(() => {
    if (!confirmEnd) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ending) setConfirmEnd(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [confirmEnd, ending]);

  const handleLeave = () => {
    meeting.leaveRoom();
    window.history.back();
  };

  const handleEndMeeting = async () => {
    setEnding(true);
    try {
      const activeIds: string[] = (activeParticipants?.toArray?.() ?? [])
        .map((p: any) => p.userId || p.customParticipantId)
        .filter(Boolean);

      await customFetch(`/meeting/${meetingId}/end`, {
        method: "POST",
        body: JSON.stringify({
          present_participant_ids: activeIds,
          joined_participant_ids: Array.from(joinedUserIds),
        }),
      });
      meeting.leaveRoom();
      setEnded(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to end meeting");
    } finally {
      setEnding(false);
      setConfirmEnd(false);
    }
  };

  // Involuntary exit (kicked / host ended / connection lost). Show a
  // dedicated terminal screen so the user knows why they're not in the
  // room instead of seeing an infinite "Connecting…".
  if (exitReason) {
    const copy = exitReason === "kicked"
      ? {
          title: "You were removed from the class",
          body: "The host removed you from this meeting. Reach out to them if this wasn't expected.",
          toneBg: "bg-bad-bg",
          toneFg: "text-bad",
        }
      : exitReason === "ended"
      ? {
          title: "Class ended",
          body: "The host ended this class. Attendance has been recorded.",
          toneBg: "bg-ok-bg",
          toneFg: "text-ok",
        }
      : {
          title: "Disconnected",
          body: "We lost the connection to the meeting room. You can rejoin from the dashboard.",
          toneBg: "bg-brand-subtle",
          toneFg: "text-brand-ink",
        };
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className={`w-16 h-16 rounded-full ${copy.toneBg} flex items-center justify-center mx-auto`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-8 h-8 ${copy.toneFg}`} aria-hidden="true">
              {exitReason === "kicked" ? (
                <>
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                </>
              ) : exitReason === "ended" ? (
                <path d="M5 13l4 4L19 7" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </>
              )}
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink">{copy.title}</h2>
          <p className="text-ink-3 text-sm">{copy.body}</p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="px-4 py-2 rounded-[var(--r-sm)] bg-gold text-paper text-sm font-medium hover:bg-gold-deep transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (ended) {
    const totalSeen = joinedUserIds.size;
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-full bg-ok-bg flex items-center justify-center mx-auto">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-ok" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink">Class ended</h2>
          <p className="text-ink-3 text-sm">
            {totalSeen > 0
              ? `Attendance recorded for ${totalSeen} participant${totalSeen === 1 ? "" : "s"}.`
              : "Attendance has been recorded."}
          </p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="px-4 py-2 rounded-[var(--r-sm)] bg-gold text-paper text-sm font-medium hover:bg-gold-deep transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <RtkThemeBridge>
    <div className="h-screen flex flex-col bg-paper overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 h-14 bg-paper-2 border-b border-line">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-ok animate-pulse block" />
          <span className="text-white font-medium text-sm">Live class</span>
        </div>
        {/* Sidebar tabs — clicking the active one collapses the panel,
            clicking the other swaps + opens. Gives users one place to
            reclaim screen real estate. */}
        <div className="hidden md:flex gap-1 bg-paper rounded-[var(--r-sm)] p-1" role="tablist" aria-label="Sidebar panel">
          {(["people", "chat"] as const).map((tab) => {
            const isActiveOpen = sidebarOpen && activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActiveOpen}
                onClick={() => {
                  if (sidebarOpen && activeTab === tab) {
                    setSidebarOpen(false);
                  } else {
                    setActiveTab(tab);
                    setSidebarOpen(true);
                  }
                }}
                className={`px-3 py-1 rounded-[var(--r-sm)] text-xs font-medium transition-colors ${
                  isActiveOpen ? "bg-card-elev text-ink" : "text-ink-4 hover:text-ink"
                }`}
              >
                {tab === "people" ? "People" : "Chat"}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative overflow-hidden bg-bg-deep">
          {!roomJoined ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-ink-4 text-sm">Connecting…</p>
              </div>
            </div>
          ) : (
            <RtkGrid
              meeting={meeting}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          )}
          <RtkParticipantsAudio meeting={meeting} style={{ display: "none" }} />
        </div>

        {/* Sidebar — collapsible via the header tabs. Wider than before
            (320px) so participant names + chat copy don't truncate to "Aman Kum…".
            Hidden on small screens so mobile gets full video. */}
        {sidebarOpen && (
          <aside className="hidden md:flex w-80 border-l border-line bg-paper-2 overflow-hidden flex-col relative">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-[var(--r-sm)] text-ink-4 hover:text-ink hover:bg-card-elev transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {activeTab === "chat" ? (
              <RtkChat
                meeting={meeting}
                style={{ width: "100%", height: "100%", flex: "1" }}
              />
            ) : (
              <RtkParticipants
                meeting={meeting}
                style={{ width: "100%", height: "100%", flex: "1" }}
              />
            )}
          </aside>
        )}
      </div>

      {/* Controls */}
      <footer className="shrink-0 flex items-center justify-between px-6 h-20 bg-paper-2 border-t border-line">
        <div className="flex items-center gap-2">
          <RtkMicToggle meeting={meeting} variant="horizontal" />
          <RtkCameraToggle meeting={meeting} variant="horizontal" />
          {/* RtkScreenShareToggle defaults to the icon-only square. Pin it
              to the horizontal labeled variant so it matches Mic/Camera. */}
          <RtkScreenShareToggle meeting={meeting} variant="horizontal" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLeave}
            className="px-4 py-2 rounded-lg border border-line-2 text-ink-3 text-sm hover:bg-card-elev transition-colors"
          >
            Leave
          </button>

          {isMentorOrAdmin && (
            confirmEnd ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={ending}
                  onClick={handleEndMeeting}
                  className="px-4 py-2 rounded-lg bg-bad text-white text-sm font-medium hover:bg-bad disabled:opacity-50 transition-colors"
                >
                  {ending ? "Ending…" : "Confirm end"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(false)}
                  className="px-3 py-2 rounded-lg border border-line-2 text-ink-3 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmEnd(true)}
                className="px-4 py-2 rounded-lg bg-bad/10 border border-bad-deep text-bad text-sm font-medium hover:bg-bad/20 transition-colors"
              >
                End class
              </button>
            )
          )}
        </div>
      </footer>
    </div>
    </RtkThemeBridge>
  );
}

// ── Root page — handles token fetch + RTK init ────────────────────────────────

function MeetErrorScreen({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="w-12 h-12 rounded-full bg-bad/10 border border-bad-deep flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-bad">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-ink-4 text-sm">{message}</p>
        <div className="flex items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-brand text-paper text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg border border-line-2 text-ink-3 text-sm hover:bg-card-elev transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MeetRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const {
    data: meetingData,
    isLoading: meetingLoading,
    error: meetingError,
  } = useGetMeetingByRoomId(roomId);
  const meeting = meetingData?.data?.data;

  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useGetMeetingToken(meeting?.id ?? "", {
    enabled: !!meeting?.id,
  } as any);
  const authToken = tokenData?.data?.data?.authToken;

  const { data: currentUserData } = useGetUser();
  const currentUser = currentUserData?.status === 200 ? currentUserData.data.data : undefined;
  const isMentorOrAdmin = currentUser?.role === "MENTOR" || currentUser?.role === "ADMIN";

  const [client, loadClient] = useRealtimeKitClient();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinAttempt, setJoinAttempt] = useState(0);

  useEffect(() => {
    if (!authToken || client) return;
    loadClient({ authToken, defaults: { video: true, audio: true } });
  }, [authToken, client, loadClient]);

  useEffect(() => {
    if (!client || !meeting?.id) return;
    setJoinError(null);
    client.joinRoom().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to join the meeting room";
      setJoinError(msg);
    });
  }, [client, meeting?.id, joinAttempt]);

  if (meetingLoading || tokenLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-4 text-sm">Loading meeting…</p>
        </div>
      </div>
    );
  }

  if (meetingError) {
    const msg = meetingError instanceof Error ? meetingError.message : "Could not load meeting.";
    const isForbidden = /forbidden|do not have access/i.test(msg);
    return (
      <MeetErrorScreen
        title={isForbidden ? "Access denied" : "Could not load meeting"}
        message={
          isForbidden
            ? "You are not enrolled in this batch, so you can't join this session."
            : msg
        }
      />
    );
  }

  if (!meeting) {
    return <MeetErrorScreen title="Meeting not found" message="The room you tried to join doesn't exist." />;
  }

  if (tokenError) {
    const msg = tokenError instanceof Error ? tokenError.message : "Could not fetch meeting token.";
    return <MeetErrorScreen title="Could not join meeting" message={msg} />;
  }

  if (!authToken) {
    return (
      <MeetErrorScreen
        title="Access denied"
        message="You do not have permission to join this meeting."
      />
    );
  }

  if (joinError) {
    return (
      <MeetErrorScreen
        title="Failed to connect"
        message={joinError}
        onRetry={() => {
          setJoinError(null);
          setJoinAttempt((n) => n + 1);
        }}
      />
    );
  }

  return (
    <RealtimeKitProvider
      value={client}
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MeetingRoom
        meetingId={meeting.id}
        isMentorOrAdmin={isMentorOrAdmin}
      />
    </RealtimeKitProvider>
  );
}
