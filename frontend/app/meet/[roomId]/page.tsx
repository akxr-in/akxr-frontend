"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

// ── Inner meeting room (needs RealtimeKitProvider context) ────────────────────

function MeetingRoom({
  meetingId,
  isMentorOrAdmin,
}: {
  meetingId: string;
  isMentorOrAdmin: boolean;
}) {
  const { meeting } = useRealtimeKitMeeting();
  const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);

  const [joinedUserIds, setJoinedUserIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"chat" | "people">("people");
  const [ended, setEnded] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);

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

  if (ended) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-green-400">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Class ended</h2>
          <p className="text-[#888] text-sm">Attendance has been recorded automatically.</p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg bg-brand text-black text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 h-14 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse block" />
          <span className="text-white font-medium text-sm">Live class</span>
        </div>
        <div className="flex gap-1 bg-[#111] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "people" ? "bg-[#2a2a2a] text-white" : "text-[#666] hover:text-white"
            }`}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === "chat" ? "bg-[#2a2a2a] text-white" : "text-[#666] hover:text-white"
            }`}
          >
            Chat
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative overflow-hidden bg-[#0d0d0d]">
          {!roomJoined ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[#888] text-sm">Connecting…</p>
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

        {/* Sidebar */}
        <aside className="w-72 border-l border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden flex flex-col">
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
      </div>

      {/* Controls */}
      <footer className="shrink-0 flex items-center justify-between px-6 h-20 bg-[#1a1a1a] border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <RtkMicToggle meeting={meeting} variant="horizontal" />
          <RtkCameraToggle meeting={meeting} variant="horizontal" />
          <RtkScreenShareToggle meeting={meeting} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLeave}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] text-sm hover:bg-[#2a2a2a] transition-colors"
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
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {ending ? "Ending…" : "Confirm end"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(false)}
                  className="px-3 py-2 rounded-lg border border-[#333] text-[#aaa] text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmEnd(true)}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                End class
              </button>
            )
          )}
        </div>
      </footer>
    </div>
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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-[#888] text-sm">{message}</p>
        <div className="flex items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-brand text-black text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] text-sm hover:bg-[#2a2a2a] transition-colors"
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#888] text-sm">Loading meeting…</p>
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
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
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
