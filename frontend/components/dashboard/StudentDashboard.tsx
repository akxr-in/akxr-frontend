"use client";

import { useState } from "react";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import { AttendanceBadge, type AttStatus } from "./AttendanceBadge";
import { Avatar } from "./Avatar";
import type { UserDataResponseData } from "@akxr/api";

// ---------------------------------------------------------------------------
// Mock data — replace with real API calls when backend is ready
// ---------------------------------------------------------------------------
const MOCK_COURSE = {
  code: 'AXR-201',
  title: 'Data Structures & Algorithms',
  weeks: 14,
};

const MOCK_BATCH = {
  code: 'DSA-26-A',
  start: 'Jan 14',
  end: 'Apr 22',
  progress: 0.62,
  totalSessions: 14,
  doneSessions: 8,
  attendance: 0.92,
  mentorName: 'Karthik Ramaswamy',
};

type SessionState = 'done' | 'today' | 'upcoming';

interface MockSession {
  idx: number;
  date: string;
  title: string;
  state: SessionState;
  myAtt: AttStatus | null;
}

const MOCK_SESSIONS: MockSession[] = [
  { idx: 1,  date: 'Jan 14', title: 'Course kickoff & complexity',         state: 'done',     myAtt: 'present' },
  { idx: 2,  date: 'Jan 16', title: 'Arrays, prefix sums',                  state: 'done',     myAtt: 'present' },
  { idx: 3,  date: 'Jan 21', title: 'Two-pointer & sliding window',         state: 'done',     myAtt: 'present' },
  { idx: 4,  date: 'Jan 23', title: 'Linked lists',                          state: 'done',     myAtt: 'partial' },
  { idx: 5,  date: 'Jan 28', title: 'Stacks, queues, deques',               state: 'done',     myAtt: 'present' },
  { idx: 6,  date: 'Jan 30', title: 'Hash maps, hashing strategies',        state: 'done',     myAtt: 'absent'  },
  { idx: 7,  date: 'Feb 04', title: 'Recursion & backtracking I',           state: 'done',     myAtt: 'present' },
  { idx: 8,  date: 'Feb 06', title: 'Recursion & backtracking II',          state: 'done',     myAtt: 'present' },
  { idx: 9,  date: 'Feb 11', title: 'Trees: traversals & DFS',              state: 'today',    myAtt: null },
  { idx: 10, date: 'Feb 13', title: 'BSTs & balancing',                     state: 'upcoming', myAtt: null },
  { idx: 11, date: 'Feb 18', title: 'Heaps & priority queues',              state: 'upcoming', myAtt: null },
  { idx: 12, date: 'Feb 20', title: 'Graphs I: BFS, DFS, components',       state: 'upcoming', myAtt: null },
  { idx: 13, date: 'Feb 25', title: 'Graphs II: Dijkstra, MST',             state: 'upcoming', myAtt: null },
  { idx: 14, date: 'Feb 27', title: 'DP foundations',                       state: 'upcoming', myAtt: null },
];

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
        style={{ transition: 'stroke-dashoffset .6s ease' }}
      />
      <text x="46" y="51" textAnchor="middle" fontSize="20" fontWeight="600" fill="#fafafa">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

interface OverviewScreenProps {
  firstName: string;
  onOpenBatch: () => void;
}

function OverviewScreen({ firstName, onOpenBatch }: OverviewScreenProps) {
  return (
    <div className="space-y-5">
      {/* Hero row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Greeting card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg p-6 relative overflow-hidden">
          {/* Decorative pills */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-border-strong text-text-muted bg-bg-elevated">
              SESSION {MOCK_BATCH.doneSessions}/{MOCK_BATCH.totalSessions}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-border-strong text-text-muted bg-bg-elevated">
              {Math.round(MOCK_BATCH.attendance * 100)}% ATTENDANCE
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted mb-2">
            {MOCK_COURSE.code} · {MOCK_BATCH.code}
          </p>
          <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white leading-tight mb-1">
            Good morning, {firstName}.
          </h1>
          <p className="text-[13.5px] text-text-secondary mb-6">
            Session {MOCK_BATCH.doneSessions + 1} of {MOCK_BATCH.totalSessions} is live now.&nbsp;
            You&apos;re on track — keep it up.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
              style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Join live session
            </button>
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
          <p className="text-[13px] text-text-secondary mb-4 leading-snug">{MOCK_COURSE.title}</p>
          <div className="flex-1 flex items-center justify-center">
            <ProgressRing pct={Math.round(MOCK_BATCH.progress * 100)} />
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Sessions done</span>
              <span className="text-text-primary font-medium">{MOCK_BATCH.doneSessions}/{MOCK_BATCH.totalSessions}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">Mentor</span>
              <span className="text-text-primary font-medium">{MOCK_BATCH.mentorName.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Attendance" value="92%" sub="↑4 pts this month" positive />
        <StatCard label="Last quiz" value="9.2" sub="Top 15% of batch" positive />
        <StatCard label="Assignment" value="On time" sub="8/8 submitted" />
        <StatCard label="Streak" value="12d" sub="Personal best" positive />
      </div>

      {/* My batches + Upcoming */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* My batches card */}
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
                <p className="font-mono text-[11px] text-brand font-medium">{MOCK_BATCH.code}</p>
                <p className="text-[13px] text-text-primary mt-0.5">{MOCK_COURSE.title}</p>
                <p className="text-[11.5px] text-text-muted mt-0.5">
                  {MOCK_BATCH.start} – {MOCK_BATCH.end} · {MOCK_BATCH.mentorName}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-elevated border border-border-default">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-success font-medium">Live now</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-text-muted">Progress</span>
                <span className="text-text-secondary">{Math.round(MOCK_BATCH.progress * 100)}%</span>
              </div>
              <ProgressBar value={MOCK_BATCH.progress * 100} accent />
            </div>
          </div>
        </div>

        {/* Upcoming card */}
        <div className="bg-bg-secondary border border-border-default rounded-lg">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Upcoming</p>
          </div>
          <div className="p-3 space-y-1">
            {MOCK_SESSIONS.filter((s) => s.state === 'today' || s.state === 'upcoming')
              .slice(0, 4)
              .map((session) => (
                <div
                  key={session.idx}
                  className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-bg-elevated transition-colors"
                >
                  <div className="w-8 text-center flex-shrink-0">
                    <p className="font-mono text-[9px] text-text-muted">{session.date.split(' ')[0].toUpperCase()}</p>
                    <p className="text-[12px] font-semibold text-text-primary">{session.date.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-text-secondary leading-snug truncate">{session.title}</p>
                    {session.state === 'today' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-brand font-medium mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-brand animate-pulse" />
                        Live now
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BatchDetailScreenProps {
  onBack: () => void;
}

function BatchDetailScreen({ onBack }: BatchDetailScreenProps) {
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
              {MOCK_COURSE.code} · {MOCK_BATCH.code} · {MOCK_BATCH.mentorName}
            </p>
            <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">{MOCK_COURSE.title}</h2>
            <p className="text-[13px] text-text-muted mt-0.5">{MOCK_BATCH.start} – {MOCK_BATCH.end}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Sessions" value={`${MOCK_BATCH.doneSessions}/${MOCK_BATCH.totalSessions}`} sub="completed" />
        <StatCard label="My attendance" value={`${Math.round(MOCK_BATCH.attendance * 100)}%`} sub="term attendance" positive />
        <StatCard label="Mentor" value={MOCK_BATCH.mentorName.split(' ')[0]} sub={MOCK_BATCH.mentorName} />
      </div>

      {/* Session log table */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Session log</p>
        </div>
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
            {MOCK_SESSIONS.map((session, i) => (
              <tr
                key={session.idx}
                className={`border-b border-border-default transition-colors ${i === MOCK_SESSIONS.length - 1 ? 'border-b-0' : ''} ${session.state === 'today' ? 'bg-brand-subtle hover:bg-brand-muted' : 'hover:bg-bg-primary'}`}
              >
                <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted">{session.idx}</td>
                <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted whitespace-nowrap">{session.date}</td>
                <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{session.title}</td>
                <td className="px-3.5 py-3">
                  {session.state === 'done' && session.myAtt ? (
                    <AttendanceBadge status={session.myAtt} />
                  ) : session.state === 'today' ? (
                    <AttendanceBadge status="live" />
                  ) : (
                    <span className="text-text-muted text-[12px]">—</span>
                  )}
                </td>
                <td className="px-3.5 py-3">
                  {session.state === 'today' ? (
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
  { id: 'overview', label: 'Overview' },
  { id: 'batch', label: 'My batch' },
];

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const firstName = user.full_name.split(' ')[0];

  return (
    <AppShell
      role="STUDENT"
      userName={user.full_name}
      tabs={STUDENT_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <OverviewScreen
          firstName={firstName}
          onOpenBatch={() => setActiveTab('batch')}
        />
      )}
      {activeTab === 'batch' && (
        <BatchDetailScreen onBack={() => setActiveTab('overview')} />
      )}
    </AppShell>
  );
}
