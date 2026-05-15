"use client";

import { useState } from "react";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import { Avatar } from "./Avatar";
import type { UserDataResponseData } from "@akxr/api";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface MockCourse {
  id: string;
  code: string;
  title: string;
  weeks: number;
  batches: number;
  students: number;
}

const MOCK_COURSES: MockCourse[] = [
  { id: 'c1', code: 'AXR-201', title: 'Data Structures & Algorithms', weeks: 14, batches: 3, students: 84 },
  { id: 'c2', code: 'AXR-110', title: 'Full-stack Web Engineering',   weeks: 12, batches: 2, students: 56 },
  { id: 'c3', code: 'AXR-305', title: 'Applied Machine Learning',     weeks: 10, batches: 2, students: 38 },
  { id: 'c4', code: 'AXR-150', title: 'Frontend Foundations',         weeks: 8,  batches: 1, students: 22 },
];

interface MockAdminBatch {
  id: string;
  code: string;
  courseId: string;
  mentor: string;
  start: string;
  end: string;
  size: number;
  progress: number;
  avgAtt: number;
}

const MOCK_ADMIN_BATCHES: MockAdminBatch[] = [
  { id: 'b1', code: 'DSA-26-A', courseId: 'c1', mentor: 'Karthik Ramaswamy',  start: 'Jan 14', end: 'Apr 22', size: 28, progress: 0.62, avgAtt: 0.92 },
  { id: 'b2', code: 'DSA-26-B', courseId: 'c1', mentor: 'Karthik Ramaswamy',  start: 'Feb 04', end: 'May 13', size: 30, progress: 0.41, avgAtt: 0.84 },
  { id: 'b3', code: 'DSA-26-C', courseId: 'c1', mentor: 'Nikhil Deshmukh',    start: 'Mar 01', end: 'Jun 10', size: 26, progress: 0.18, avgAtt: 0.71 },
  { id: 'b4', code: 'WEB-26-A', courseId: 'c2', mentor: 'Priya Subramanian',  start: 'Jan 21', end: 'Apr 15', size: 28, progress: 0.74, avgAtt: 0.88 },
  { id: 'b5', code: 'WEB-26-B', courseId: 'c2', mentor: 'Tara Krishnan',      start: 'Mar 11', end: 'Jun 03', size: 28, progress: 0.22, avgAtt: 0.62 },
];

interface MockMentor {
  id: string;
  name: string;
  expertise: string;
  batches: string[];
}

const MOCK_MENTORS: MockMentor[] = [
  { id: 'm1', name: 'Karthik Ramaswamy', expertise: 'Systems & DSA',       batches: ['b1', 'b2'] },
  { id: 'm2', name: 'Priya Subramanian', expertise: 'Web Engineering',     batches: ['b4'] },
  { id: 'm3', name: 'Nikhil Deshmukh',   expertise: 'ML & Data',           batches: ['b3'] },
  { id: 'm4', name: 'Tara Krishnan',     expertise: 'Frontend & Design',   batches: ['b5'] },
];

type AuditRole = 'mentor' | 'admin' | 'system';

interface MockAuditEntry {
  t: string;
  actor: string;
  action: string;
  role: AuditRole;
}

const MOCK_AUDIT: MockAuditEntry[] = [
  { t: '12:42', actor: 'Priya S. (Mentor)',   action: 'Marked attendance for WEB-26-A · Session 17',        role: 'mentor' },
  { t: '12:31', actor: 'Karthik R. (Mentor)', action: 'Requested end-date change for DSA-26-A → Apr 29',    role: 'mentor' },
  { t: '12:18', actor: 'Maya Iyer (Admin)',    action: 'Created batch ML-26-B under AXR-305',                role: 'admin'  },
  { t: '11:55', actor: 'Maya Iyer (Admin)',    action: 'Assigned mentor Nikhil D. → ML-26-B',               role: 'admin'  },
  { t: '11:30', actor: 'System',              action: 'Auto-classified attendance for DSA-26-A · Session 8', role: 'system' },
  { t: '10:48', actor: 'Maya Iyer (Admin)',    action: 'Updated role: Tara K. → Mentor',                    role: 'admin'  },
  { t: '10:02', actor: 'Karthik R. (Mentor)', action: 'Ended live class · DSA-26-A · Session 8',            role: 'mentor' },
];

interface PendingRequest {
  who: string;
  what: string;
  ago: string;
  kind: string;
}

const MOCK_PENDING_REQUESTS: PendingRequest[] = [
  { who: 'Karthik R.', what: 'Push DSA-26-A end → Apr 29',    ago: '32m', kind: 'date'    },
  { who: 'Priya S.',   what: 'Add session: WEB-26-A · Feb 17', ago: '2h',  kind: 'session' },
  { who: 'Tara K.',    what: 'Promote to mentor role',          ago: '1d',  kind: 'role'   },
];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const auditDotColor: Record<AuditRole, string> = {
  mentor: '#678DE5',
  admin:  '#C9963A',
  system: '#737373',
};

function TrendSparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? '0,16 8,12 16,14 24,9 32,11 40,6 48,3'
    : '0,4 8,8 16,6 24,11 32,9 40,14 48,17';

  return (
    <svg width="48" height="20" viewBox="0 0 48 20">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22C55E' : '#C52222'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Create course modal (2-step)
// ---------------------------------------------------------------------------

interface CreateCourseModalProps {
  onClose: () => void;
}

function CreateCourseModal({ onClose }: CreateCourseModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    code: '', title: '', weeks: '', sessionsPerWeek: '', description: '',
    batchCode: '', batchSize: '', startsOn: '', mentor: '',
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              {step === 1 ? 'Create new course' : 'Create first batch'}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Step {step} of 2</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border"
                  style={
                    step >= s
                      ? { background: '#C9963A', borderColor: '#C9963A', color: '#000' }
                      : { background: 'transparent', borderColor: '#404040', color: '#737373' }
                  }
                >
                  {s}
                </div>
                {s < 2 && <div className="h-px flex-1 bg-border-default" style={{ width: '40px' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Course code</label>
                  <input
                    type="text"
                    placeholder="AXR-401"
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Duration (weeks)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={form.weeks}
                    onChange={(e) => update('weeks', e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Advanced System Design"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Sessions per week</label>
                <input
                  type="number"
                  placeholder="2"
                  value={form.sessionsPerWeek}
                  onChange={(e) => update('sessionsPerWeek', e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Description</label>
                <textarea
                  placeholder="Brief description of the course..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={3}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Batch code</label>
                  <input
                    type="text"
                    placeholder="DSA-26-D"
                    value={form.batchCode}
                    onChange={(e) => update('batchCode', e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Batch size</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={form.batchSize}
                    onChange={(e) => update('batchSize', e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Starts on</label>
                <input
                  type="date"
                  value={form.startsOn}
                  onChange={(e) => update('startsOn', e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Assign mentor</label>
                <select
                  value={form.mentor}
                  onChange={(e) => update('mentor', e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors"
                >
                  <option value="">Select a mentor...</option>
                  {MOCK_MENTORS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} · {m.expertise}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-default flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
              >
                Next: batch
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
              >
                Publish course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function OverviewScreen({ onNewCourse, firstName }: { onNewCourse: () => void; firstName: string }) {
  const totalStudents = MOCK_COURSES.reduce((acc, c) => acc + c.students, 0);
  const overallAvgAtt = Math.round(
    (MOCK_ADMIN_BATCHES.reduce((acc, b) => acc + b.avgAtt, 0) / MOCK_ADMIN_BATCHES.length) * 100
  );

  return (
    <div className="space-y-5">
      {/* Heading row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white">The org at a glance, {firstName}.</h1>
          <p className="text-text-muted text-[13.5px] mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            onClick={onNewCourse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New course
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Courses" value={MOCK_COURSES.length} sub="2 drafts, 2 live" />
        <StatCard label="Active batches" value={MOCK_ADMIN_BATCHES.length} sub="3 live today" positive />
        <StatCard label="Students" value={totalStudents} sub="across all batches" />
        <StatCard label="Avg attendance" value={`${overallAvgAtt}%`} sub="across all batches" positive={overallAvgAtt >= 80} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Batch health table */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Batch health</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Batch</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Avg att.</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Trend</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">At-risk</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ADMIN_BATCHES.map((batch, i) => {
                const atRisk = Math.floor((1 - batch.avgAtt) * batch.size);
                const positive = batch.avgAtt >= 0.80;
                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-bg-primary transition-colors ${i < MOCK_ADMIN_BATCHES.length - 1 ? 'border-b border-border-default' : ''}`}
                  >
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-brand font-medium">{batch.code}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-secondary">{batch.mentor.split(' ')[0]}</td>
                    <td className="px-3.5 py-2.5 text-[12.5px]" style={{ color: positive ? '#22C55E' : '#C52222' }}>
                      {Math.round(batch.avgAtt * 100)}%
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TrendSparkline positive={positive} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      {atRisk > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#C52222' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C52222' }} />
                          {atRisk}
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Approval inbox */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Approval inbox</p>
          </div>
          <div className="divide-y divide-border-default">
            {MOCK_PENDING_REQUESTS.map((req, i) => (
              <div key={i} className="px-4 py-3 hover:bg-bg-primary transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[12.5px] text-text-primary font-medium truncate">{req.what}</p>
                      <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.07em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{req.kind}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">{req.who} · {req.ago} ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-2.5 py-1 rounded text-[11px] font-medium border transition-colors" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.2)' }}>
                    Approve
                  </button>
                  <button type="button" className="px-2.5 py-1 rounded text-[11px] font-medium border transition-colors" style={{ background: 'rgba(197,34,34,0.12)', color: '#C52222', borderColor: 'rgba(197,34,34,0.2)' }}>
                    Reject
                  </button>
                  <button type="button" className="px-2.5 py-1 rounded text-[11px] font-medium border border-border-default text-text-muted hover:text-text-secondary transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogScreen({ onNewCourse }: { onNewCourse: () => void }) {
  const [selectedCourse, setSelectedCourse] = useState<string>('c1');

  const courseBatches = MOCK_ADMIN_BATCHES.filter((b) => b.courseId === selectedCourse);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Courses & batches</h2>
        <button
          type="button"
          onClick={onNewCourse}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
          style={{ background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New course
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Course list */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Courses</p>
          </div>
          <div>
            {MOCK_COURSES.map((course) => {
              const isActive = course.id === selectedCourse;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left pl-3.5 pr-4 py-3 border-b border-border-default border-l-2 hover:bg-bg-primary transition-colors ${isActive ? 'border-l-brand bg-bg-primary' : 'border-l-transparent'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] text-brand font-medium">{course.code}</p>
                      <p className="text-[12.5px] text-text-primary mt-0.5">{course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{course.weeks}w</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{course.batches}B</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{course.students}S</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch table */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">
              Batches — {MOCK_COURSES.find((c) => c.id === selectedCourse)?.code}
            </p>
          </div>
          {courseBatches.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px]">No batches yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Code</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Schedule</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Size</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Progress</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseBatches.map((batch, i) => (
                  <tr
                    key={batch.id}
                    className={`hover:bg-bg-primary transition-colors ${i < courseBatches.length - 1 ? 'border-b border-border-default' : ''}`}
                  >
                    <td className="px-3.5 py-3 font-mono text-[11px] text-brand font-medium">{batch.code}</td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={batch.mentor} size="sm" />
                        <span className="text-[12px] text-text-secondary">{batch.mentor.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted">{batch.start}–{batch.end}</td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.size}</td>
                    <td className="px-3.5 py-3 min-w-[100px]">
                      <div className="space-y-1">
                        <ProgressBar value={batch.progress * 100} accent />
                        <p className="text-[10px] text-text-muted font-mono">{Math.round(batch.progress * 100)}%</p>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <button type="button" className="text-[11.5px] text-text-muted hover:text-text-secondary transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function PeopleScreen() {
  // Matrix: mentor rows × batch columns
  // State: for each batch, which mentor is assigned
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    MOCK_ADMIN_BATCHES.forEach((b) => {
      const mentor = MOCK_MENTORS.find((m) => m.batches.includes(b.id));
      if (mentor) init[b.id] = mentor.id;
    });
    return init;
  });

  const [roleRequestStatus, setRoleRequestStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const toggleCell = (mentorId: string, batchId: string) => {
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      if (prev[batchId] === mentorId) {
        delete newAssignments[batchId];
      } else {
        newAssignments[batchId] = mentorId;
      }
      return newAssignments;
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">People & roles</h2>

      {/* Mentor ↔ batch matrix */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Mentor / batch assignment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Expertise</th>
                {MOCK_ADMIN_BATCHES.map((b) => (
                  <th key={b.id} className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-center">
                    {b.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_MENTORS.map((mentor, i) => (
                <tr
                  key={mentor.id}
                  className={`hover:bg-bg-primary transition-colors ${i < MOCK_MENTORS.length - 1 ? 'border-b border-border-default' : ''}`}
                >
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={mentor.name} size="sm" />
                      <span className="text-[12.5px] text-text-primary">{mentor.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[11.5px] text-text-muted">{mentor.expertise}</td>
                  {MOCK_ADMIN_BATCHES.map((batch) => {
                    const isAssigned = assignments[batch.id] === mentor.id;
                    return (
                      <td key={batch.id} className="px-3.5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCell(mentor.id, batch.id)}
                          className="w-6 h-6 rounded flex items-center justify-center mx-auto border transition-all duration-150"
                          style={
                            isAssigned
                              ? { background: 'rgba(201,150,58,0.20)', borderColor: 'rgba(201,150,58,0.4)' }
                              : { background: 'transparent', borderColor: '#333' }
                          }
                          title={isAssigned ? 'Unassign' : 'Assign'}
                        >
                          {isAssigned && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9963A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending role changes */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Pending role changes</p>
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name="Tara Krishnan" size="md" />
            <div>
              <p className="text-[13px] text-text-primary font-medium">Tara Krishnan</p>
              <p className="text-[11.5px] text-text-muted mt-0.5">
                Promote to{' '}
                <span className="font-mono uppercase text-[10px] tracking-[0.05em]" style={{ color: '#C9963A' }}>Mentor</span>
                {' '}· requested 1d ago
              </p>
            </div>
          </div>
          {roleRequestStatus === 'pending' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRoleRequestStatus('approved')}
                className="px-3 py-1.5 rounded text-[11.5px] font-medium border transition-colors"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.2)' }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setRoleRequestStatus('rejected')}
                className="px-3 py-1.5 rounded text-[11.5px] font-medium border transition-colors"
                style={{ background: 'rgba(197,34,34,0.12)', color: '#C52222', borderColor: 'rgba(197,34,34,0.2)' }}
              >
                Reject
              </button>
            </div>
          )}
          {roleRequestStatus === 'approved' && (
            <span className="text-[11.5px] font-medium" style={{ color: '#22C55E' }}>Approved</span>
          )}
          {roleRequestStatus === 'rejected' && (
            <span className="text-[11.5px] font-medium" style={{ color: '#C52222' }}>Rejected</span>
          )}
        </div>
      </div>
    </div>
  );
}

type AuditFilter = 'all' | AuditRole;

function AuditLogScreen() {
  const [filter, setFilter] = useState<AuditFilter>('all');

  const filters: AuditFilter[] = ['all', 'admin', 'mentor', 'system'];

  const filtered = filter === 'all'
    ? MOCK_AUDIT
    : MOCK_AUDIT.filter((e) => e.role === filter);

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Audit log</h2>

      {/* Filter buttons */}
      <div className="flex items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md font-mono text-[10.5px] uppercase tracking-[0.07em] border transition-colors"
            style={
              filter === f
                ? { background: 'rgba(201,150,58,0.15)', color: '#C9963A', borderColor: 'rgba(201,150,58,0.3)' }
                : { background: 'transparent', color: '#737373', borderColor: '#333' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Audit entries */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden divide-y divide-border-default">
        {filtered.map((entry, i) => (
          <div key={i} className="flex items-start gap-3.5 px-4 py-3 hover:bg-bg-primary transition-colors">
            <span className="font-mono text-[10.5px] text-text-muted flex-shrink-0 w-10 pt-0.5">{entry.t}</span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: auditDotColor[entry.role] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-text-primary">{entry.action}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{entry.actor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AdminDashboardProps {
  user: UserDataResponseData;
}

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'catalog',  label: 'Courses & batches' },
  { id: 'people',   label: 'People & roles' },
  { id: 'audit',    label: 'Audit log' },
];

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const firstName = user.full_name.split(' ')[0];

  return (
    <>
      <AppShell
        role="ADMIN"
        userName={user.full_name}
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'overview' && <OverviewScreen onNewCourse={() => setShowCreateModal(true)} firstName={firstName} />}
        {activeTab === 'catalog'  && <CatalogScreen  onNewCourse={() => setShowCreateModal(true)} />}
        {activeTab === 'people'   && <PeopleScreen />}
        {activeTab === 'audit'    && <AuditLogScreen />}
      </AppShell>

      {showCreateModal && (
        <CreateCourseModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}
