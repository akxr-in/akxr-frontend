"use client";

import { useState } from "react";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import { AttendanceBadge, type AttStatus } from "./AttendanceBadge";
import { Avatar } from "./Avatar";
import type { UserDataResponseData } from "@akxr/api";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_MENTOR = { name: 'Karthik Ramaswamy', expertise: 'Systems & DSA' };

interface MockBatch {
  id: string;
  code: string;
  course: string;
  start: string;
  end: string;
  size: number;
  progress: number;
  avgAtt: number;
}

const MOCK_MENTOR_BATCHES: MockBatch[] = [
  { id: 'b1', code: 'DSA-26-A', course: 'Data Structures & Algorithms', start: 'Jan 14', end: 'Apr 22', size: 28, progress: 0.62, avgAtt: 0.84 },
  { id: 'b2', code: 'DSA-26-B', course: 'Data Structures & Algorithms', start: 'Feb 04', end: 'May 13', size: 30, progress: 0.41, avgAtt: 0.78 },
];

interface RosterEntry {
  id: string;
  name: string;
  termAtt: number;
  mark: AttStatus;
}

const MOCK_ROSTER: RosterEntry[] = [
  { id: 's1',  name: 'Aanya Kapoor',     termAtt: 0.92, mark: 'present' },
  { id: 's2',  name: 'Rohan Iyer',        termAtt: 0.78, mark: 'present' },
  { id: 's3',  name: 'Diya Sharma',       termAtt: 0.96, mark: 'present' },
  { id: 's4',  name: 'Arjun Mehta',       termAtt: 0.61, mark: 'absent'  },
  { id: 's5',  name: 'Kavya Reddy',       termAtt: 0.84, mark: 'present' },
  { id: 's6',  name: 'Ishaan Verma',      termAtt: 0.73, mark: 'partial' },
  { id: 's7',  name: 'Meera Nair',        termAtt: 0.89, mark: 'present' },
  { id: 's8',  name: 'Vihaan Joshi',      termAtt: 0.45, mark: 'absent'  },
  { id: 's9',  name: 'Saanvi Bhat',       termAtt: 0.88, mark: 'present' },
  { id: 's10', name: 'Reyansh Pillai',    termAtt: 0.81, mark: 'present' },
  { id: 's11', name: 'Anika Banerjee',    termAtt: 0.93, mark: 'present' },
  { id: 's12', name: 'Aarav Choudhury',   termAtt: 0.68, mark: 'partial' },
];

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface MockRequest {
  id: number;
  title: string;
  status: RequestStatus;
  ago: string;
  reason: string;
}

const MOCK_REQUESTS: MockRequest[] = [
  { id: 1, title: 'Move DSA-26-A end-date to Apr 29', status: 'pending',  ago: '32m ago', reason: 'Two sessions slipped due to public holidays.' },
  { id: 2, title: 'Swap mentor for Session 12',        status: 'approved', ago: '2d ago',  reason: 'Travel conflict on Feb 20.' },
  { id: 3, title: 'Extend WEB-26-A by 1 week',         status: 'rejected', ago: '5d ago',  reason: 'Curriculum buffer not exhausted.' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

// MarkPicker: segmented control for attendance
type MarkOption = Extract<AttStatus, 'present' | 'partial' | 'absent'>;

interface MarkPickerProps {
  value: MarkOption;
  onChange: (v: MarkOption) => void;
}

const markColors: Record<MarkOption, { active: string; activeBorder: string; activeText: string }> = {
  present: { active: 'rgba(34,197,94,0.15)',  activeBorder: 'rgba(34,197,94,0.35)',  activeText: '#22C55E' },
  partial: { active: 'rgba(201,150,58,0.15)', activeBorder: 'rgba(201,150,58,0.35)', activeText: '#C9963A' },
  absent:  { active: 'rgba(197,34,34,0.18)',  activeBorder: 'rgba(197,34,34,0.35)',  activeText: '#C52222' },
};

const MARK_OPTIONS: MarkOption[] = ['present', 'partial', 'absent'];

function MarkPicker({ value, onChange }: MarkPickerProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border-default overflow-hidden">
      {MARK_OPTIONS.map((opt) => {
        const isActive = value === opt;
        const cfg = markColors[opt];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-2.5 py-1 text-[11px] font-medium transition-all duration-150 capitalize"
            style={
              isActive
                ? { backgroundColor: cfg.active, color: cfg.activeText, borderColor: cfg.activeBorder }
                : { color: '#737373' }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-md mx-4 shadow-2xl">
        {/* Modal header */}
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

        {/* Modal body */}
        <div className="p-5 space-y-4">
          {/* Change type select */}
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

          {/* Date inputs if end-date change */}
          {changeType === 'date' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-2">
                  Current end date
                </label>
                <input
                  type="text"
                  defaultValue="Apr 22"
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
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                />
              </div>
            </div>
          )}

          {/* Reason textarea */}
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

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border border-border-default bg-bg-elevated">
            <svg width="14" height="14" className="text-text-muted flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className="text-[11.5px] text-text-muted leading-snug">
              Change requests are reviewed by admins within 24 hours. You&apos;ll get notified on Zulip.
            </p>
          </div>
        </div>

        {/* Modal footer */}
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

function BatchesScreen({ firstName }: { firstName: string }) {
  const [showModal, setShowModal] = useState(false);

  const pendingCount = MOCK_REQUESTS.filter((r) => r.status === 'pending').length;
  const totalStudents = MOCK_MENTOR_BATCHES.reduce((acc, b) => acc + b.size, 0);
  const avgAtt = Math.round(
    (MOCK_MENTOR_BATCHES.reduce((acc, b) => acc + b.avgAtt, 0) / MOCK_MENTOR_BATCHES.length) * 100
  );

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white">
          Hey, {firstName}.
        </h1>
        <p className="text-text-secondary text-[14px] mt-0.5">
          {MOCK_MENTOR.expertise} · {MOCK_MENTOR_BATCHES.length} active batches
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active batches" value={MOCK_MENTOR_BATCHES.length} sub="this term" />
        <StatCard label="Total students" value={totalStudents} sub="across all batches" />
        <StatCard label="Avg attendance" value={`${avgAtt}%`} sub="term average" positive />
        <StatCard label="Pending requests" value={pendingCount} sub={pendingCount > 0 ? 'needs review' : 'all clear'} />
      </div>

      {/* Batch table */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">My batches</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Code</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Course</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Schedule</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Size</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Progress</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Avg att.</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MENTOR_BATCHES.map((batch, i) => (
              <tr
                key={batch.id}
                className={`hover:bg-bg-primary transition-colors ${i < MOCK_MENTOR_BATCHES.length - 1 ? 'border-b border-border-default' : ''}`}
              >
                <td className="px-3.5 py-3 font-mono text-[11px] text-brand font-medium">{batch.code}</td>
                <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.course}</td>
                <td className="px-3.5 py-3 text-[12px] text-text-muted font-mono">{batch.start}–{batch.end}</td>
                <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.size}</td>
                <td className="px-3.5 py-3 min-w-[100px]">
                  <div className="space-y-1">
                    <ProgressBar value={batch.progress * 100} accent />
                    <p className="text-[10px] text-text-muted font-mono">{Math.round(batch.progress * 100)}%</p>
                  </div>
                </td>
                <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{Math.round(batch.avgAtt * 100)}%</td>
                <td className="px-3.5 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Today panel */}
      <div className="bg-bg-secondary border border-border-default rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1">Today · DSA-26-A</p>
            <h3 className="text-[16px] font-semibold text-white">Session 9 — Trees: traversals & DFS</h3>
            <p className="text-[12.5px] text-text-muted mt-0.5">Feb 11 · 28 students · 2h scheduled</p>
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

      {showModal && (
        <ChangeModal batchCode="DSA-26-A" onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function AttendanceScreen() {
  const [roster, setRoster] = useState<RosterEntry[]>(MOCK_ROSTER);

  const presentCount = roster.filter((s) => s.mark === 'present').length;
  const partialCount = roster.filter((s) => s.mark === 'partial').length;
  const absentCount  = roster.filter((s) => s.mark === 'absent').length;

  const markAll = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, mark: 'present' as AttStatus })));
  };

  const updateMark = (id: string, mark: MarkOption) => {
    setRoster((prev) => prev.map((s) => s.id === id ? { ...s, mark } : s));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Mark attendance</h2>
        <p className="text-text-muted text-[13px] mt-0.5">DSA-26-A · Session 9 — Trees: traversals & DFS</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-default" style={{ background: 'rgba(34,197,94,0.07)' }}>
          <span className="text-[24px] font-semibold" style={{ color: '#22C55E' }}>{presentCount}</span>
          <span className="text-[12px] text-text-muted">Present</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-default" style={{ background: 'rgba(201,150,58,0.07)' }}>
          <span className="text-[24px] font-semibold" style={{ color: '#C9963A' }}>{partialCount}</span>
          <span className="text-[12px] text-text-muted">Partial</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-default" style={{ background: 'rgba(197,34,34,0.07)' }}>
          <span className="text-[24px] font-semibold" style={{ color: '#C52222' }}>{absentCount}</span>
          <span className="text-[12px] text-text-muted">Absent</span>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Student roster</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-[11.5px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
            >
              Mark all present
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-[11.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
            >
              Save
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Student</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Term att.</th>
              <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Today</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((student, i) => (
              <tr
                key={student.id}
                className={`hover:bg-bg-primary transition-colors ${i < roster.length - 1 ? 'border-b border-border-default' : ''}`}
              >
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={student.name} size="sm" />
                    <span className="text-[12.5px] text-text-primary">{student.name}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 min-w-[100px]">
                  <div className="space-y-1">
                    <ProgressBar
                      value={student.termAtt * 100}
                      color={student.termAtt >= 0.75 ? '#22C55E' : '#C52222'}
                    />
                    <p className="text-[10px] text-text-muted font-mono">{Math.round(student.termAtt * 100)}%</p>
                  </div>
                </td>
                <td className="px-3.5 py-2.5">
                  <MarkPicker
                    value={student.mark as MarkOption}
                    onChange={(v) => updateMark(student.id, v)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestsScreen() {
  const [showModal, setShowModal] = useState(false);

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

      <div className="space-y-2.5">
        {MOCK_REQUESTS.map((req) => (
          <div
            key={req.id}
            className="bg-bg-secondary border border-border-default rounded-lg px-4 py-3.5 flex items-center gap-4"
          >
            <RequestStatusBadge status={req.status} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-text-primary font-medium">{req.title}</p>
              <p className="text-[11.5px] text-text-muted mt-0.5">{req.reason}</p>
            </div>
            <span className="font-mono text-[10.5px] text-text-muted flex-shrink-0">{req.ago}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <ChangeModal batchCode="DSA-26-A" onClose={() => setShowModal(false)} />
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

  return (
    <AppShell
      role="MENTOR"
      userName={user.full_name}
      tabs={MENTOR_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'batches'    && <BatchesScreen firstName={firstName} />}
      {activeTab === 'attendance' && <AttendanceScreen />}
      {activeTab === 'requests'   && <RequestsScreen />}
    </AppShell>
  );
}
