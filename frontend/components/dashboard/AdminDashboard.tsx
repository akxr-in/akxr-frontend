"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CrudBatchModal } from "../CrudBatchModal";
import { AppShell } from "./AppShell";
import { StatCard } from "./StatCard";
import { ProgressBar } from "./ProgressBar";
import { Avatar } from "./Avatar";
import type { UserDataResponseData } from "@akxr/api";
import {
  useGetAdminDashboard,
  useGetAdminBatches,
  useGetAdminCourses,
  usePostAdminCourses,
  usePostBatch,
  usePostAdminUpgradeRole,
  usePatchBatchId,
  useAssignStudentToBatch,
  useDeleteAdminUser,
  getAdminBatchesQueryKey,
  getAdminCoursesQueryKey,
  getAdminDashboardQueryKey,
  type AdminDashboard as AdminDashboardData,
  type AdminBatch,
  type AdminCourse,
  type AdminUser,
} from "@akxr/api";
import { useGetAdminUsers, getGetAdminUsersQueryKey } from "@akxr/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

type AuditRole = "mentor" | "admin" | "system";

const auditDotColor: Record<AuditRole, string> = {
  mentor: "#678DE5",
  admin: "#C9963A",
  system: "#737373",
};

// ---------------------------------------------------------------------------
// Create course modal
// ---------------------------------------------------------------------------

interface CreateCourseModalProps {
  onClose: () => void;
  mentors: AdminUser[];
}

function CreateCourseModal({ onClose, mentors }: CreateCourseModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    code: "", title: "", weeks: "", sessionsPerWeek: "", description: "",
    batchCode: "", batchSize: "", startsOn: "", mentor: "",
  });

  const queryClient = useQueryClient();
  const { mutateAsync: createCourse } = usePostAdminCourses();
  const { mutateAsync: createBatch } = usePostBatch();

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePublish = async () => {
    try {
      const courseRes = await createCourse({
        data: {
          name: form.title,
          description: form.description,
          time_allotted_in_weeks: parseInt(form.weeks, 10),
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const courseId = (courseRes.data as any).id;

      if (!courseId) {
        throw new Error("Course creation failed: no ID returned");
      }

      await createBatch({
        data: {
          batch_name: `${form.title} - ${form.batchCode}`,
          batch_code: form.batchCode,
          description: form.description,
          total_classes: parseInt(form.weeks, 10) * parseInt(form.sessionsPerWeek, 10),
          batch_start_date: form.startsOn,
          batch_end_date: new Date(new Date(form.startsOn).getTime() + parseInt(form.weeks, 10) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimated_end_date: new Date(new Date(form.startsOn).getTime() + parseInt(form.weeks, 10) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mentor_ids: form.mentor ? [form.mentor] : [],
          course_ids: [courseId],
        }
      });

      queryClient.invalidateQueries({ queryKey: getAdminCoursesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminDashboardQueryKey() });
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to create course and batch");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border-default rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              {step === 1 ? "Create new course" : "Create first batch"}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Step {step} of 2</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border"
                  style={
                    step >= s
                      ? { background: "#C9963A", borderColor: "#C9963A", color: "#000" }
                      : { background: "transparent", borderColor: "#404040", color: "#737373" }
                  }
                >
                  {s}
                </div>
                {s < 2 && <div className="h-px flex-1 bg-border-default" style={{ width: "40px" }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-3.5">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Course code</label>
                  <input type="text" placeholder="AXR-401" value={form.code} onChange={(e) => update("code", e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Duration (weeks)</label>
                  <input type="number" placeholder="12" value={form.weeks} onChange={(e) => update("weeks", e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Title</label>
                <input type="text" placeholder="Advanced System Design" value={form.title} onChange={(e) => update("title", e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Sessions per week</label>
                <input type="number" placeholder="2" value={form.sessionsPerWeek} onChange={(e) => update("sessionsPerWeek", e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Description</label>
                <textarea placeholder="Brief description of the course..." value={form.description} onChange={(e) => update("description", e.target.value)}
                  rows={3} className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors resize-none" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Batch code</label>
                  <input type="text" placeholder="DSA-26-D" value={form.batchCode} onChange={(e) => update("batchCode", e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Batch size</label>
                  <input type="number" placeholder="30" value={form.batchSize} onChange={(e) => update("batchSize", e.target.value)}
                    className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Starts on</label>
                <input type="date" value={form.startsOn} onChange={(e) => update("startsOn", e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted block mb-1.5">Assign mentor</label>
                <select value={form.mentor} onChange={(e) => update("mentor", e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[13px] text-text-primary outline-none focus:border-border-focus transition-colors">
                  <option value="">Select a mentor…</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border-default flex items-center justify-between">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors">
                Back
              </button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => setStep(2)}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}>
                Next: batch
              </button>
            ) : (
              <button type="button" onClick={handlePublish}
                className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}>
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

function OverviewScreen({
  onNewCourse,
  firstName,
  dashData,
  dashLoading,
  batches,
  getMentorName,
}: {
  onNewCourse: () => void;
  firstName: string;
  dashData: AdminDashboardData | null;
  dashLoading: boolean;
  batches: AdminBatch[];
  getMentorName: (id: string) => string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.028em] text-white">The org at a glance, {firstName}.</h1>
          <p className="text-text-muted text-[13.5px] mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-border-default text-text-muted hover:border-border-strong hover:text-text-secondary transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button type="button" onClick={onNewCourse}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Courses" value={dashLoading ? "…" : (dashData?.total_courses ?? 0)} sub="published courses" />
        <StatCard label="Active batches" value={dashLoading ? "…" : (dashData?.total_active_batches ?? 0)}
          sub={`${dashData?.total_batches ?? 0} total`} positive />
        <StatCard label="Students" value={dashLoading ? "…" : (dashData?.total_students ?? 0)}
          sub={`${dashData?.total_mentors ?? 0} mentors`} />
        <StatCard label="Avg attendance" value="—" sub="no data available" />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        {/* Batch health table */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Batch health</p>
          </div>
          {batches.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px]">No batches yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Batch</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Start</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">End</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => (
                  <tr key={batch.id}
                    className={`hover:bg-bg-primary transition-colors ${i < batches.length - 1 ? "border-b border-border-default" : ""}`}>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-brand font-medium">{batch.batch_code}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-secondary">
                      {batch.mentor_ids[0] ? getMentorName(batch.mentor_ids[0]).split(" ")[0] : "—"}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-muted">{fmtDate(batch.batch_start_date)}</td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-muted">{fmtDate(batch.batch_end_date)}</td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-secondary">{batch.total_classes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Approval inbox */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Approval inbox</p>
          </div>
          <div className="p-8 text-center text-text-muted text-[13px]">No pending requests.</div>
        </div>
      </div>
    </div>
  );
}

function CatalogScreen({
  onNewCourse,
  courses,
  batches,
  getMentorName,
}: {
  onNewCourse: () => void;
  courses: AdminCourse[];
  batches: AdminBatch[];
  getMentorName: (id: string) => string;
}) {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    courses[0]?.id ?? null
  );
  const [editingBatch, setEditingBatch] = useState<AdminBatch | null>(null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const courseBatches = selectedCourseId
    ? batches.filter((b) => b.course_ids.includes(selectedCourseId))
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Courses & batches</h2>
        <button type="button" onClick={onNewCourse}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New course
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "320px 1fr" }}>
        {/* Course list */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">Courses</p>
          </div>
          {courses.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px]">No courses yet.</div>
          ) : (
            <div>
              {courses.map((course) => {
                const isActive = course.id === selectedCourseId;
                const batchCount = batches.filter((b) => b.course_ids.includes(course.id)).length;
                return (
                  <button key={course.id} type="button" onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left pl-3.5 pr-4 py-3 border-b border-border-default border-l-2 hover:bg-bg-primary transition-colors ${isActive ? "border-l-brand bg-bg-primary" : "border-l-transparent"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12.5px] text-text-primary mt-0.5">{course.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{course.time_allotted_in_weeks}w</span>
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border border-border-default text-text-muted">{batchCount}B</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Batch table */}
        <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[13px] font-semibold text-white">
              Batches{selectedCourse ? ` — ${selectedCourse.name}` : ""}
            </p>
          </div>
          {courseBatches.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-[13px]">No batches yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Code</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Name</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Schedule</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Sessions</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseBatches.map((batch, i) => (
                  <tr key={batch.id}
                    className={`hover:bg-bg-primary transition-colors ${i < courseBatches.length - 1 ? "border-b border-border-default" : ""}`}>
                    <td className="px-3.5 py-3 font-mono text-[11px] text-brand font-medium">{batch.batch_code}</td>
                    <td className="px-3.5 py-3 text-[12px] text-text-secondary">{batch.batch_name}</td>
                    <td className="px-3.5 py-3">
                      {batch.mentor_ids[0] ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={getMentorName(batch.mentor_ids[0])} size="sm" />
                          <span className="text-[12px] text-text-secondary">{getMentorName(batch.mentor_ids[0]).split(" ")[0]}</span>
                        </div>
                      ) : <span className="text-[12px] text-text-muted">—</span>}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted">
                      {fmtDate(batch.batch_start_date)}–{fmtDate(batch.batch_end_date)}
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-primary">{batch.total_classes}</td>
                    <td className="px-3.5 py-3">
                      <button type="button" onClick={() => setEditingBatch(batch)} className="text-[11.5px] text-text-muted hover:text-text-secondary transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CrudBatchModal
        open={!!editingBatch}
        batch={editingBatch}
        onClose={() => setEditingBatch(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
          setEditingBatch(null);
        }}
      />
    </div>
  );
}

function PeopleScreen({
  allUsers,
  mentors,
  batches,
}: {
  allUsers: AdminUser[];
  mentors: AdminUser[];
  batches: AdminBatch[];
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: upgradeRole } = usePostAdminUpgradeRole();
  const { mutateAsync: patchBatch } = usePatchBatchId();
  const { mutateAsync: assignBatch, isPending: isAssigning } = useAssignStudentToBatch();
  const { mutateAsync: doDeleteUser } = useDeleteAdminUser();
  const [togglingCell, setTogglingCell] = useState<string | null>(null);
  const [assigningStudent, setAssigningStudent] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const students = allUsers.filter((u) => u.role === "STUDENT");

  const handleAssignBatch = async (userId: string, batchId: string) => {
    if (!batchId || isAssigning) return;
    setAssigningStudent(userId);
    try {
      await assignBatch({ userId, batchId });
      queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
    } catch (e) {
      console.error(e);
      alert("Failed to assign batch");
    } finally {
      setAssigningStudent(null);
    }
  };

  const handleToggleAssign = async (batch: AdminBatch, mentorId: string) => {
    const cellKey = `${batch.id}-${mentorId}`;
    if (togglingCell === cellKey) return;
    const newMentorIds = batch.mentor_ids.includes(mentorId)
      ? batch.mentor_ids.filter((id) => id !== mentorId)
      : [...batch.mentor_ids, mentorId];
    setTogglingCell(cellKey);
    try {
      await patchBatch({ id: batch.id, data: { mentor_ids: newMentorIds } });
      queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
    } catch (e) {
      console.error(e);
      alert("Failed to update batch assignment");
    } finally {
      setTogglingCell(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    setDeletingUserId(user.id);
    try {
      await doDeleteUser(user.id);
      queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminDashboardQueryKey() });
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    } finally {
      setDeletingUserId(null);
      setConfirmDeleteUser(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "MENTOR" | "STUDENT") => {
    try {
      await upgradeRole({ data: { user_id: userId, new_role: newRole } });
      queryClient.invalidateQueries({ queryKey: getGetAdminUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminDashboardQueryKey() });
    } catch (e) {
      console.error(e);
      alert("Failed to upgrade role");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">People & roles</h2>

      {/* Mentor ↔ batch matrix */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Mentor / batch assignment</p>
        </div>
        {mentors.length === 0 || batches.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-[13px]">
            {mentors.length === 0 ? "No mentors yet." : "No batches yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Mentor</th>
                  {batches.map((b) => (
                    <th key={b.id} className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-center">
                      {b.batch_code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor, i) => (
                  <tr key={mentor.id}
                    className={`hover:bg-bg-primary transition-colors ${i < mentors.length - 1 ? "border-b border-border-default" : ""}`}>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={mentor.full_name} size="sm" />
                        <span className="text-[12.5px] text-text-primary">{mentor.full_name}</span>
                      </div>
                    </td>
                    {batches.map((batch) => {
                      const isAssigned = batch.mentor_ids.includes(mentor.id);
                      const cellKey = `${batch.id}-${mentor.id}`;
                      const isToggling = togglingCell === cellKey;
                      return (
                        <td key={batch.id} className="px-3.5 py-3 text-center">
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={isAssigned ? "Remove mentor from batch" : "Assign mentor to batch"}
                            onClick={() => handleToggleAssign(batch, mentor.id)}
                            onKeyDown={(e) => e.key === "Enter" && handleToggleAssign(batch, mentor.id)}
                            className="w-6 h-6 rounded flex items-center justify-center mx-auto border cursor-pointer transition-opacity"
                            style={
                              isAssigned
                                ? { background: "rgba(201,150,58,0.20)", borderColor: "rgba(201,150,58,0.4)", opacity: isToggling ? 0.5 : 1 }
                                : { background: "transparent", borderColor: "#333", opacity: isToggling ? 0.5 : 1 }
                            }
                          >
                            {isAssigned && !isToggling && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9963A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                            {isToggling && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" className="animate-spin">
                                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                              </svg>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User roles */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">User roles management</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">User</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Email</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Current Role</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Change Role</th>
                <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, i) => (
                <tr key={user.id} className={`hover:bg-bg-primary transition-colors ${i < allUsers.length - 1 ? "border-b border-border-default" : ""}`}>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={user.full_name} size="sm" />
                      <span className="text-[12.5px] text-text-primary">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[12.5px] text-text-muted">{user.email}</td>
                  <td className="px-3.5 py-3 text-[12.5px] font-mono text-brand">{user.role}</td>
                  <td className="px-3.5 py-3">
                    <select
                      className="bg-bg-primary border border-border-default rounded-md px-2 py-1 text-[12px] text-text-primary outline-none focus:border-border-focus transition-colors"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "MENTOR" | "STUDENT")}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-3.5 py-3">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteUser(user)}
                      className="p-1.5 rounded text-error/60 hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete user"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete user confirmation dialog */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-default rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-text-primary mb-2">Delete user?</h2>
            <p className="text-text-secondary text-sm mb-6">
              <span className="font-semibold text-text-primary">{confirmDeleteUser.full_name}</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deletingUserId === confirmDeleteUser.id}
                onClick={() => handleDeleteUser(confirmDeleteUser)}
                className="flex-1 py-2 px-4 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deletingUserId === confirmDeleteUser.id ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="flex-1 py-2 px-4 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student batch enrollment */}
      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[13px] font-semibold text-white">Student batch enrollment</p>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-[13px]">No students yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Student</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Email</th>
                  <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Assign Batch</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.id} className={`hover:bg-bg-primary transition-colors ${i < students.length - 1 ? "border-b border-border-default" : ""}`}>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.full_name} size="sm" />
                        <span className="text-[12.5px] text-text-primary">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-muted">{student.email}</td>
                    <td className="px-3.5 py-3">
                      <select
                        className="bg-bg-primary border border-border-default rounded-md px-2 py-1 text-[12px] text-text-primary outline-none focus:border-border-focus transition-colors disabled:opacity-50"
                        defaultValue={student.batch_ids?.[0] ?? ""}
                        disabled={assigningStudent === student.id}
                        onChange={(e) => handleAssignBatch(student.id, e.target.value)}
                      >
                        <option value="">No batch</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>{b.batch_name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type AuditFilter = "all" | AuditRole;

function AuditLogScreen() {
  const [filter, setFilter] = useState<AuditFilter>("all");
  const filters: AuditFilter[] = ["all", "admin", "mentor", "system"];

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold tracking-[-0.022em] text-white">Audit log</h2>

      <div className="flex items-center gap-1.5">
        {filters.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md font-mono text-[10.5px] uppercase tracking-[0.07em] border transition-colors"
            style={
              filter === f
                ? { background: "rgba(201,150,58,0.15)", color: "#C9963A", borderColor: "rgba(201,150,58,0.3)" }
                : { background: "transparent", color: "#737373", borderColor: "#333" }
            }>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="flex items-start gap-3.5 px-4 py-3 border-b border-border-default">
          <span className="flex-shrink-0">
            <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: auditDotColor.system }} />
          </span>
          <p className="text-[12px] text-text-muted">Audit log not yet available from backend.</p>
        </div>
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
  { id: "overview", label: "Overview" },
  { id: "catalog",  label: "Courses & batches" },
  { id: "people",   label: "People & roles" },
  { id: "audit",    label: "Audit log" },
];

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const firstName = user.full_name.split(" ")[0];

  const { data: dashRes, isLoading: dashLoading } = useGetAdminDashboard();
  const { data: batchesRes } = useGetAdminBatches();
  const { data: coursesRes } = useGetAdminCourses();
  const { data: usersRes } = useGetAdminUsers();

  const dashData: AdminDashboardData | null = dashRes?.data?.data ?? null;
  const batches: AdminBatch[] = batchesRes?.data?.data ?? [];
  const courses: AdminCourse[] = coursesRes?.data?.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allUsers: AdminUser[] = ((usersRes?.data as any)?.data as unknown as AdminUser[]) ?? [];
  const mentors: AdminUser[] = allUsers.filter((u) => u.role === "MENTOR");

  const getMentorName = (id: string) =>
    allUsers.find((u) => u.id === id)?.full_name ?? "—";

  return (
    <>
      <AppShell
        role="ADMIN"
        userName={user.full_name}
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === "overview" && (
          <OverviewScreen
            onNewCourse={() => setShowCreateModal(true)}
            firstName={firstName}
            dashData={dashData}
            dashLoading={dashLoading}
            batches={batches}
            getMentorName={getMentorName}
          />
        )}
        {activeTab === "catalog" && (
          <CatalogScreen
            onNewCourse={() => setShowCreateModal(true)}
            courses={courses}
            batches={batches}
            getMentorName={getMentorName}
          />
        )}
        {activeTab === "people" && (
          <PeopleScreen allUsers={allUsers} mentors={mentors} batches={batches} />
        )}
        {activeTab === "audit" && <AuditLogScreen />}
      </AppShell>

      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          mentors={mentors}
        />
      )}
    </>
  );
}
