"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import type { UserDataResponseData } from "@akxr/api";
import {
  useGetMentorBatches,
  useGetMeeting,
  useGetMeetingIdAttendance,
  useGetBatchRequestsMy,
  usePostBatchRequests,
  getMentorBatchesQueryKey,
  type MentorBatch
} from "@akxr/api";
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
  onClose: () => void;
}

function ChangeModal({ batchCode, onClose }: ChangeModalProps) {
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
  const [showModal, setShowModal] = useState(false);

  const totalStudents = batches.reduce((acc, b) => acc + b.student_count, 0);
  const avgAtt = batches.length > 0
    ? Math.round(batches.reduce((acc, b) => acc + b.avg_attendance_pct, 0) / batches.length)
    : 0;

  const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';

  const firstBatch = batches[0];

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
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
                      >
                        View
                      </button>
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
                Today · {firstBatch.batch_code}
              </p>
              <h3 className="text-[16px] font-semibold text-white">{firstBatch.batch_name}</h3>
              <p className="text-[12.5px] text-text-muted mt-0.5">
                {firstBatch.student_count} students · {firstBatch.meetings_count} sessions total
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-elevated border border-border-default">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
              <span className="text-[11px] text-error font-medium">Not started</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
            >
              Request date change
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
            >
              Start now
            </button>
          </div>
        </div>
      )}

      {showModal && firstBatch && (
        <ChangeModal batchCode={firstBatch.batch_code} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function AttendanceScreen() {
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeeting();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meetings: any[] = (meetingsRes as any)?.data?.data || [];
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");

  const { data: attendanceRes, isLoading: attendanceLoading } = useGetMeetingIdAttendance(
    selectedMeetingId,
    { query: { enabled: !!selectedMeetingId } }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attendanceData: any = (attendanceRes as any)?.data?.data;

  // Set default selected meeting once loaded
  if (meetings.length > 0 && !selectedMeetingId) {
    setSelectedMeetingId(meetings[0].id);
  }

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

function RequestsScreen() {
  const [showModal, setShowModal] = useState(false);
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
          onClick={() => setShowModal(true)}
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
        <ChangeModal batchCode="" onClose={() => setShowModal(false)} />
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
      {activeTab === 'attendance' && <AttendanceScreen />}
      {activeTab === 'requests'   && <RequestsScreen />}
    </AppShell>
  );
}
