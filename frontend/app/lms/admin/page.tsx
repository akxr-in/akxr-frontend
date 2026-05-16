"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminBatchesQueryKey,
  getAdminCoursesQueryKey,
  useGetAdminBatches,
  useGetAdminCourses,
  useGetAdminUsers,
  useGetUser,
  usePostAdminCourses,
  usePostBatch,
  type AdminBatch,
  type AdminCourse,
  type AdminUser,
} from "@akxr/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyHint, fmtDate, LmsLayout, Panel, StatTile } from "@/components/lms/LmsLayout";

type AdminTab = "catalog" | "create";

interface CreateCourseForm {
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
  moduleTitle: string;
  lectureTitle: string;
  lectureVideoUrl: string;
  lectureNotes: string;
  assignmentRef: string;
}

interface CreateBatchForm {
  batch_code: string;
  batch_name: string;
  mentor_id: string;
  batch_start_date: string;
  batch_end_date: string;
  estimated_end_date: string;
  total_classes: number;
  description: string;
}

const initialCourseForm: CreateCourseForm = {
  title: "",
  description: "",
  status: "DRAFT",
  moduleTitle: "",
  lectureTitle: "",
  lectureVideoUrl: "",
  lectureNotes: "",
  assignmentRef: "",
};

const initialBatchForm: CreateBatchForm = {
  batch_code: "",
  batch_name: "",
  mentor_id: "",
  batch_start_date: "",
  batch_end_date: "",
  estimated_end_date: "",
  total_classes: 20,
  description: "",
};

const EMPTY_COURSES: AdminCourse[] = [];
const EMPTY_BATCHES: AdminBatch[] = [];
const EMPTY_USERS: AdminUser[] = [];

export default function LMSAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<AdminTab>(requestedTab === "create" ? "create" : "catalog");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLectureKey, setSelectedLectureKey] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<CreateCourseForm>(initialCourseForm);
  const [batchForm, setBatchForm] = useState<CreateBatchForm>(initialBatchForm);
  const [feedback, setFeedback] = useState<string | null>(null);

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
  const mentors = allUsers.filter((item) => item.role === "MENTOR" || item.role === "MENTOR_EDITOR");
  const effectiveCourseId = selectedCourseId ?? courses[0]?.id ?? null;
  const selectedCourse = courses.find((course) => course.id === effectiveCourseId) ?? null;

  const selectedLecture = useMemo(() => {
    if (!selectedCourse) return null;
    const allLectures = selectedCourse.modules.flatMap((module) =>
      module.lectures.map((lecture) => ({
        key: `${module.id}:${lecture.id}`,
        moduleTitle: module.title,
        lecture,
      })),
    );
    if (allLectures.length === 0) return null;
    const fallback = allLectures[0];
    return allLectures.find((item) => item.key === selectedLectureKey) ?? fallback;
  }, [selectedCourse, selectedLectureKey]);

  const linkedBatches = selectedCourse
    ? batches.filter((batch) => batch.course_ids.includes(selectedCourse.id))
    : [];

  if (!user || user.role !== "ADMIN") return null;

  async function handleCreateCourse(): Promise<void> {
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      setFeedback("Course title and description are required.");
      return;
    }

    createCourseMutation.mutate(
      {
        // Orval-generated PostAdminCoursesBody is stale (uses old name/time_allotted_in_weeks
        // shape); the BE Zod schema actually accepts { title, description, status, modules }.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          title: courseForm.title.trim(),
          description: courseForm.description.trim(),
          status: courseForm.status,
          modules: courseForm.moduleTitle.trim()
            ? [
                {
                  title: courseForm.moduleTitle.trim(),
                  sequence_order: 1,
                  lectures: courseForm.lectureTitle.trim()
                    ? [
                        {
                          title: courseForm.lectureTitle.trim(),
                          sequence_order: 1,
                          video_url: courseForm.lectureVideoUrl.trim() || null,
                          text_content: courseForm.lectureNotes.trim() || null,
                          assignment_reference: courseForm.assignmentRef.trim() || null,
                        },
                      ]
                    : [],
                },
              ]
            : [],
        } as any,
      },
      {
        onSuccess: async (res) => {
          if (res.status !== 201) {
            setFeedback("Could not create course. Please verify your payload.");
            return;
          }
          await queryClient.invalidateQueries({ queryKey: getAdminCoursesQueryKey() });
          setCourseForm(initialCourseForm);
          setFeedback("Course created successfully. You can now create a linked batch.");
        },
        onError: () => {
          setFeedback("Course creation failed. Please try again.");
        },
      },
    );
  }

  function handleCreateBatch(): void {
    if (!selectedCourse) {
      setFeedback("Pick a course in the catalog before creating a batch.");
      return;
    }
    if (!batchForm.mentor_id || !batchForm.batch_code.trim() || !batchForm.batch_name.trim()) {
      setFeedback("Batch code, name, and mentor are required.");
      return;
    }

    createBatchMutation.mutate(
      {
        data: {
          total_classes: Number(batchForm.total_classes),
          batch_name: batchForm.batch_name.trim(),
          mentor_ids: [batchForm.mentor_id],
          batch_start_date: batchForm.batch_start_date,
          batch_end_date: batchForm.batch_end_date,
          estimated_end_date: batchForm.estimated_end_date || batchForm.batch_end_date,
          current_course_id: selectedCourse.id,
          course_ids: [selectedCourse.id],
          batch_code: batchForm.batch_code.trim().toUpperCase(),
          description: batchForm.description.trim() || `Batch for ${selectedCourse.title}`,
        },
      },
      {
        onSuccess: async (res) => {
          if (res.status !== 201) {
            setFeedback("Batch creation failed due to validation.");
            return;
          }
          await queryClient.invalidateQueries({ queryKey: getAdminBatchesQueryKey() });
          setBatchForm(initialBatchForm);
          setFeedback("Batch created and connected to the selected course.");
          setActiveTab("catalog");
        },
        onError: () => {
          setFeedback("Batch creation failed. Please verify dates and mentor.");
        },
      },
    );
  }

  return (
    <LmsLayout
      role="ADMIN"
      heading="LMS Control Workspace"
      subtitle="Manage the course catalog and launch real batches tied to mentors."
      userName={user.full_name}
      tabs={[
        { id: "catalog", label: "Catalog" },
        { id: "create", label: "Create & connect" },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as AdminTab)}
    >
      {activeTab === "catalog" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <StatTile label="Courses" value={courses.length} sub="in LMS catalog" />
            <StatTile label="Linked batches" value={batches.length} sub="across all courses" />
            <StatTile label="Mentors" value={mentors.length} sub="eligible for assignment" />
            <StatTile label="Drafts" value={courses.filter((item) => item.status === "DRAFT").length} sub="pending publish" />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "320px 1fr 360px" }}>
            <Panel title="Course tree" sub="Modules and lectures">
              <div className="max-h-[72vh] overflow-auto p-2">
                {coursesLoading ? (
                  <EmptyHint text="Loading courses…" />
                ) : courses.length === 0 ? (
                  <EmptyHint text="No courses yet. Create one from the next tab." />
                ) : (
                  courses.map((course) => {
                    const selected = course.id === selectedCourse?.id;
                    return (
                      <div key={course.id} className="mb-2 border border-border-default rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`w-full text-left px-3 py-2 border-b border-border-default ${selected ? "bg-bg-primary" : "bg-bg-secondary hover:bg-bg-primary"}`}
                        >
                          <p className="text-[12.5px] text-white">{course.title}</p>
                          <p className="text-[10.5px] text-text-muted mt-1">
                            {course.modules.length} modules · {course.status}
                          </p>
                        </button>
                        {selected && (
                          <div className="p-2 space-y-1 bg-bg-secondary">
                            {course.modules.map((module, moduleIdx) => (
                              <div key={module.id}>
                                <p className="font-mono text-[10px] text-text-muted px-1 py-1 uppercase tracking-[0.08em]">
                                  {String(moduleIdx + 1).padStart(2, "0")} · {module.title}
                                </p>
                                {module.lectures.map((lecture) => {
                                  const key = `${module.id}:${lecture.id}`;
                                  const active = selectedLecture?.key === key;
                                  return (
                                    <button
                                      key={lecture.id}
                                      type="button"
                                      onClick={() => setSelectedLectureKey(key)}
                                      className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] ${
                                        active ? "bg-bg-primary text-white" : "text-text-secondary hover:bg-bg-primary"
                                      }`}
                                    >
                                      {lecture.title}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>

            <Panel
              title={selectedLecture?.lecture.title ?? "Lecture inspector"}
              sub={selectedLecture ? `${selectedLecture.moduleTitle} · selected lecture` : "Select a lecture from the tree"}
            >
              <div className="p-4 space-y-4">
                {!selectedLecture ? (
                  <EmptyHint text="Select a lecture to inspect metadata and content." />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <FieldRead label="Video URL" value={selectedLecture.lecture.video_url || "—"} />
                      <FieldRead label="Assignment reference" value={selectedLecture.lecture.assignment_reference || "—"} />
                    </div>
                    <FieldRead
                      label="Notes / text content"
                      value={selectedLecture.lecture.text_content || "No notes attached yet."}
                      multiline
                    />
                    <div className="text-[11px] text-text-muted">
                      Lecture editing endpoint is not exposed yet in backend. This panel is connected and read-only until patch endpoints are added.
                    </div>
                  </>
                )}
              </div>
            </Panel>

            <Panel title="Linked batches" sub={selectedCourse ? `For ${selectedCourse.title}` : "Pick a course"}>
              <div className="max-h-[72vh] overflow-auto">
                {linkedBatches.length === 0 ? (
                  <EmptyHint text="No batches linked to this course yet." />
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
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Panel title="Create course" sub="Creates an actual LMS course record">
            <div className="p-4 space-y-3">
              <FieldInput label="Course title" value={courseForm.title} onChange={(value) => setCourseForm((prev) => ({ ...prev, title: value }))} />
              <FieldTextarea
                label="Description"
                value={courseForm.description}
                onChange={(value) => setCourseForm((prev) => ({ ...prev, description: value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Module title"
                  value={courseForm.moduleTitle}
                  onChange={(value) => setCourseForm((prev) => ({ ...prev, moduleTitle: value }))}
                />
                <FieldInput
                  label="Lecture title"
                  value={courseForm.lectureTitle}
                  onChange={(value) => setCourseForm((prev) => ({ ...prev, lectureTitle: value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Video URL"
                  value={courseForm.lectureVideoUrl}
                  onChange={(value) => setCourseForm((prev) => ({ ...prev, lectureVideoUrl: value }))}
                />
                <FieldInput
                  label="Assignment reference"
                  value={courseForm.assignmentRef}
                  onChange={(value) => setCourseForm((prev) => ({ ...prev, assignmentRef: value }))}
                />
              </div>
              <FieldTextarea
                label="Lecture notes"
                value={courseForm.lectureNotes}
                onChange={(value) => setCourseForm((prev) => ({ ...prev, lectureNotes: value }))}
              />
              <div className="flex items-center justify-between pt-2">
                <select
                  value={courseForm.status}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, status: e.target.value as "DRAFT" | "PUBLISHED" }))
                  }
                  className="bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
                <button
                  type="button"
                  onClick={handleCreateCourse}
                  disabled={createCourseMutation.isPending}
                  className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
                >
                  {createCourseMutation.isPending ? "Creating…" : "Create course"}
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Create linked batch" sub="Connects a mentor and dates to a course">
            <div className="p-4 space-y-3">
              <select
                value={effectiveCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Batch code"
                  value={batchForm.batch_code}
                  onChange={(value) => setBatchForm((prev) => ({ ...prev, batch_code: value.slice(0, 4) }))}
                />
                <FieldInput
                  label="Batch name"
                  value={batchForm.batch_name}
                  onChange={(value) => setBatchForm((prev) => ({ ...prev, batch_name: value }))}
                />
              </div>
              <FieldInput
                label="Description"
                value={batchForm.description}
                onChange={(value) => setBatchForm((prev) => ({ ...prev, description: value }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <FieldDate
                  label="Start date"
                  value={batchForm.batch_start_date}
                  onChange={(value) => setBatchForm((prev) => ({ ...prev, batch_start_date: value }))}
                />
                <FieldDate
                  label="End date"
                  value={batchForm.batch_end_date}
                  onChange={(value) => setBatchForm((prev) => ({ ...prev, batch_end_date: value }))}
                />
                <FieldDate
                  label="Estimated end"
                  value={batchForm.estimated_end_date}
                  onChange={(value) => setBatchForm((prev) => ({ ...prev, estimated_end_date: value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[11px] text-text-muted">
                  Mentor
                  <select
                    value={batchForm.mentor_id}
                    onChange={(e) => setBatchForm((prev) => ({ ...prev, mentor_id: e.target.value }))}
                    className="mt-1 w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
                  >
                    <option value="">Select mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px] text-text-muted">
                  Total classes
                  <input
                    type="number"
                    min={1}
                    value={batchForm.total_classes}
                    onChange={(e) =>
                      setBatchForm((prev) => ({ ...prev, total_classes: Number(e.target.value) || 1 }))
                    }
                    className="mt-1 w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
                  />
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCreateBatch}
                  disabled={createBatchMutation.isPending}
                  className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
                >
                  {createBatchMutation.isPending ? "Creating…" : "Create batch"}
                </button>
              </div>
            </div>
          </Panel>

          {feedback ? (
            <div className="col-span-2 bg-bg-secondary border border-border-default rounded-lg px-4 py-3 text-[12.5px] text-text-secondary">
              {feedback}
            </div>
          ) : null}
        </div>
      )}
    </LmsLayout>
  );
}

function FieldRead({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className={`mt-1 px-3 py-2 rounded-md border border-border-default bg-bg-primary text-[12.5px] text-text-secondary ${multiline ? "min-h-[120px] whitespace-pre-wrap leading-6" : "truncate"}`}>
        {value}
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] text-text-muted">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
      />
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] text-text-muted">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary resize-none"
      />
    </label>
  );
}

function FieldDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11px] text-text-muted">
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-[12.5px] text-text-primary"
      />
    </label>
  );
}
