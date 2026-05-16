"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useGetUser,
  useGetUserAttendance,
  useGetUserBatches,
  type AttendanceWithMeeting,
  type BatchWithStats,
} from "@akxr/api";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyHint, fmtDate, fmtDateTime, LmsLayout, Panel, StatTile } from "@/components/lms/LmsLayout";

type StudentTab = "home" | "course";

type SessionState = "done" | "today" | "upcoming";

interface SessionView {
  id: string;
  title: string;
  date: string;
  dateTime: string;
  durationLabel: string;
  state: SessionState;
  attendance: "PRESENT" | "PARTIALLY_PRESENT" | "ABSENT" | null;
  description: string;
}

const EMPTY_BATCHES: BatchWithStats[] = [];
const EMPTY_ATTENDANCE: AttendanceWithMeeting[] = [];

function deriveSessionState(startIso: string, minutes: number): SessionState {
  const now = new Date();
  const start = new Date(startIso);
  const end = new Date(start.getTime() + minutes * 60_000);
  if (end < now) return "done";
  if (start.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LMSStudent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<StudentTab>("home");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data: userRes, isLoading: userLoading } = useGetUser();
  const { data: batchesRes, isLoading: batchLoading } = useGetUserBatches();
  const { data: attendanceRes, isLoading: attendanceLoading } = useGetUserAttendance();

  const user = userRes?.status === 200 ? userRes.data.data : null;

  useEffect(() => {
    if (userLoading) return;
    if (!user || user.role !== "STUDENT") router.push("/");
  }, [user, userLoading, router]);

  const batches: BatchWithStats[] = batchesRes?.data?.data ?? EMPTY_BATCHES;
  const attendanceRecords: AttendanceWithMeeting[] = attendanceRes?.data?.data ?? EMPTY_ATTENDANCE;
  const selectedBatchId = searchParams.get("batch");
  const batch =
    (selectedBatchId ? batches.find((item) => item.id === selectedBatchId) : undefined) ??
    batches[0] ??
    null;

  const sessions = useMemo<SessionView[]>(() => {
    if (!batch) return [];
    const attByMeeting = new Map<string, "PRESENT" | "PARTIALLY_PRESENT" | "ABSENT">();
    for (const record of attendanceRecords) {
      if (record.meeting && record.attendance.batch_id === batch.id) {
        attByMeeting.set(record.meeting.id, record.attendance.status);
      }
    }

    return [...batch.meetings]
      .sort(
        (a, b) =>
          new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime(),
      )
      .map((meeting) => {
        const minutes = Math.max(
          1,
          Math.round(
            (new Date(meeting.scheduled_end_time).getTime() -
              new Date(meeting.scheduled_start_time).getTime()) /
              60_000,
          ),
        );

        return {
          id: meeting.id,
          title: meeting.title,
          date: fmtDate(meeting.scheduled_start_time),
          dateTime: fmtDateTime(meeting.scheduled_start_time),
          durationLabel: durationLabel(minutes),
          state: deriveSessionState(meeting.scheduled_start_time, minutes),
          attendance: attByMeeting.get(meeting.id) ?? null,
          description: meeting.description || "No lecture notes shared for this session yet.",
        };
      });
  }, [attendanceRecords, batch]);

  const resumeSession =
    sessions.find((s) => s.state === "today") ??
    sessions.find((s) => s.state === "upcoming") ??
    sessions[sessions.length - 1] ??
    null;
  const effectiveActiveSessionId = activeSessionId ?? resumeSession?.id ?? null;
  const activeSession = sessions.find((s) => s.id === effectiveActiveSessionId) ?? sessions[0] ?? null;
  const doneCount = sessions.filter((s) => s.state === "done").length;
  const progress = sessions.length > 0 ? doneCount / sessions.length : 0;
  const attendanceRows = sessions.filter((s) => s.state === "done" && s.attendance !== null);
  const attendanceScore =
    attendanceRows.length === 0
      ? 0
      : attendanceRows.reduce((acc, session) => {
          if (session.attendance === "PRESENT") return acc + 1;
          if (session.attendance === "PARTIALLY_PRESENT") return acc + 0.5;
          return acc;
        }, 0) / attendanceRows.length;
  const firstName = user?.full_name.split(" ")[0] ?? "there";
  const loading = userLoading || batchLoading || attendanceLoading;

  if (!user || user.role !== "STUDENT") return null;

  return (
    <LmsLayout
      role="STUDENT"
      heading={`Welcome back, ${firstName}.`}
      subtitle="Track your batch progress, continue sessions, and review your attendance from one place."
      userName={user.full_name}
      tabs={[
        { id: "home", label: "My batch" },
        { id: "course", label: "Session player" },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as StudentTab)}
    >
      {loading ? (
        <div className="h-[45vh] flex items-center justify-center text-text-muted text-[13px]">Loading LMS workspace…</div>
      ) : !batch ? (
        <Panel title="No batch assigned yet">
          <EmptyHint text="You are not assigned to a batch yet. Once admin adds you, your LMS timeline will appear here." />
        </Panel>
      ) : activeTab === "home" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            <StatTile label="Batch" value={batch.batch_code} sub={batch.batch_name} />
            <StatTile label="Progress" value={`${Math.round(progress * 100)}%`} sub={`${doneCount}/${sessions.length} sessions done`} />
            <StatTile label="Attendance" value={`${Math.round(attendanceScore * 100)}%`} sub={`${attendanceRows.length} recorded sessions`} />
            <StatTile label="Mentor" value={batch.mentor_names[0] ?? "TBD"} sub={`${fmtDate(batch.batch_start_date)} → ${fmtDate(batch.batch_end_date)}`} />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
            <Panel title="Continue learning" sub={`Batch ${batch.batch_code} · ${batch.batch_name}`}>
              <div className="p-5">
                {activeSession ? (
                  <div className="bg-bg-primary border border-border-default rounded-lg p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">Next session</p>
                    <h2 className="text-[24px] text-white font-semibold tracking-[-0.02em] mt-2">{activeSession.title}</h2>
                    <p className="text-[12.5px] text-text-muted mt-2">
                      {activeSession.dateTime} · {activeSession.durationLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("course")}
                      className="mt-5 px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                      style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
                    >
                      Resume in player
                    </button>
                  </div>
                ) : (
                  <EmptyHint text="No sessions available in this batch yet." />
                )}
              </div>
            </Panel>

            <Panel title="Upcoming sessions" sub="Next 5 on your timeline">
              <div className="p-3 space-y-1">
                {sessions.filter((s) => s.state !== "done").slice(0, 5).length === 0 ? (
                  <EmptyHint text="No upcoming sessions." />
                ) : (
                  sessions
                    .filter((s) => s.state !== "done")
                    .slice(0, 5)
                    .map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setActiveTab("course");
                        }}
                        className="w-full text-left px-3 py-2 rounded-md border border-transparent hover:border-border-default hover:bg-bg-primary transition-colors"
                      >
                        <p className="text-[12px] text-text-secondary truncate">{session.title}</p>
                        <p className="text-[10.5px] text-text-muted mt-1">
                          {session.dateTime} · {session.durationLabel}
                        </p>
                      </button>
                    ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "320px 1fr" }}>
          <Panel title={batch.batch_name} sub={`Batch ${batch.batch_code} · Mentor ${batch.mentor_names[0] ?? "TBD"}`}>
            <div className="p-2 space-y-1 max-h-[70vh] overflow-auto">
              {sessions.length === 0 ? (
                <EmptyHint text="No sessions yet." />
              ) : (
                sessions.map((session, idx) => {
                  const selected = session.id === activeSession?.id;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setActiveSessionId(session.id)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                        selected
                          ? "bg-bg-primary border-brand"
                          : "bg-transparent border-transparent hover:border-border-default hover:bg-bg-primary"
                      }`}
                    >
                      <p className="font-mono text-[10px] text-text-muted">Session {idx + 1}</p>
                      <p className={`text-[12.5px] mt-1 truncate ${selected ? "text-white" : "text-text-secondary"}`}>
                        {session.title}
                      </p>
                      <p className="text-[10.5px] text-text-muted mt-1">
                        {session.date} · {session.durationLabel}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title={activeSession?.title ?? "Select a session"} sub={activeSession ? `${activeSession.dateTime} · ${activeSession.durationLabel}` : undefined}>
              <div className="p-4">
                <div className="aspect-video border border-border-default rounded-lg bg-bg-primary flex items-center justify-center">
                  <span className="text-[12px] text-text-muted">
                    {activeSession ? "Video player integration placeholder" : "No session selected"}
                  </span>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-4">
              <Panel title="Notes" sub="Session summary">
                <div className="p-4 text-[13px] text-text-secondary leading-6 min-h-[170px]">
                  {activeSession?.description ?? "Select a session to view notes."}
                </div>
              </Panel>
              <Panel title="My attendance" sub="For this session">
                <div className="p-4 min-h-[170px]">
                  {activeSession?.attendance ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-border-default bg-bg-primary text-text-secondary">
                      {activeSession.attendance}
                    </span>
                  ) : (
                    <p className="text-[12.5px] text-text-muted">Attendance will appear once this session is completed.</p>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}
    </LmsLayout>
  );
}
