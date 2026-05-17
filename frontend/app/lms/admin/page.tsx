"use client";

import { Suspense, useEffect, useState } from "react";
import {
  getAdminBatchesQueryKey,
  getAdminCoursesQueryKey,
  useGetAdminBatches,
  useGetAdminCourses,
  useGetAdminUsers,
  useGetUser,
  usePostAdminCourses,
  usePostBatch,
  useDeleteAdminCourse,
  useAddModule,
  useUpdateAdminModule,
  useDeleteAdminModule,
  useAddLecture,
  useUpdateAdminLecture,
  useDeleteAdminLecture,
  type AdminBatch,
  type AdminCourse,
  type AdminUser,
  type AddLectureBody,
  type UpdateLectureBody,
} from "@akxr/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyHint, fmtDate, LmsLayout, Panel, StatTile } from "@/components/lms/LmsLayout";

type AdminTab = "catalog" | "build" | "batch";

// ── Shared field primitives ───────────────────────────────────────────────────

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="text-[11px] text-text-muted flex flex-col gap-1">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary placeholder:text-text-muted"
      />
    </label>
  );
}

function FieldTextarea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="text-[11px] text-text-muted flex flex-col gap-1">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary resize-none placeholder:text-text-muted"
      />
    </label>
  );
}

function FieldDate({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-[11px] text-text-muted flex flex-col gap-1">
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
      />
    </label>
  );
}

function GoldButton({ children, onClick, disabled, className = "" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150 disabled:opacity-50 ${className}`}
      style={{ background: "linear-gradient(135deg, var(--gold-ink) 0%, var(--gold) 45%, var(--gold-deep) 100%)" }}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick, disabled, className = "" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded-md text-[11.5px] font-medium border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Lecture editor modal ──────────────────────────────────────────────────────

interface LectureEditorProps {
  mode: "add" | "edit";
  moduleId: string;
  initial?: AddLectureBody & { id?: string };
  onClose: () => void;
  onSaved: () => void;
}

function LectureEditor({ mode, moduleId, initial, onClose, onSaved }: LectureEditorProps) {
  const [form, setForm] = useState<UpdateLectureBody & { title: string }>({
    title: initial?.title ?? "",
    sequence_order: initial?.sequence_order ?? 0,
    video_url: initial?.video_url ?? "",
    text_content: initial?.text_content ?? "",
    assignment_reference: initial?.assignment_reference ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMutation = useAddLecture();
  const updateMutation = useUpdateAdminLecture();

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        sequence_order: Number(form.sequence_order) || 0,
        video_url: form.video_url?.trim() || null,
        text_content: form.text_content?.trim() || null,
        assignment_reference: form.assignment_reference?.trim() || null,
      };
      if (mode === "add") {
        await addMutation.mutateAsync({ moduleId, body: payload });
      } else {
        await updateMutation.mutateAsync({ lectureId: initial!.id!, body: payload });
      }
      onSaved();
      onClose();
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-bg-secondary border border-border-default rounded-lg w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <h3 className="text-[14px] font-semibold text-white">
            {mode === "add" ? "Add lecture" : "Edit lecture"}
          </h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.78 4.28a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72Z" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          <FieldInput label="Lecture title *" value={form.title} onChange={f("title")} placeholder="e.g. Introduction to Arrays" />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Sequence order"
              value={String(form.sequence_order ?? 0)}
              onChange={(v) => setForm((p) => ({ ...p, sequence_order: Number(v) || 0 }))}
            />
            <FieldInput label="Assignment reference" value={form.assignment_reference ?? ""} onChange={f("assignment_reference")} placeholder="e.g. hw-01" />
          </div>
          <FieldInput label="Video URL (YouTube / Vimeo)" value={form.video_url ?? ""} onChange={f("video_url")} placeholder="https://youtube.com/watch?v=…" />
          <FieldTextarea label="Text / notes content" value={form.text_content ?? ""} onChange={f("text_content")} rows={4} placeholder="Markdown or plain text notes…" />
          {error && <p className="text-[11.5px] text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border-default">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-[12.5px] border border-border-default text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <GoldButton onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : mode === "add" ? "Add lecture" : "Save changes"}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}

// ── Catalog: editable course tree ─────────────────────────────────────────────

interface CatalogProps {
  courses: AdminCourse[];
  batches: AdminBatch[];
  loading: boolean;
  onRefresh: () => void;
}

function Catalog({ courses, batches, loading, onRefresh }: CatalogProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [lectureEditor, setLectureEditor] = useState<{
    mode: "add" | "edit";
    moduleId: string;
    initial?: AddLectureBody & { id: string };
  } | null>(null);
  const [addModuleTitle, setAddModuleTitle] = useState<{ [courseId: string]: string }>({});
  const [addingModule, setAddingModule] = useState<string | null>(null);

  const addModuleMutation = useAddModule();
  const deleteModuleMutation = useDeleteAdminModule();
  const deleteLectureMutation = useDeleteAdminLecture();
  const deleteCourseMutation = useDeleteAdminCourse();

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null;
  const linkedBatches = selectedCourse
    ? batches.filter((b) => b.course_ids.includes(selectedCourse.id))
    : [];

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAddModule(courseId: string) {
    const title = (addModuleTitle[courseId] ?? "").trim();
    if (!title) return;
    setAddingModule(courseId);
    try {
      await addModuleMutation.mutateAsync({ courseId, body: { title } });
      setAddModuleTitle((p) => ({ ...p, [courseId]: "" }));
      onRefresh();
    } finally {
      setAddingModule(null);
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lectures?")) return;
    await deleteModuleMutation.mutateAsync(moduleId);
    onRefresh();
  }

  async function handleDeleteLecture(lectureId: string) {
    if (!confirm("Delete this lecture?")) return;
    await deleteLectureMutation.mutateAsync(lectureId);
    onRefresh();
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm("Delete this entire course? This will remove all modules, lectures, and progress records.")) return;
    await deleteCourseMutation.mutateAsync(courseId);
    if (selectedCourseId === courseId) setSelectedCourseId(null);
    onRefresh();
  }

  return (
    <>
      {lectureEditor && (
        <LectureEditor
          mode={lectureEditor.mode}
          moduleId={lectureEditor.moduleId}
          initial={lectureEditor.initial}
          onClose={() => setLectureEditor(null)}
          onSaved={onRefresh}
        />
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <StatTile label="Courses" value={courses.length} sub="in catalog" />
          <StatTile label="Linked batches" value={batches.length} sub="across all courses" />
          <StatTile
            label="Total modules"
            value={courses.reduce((a, c) => a + c.modules.length, 0)}
            sub="across all courses"
          />
          <StatTile
            label="Drafts"
            value={courses.filter((c) => c.status === "DRAFT").length}
            sub="pending publish"
          />
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr 300px" }}>
          {/* Course list */}
          <Panel title="Courses">
            <div className="max-h-[72vh] overflow-auto">
              {loading ? (
                <EmptyHint text="Loading…" />
              ) : courses.length === 0 ? (
                <EmptyHint text="No courses yet. Use Build tab to create one." />
              ) : (
                courses.map((course) => {
                  const active = course.id === (selectedCourse?.id ?? null);
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border-default transition-colors ${active ? "bg-bg-primary" : "hover:bg-bg-primary"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-[12.5px] font-medium truncate ${active ? "text-white" : "text-text-secondary"}`}>
                            {course.title}
                          </p>
                          <p className="text-[10.5px] text-text-muted mt-0.5">
                            {course.modules.length} modules · {course.modules.reduce((a, m) => a + m.lectures.length, 0)} lectures
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-[9.5px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded border ${course.status === "PUBLISHED" ? "border-emerald-800 text-emerald-400" : "border-border-default text-text-muted"}`}>
                          {course.status === "PUBLISHED" ? "Live" : "Draft"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Panel>

          {/* Editable course tree */}
          <Panel
            title={selectedCourse?.title ?? "Select a course"}
            sub={selectedCourse ? `${selectedCourse.modules.length} modules · ${selectedCourse.status}` : undefined}
            right={
              selectedCourse ? (
                <DangerButton onClick={() => handleDeleteCourse(selectedCourse.id)}>
                  Delete course
                </DangerButton>
              ) : undefined
            }
          >
            <div className="max-h-[72vh] overflow-auto">
              {!selectedCourse ? (
                <EmptyHint text="Select a course from the list to manage its content." />
              ) : (
                <>
                  {[...selectedCourse.modules]
                    .sort((a, b) => a.sequence_order - b.sequence_order)
                    .map((mod) => {
                      const expanded = expandedModules.has(mod.id);
                      const sortedLectures = [...mod.lectures].sort(
                        (a, b) => a.sequence_order - b.sequence_order
                      );
                      return (
                        <div key={mod.id} className="border-b border-border-default">
                          {/* Module row */}
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary hover:bg-bg-primary transition-colors group">
                            <button
                              type="button"
                              onClick={() => toggleModule(mod.id)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                className={`flex-shrink-0 text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
                                fill="currentColor"
                              >
                                <path d="M3.5 1.5 7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="text-[12px] font-semibold text-text-secondary truncate">
                                {mod.title}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono ml-1">
                                ({sortedLectures.length})
                              </span>
                            </button>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                title="Add lecture"
                                onClick={() => {
                                  toggleModule(mod.id);
                                  setLectureEditor({ mode: "add", moduleId: mod.id });
                                }}
                                className="text-[10.5px] text-brand hover:text-text-primary px-1.5 py-1 rounded border border-brand/40 hover:border-brand transition-colors"
                              >
                                + Lecture
                              </button>
                              <button
                                type="button"
                                title="Delete module"
                                onClick={() => handleDeleteModule(mod.id)}
                                className="text-[10.5px] text-red-400 hover:text-red-300 px-1.5 py-1 rounded border border-red-900/40 hover:border-red-900 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Lecture rows */}
                          {expanded && (
                            <div>
                              {sortedLectures.length === 0 ? (
                                <p className="text-[11px] text-text-muted px-8 py-2">
                                  No lectures yet.{" "}
                                  <button
                                    type="button"
                                    className="text-brand underline"
                                    onClick={() => setLectureEditor({ mode: "add", moduleId: mod.id })}
                                  >
                                    Add one
                                  </button>
                                </p>
                              ) : (
                                sortedLectures.map((lec) => (
                                  <div
                                    key={lec.id}
                                    className="flex items-center gap-2 px-8 py-2 border-t border-border-default hover:bg-bg-primary transition-colors group"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[12px] text-text-secondary truncate">{lec.title}</p>
                                      <div className="flex gap-2 mt-0.5">
                                        {lec.video_url && <span className="text-[9.5px] font-mono text-brand uppercase">Video</span>}
                                        {lec.text_content && <span className="text-[9.5px] font-mono text-text-muted uppercase">Text</span>}
                                        {lec.assignment_reference && <span className="text-[9.5px] font-mono text-amber-500 uppercase">Assignment</span>}
                                        {!lec.video_url && !lec.text_content && !lec.assignment_reference && (
                                          <span className="text-[9.5px] text-text-muted">No content</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setLectureEditor({
                                            mode: "edit",
                                            moduleId: mod.id,
                                            initial: {
                                              id: lec.id,
                                              title: lec.title,
                                              sequence_order: lec.sequence_order,
                                              video_url: lec.video_url,
                                              text_content: lec.text_content,
                                              assignment_reference: lec.assignment_reference,
                                            },
                                          })
                                        }
                                        className="text-[10.5px] text-text-muted hover:text-text-primary px-1.5 py-1 rounded border border-border-default hover:border-text-muted transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLecture(lec.id)}
                                        className="text-[10.5px] text-red-400 hover:text-red-300 px-1.5 py-1 rounded border border-red-900/40 hover:border-red-900 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}

                              {/* Add lecture inline shortcut */}
                              <button
                                type="button"
                                onClick={() => setLectureEditor({ mode: "add", moduleId: mod.id })}
                                className="w-full text-left px-8 py-2 text-[11px] text-text-muted hover:text-brand border-t border-border-default hover:bg-bg-primary transition-colors"
                              >
                                + Add lecture
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Add module row */}
                  <div className="px-4 py-3 flex items-center gap-2">
                    <input
                      value={addModuleTitle[selectedCourse.id] ?? ""}
                      onChange={(e) =>
                        setAddModuleTitle((p) => ({ ...p, [selectedCourse.id]: e.target.value }))
                      }
                      placeholder="New module title…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddModule(selectedCourse.id);
                      }}
                      className="flex-1 bg-bg-primary border border-border-default rounded-md px-3 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted"
                    />
                    <GoldButton
                      onClick={() => handleAddModule(selectedCourse.id)}
                      disabled={addingModule === selectedCourse.id || !(addModuleTitle[selectedCourse.id] ?? "").trim()}
                    >
                      {addingModule === selectedCourse.id ? "Adding…" : "+ Module"}
                    </GoldButton>
                  </div>
                </>
              )}
            </div>
          </Panel>

          {/* Linked batches */}
          <Panel
            title="Linked batches"
            sub={selectedCourse ? `For "${selectedCourse.title}"` : "Pick a course"}
          >
            <div className="max-h-[72vh] overflow-auto">
              {!selectedCourse ? (
                <EmptyHint text="Select a course to see linked batches." />
              ) : linkedBatches.length === 0 ? (
                <EmptyHint text="No batches linked. Create one from the Batch tab." />
              ) : (
                linkedBatches.map((batch, idx) => (
                  <div
                    key={batch.id}
                    className={`px-4 py-3 ${idx < linkedBatches.length - 1 ? "border-b border-border-default" : ""}`}
                  >
                    <p className="font-mono text-[11px] text-brand">{batch.batch_code}</p>
                    <p className="text-[12.5px] text-text-secondary mt-1">{batch.batch_name}</p>
                    <p className="text-[10.5px] text-text-muted mt-1">
                      {fmtDate(batch.batch_start_date)} → {fmtDate(batch.batch_end_date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

// ── Course builder ────────────────────────────────────────────────────────────

interface DraftLecture {
  _key: string;
  title: string;
  video_url: string;
  text_content: string;
  assignment_reference: string;
  sequence_order: number;
}

interface DraftModule {
  _key: string;
  title: string;
  sequence_order: number;
  lectures: DraftLecture[];
}

function newLecture(seq: number): DraftLecture {
  return { _key: crypto.randomUUID(), title: "", video_url: "", text_content: "", assignment_reference: "", sequence_order: seq };
}

function newModule(seq: number): DraftModule {
  return { _key: crypto.randomUUID(), title: "", sequence_order: seq, lectures: [newLecture(1)] };
}

interface BuildTabProps {
  onRefresh: () => void;
  createCourseMutation: ReturnType<typeof usePostAdminCourses>;
}

function BuildTab({ onRefresh, createCourseMutation }: BuildTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [modules, setModules] = useState<DraftModule[]>([newModule(1)]);
  const [feedback, setFeedback] = useState<string | null>(null);

  function addModule() {
    setModules((p) => [...p, newModule(p.length + 1)]);
  }

  function removeModule(key: string) {
    setModules((p) => p.filter((m) => m._key !== key));
  }

  function updateModuleField(key: string, field: "title" | "sequence_order", value: string | number) {
    setModules((p) => p.map((m) => m._key === key ? { ...m, [field]: value } : m));
  }

  function addLectureToModule(moduleKey: string) {
    setModules((p) =>
      p.map((m) =>
        m._key === moduleKey
          ? { ...m, lectures: [...m.lectures, newLecture(m.lectures.length + 1)] }
          : m
      )
    );
  }

  function removeLecture(moduleKey: string, lectureKey: string) {
    setModules((p) =>
      p.map((m) =>
        m._key === moduleKey
          ? { ...m, lectures: m.lectures.filter((l) => l._key !== lectureKey) }
          : m
      )
    );
  }

  function updateLectureField(
    moduleKey: string,
    lectureKey: string,
    field: keyof Omit<DraftLecture, "_key">,
    value: string | number
  ) {
    setModules((p) =>
      p.map((m) =>
        m._key === moduleKey
          ? {
              ...m,
              lectures: m.lectures.map((l) =>
                l._key === lectureKey ? { ...l, [field]: value } : l
              ),
            }
          : m
      )
    );
  }

  async function handleCreate() {
    if (!title.trim() || !description.trim()) {
      setFeedback("Course title and description are required.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      modules: modules
        .filter((m) => m.title.trim())
        .map((m, mi) => ({
          title: m.title.trim(),
          sequence_order: m.sequence_order || mi + 1,
          lectures: m.lectures
            .filter((l) => l.title.trim())
            .map((l, li) => ({
              title: l.title.trim(),
              sequence_order: l.sequence_order || li + 1,
              video_url: l.video_url.trim() || null,
              text_content: l.text_content.trim() || null,
              assignment_reference: l.assignment_reference.trim() || null,
            })),
        })),
    };

    createCourseMutation.mutate(
      { data: payload as any },
      {
        onSuccess: async (res) => {
          if (res.status !== 201) {
            setFeedback("Course creation failed.");
            return;
          }
          setTitle("");
          setDescription("");
          setStatus("DRAFT");
          setModules([newModule(1)]);
          setFeedback("Course created successfully!");
          onRefresh();
        },
        onError: () => setFeedback("Course creation failed. Please try again."),
      }
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Panel title="Course details">
        <div className="p-4 space-y-3">
          <FieldInput label="Course title *" value={title} onChange={setTitle} placeholder="e.g. JavaScript Fundamentals" />
          <FieldTextarea label="Description *" value={description} onChange={setDescription} rows={3} placeholder="What students will learn in this course…" />
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-text-muted flex flex-col gap-1">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
          </div>
        </div>
      </Panel>

      {/* Module + lecture builder */}
      {modules.map((mod, modIdx) => (
        <div key={mod._key} className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
          {/* Module header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default bg-bg-primary">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex-shrink-0">
              Module {modIdx + 1}
            </span>
            <input
              value={mod.title}
              onChange={(e) => updateModuleField(mod._key, "title", e.target.value)}
              placeholder="Module title…"
              className="flex-1 bg-transparent border-b border-border-default text-[13px] text-white py-0.5 placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <input
              type="number"
              min={1}
              value={mod.sequence_order}
              onChange={(e) => updateModuleField(mod._key, "sequence_order", Number(e.target.value))}
              className="w-14 bg-bg-secondary border border-border-default rounded px-2 py-1 text-[11.5px] text-text-primary text-center"
              title="Sequence order"
            />
            {modules.length > 1 && (
              <button
                type="button"
                onClick={() => removeModule(mod._key)}
                className="text-red-400 hover:text-red-300 text-[12px]"
              >
                Remove
              </button>
            )}
          </div>

          {/* Lectures */}
          <div className="divide-y divide-border-default">
            {mod.lectures.map((lec, lecIdx) => (
              <div key={lec._key} className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9.5px] text-text-muted flex-shrink-0">L{lecIdx + 1}</span>
                  <input
                    value={lec.title}
                    onChange={(e) => updateLectureField(mod._key, lec._key, "title", e.target.value)}
                    placeholder="Lecture title…"
                    className="flex-1 bg-transparent border-b border-border-default text-[12.5px] text-white py-0.5 placeholder:text-text-muted focus:outline-none focus:border-brand"
                  />
                  {mod.lectures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLecture(mod._key, lec._key)}
                      className="text-red-400 hover:text-red-300 text-[11px] flex-shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pl-5">
                  <input
                    value={lec.video_url}
                    onChange={(e) => updateLectureField(mod._key, lec._key, "video_url", e.target.value)}
                    placeholder="Video URL (optional)"
                    className="bg-bg-primary border border-border-default rounded px-2.5 py-1.5 text-[11.5px] text-text-primary placeholder:text-text-muted col-span-2"
                  />
                  <textarea
                    value={lec.text_content}
                    onChange={(e) => updateLectureField(mod._key, lec._key, "text_content", e.target.value)}
                    placeholder="Text / notes (optional)"
                    rows={2}
                    className="bg-bg-primary border border-border-default rounded px-2.5 py-1.5 text-[11.5px] text-text-primary placeholder:text-text-muted resize-none"
                  />
                  <input
                    value={lec.assignment_reference}
                    onChange={(e) => updateLectureField(mod._key, lec._key, "assignment_reference", e.target.value)}
                    placeholder="Assignment ref (optional)"
                    className="bg-bg-primary border border-border-default rounded px-2.5 py-1.5 text-[11.5px] text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-border-default">
            <button
              type="button"
              onClick={() => addLectureToModule(mod._key)}
              className="text-[11.5px] text-text-muted hover:text-brand transition-colors"
            >
              + Add lecture
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addModule}
        className="w-full py-3 rounded-lg border border-dashed border-border-default text-[12px] text-text-muted hover:text-text-secondary hover:border-text-muted transition-colors"
      >
        + Add module
      </button>

      <div className="flex items-center justify-between pt-2">
        {feedback ? (
          <p className={`text-[12.5px] ${feedback.includes("success") ? "text-emerald-400" : "text-red-400"}`}>
            {feedback}
          </p>
        ) : <span />}
        <GoldButton onClick={handleCreate} disabled={createCourseMutation.isPending}>
          {createCourseMutation.isPending ? "Creating…" : "Create course"}
        </GoldButton>
      </div>
    </div>
  );
}

// ── Batch creation tab ────────────────────────────────────────────────────────

interface BatchTabProps {
  courses: AdminCourse[];
  mentors: AdminUser[];
  createBatchMutation: ReturnType<typeof usePostBatch>;
  onRefresh: () => void;
}

interface BatchForm {
  course_id: string;
  batch_code: string;
  batch_name: string;
  mentor_id: string;
  batch_start_date: string;
  batch_end_date: string;
  estimated_end_date: string;
  total_classes: number;
  description: string;
}

const initialBatchForm: BatchForm = {
  course_id: "",
  batch_code: "",
  batch_name: "",
  mentor_id: "",
  batch_start_date: "",
  batch_end_date: "",
  estimated_end_date: "",
  total_classes: 20,
  description: "",
};

function BatchTab({ courses, mentors, createBatchMutation, onRefresh }: BatchTabProps) {
  const [form, setForm] = useState<BatchForm>(initialBatchForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const f = (k: keyof BatchForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  function handleCreate() {
    const course = courses.find((c) => c.id === form.course_id);
    if (!course) { setFeedback("Select a course first."); return; }
    if (!form.mentor_id || !form.batch_code.trim() || !form.batch_name.trim()) {
      setFeedback("Batch code, name, and mentor are required.");
      return;
    }

    createBatchMutation.mutate(
      {
        data: {
          total_classes: Number(form.total_classes),
          batch_name: form.batch_name.trim(),
          mentor_ids: [form.mentor_id],
          batch_start_date: form.batch_start_date,
          batch_end_date: form.batch_end_date,
          estimated_end_date: form.estimated_end_date || form.batch_end_date,
          current_course_id: course.id,
          course_ids: [course.id],
          batch_code: form.batch_code.trim().toUpperCase(),
          description: form.description.trim() || `Batch for ${course.title}`,
        },
      },
      {
        onSuccess: async (res) => {
          if (res.status !== 201) { setFeedback("Batch creation failed."); return; }
          await queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
          setForm(initialBatchForm);
          setFeedback("Batch created and connected to the selected course.");
          onRefresh();
        },
        onError: () => setFeedback("Batch creation failed. Verify dates and mentor."),
      }
    );
  }

  return (
    <div className="max-w-xl">
      <Panel title="Create batch" sub="Connect a mentor and dates to an existing course">
        <div className="p-4 space-y-3">
          <label className="text-[11px] text-text-muted flex flex-col gap-1">
            Course *
            <select
              value={form.course_id}
              onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
              className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Batch code *" value={form.batch_code} onChange={(v) => setForm((p) => ({ ...p, batch_code: v.slice(0, 8) }))} placeholder="e.g. JS01" />
            <FieldInput label="Batch name *" value={form.batch_name} onChange={f("batch_name")} placeholder="e.g. Jan 2025 Cohort" />
          </div>

          <FieldInput label="Description" value={form.description} onChange={f("description")} />

          <div className="grid grid-cols-3 gap-3">
            <FieldDate label="Start date" value={form.batch_start_date} onChange={f("batch_start_date")} />
            <FieldDate label="End date" value={form.batch_end_date} onChange={f("batch_end_date")} />
            <FieldDate label="Estimated end" value={form.estimated_end_date} onChange={f("estimated_end_date")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] text-text-muted flex flex-col gap-1">
              Mentor *
              <select
                value={form.mentor_id}
                onChange={(e) => setForm((p) => ({ ...p, mentor_id: e.target.value }))}
                className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
              >
                <option value="">Select mentor…</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-text-muted flex flex-col gap-1">
              Total classes
              <input
                type="number"
                min={1}
                value={form.total_classes}
                onChange={(e) => setForm((p) => ({ ...p, total_classes: Number(e.target.value) || 1 }))}
                className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
              />
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {feedback ? (
              <p className={`text-[12px] ${feedback.includes("created") ? "text-emerald-400" : "text-red-400"}`}>
                {feedback}
              </p>
            ) : <span />}
            <GoldButton onClick={handleCreate} disabled={createBatchMutation.isPending}>
              {createBatchMutation.isPending ? "Creating…" : "Create batch"}
            </GoldButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────

const EMPTY_COURSES: AdminCourse[] = [];
const EMPTY_BATCHES: AdminBatch[] = [];
const EMPTY_USERS: AdminUser[] = [];

export default function LMSAdmin() {
  return (
    <Suspense fallback={null}>
      <LMSAdminInner />
    </Suspense>
  );
}

function LMSAdminInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<AdminTab>(
    requestedTab === "build" ? "build" : requestedTab === "batch" ? "batch" : "catalog"
  );

  const { data: userRes, isLoading: userLoading } = useGetUser();
  const { data: coursesRes, isLoading: coursesLoading } = useGetAdminCourses();
  const { data: batchesRes } = useGetAdminBatches();
  const { data: usersRes } = useGetAdminUsers();
  const createCourseMutation = usePostAdminCourses();
  const createBatchMutation = usePostBatch();

  const user = userRes?.status === 200 ? userRes.data.data : null;

  useEffect(() => {
    if (userLoading) return;
    if (!user || user.role !== "ADMIN") router.push("/");
  }, [user, userLoading, router]);

  const courses: AdminCourse[] = coursesRes?.data?.data ?? EMPTY_COURSES;
  const batches: AdminBatch[] = batchesRes?.data?.data ?? EMPTY_BATCHES;
  const allUsers = (usersRes?.status === 200 ? usersRes.data.data : EMPTY_USERS) as AdminUser[];
  const mentors = allUsers.filter((u) => u.role === "MENTOR" || u.role === "MENTOR_EDITOR");

  if (!user || user.role !== "ADMIN") return null;

  function refresh() {
    queryClient.invalidateQueries({ queryKey: getAdminCoursesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
  }

  return (
    <LmsLayout
      role="ADMIN"
      heading="LMS Control Workspace"
      subtitle="Manage courses, build content, and launch batches connected to mentors."
      userName={user.full_name}
      tabs={[
        { id: "catalog", label: "Catalog" },
        { id: "build", label: "Build course" },
        { id: "batch", label: "Create batch" },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as AdminTab)}
    >
      {activeTab === "catalog" ? (
        <Catalog
          courses={courses}
          batches={batches}
          loading={coursesLoading}
          onRefresh={refresh}
        />
      ) : activeTab === "build" ? (
        <BuildTab
          onRefresh={refresh}
          createCourseMutation={createCourseMutation}
        />
      ) : (
        <BatchTab
          courses={courses}
          mentors={mentors}
          createBatchMutation={createBatchMutation}
          onRefresh={refresh}
        />
      )}
    </LmsLayout>
  );
}
