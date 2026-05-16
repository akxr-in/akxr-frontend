"use client";

import { Suspense, useEffect, useState } from "react";
import {
  useGetMeeting,
  useGetMentorBatches,
  useGetUser,
  usePostMeetingIdStart,
  type GetMeeting200DataItem,
  type MentorBatch,
} from "@akxr/api";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyHint, fmtDate, fmtDateTime, LmsLayout, Panel, StatTile } from "@/components/lms/LmsLayout";

type MentorTab = "batches" | "live";

export default function LMSMentor() {
  return (
    <Suspense fallback={null}>
      <LMSMentorInner />
    </Suspense>
  );
}

function LMSMentorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MentorTab>("batches");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: userRes, isLoading: userLoading } = useGetUser();
  const { data: batchesRes, isLoading: batchesLoading } = useGetMentorBatches();
  const { data: meetingsRes, isLoading: meetingsLoading } = useGetMeeting();
  const startMeetingMutation = usePostMeetingIdStart();

  const user = userRes?.status === 200 ? userRes.data.data : null;
  const batches: MentorBatch[] = batchesRes?.data?.data ?? [];
  const meetings: GetMeeting200DataItem[] =
    meetingsRes?.status === 200 ? meetingsRes.data.data : [];

  useEffect(() => {
    if (userLoading) return;
    if (!user || (user.role !== "MENTOR" && user.role !== "MENTOR_EDITOR")) router.push("/");
  }, [router, user, userLoading]);

  const fromQuery = searchParams.get("batch");
  const queryBatchId = fromQuery && batches.some((item) => item.id === fromQuery) ? fromQuery : null;
  const effectiveBatchId = selectedBatchId ?? queryBatchId ?? batches[0]?.id ?? null;
  const selectedBatch = batches.find((batch) => batch.id === effectiveBatchId) ?? null;
  const myMeetings = selectedBatch
    ? meetings
        .filter((meeting) => meeting.batch_id === selectedBatch.id)
        .sort(
          (a, b) =>
            new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime(),
        )
    : [];

  const nextMeeting =
    myMeetings.find((meeting) => meeting.status === "STARTED") ??
    myMeetings.find((meeting) => meeting.status === "SCHEDULED") ??
    null;

  const avgAttendance =
    batches.length === 0
      ? 0
      : batches.reduce((acc, batch) => acc + batch.avg_attendance_pct, 0) / batches.length;

  const loading = userLoading || batchesLoading || meetingsLoading;
  const firstName = user?.full_name.split(" ")[0] ?? "mentor";

  if (!user || (user.role !== "MENTOR" && user.role !== "MENTOR_EDITOR")) return null;

  return (
    <LmsLayout
      role="MENTOR"
      heading={`Mentor workspace, ${firstName}.`}
      subtitle="Operate your batches in real-time: watch progress, inspect schedule, and start live sessions."
      userName={user.full_name}
      tabs={[
        { id: "batches", label: "My batches" },
        { id: "live", label: "Live controls" },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as MentorTab)}
      actions={
        nextMeeting ? (
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className="px-3.5 py-2 rounded-md text-[12.5px] font-medium border border-brand text-text-inverted transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
          >
            Open live controls
          </button>
        ) : null
      }
    >
      {loading ? (
        <div className="h-[45vh] flex items-center justify-center text-text-muted text-[13px]">Loading mentor LMS…</div>
      ) : batches.length === 0 ? (
        <Panel title="No batches assigned">
          <EmptyHint text="No mentor batches found. Ask admin to assign you to at least one active batch." />
        </Panel>
      ) : activeTab === "batches" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <StatTile label="Active batches" value={batches.length} sub="currently assigned" />
            <StatTile
              label="Students"
              value={batches.reduce((acc, batch) => acc + batch.student_count, 0)}
              sub="across all batches"
            />
            <StatTile label="Avg attendance" value={`${Math.round(avgAttendance)}%`} sub="mentor cohort average" />
            <StatTile
              label="Sessions done"
              value={batches.reduce((acc, batch) => acc + batch.completed_meetings_count, 0)}
              sub="total completed"
            />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 380px" }}>
            <Panel title="Batch performance" sub="Connected to real mentor batches">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Code</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Name</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Dates</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Progress</th>
                    <th className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted px-3.5 py-2.5 bg-bg-primary text-left">Avg att.</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch, idx) => {
                    const progress =
                      batch.meetings_count > 0
                        ? Math.round((batch.completed_meetings_count / batch.meetings_count) * 100)
                        : 0;
                    const selected = batch.id === selectedBatch?.id;
                    return (
                      <tr
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={`cursor-pointer hover:bg-bg-primary ${idx < batches.length - 1 ? "border-b border-border-default" : ""} ${selected ? "bg-bg-primary" : ""}`}
                      >
                        <td className="px-3.5 py-3 font-mono text-[11px] text-brand">{batch.batch_code}</td>
                        <td className="px-3.5 py-3 text-[12.5px] text-text-secondary">{batch.batch_name}</td>
                        <td className="px-3.5 py-3 font-mono text-[11px] text-text-muted">
                          {fmtDate(batch.batch_start_date)} → {fmtDate(batch.batch_end_date)}
                        </td>
                        <td className="px-3.5 py-3 text-[12px] text-text-secondary">{progress}%</td>
                        <td className="px-3.5 py-3 text-[12px] text-text-secondary">{Math.round(batch.avg_attendance_pct)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>

            <Panel title={selectedBatch ? selectedBatch.batch_code : "Select batch"} sub="Upcoming timeline">
              <div className="max-h-[65vh] overflow-auto p-2">
                {myMeetings.length === 0 ? (
                  <EmptyHint text="No meetings for this batch yet." />
                ) : (
                  myMeetings.slice(0, 10).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="px-3 py-2 rounded-md border border-border-default bg-bg-primary mb-2"
                    >
                      <p className="text-[12px] text-text-secondary truncate">{meeting.title}</p>
                      <p className="text-[10.5px] text-text-muted mt-1">{fmtDateTime(meeting.scheduled_start_time)}</p>
                      <p className="text-[10px] text-brand mt-1">{meeting.status}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 420px" }}>
          <Panel title="Live session operations" sub={selectedBatch ? `Batch ${selectedBatch.batch_code}` : "Select batch"}>
            <div className="p-4 space-y-4">
              {!nextMeeting ? (
                <EmptyHint text="No scheduled meeting available to start right now." />
              ) : (
                <div className="bg-bg-primary border border-border-default rounded-lg p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">Next meeting</p>
                  <h3 className="text-[20px] text-white font-semibold mt-2">{nextMeeting.title}</h3>
                  <p className="text-[12px] text-text-muted mt-2">
                    {fmtDateTime(nextMeeting.scheduled_start_time)} · {nextMeeting.status}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      type="button"
                      disabled={startMeetingMutation.isPending || nextMeeting.status === "STARTED"}
                      onClick={() => {
                        startMeetingMutation.mutate(
                          { id: nextMeeting.id, data: {} },
                          {
                            onSuccess: (res) => {
                              if (res.status === 200) {
                                setFeedback("Meeting started. Students can now join from LMS.");
                              } else {
                                setFeedback("Could not start meeting.");
                              }
                            },
                            onError: () => setFeedback("Failed to start meeting."),
                          },
                        );
                      }}
                      className="px-4 py-2 rounded-md text-[13px] font-medium border border-brand text-text-inverted transition-all duration-150 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)" }}
                    >
                      {nextMeeting.status === "STARTED"
                        ? "Already live"
                        : startMeetingMutation.isPending
                          ? "Starting…"
                          : "Start live session"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="px-4 py-2 rounded-md text-[13px] font-medium border border-border-default text-text-muted hover:text-text-secondary"
                    >
                      Open dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Batch context" sub="Current selection">
            <div className="p-4 space-y-3">
              {selectedBatch ? (
                <>
                  <ContextRow label="Batch name" value={selectedBatch.batch_name} />
                  <ContextRow label="Students" value={String(selectedBatch.student_count)} />
                  <ContextRow
                    label="Schedule"
                    value={`${fmtDate(selectedBatch.batch_start_date)} → ${fmtDate(selectedBatch.batch_end_date)}`}
                  />
                  <ContextRow
                    label="Completed sessions"
                    value={`${selectedBatch.completed_meetings_count}/${selectedBatch.meetings_count}`}
                  />
                </>
              ) : (
                <EmptyHint text="Choose a batch from the previous tab." />
              )}
              {feedback ? (
                <div className="px-3 py-2 border border-border-default rounded-md text-[12px] text-text-secondary bg-bg-primary">
                  {feedback}
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      )}
    </LmsLayout>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px] border-b border-border-default last:border-b-0 py-2">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-secondary">{value}</span>
    </div>
  );
}
