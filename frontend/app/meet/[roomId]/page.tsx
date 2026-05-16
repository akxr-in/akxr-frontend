"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRealtimeKitClient, RealtimeKitProvider, useRealtimeKitSelector } from "@cloudflare/realtimekit-react";
import { useGetMeetingByRoomId, useGetMeetingToken, useGetUser, useGetBatchStudents } from "@akxr/api";
import { useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@akxr/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type DisplayStatus = "present" | "absent" | "partial";

// ── Video tile for a single participant ───────────────────────────────────────

function ParticipantTile({ peerId }: { peerId: string }) {
  const participant = useRealtimeKitSelector((m) => m.participants.active.get(peerId));
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (participant?.videoEnabled && participant.videoTrack) {
      const stream = new MediaStream();
      stream.addTrack(participant.videoTrack);
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [participant?.videoEnabled, participant?.videoTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (participant?.audioEnabled && participant.audioTrack) {
      const stream = new MediaStream();
      stream.addTrack(participant.audioTrack);
      audioRef.current.srcObject = stream;
    } else {
      audioRef.current.srcObject = null;
    }
  }, [participant?.audioEnabled, participant?.audioTrack]);

  if (!participant) return null;

  return (
    <div className="relative bg-bg-card rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-border-default">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${participant.videoEnabled ? "block" : "hidden"}`}
      />
      <audio ref={audioRef} autoPlay />
      {!participant.videoEnabled && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-xl">
            {(participant.name || "?")[0].toUpperCase()}
          </div>
          <span className="text-text-secondary text-sm">{participant.name || "Unknown"}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded-full truncate max-w-[120px]">
          {participant.name || "Unknown"}
        </span>
        {!participant.audioEnabled && (
          <span className="w-5 h-5 rounded-full bg-error/80 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

// ── Self tile ─────────────────────────────────────────────────────────────────

function SelfTile() {
  const self = useRealtimeKitSelector((m) => m.self);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !self) return;
    if (self.videoEnabled && self.videoTrack) {
      const stream = new MediaStream();
      stream.addTrack(self.videoTrack);
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [self?.videoEnabled, self?.videoTrack]);

  if (!self) return null;

  return (
    <div className="relative bg-bg-card rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-brand/40">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${self.videoEnabled ? "block" : "hidden"}`}
      />
      {!self.videoEnabled && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-xl">
            {(self.name || "?")[0].toUpperCase()}
          </div>
          <span className="text-text-secondary text-sm">{self.name || "You"}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2">
        <span className="text-xs text-white bg-brand/60 px-2 py-0.5 rounded-full">You</span>
      </div>
    </div>
  );
}

// ── Video grid ────────────────────────────────────────────────────────────────

function VideoGrid() {
  const activePeers = useRealtimeKitSelector((m) => m.participants.active);
  const peerIds = activePeers?.toArray().map((p: any) => p.id) ?? [];

  return (
    <div className={`grid gap-3 flex-1 ${
      peerIds.length === 0 ? "grid-cols-1" :
      peerIds.length <= 1 ? "grid-cols-2" :
      peerIds.length <= 3 ? "grid-cols-2" :
      "grid-cols-3"
    }`}>
      <SelfTile />
      {peerIds.map((id: string) => <ParticipantTile key={id} peerId={id} />)}
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────

function ChatPanel() {
  const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);
  const chat = useRealtimeKitSelector((m) => m.chat);
  const messages = useRealtimeKitSelector((m) => m.chat?.messages ?? []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!roomJoined) return null;

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !chat) return;
    chat.sendTextMessage(text);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-default">
        <p className="text-[13px] font-semibold text-white">Chat</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-text-muted text-xs text-center mt-4">No messages yet</p>
        )}
        {messages.map((msg: any) => (
          <div key={msg.id} className="text-[12px]">
            <span className="text-brand font-medium">{msg.displayName || "Unknown"}: </span>
            <span className="text-text-secondary">{msg.type === "text" ? msg.message : "[attachment]"}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="p-3 border-t border-border-default flex gap-2"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-bg-primary border border-border-default rounded-lg px-3 py-1.5 text-[12px] text-text-primary outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-brand text-black text-[12px] font-medium hover:bg-brand/90 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// ── Participant list sidebar ───────────────────────────────────────────────────

function ParticipantList({ joinedUserIds, batchId }: { joinedUserIds: Set<string>; batchId: string }) {
  const { data: studentsData } = useGetBatchStudents(batchId);
  const students = studentsData?.data?.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-default">
        <p className="text-[13px] font-semibold text-white">Participants ({joinedUserIds.size})</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {students.map((s) => {
          const online = joinedUserIds.has(s.id);
          return (
            <div key={s.id} className="flex items-center gap-2.5 py-1.5">
              <div className={`w-2 h-2 rounded-full ${online ? "bg-success" : "bg-text-muted"}`} />
              <span className="text-[12.5px] text-text-primary truncate">{s.full_name}</span>
              {!online && <span className="text-[10px] text-text-muted ml-auto">Absent</span>}
            </div>
          );
        })}
        {students.length === 0 && (
          <p className="text-text-muted text-xs text-center mt-4">No student data</p>
        )}
      </div>
    </div>
  );
}

// ── Controls bar ─────────────────────────────────────────────────────────────

function ControlBar({
  isMentorOrAdmin,
  meetingId,
  joinedUserIds,
  activeUserIds,
  onEnd,
}: {
  isMentorOrAdmin: boolean;
  meetingId: string;
  joinedUserIds: Set<string>;
  activeUserIds: Set<string>;
  onEnd: () => void;
}) {
  const self = useRealtimeKitSelector((m) => m.self);
  const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);
  const [ending, setEnding] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!self || !roomJoined) return null;

  const toggleAudio = () => self.audio.toggle();
  const toggleVideo = () => self.video.toggle();
  const toggleScreenShare = () => self.screenShare.toggle();

  const handleEndMeeting = async () => {
    setEnding(true);
    try {
      await customFetch(`/meeting/${meetingId}/end`, {
        method: "POST",
        body: JSON.stringify({
          present_participant_ids: Array.from(activeUserIds),
          joined_participant_ids: Array.from(joinedUserIds),
        }),
      });
      onEnd();
    } catch (e) {
      console.error(e);
      alert("Failed to end meeting");
    } finally {
      setEnding(false);
      setConfirmEnd(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-t border-border-default">
      <div className="flex items-center gap-3">
        {/* Mic */}
        <button
          type="button"
          onClick={toggleAudio}
          title={self.audioEnabled ? "Mute" : "Unmute"}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
            self.audioEnabled ? "border-border-default text-text-primary hover:bg-bg-card" : "bg-error/20 border-error/40 text-error"
          }`}
        >
          {self.audioEnabled ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={toggleVideo}
          title={self.videoEnabled ? "Stop video" : "Start video"}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
            self.videoEnabled ? "border-border-default text-text-primary hover:bg-bg-card" : "bg-error/20 border-error/40 text-error"
          }`}
        >
          {self.videoEnabled ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          )}
        </button>

        {/* Screen share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          title="Share screen"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-border-default text-text-primary hover:bg-bg-card transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Leave button (everyone) */}
        <button
          type="button"
          onClick={() => self.leaveRoom?.()}
          className="px-4 py-2 rounded-lg border border-border-default text-text-secondary text-sm hover:bg-bg-card transition-colors"
        >
          Leave
        </button>

        {/* End meeting (mentor/admin only) */}
        {isMentorOrAdmin && (
          confirmEnd ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={ending}
                onClick={handleEndMeeting}
                className="px-4 py-2 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {ending ? "Ending…" : "Confirm end"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className="px-3 py-2 rounded-lg border border-border-default text-text-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmEnd(true)}
              className="px-4 py-2 rounded-lg bg-error/10 border border-error/40 text-error text-sm font-medium hover:bg-error/20 transition-colors"
            >
              End class
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Inner meeting room (needs RealtimeKitProvider context) ────────────────────

function MeetingRoom({
  meetingId,
  batchId,
  isMentorOrAdmin,
}: {
  meetingId: string;
  batchId: string;
  isMentorOrAdmin: boolean;
}) {
  const roomJoined = useRealtimeKitSelector((m) => m.self.roomJoined);
  const { meeting } = useRealtimeKitSelector((m) => m) as any;

  // Track participant join/leave for attendance
  const [joinedUserIds, setJoinedUserIds] = useState<Set<string>>(new Set());
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"chat" | "people">("people");
  const [ended, setEnded] = useState(false);

  // Listen to RTK participant events
  const client = useRealtimeKitSelector((m) => m) as any;

  useEffect(() => {
    if (!client || !roomJoined) return;

    const onJoin = (participant: any) => {
      const uid = participant.userId || participant.customParticipantId;
      if (!uid) return;
      setJoinedUserIds((prev) => new Set([...prev, uid]));
      setActiveUserIds((prev) => new Set([...prev, uid]));
    };

    const onLeave = (participant: any) => {
      const uid = participant.userId || participant.customParticipantId;
      if (!uid) return;
      setActiveUserIds((prev) => { const next = new Set(prev); next.delete(uid); return next; });
    };

    client.on?.("participantJoined", onJoin);
    client.on?.("participantLeft", onLeave);
    return () => {
      client.off?.("participantJoined", onJoin);
      client.off?.("participantLeft", onLeave);
    };
  }, [client, roomJoined]);

  if (ended) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-success">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Class ended</h2>
          <p className="text-text-secondary text-sm">Attendance has been recorded automatically.</p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg bg-brand text-black text-sm font-medium"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-text-primary font-medium text-sm">Live class</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${activeTab === "people" ? "bg-bg-card text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${activeTab === "chat" ? "bg-bg-card text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 p-4 overflow-auto">
          {!roomJoined ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-secondary text-sm">Connecting…</p>
              </div>
            </div>
          ) : (
            <VideoGrid />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 border-l border-border-default bg-bg-secondary flex flex-col">
          {activeTab === "chat" ? (
            <ChatPanel />
          ) : (
            <ParticipantList joinedUserIds={joinedUserIds} batchId={batchId} />
          )}
        </div>
      </div>

      {/* Controls */}
      <ControlBar
        isMentorOrAdmin={isMentorOrAdmin}
        meetingId={meetingId}
        joinedUserIds={joinedUserIds}
        activeUserIds={activeUserIds}
        onEnd={() => setEnded(true)}
      />
    </div>
  );
}

// ── Root page — handles token fetch + RTK init ────────────────────────────────

export default function MeetRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const { data: meetingData, isLoading: meetingLoading } = useGetMeetingByRoomId(roomId);
  const meeting = meetingData?.data?.data;

  const { data: tokenData, isLoading: tokenLoading } = useGetMeetingToken(meeting?.id ?? "", {
    enabled: !!meeting?.id,
  } as any);
  const authToken = tokenData?.data?.data?.authToken;

  const { data: currentUserData } = useGetUser();
  const currentUser = currentUserData?.status === 200 ? currentUserData.data.data : undefined;
  const isMentorOrAdmin = currentUser?.role === "MENTOR" || currentUser?.role === "ADMIN";

  const [client, loadClient] = useRealtimeKitClient();

  useEffect(() => {
    if (!authToken || client) return;
    loadClient({ authToken, defaults: { video: true, audio: true } });
  }, [authToken, client, loadClient]);

  useEffect(() => {
    if (!client || !meeting?.id) return;
    client.joinRoom().catch(console.error);
  }, [client, meeting?.id]);

  if (meetingLoading || tokenLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary text-sm">Loading meeting…</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-muted">Meeting not found.</p>
      </div>
    );
  }

  if (!authToken) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-muted">You do not have access to this meeting.</p>
      </div>
    );
  }

  return (
    <RealtimeKitProvider value={client} fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MeetingRoom
        meetingId={meeting.id}
        batchId={meeting.batch_id}
        isMentorOrAdmin={isMentorOrAdmin}
      />
    </RealtimeKitProvider>
  );
}
