"use client";

import { useMemo, useState } from "react";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import { AttendanceBadge, type AttStatus } from "./AttendanceBadge";
import type { UserDataResponseData } from "@akxr/api";
import {
  useGetUserBatches,
  useGetUserAttendance,
  type BatchWithStats,
  type AttendanceWithMeeting,
} from "@akxr/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SessionState = "done" | "today" | "upcoming";

interface SessionEntry {
  idx: number;
  date: string;
  title: string;
  state: SessionState;
  myAtt: AttStatus | null;
}

interface BatchInfo {
  code: string;
  name: string;
  start: string;
  end: string;
  mentorName: string;
  progress: number;
  totalSessions: number;
  doneSessions: number;
  attendancePct: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

function getMeetingState(
  scheduledStart: string,
  scheduledEnd: string
): SessionState {
  const now = new Date();
  const end = new Date(scheduledEnd);
  const start = new Date(scheduledStart);
  if (end < now) return "done";
  if (start.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

function mapStatus(
  s: "PRESENT" | "PARTIALLY_PRESENT" | "ABSENT"
): AttStatus {
  if (s === "PRESENT") return "present";
  if (s === "PARTIALLY_PRESENT") return "partial";
  return "absent";
}

function deriveSessions(
  batch: BatchWithStats,
  attendanceRecords: AttendanceWithMeeting[]
): SessionEntry[] {
  const attByMeetingId = new Map<string, "PRESENT" | "PARTIALLY_PRESENT" | "ABSENT">();
  attendanceRecords.forEach((rec) => {
    if (rec.meeting && rec.attendance.batch_id === batch.id) {
      attByMeetingId.set(rec.meeting.id, rec.attendance.status);
    }
  });

  return batch.meetings.map((meeting, i) => {
    const state = getMeetingState(
      meeting.scheduled_start_time,
      meeting.scheduled_end_time
    );
    const rawStatus = attByMeetingId.get(meeting.id);
    const myAtt: AttStatus | null =
      state === "done" && rawStatus ? mapStatus(rawStatus) : null;

    return {
      idx: i + 1,
      date: fmtDate(meeting.scheduled_start_time),
      title: meeting.title,
      state,
      myAtt,
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressRing({ pct }: { pct: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <svg width="92" height="92" viewBox="0 0 92 92">
      <circle cx="46" cy="46" r={r} fill="none" stroke="#1a1a1a" strokeWidth="8" />
      <circle
        cx="46" cy="46" r={r} fill="none" stroke="#C9963A" strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        strokeLinecap="round"
        transform="rotate(-90 46 46)"
        style={{ transition: "stroke-dashoffset .6s ease" }}
      />
      <text x="46" y="51" textAnchor="middle" fontSize="20" fontWeight="600" fill="#fafafa">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2 text-text-muted">
        <div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <span className="text-[13px]">Loading your dashboard…</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OverviewScreen
// ---------------------------------------------------------------------------

interface OverviewScreenProps {
  firstName: string;
  batchInfo: BatchInfo | null;
  sessions: SessionEntry[];
  isLoading: boolean;
  onOpenBatch: () => void;
}

function OverviewScreen({
  firstName,
  batchInfo,
  sessions,
  isLoading,
  onOpenBatch,
}: OverviewScreenProps) {
  if (isLoading) return <LoadingState />;

  const todaySession = sessions.find((s) => s.state === "today");
  const upcomingPreview = sessions
    .filter((s) => s.state === "today" || s.state === "upcoming")
    .slice(0, 4);

  const attPct = batchInfo ? Math.round(batchInfo.attendancePct * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Hero row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        {/* Greeting card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-border-strong text-text-muted bg-bg-elevated">
              SESSION {batchInfo?.doneSessions ?? "—"}/{batchInfo?.totalSessions ?? "—"}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-border-strong text-text-muted bg-bg-elevated">
              {attPct}% ATTENDANCE
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">
            {batchInfo?.code ?? "—"}
          </p>
          <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white leading-tight mb-1">
            Good morning, {firstName}.
          </h1>
          <p className="text-[13.5px] text-text-secondary mb-6">
            {todaySession
              ? `Session ${todaySession.idx} of ${batchInfo?.totalSessions ?? "—"} is live now. You're on track — keep it up.`
              : batchInfo
              ? `${batchInfo.doneSessions} of ${batchInfo.totalSessions} sessions completed. Keep it up.`
              : "Welcome to your dashboard."}
          </p>
          <div className="flex items-center gap-3">
            {todaySession && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Join live session
              </button>
            )}
            <button
              type="button"
              onClick={onOpenBatch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
            >
              Open my batch
            </button>
          </div>
        </div>

        {/* Progress card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg p-5 flex flex-col">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-3">
            Course progress
          </p>
          <p className="text-[13px] text-text-secondary mb-4 leading-snug">
            {batchInfo?.name ?? "—"}
          </p>
          <div className="flex-1 flex items-center justify-center">
            <ProgressRing pct={batchInfo ? Math.round(batchInfo.progress * 100) : 0} />
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Sessions done</span>
              <span className="text-text-primary font-medium">
                {batchInfo?.doneSessions ?? "—"}/{batchInfo?.totalSessions ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Mentor</span>
              <span className="text-text-primary font-medium">
                {batchInfo?.mentorName.split(" ")[0] ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Attendance" value={`${attPct}%`} sub="term attendance" positive={attPct >= 75} />
        <StatCard label="Sessions done" value={batchInfo?.doneSessions ?? "—"} sub={`of ${batchInfo?.totalSessions ?? "—"} total`} />
        <StatCard label="Mentor" value={batchInfo?.mentorName.split(" ")[0] ?? "—"} sub={batchInfo?.mentorName ?? "—"} />
        <StatCard label="Batch" value={batchInfo?.code ?? "—"} sub={batchInfo ? `${batchInfo.start} – ${batchInfo.end}` : "—"} />
      </div>

      {/* Batch row + Upcoming */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Batch card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg">
          <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <p className="text-[13px] font-semibold text-white">My batch</p>
            <button
              type="button"
              onClick={onOpenBatch}
              className="text-[11.5px] text-text-muted hover:text-text-secondary transition-colors"
            >
              View details →
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-[11px] text-brand font-medium">{batchInfo?.code ?? "—"}</p>
                <p className="text-[13px] text-text-primary mt-0.5">{batchInfo?.name ?? "—"}</p>
                <p className="text-[11.5px] text-text-muted mt-0.5">
                  {batchInfo ? `${batchInfo.start} – ${batchInfo.end} · ${batchInfo.mentorName}` : "—"}
                </p>
              </div>
              {todaySession && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-elevated border border-border-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] text-success font-medium">Live now</span>
                </div>
              )}
            </div>
            {batchInfo && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-secondary">{Math.round(batchInfo.progress * 100)}%</span>
                </div>
                <ProgressBar value={batchInfo.progress * 100} accent />
              </div>
            )}
          </div>
        </div>

        {/* Upcoming card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Upcoming</p>
          </div>
          <div className="p-3 space-y-1">
            {upcomingPreview.length === 0 ? (
              <p className="px-2 py-4 text-[12px] text-text-muted text-center">No upcoming sessions.</p>
            ) : (
              upcomingPreview.map((session) => (
                <div
                  key={session.idx}
                  className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-bg-elevated transition-colors"
                >
                  <div className="w-8 text-center flex-shrink-0">
                    <p className="font-mono text-[9px] text-text-muted">{session.date.split(" ")[0].toUpperCase()}</p>
                    <p className="text-[12px] font-semibold text-text-primary">{session.date.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-text-secondary leading-snug truncate">{session.title}</p>
                    {session.state === "today" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-brand font-medium mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
                        Live now
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BatchDetailScreen
// ---------------------------------------------------------------------------

interface BatchDetailScreenProps {
  batchInfo: BatchInfo | null;
  sessions: SessionEntry[];
  onBack: () => void;
}

function BatchDetailScreen({ batchInfo, sessions, onBack }: BatchDetailScreenProps) {
  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-secondary transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to overview
        </button>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
              {batchInfo?.code ?? "—"} · {batchInfo?.mentorName ?? "—"}
            </p>
            <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">
              {batchInfo?.name ?? "My batch"}
            </h2>
            <p className="text-[13px] text-text-muted mt-0.5">
              {batchInfo ? `${batchInfo.start} – ${batchInfo.end}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Sessions"
          value={batchInfo ? `${batchInfo.doneSessions}/${batchInfo.totalSessions}` : "—"}
          sub="completed"
        />
        <StatCard
          label="My attendance"
          value={batchInfo ? `${Math.round(batchInfo.attendancePct * 100)}%` : "—"}
          sub="term attendance"
          positive={(batchInfo?.attendancePct ?? 0) >= 0.75}
        />
        <StatCard
          label="Mentor"
          value={batchInfo?.mentorName.split(" ")[0] ?? "—"}
          sub={batchInfo?.mentorName ?? "—"}
        />
      </div>

      {/* Session log table */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Session log</p>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-[13px]">No sessions yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left w-10">#</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Date</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Topic</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Attendance</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => (
                <tr
                  key={session.idx}
                  className={`border-b border-border-default transition-colors ${i === sessions.length - 1 ? "border-b-0" : ""} ${session.state === "today" ? "bg-brand-subtle hover:bg-brand-muted" : "hover:bg-bg-primary"}`}
                >
                  <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted">{session.idx}</td>
                  <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted whitespace-nowrap">{session.date}</td>
                  <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{session.title}</td>
                  <td className="px-3.5 py-3">
                    {session.state === "done" && session.myAtt ? (
                      <AttendanceBadge status={session.myAtt} />
                    ) : session.state === "today" ? (
                      <AttendanceBadge status="live" />
                    ) : (
                      <span className="text-text-muted text-[12px]">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3">
                    {session.state === "today" ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11.5px] font-medium border border-brand text-brand hover:bg-brand hover:text-text-inverted transition-all"
                      >
                        Join
                      </button>
                    ) : (
                      <span className="text-text-muted text-[12px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface StudentDashboardProps {
  user: UserDataResponseData;
}

const STUDENT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "batch", label: "My batch" },
];

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const firstName = user.full_name.split(" ")[0];

  const { data: batchRes, isLoading: batchLoading } = useGetUserBatches();
  const { data: attRes, isLoading: attLoading } = useGetUserAttendance();

  const batches: BatchWithStats[] = batchRes?.data?.data ?? [];
  const attendanceRecords: AttendanceWithMeeting[] = attRes?.data?.data ?? [];

  const batch = batches[0] ?? null;

  const sessions = useMemo(
    () => (batch ? deriveSessions(batch, attendanceRecords) : []),
    [batch, attendanceRecords]
  );

  const batchInfo = useMemo<BatchInfo | null>(() => {
    if (!batch) return null;
    const doneSessions = sessions.filter((s) => s.state === "done").length;
    const totalSessions = sessions.length;
    const progress = totalSessions > 0 ? doneSessions / totalSessions : 0;

    const pastWithAtt = sessions.filter((s) => s.state === "done" && s.myAtt !== null);
    const presentCount = pastWithAtt.filter((s) => s.myAtt === "present").length;
    const partialCount = pastWithAtt.filter((s) => s.myAtt === "partial").length;
    const attendancePct =
      pastWithAtt.length > 0
        ? (presentCount + partialCount * 0.5) / pastWithAtt.length
        : 0;

    return {
      code: batch.batch_code,
      name: batch.batch_name,
      start: fmtDate(batch.batch_start_date),
      end: fmtDate(batch.batch_end_date),
      mentorName: batch.mentor_names[0] ?? "TBD",
      progress,
      totalSessions,
      doneSessions,
      attendancePct,
    };
  }, [batch, sessions]);

  const isLoading = batchLoading || attLoading;

  return (
    <AppShell
      role="STUDENT"
      userName={user.full_name}
      tabs={STUDENT_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "overview" && (
        <OverviewScreen
          firstName={firstName}
          batchInfo={batchInfo}
          sessions={sessions}
          isLoading={isLoading}
          onOpenBatch={() => setActiveTab("batch")}
        />
      )}
      {activeTab === "batch" && (
        <BatchDetailScreen
          batchInfo={batchInfo}
          sessions={sessions}
          onBack={() => setActiveTab("overview")}
        />
      )}
    </AppShell>
  );
}
