"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import type { UserDataResponseData } from "@akxr/api";
import {
  useGetMentorBatches,
  useGetMeetingIdAttendance,
  useGetBatchRequestsMy,
  usePostBatchRequests,
  getBatchIdMeetings,
  getGetBatchIdMeetingsQueryKey,
  type MentorBatch
} from "@akxr/api";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getGetBatchRequestsMyQueryKey } from "@akxr/api";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type RequestStatus = 'pending' | 'approved' | 'rejected';

const requestStatusConfig: Record<RequestStatus, { bg: string; text: string; border: string; label: string }> = {
  pending:  { bg: 'rgba(201,150,58,0.10)',  text: '#C9963A', border: 'rgba(201,150,58,0.2)',  label: 'Pending'  },
  approved: { bg: 'rgba(34,197,94,0.12)',   text: '#22C55E', border: 'rgba(34,197,94,0.2)',   label: 'Approved' },
  rejected: { bg: 'rgba(197,34,34,0.14)',   text: '#C52222', border: 'rgba(197,34,34,0.2)',   label: 'Rejected' },
};

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const cfg = requestStatusConfig[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.06em] border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

// Request change modal
type ChangeType = 'date' | 'reschedule' | 'size';

interface ChangeModalProps {
  batchCode: string;
  currentEndDate?: string | null;
  onClose: () => void;
}

function ChangeModal({ batchCode, currentEndDate, onClose }: ChangeModalProps) {
  const [changeType, setChangeType] = useState<ChangeType>('date');
  const [reason, setReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  
  const queryClient = useQueryClient();
  const { mutateAsync: createRequest } = usePostBatchRequests();

  const handleSubmit = async () => {
    try {
      await createRequest({
        data: {
          batch_code: batchCode,
          change_type: changeType,
          reason,
          proposed_value: changeType === 'date' ? proposedDate : undefined
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetBatchRequestsMyQueryKey() });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to submit request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-md mx-4 shadow-2xl">
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-white">Change batch {batchCode}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-2">
              What needs to change?
            </label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as ChangeType)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
            >
              <option value="date">Push end date</option>
              <option value="reschedule">Reschedule a session</option>
              <option value="size">Adjust batch size</option>
            </select>
          </div>

          {changeType === 'date' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-2">
                  Current end date
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentEndDate ? new Date(currentEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  className="w-full bg-bg-elevated border border-border-default rounded-md px-3 py-2 text-[13px] text-text-muted"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-2">
                  Proposed end date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain why this change is needed..."
              rows={3}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors resize-none"
            />
          </div>

          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border border-border-default bg-bg-elevated">
            <svg width="14" height="14" className="text-text-muted flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className="text-[11.5px] text-text-muted leading-snug">
              Change requests are reviewed by admins within 24 hours. You&apos;ll get notified on Zulip.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border-default flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function BatchesScreen({ firstName, batches, isLoading }: { firstName: string; batches: MentorBatch[]; isLoading: boolean }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // GET /meeting is admin-only — fetch per-batch instead (mentor has access to GET /batch/:id/meetings)
  const meetingQueries = useQueries({
    queries: batches.map((b) => ({
      queryKey: getGetBatchIdMeetingsQueryKey(b.id),
      queryFn: () => getBatchIdMeetings(b.id),
    })),
  });

  const totalStudents = batches.reduce((acc, b) => acc + b.student_count, 0);
  const avgAtt = batches.length > 0
    ? Math.round(batches.reduce((acc, b) => acc + b.avg_attendance_pct, 0) / batches.length)
    : 0;

  const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';

  const batchNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of batches) map.set(b.id, b.batch_name);
    return map;
  }, [batches]);

  const scheduledClasses = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = meetingQueries.flatMap((q) => (q.data as any)?.data?.data ?? []);
    if (!raw.length) return [];
    const now = new Date();
    return raw
      .filter((m) => m.status !== 'ENDED' && m.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime())
      .map((m) => {
        const start = new Date(m.scheduled_start_time);
        const end = m.scheduled_end_time
          ? new Date(m.scheduled_end_time)
          : new Date(start.getTime() + ((m.duration_minutes as number) || 60) * 60_000);
        const isLive = m.status === 'STARTED' || (start <= now && end > now);
        let timeRemaining: string | undefined;
        if (!isLive && start > now) {
          const diff = start.getTime() - now.getTime();
          const hrs = Math.floor(diff / 3_600_000);
          const mins = Math.floor((diff % 3_600_000) / 60_000);
          timeRemaining = hrs > 0 ? `${hrs}hr ${mins}min` : `${mins}min`;
        }
        const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return {
          id: m.id as string,
          rtkRoomId: (m.realtime_kit_room_id as string | undefined) ?? '',
          title: (m.title as string) || 'Untitled',
          batchId: m.batch_id as string,
          batchName: batchNameMap.get(m.batch_id) ?? 'Unknown Batch',
          time: `${fmt(start)} – ${fmt(end)}`,
          isLive,
          timeRemaining,
        };
      });
  }, [meetingQueries, batchNameMap]);

  const firstBatch = batches[0];
  const liveClass = scheduledClasses.find((c) => c.isLive);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-text-muted">
          <div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <span className="text-[13px]">Loading your batches…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white">
          Hey, {firstName}.
        </h1>
        <p className="text-text-secondary text-[14px] mt-0.5">
          {batches.length} active {batches.length === 1 ? 'batch' : 'batches'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active batches" value={batches.length} sub="this term" />
        <StatCard label="Total students" value={totalStudents} sub="across all batches" />
        <StatCard label="Avg attendance" value={`${avgAtt}%`} sub="term average" positive={avgAtt >= 75} />
      </div>

      {/* Scheduled classes */}
      {scheduledClasses.length > 0 && (
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Scheduled classes</p>
          </div>
          <div className="divide-y divide-border-default">
            {scheduledClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-text-primary font-medium truncate">{cls.title}</span>
                    {cls.isLive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-medium shrink-0">
                        <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-text-muted mt-0.5">
                    {cls.batchName} · {cls.time}
                  </p>
                </div>
                <div className="ml-4 shrink-0">
                  {cls.isLive && cls.rtkRoomId ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/meet/${cls.rtkRoomId}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-brand text-text-inverted transition-all duration-150"
                      style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Join now
                    </button>
                  ) : cls.rtkRoomId ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/meet/${cls.rtkRoomId}`)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
                    >
                      {cls.timeRemaining ? `In ${cls.timeRemaining}` : 'Join'}
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[12px] font-medium border border-border-default text-text-muted font-mono">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">My batches</p>
        </div>
        {batches.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-[13px]">No batches assigned yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Code</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Name</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Schedule</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Size</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Progress</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Avg att.</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, i) => {
                const progress = batch.meetings_count > 0
                  ? (batch.completed_meetings_count / batch.meetings_count) * 100
                  : 0;
                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-bg-primary transition-colors ${i < batches.length - 1 ? 'border-b border-border-default' : ''}`}
                  >
                    <td className="px-3.5 py-3 font-mono text-[11px] text-brand font-medium">{batch.batch_code}</td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.batch_name}</td>
                    <td className="px-3.5 py-3 text-[12px] text-text-muted font-mono">
                      {fmtDate(batch.batch_start_date)}–{fmtDate(batch.batch_end_date)}
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.student_count}</td>
                    <td className="px-3.5 py-3 min-w-[100px]">
                      <div className="space-y-1">
                        <ProgressBar value={progress} accent />
                        <p className="text-[10px] text-text-muted font-mono">{Math.round(progress)}%</p>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{Math.round(batch.avg_attendance_pct)}%</td>
                    <td className="px-3.5 py-3">
                      <span className="font-mono text-[11px] text-text-muted">{batch.batch_code}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {firstBatch && (
        <div className="bg-bg-secondary border border-border-default rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">
                {liveClass ? `Live now · ${liveClass.batchName}` : `Today · ${firstBatch.batch_code}`}
              </p>
              <h3 className="text-[16px] font-semibold text-white">
                {liveClass ? liveClass.title : firstBatch.batch_name}
              </h3>
              <p className="text-[12.5px] text-text-muted mt-0.5">
                {liveClass ? liveClass.time : `${firstBatch.student_count} students · ${firstBatch.meetings_count} sessions total`}
              </p>
            </div>
            {liveClass ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-success font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-elevated border border-border-default">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-[11px] text-error font-medium">Not started</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowChangeModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
            >
              Request date change
            </button>
            <button
              type="button"
              onClick={() => liveClass?.rtkRoomId
                ? router.push(`/meet/${liveClass.rtkRoomId}`)
                : undefined
              }
              disabled={!liveClass?.rtkRoomId}
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
            >
              {liveClass ? 'Join now' : 'No live session'}
            </button>
          </div>
        </div>
      )}

      {showModal && firstBatch && (
        <ChangeModal
          batchCode={firstBatch.batch_code}
          currentEndDate={firstBatch.batch_end_date}
          onClose={() => setShowModal(false)}
        />
      )}
      {showChangeModal && firstBatch && (
        <ChangeModal
          batchCode={firstBatch.batch_code}
          currentEndDate={firstBatch.batch_end_date}
          onClose={() => setShowChangeModal(false)}
        />
      )}
    </div>
  );
}

function AttendanceScreen({ batches }: { batches: MentorBatch[] }) {
  const meetingQueries = useQueries({
    queries: batches.map((b) => ({
      queryKey: getGetBatchIdMeetingsQueryKey(b.id),
      queryFn: () => getBatchIdMeetings(b.id),
    })),
  });
  const meetingsLoading = meetingQueries.some((q) => q.isLoading);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meetings: any[] = meetingQueries.flatMap((q) => (q.data as any)?.data?.data ?? []);

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");

  useEffect(() => {
    if (meetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  const { data: attendanceRes, isLoading: attendanceLoading } = useGetMeetingIdAttendance(
    selectedMeetingId,
    { query: { enabled: !!selectedMeetingId } }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attendanceData: any = (attendanceRes as any)?.data?.data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Mark attendance</h2>
          <p className="text-text-muted text-[13px] mt-0.5">Session roster for your batches</p>
        </div>
        {meetings.length > 0 && (
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({new Date(m.scheduled_start_time).toLocaleDateString()})
              </option>
            ))}
          </select>
        )}
      </div>

      {meetingsLoading ? (
        <div className="flex justify-center p-8 text-text-muted">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="bg-bg-secondary border border-border-default rounded-lg p-12 flex flex-col items-center justify-center text-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[13px] text-text-muted">
            No meetings available.
          </p>
        </div>
      ) : attendanceLoading ? (
        <div className="flex justify-center p-8 text-text-muted">Loading attendance...</div>
      ) : attendanceData ? (
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Attendees</p>
          </div>
          {attendanceData.attendees?.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px]">No attendees recorded yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Student</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Status</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Time in Meeting</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {attendanceData.attendees.map((attendee: any, i: number) => (
                  <tr key={attendee.user_id} className={`hover:bg-bg-primary transition-colors ${i < attendanceData.attendees.length - 1 ? 'border-b border-border-default' : ''}`}>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{attendee.username}</td>
                    <td className="px-3.5 py-3 text-[12.5px]">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono ${attendee.status === 'PRESENT' ? 'bg-green-500/10 text-green-500' : attendee.status === 'ABSENT' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {attendee.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-muted">{Math.round((attendee.total_time_seconds || 0) / 60)} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-text-muted">Failed to load attendance.</div>
      )}
    </div>
  );
}

function RequestsScreen({ batches }: { batches: MentorBatch[] }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<MentorBatch | null>(null);
  const { data: requestsRes, isLoading } = useGetBatchRequestsMy();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests = (requestsRes?.data as any)?.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Batch change requests</h2>
          <p className="text-text-muted text-[13px] mt-0.5">All requests you&apos;ve submitted</p>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedBatch(batches[0] ?? null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New request
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-text-muted">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-bg-secondary border border-border-default rounded-lg p-12 flex flex-col items-center justify-center text-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
            <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[13px] text-text-muted">No requests submitted yet.</p>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Batch Code</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Type</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Reason</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {requests.map((req: any, i: number) => (
                <tr key={req.id} className={`hover:bg-bg-primary transition-colors ${i < requests.length - 1 ? 'border-b border-border-default' : ''}`}>
                  <td className="px-3.5 py-3 text-[12.5px] text-brand font-mono">{req.batch_code}</td>
                  <td className="px-3.5 py-3 text-[12.5px] text-text-primary capitalize">{req.change_type}</td>
                  <td className="px-3.5 py-3 text-[12.5px] text-text-muted truncate max-w-xs">{req.reason}</td>
                  <td className="px-3.5 py-3">
                    <RequestStatusBadge status={req.status as RequestStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ChangeModal
          batchCode={selectedBatch?.batch_code ?? ""}
          currentEndDate={selectedBatch?.batch_end_date}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MentorDashboardProps {
  user: UserDataResponseData;
}

const MENTOR_TABS = [
  { id: 'batches',    label: 'My batches' },
  { id: 'attendance', label: 'Mark attendance' },
  { id: 'requests',   label: 'Requests' },
];

export function MentorDashboard({ user }: MentorDashboardProps) {
  const [activeTab, setActiveTab] = useState('batches');
  const firstName = user.full_name.split(' ')[0];

  const { data: batchRes, isLoading } = useGetMentorBatches();
  const batches: MentorBatch[] = batchRes?.data?.data ?? [];

  return (
    <AppShell
      role="MENTOR"
      userName={user.full_name}
      tabs={MENTOR_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'batches'    && <BatchesScreen firstName={firstName} batches={batches} isLoading={isLoading} />}
      {activeTab === 'attendance' && <AttendanceScreen batches={batches} />}
      {activeTab === 'requests'   && <RequestsScreen batches={batches} />}
    </AppShell>
  );
}
