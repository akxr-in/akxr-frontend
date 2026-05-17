"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  useGetUserCourses,
  useGetUserCourse,
  usePostCompleteLecture,
  getUserCourseQueryKey,
  getUserCoursesQueryKey,
  getContinueLearningQueryKey,
  type UserCourseWithState,
  type UserLecture,
} from "@akxr/api";
import { EmptyHint, Panel } from "./LmsLayout";
import { LectureVideoPlayer } from "./LectureVideoPlayer";
import { dc, initDc } from "@/lib/dc";

// ── Inline markdown renderer (text + [label](url) links only) ────────────────

function InlineMarkdown({ text, className }: { text: string; className?: string }) {
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span className={className}>{parts}</span>;
}

function MarkdownText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split("\n").map((line, i) => (
        <p key={i} className={line.trim() === "" ? "h-3" : undefined}>
          <InlineMarkdown text={line} />
        </p>
      ))}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LectureContent({ lecture }: { lecture: UserLecture }) {
  const hasAny = lecture.video_url || lecture.text_content || lecture.assignment_reference;

  // Text tracking: open on mount, close on unmount, scroll on window scroll.
  const textRef = useRef<HTMLDivElement | null>(null);
  const openedAtRef = useRef<number>(0);
  useEffect(() => {
    if (!lecture.text_content) return;
    dc.text.open(lecture.id);
    openedAtRef.current = Date.now();

    const onScroll = () => {
      const el = textRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(viewportH - rect.top, 0), total);
      const pct = Math.round((scrolled / total) * 100);
      dc.text.scroll(lecture.id, pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      const seconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      dc.text.close(lecture.id, seconds);
    };
  }, [lecture.id, lecture.text_content]);

  if (!hasAny) {
    return (
      <div className="aspect-video flex items-center justify-center border border-border-default rounded-lg bg-bg-primary">
        <span className="text-[12px] text-text-muted">No content available for this lecture.</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {lecture.video_url && (
        <LectureVideoPlayer
          videoUrl={lecture.video_url}
          videoId={lecture.id}
          title={lecture.title}
        />
      )}

      {lecture.text_content && (
        <div ref={textRef} className="border border-border-default rounded-lg bg-bg-secondary p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-text-muted mb-3">Description</p>
          <MarkdownText
            text={lecture.text_content}
            className="text-[13.5px] text-text-secondary leading-7 space-y-1"
          />
        </div>
      )}

      {lecture.assignment_reference && (
        <div className="border border-border-default rounded-lg bg-bg-secondary p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide rounded border border-brand text-brand">
              Assignment
            </span>
          </div>
          <MarkdownText
            text={lecture.assignment_reference}
            className="text-[13.5px] text-text-secondary leading-7 space-y-1"
          />
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M10.28 2.28a.75.75 0 0 0-1.06 0L4.5 6.97 2.78 5.25a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l5.25-5.25a.75.75 0 0 0 0-1.06Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M8.5 4.134a1 1 0 0 1 0 1.732L2.5 9.232A1 1 0 0 1 1 8.366V1.634A1 1 0 0 1 2.5.768L8.5 4.134Z" />
    </svg>
  );
}

// ── Course sidebar (module + lecture tree) ────────────────────────────────────

interface CourseSidebarProps {
  courses: UserCourseWithState[];
  activeCourseId: string | null;
  activeLectureId: string | null;
  completedIds: Set<string>;
  onSelectCourse: (courseId: string) => void;
  onSelectLecture: (lectureId: string) => void;
}

function CourseSidebar({
  courses,
  activeCourseId,
  activeLectureId,
  completedIds,
  onSelectCourse,
  onSelectLecture,
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });

  // Auto-expand module containing the active lecture
  useEffect(() => {
    if (!activeLectureId) return;
    for (const entry of courses) {
      for (const mod of entry.course.modules) {
        if (mod.lectures.some((l) => l.id === activeLectureId)) {
          setExpandedModules((prev) => new Set([...prev, mod.id]));
        }
      }
    }
  }, [activeLectureId, courses]);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {courses.map((entry) => {
        const isActiveCourse = entry.course.id === activeCourseId;
        const sortedModules = [...entry.course.modules].sort(
          (a, b) => a.sequence_order - b.sequence_order
        );
        const totalLectures = sortedModules.reduce((acc, m) => acc + m.lectures.length, 0);
        const doneLectures = sortedModules.reduce(
          (acc, m) => acc + m.lectures.filter((l) => completedIds.has(l.id)).length,
          0
        );

        return (
          <div key={entry.course.id} className="border-b border-border-default last:border-b-0">
            {/* Course header */}
            <button
              type="button"
              onClick={() => onSelectCourse(entry.course.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${isActiveCourse ? "bg-bg-primary" : "hover:bg-bg-primary"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[12px] font-semibold truncate ${isActiveCourse ? "text-white" : "text-text-secondary"}`}>
                    {entry.course.title}
                  </p>
                  <p className="text-[10.5px] text-text-muted mt-0.5">
                    {doneLectures}/{totalLectures} lectures
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-[9.5px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded border ${entry.state === "COMPLETED"
                      ? "border-emerald-800 text-emerald-400"
                      : entry.state === "IN_PROGRESS"
                        ? "border-brand text-brand"
                        : "border-border-default text-text-muted"
                    }`}
                >
                  {entry.state === "IN_PROGRESS" ? "Active" : entry.state === "COMPLETED" ? "Done" : "Locked"}
                </span>
              </div>
            </button>

            {/* Modules + lectures (only when this course is active) */}
            {isActiveCourse &&
              sortedModules.map((mod) => {
                const isExpanded = expandedModules.has(mod.id);
                const sortedLectures = [...mod.lectures].sort(
                  (a, b) => a.sequence_order - b.sequence_order
                );
                const modDone = sortedLectures.filter((l) => completedIds.has(l.id)).length;

                return (
                  <div key={mod.id}>
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 bg-bg-secondary hover:bg-bg-primary transition-colors border-t border-border-default"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          className={`flex-shrink-0 text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="currentColor"
                        >
                          <path d="M3.5 1.5 7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[11.5px] font-medium text-text-secondary truncate">{mod.title}</span>
                      </div>
                      <span className="flex-shrink-0 text-[10px] text-text-muted font-mono">{modDone}/{sortedLectures.length}</span>
                    </button>

                    {isExpanded &&
                      sortedLectures.map((lecture) => {
                        const done = completedIds.has(lecture.id);
                        const active = lecture.id === activeLectureId;
                        return (
                          <button
                            key={lecture.id}
                            type="button"
                            onClick={() => onSelectLecture(lecture.id)}
                            className={`w-full text-left px-5 py-2.5 flex items-start gap-2.5 transition-colors border-t border-border-default ${active
                                ? "bg-bg-primary border-l-2 border-l-brand"
                                : "hover:bg-bg-primary border-l-2 border-l-transparent"
                              }`}
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {done ? (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-900 text-emerald-400">
                                  <CheckIcon />
                                </span>
                              ) : (
                                <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-brand text-brand" : "border-border-default text-text-muted"}`}>
                                  <PlayIcon />
                                </span>
                              )}
                            </span>
                            <span className={`text-[11.5px] leading-5 ${active ? "text-white font-medium" : done ? "text-text-muted" : "text-text-secondary"}`}>
                              {lecture.title}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

// ── Main CoursePlayer ─────────────────────────────────────────────────────────

interface CoursePlayerProps {
  initialCourseId?: string | null;
  initialLectureId?: string | null;
}

export function CoursePlayer({ initialCourseId, initialLectureId }: CoursePlayerProps) {
  const queryClient = useQueryClient();
  const { data: userRes } = useGetUser();
  const userId = userRes?.status === 200 ? userRes.data.data.id : null;
  const { data: coursesRes, isLoading } = useGetUserCourses();
  const courses = coursesRes?.data?.data?.courses ?? [];

  const inProgressCourse = courses.find((c) => c.state === "IN_PROGRESS") ?? courses[0] ?? null;

  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    initialCourseId ?? null
  );
  const [activeLectureId, setActiveLectureId] = useState<string | null>(
    initialLectureId ?? null
  );
  const [markingComplete, setMarkingComplete] = useState(false);
  const completeMutation = usePostCompleteLecture();

  // Set defaults once courses load
  useEffect(() => {
    if (!activeCourseId && inProgressCourse) {
      setActiveCourseId(inProgressCourse.course.id);
    }
  }, [inProgressCourse, activeCourseId]);

  // Re-identify with active course so subsequent events carry course context.
  useEffect(() => {
    if (userId && activeCourseId) initDc(userId, activeCourseId);
  }, [userId, activeCourseId]);

  const { data: courseDetailRes } = useGetUserCourse(activeCourseId ?? "", {
    enabled: !!activeCourseId,
  });

  const completedIds = new Set<string>(courseDetailRes?.data?.data?.completed_lecture_ids ?? []);
  const activeCourseDetail = courseDetailRes?.data?.data?.course;

  // Auto-select first incomplete lecture when course changes
  useEffect(() => {
    if (!activeCourseDetail || activeLectureId) return;
    const allLectures = activeCourseDetail.modules
      .slice()
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .flatMap((m) =>
        m.lectures.slice().sort((a, b) => a.sequence_order - b.sequence_order)
      );
    const next = allLectures.find((l) => !completedIds.has(l.id)) ?? allLectures[0] ?? null;
    if (next) setActiveLectureId(next.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourseDetail?.id]);

  const activeLecture = activeCourseDetail?.modules
    .flatMap((m) => m.lectures)
    .find((l) => l.id === activeLectureId) ?? null;

  const isLectureComplete = activeLectureId ? completedIds.has(activeLectureId) : false;

  const handleMarkComplete = async () => {
    if (!activeLectureId || markingComplete) return;
    setMarkingComplete(true);
    try {
      if (activeLecture?.video_url) dc.video.complete(activeLectureId);
      await completeMutation.mutateAsync(activeLectureId);
      await queryClient.invalidateQueries({ queryKey: getUserCourseQueryKey(activeCourseId!) });
      await queryClient.invalidateQueries({ queryKey: getUserCoursesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getContinueLearningQueryKey() });

      // Auto-advance to next incomplete lecture
      if (activeCourseDetail) {
        const allLectures = activeCourseDetail.modules
          .slice()
          .sort((a, b) => a.sequence_order - b.sequence_order)
          .flatMap((m) =>
            m.lectures.slice().sort((a, b) => a.sequence_order - b.sequence_order)
          );
        const newCompleted = new Set([...completedIds, activeLectureId]);
        const nextIdx = allLectures.findIndex((l) => l.id === activeLectureId);
        const next = allLectures.slice(nextIdx + 1).find((l) => !newCompleted.has(l.id));
        if (next) setActiveLectureId(next.id);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[55vh] flex items-center justify-center text-text-muted text-[13px]">
        Loading courses…
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Panel title="Courses">
        <EmptyHint text="No courses are assigned to your batch yet." />
      </Panel>
    );
  }

  return (
    <div className="flex border border-border-default rounded-lg overflow-hidden" style={{ minHeight: "78vh" }}>
      {/* Sidebar */}
      <aside className="w-[300px] flex-shrink-0 border-r border-border-default bg-bg-secondary overflow-auto">
        <div className="px-4 py-3 border-b border-border-default">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-text-muted">Course content</p>
        </div>
        <CourseSidebar
          courses={courses}
          activeCourseId={activeCourseId}
          activeLectureId={activeLectureId}
          completedIds={completedIds}
          onSelectCourse={(id) => {
            setActiveCourseId(id);
            setActiveLectureId(null);
          }}
          onSelectLecture={setActiveLectureId}
        />
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col bg-bg-primary overflow-auto">
        {activeLecture ? (
          <>
            {/* Lecture header */}
            <div className="px-6 py-4 border-b border-border-default flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10.5px] font-mono uppercase tracking-[0.08em] text-text-muted">
                  {activeCourseDetail?.title}
                </p>
                <h2 className="text-[18px] font-semibold text-white tracking-[-0.01em] mt-0.5 truncate">
                  {activeLecture.title}
                </h2>
              </div>
              <button
                type="button"
                disabled={isLectureComplete || markingComplete}
                onClick={handleMarkComplete}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12px] font-medium border transition-all duration-150 ${isLectureComplete
                    ? "border-emerald-800 text-emerald-400 bg-emerald-900/20 cursor-default"
                    : "border-brand text-text-inverted cursor-pointer hover:opacity-90"
                  }`}
                style={
                  !isLectureComplete
                    ? { background: "linear-gradient(135deg, var(--gold-ink) 0%, var(--gold) 45%, var(--gold-deep) 100%)" }
                    : undefined
                }
              >
                {isLectureComplete ? (
                  <>
                    <CheckIcon />
                    Completed
                  </>
                ) : markingComplete ? (
                  "Marking…"
                ) : (
                  "Mark complete"
                )}
              </button>
            </div>

            {/* Lecture content */}
            <div className="flex-1 p-6 space-y-5">
              <LectureContent lecture={activeLecture} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyHint text="Select a lecture from the sidebar to begin." />
          </div>
        )}
      </div>
    </div>
  );
}
