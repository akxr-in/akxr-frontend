"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Input, Spinner, Chip, Dropdown } from "@akxr/design-system";
import type { DropdownOption } from "@akxr/design-system";
import { useGetBatchId, useGetBatchIdMeetings, getGetBatchIdQueryKey } from "@akxr/api";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarNav } from "../../../../../../components/SidebarNav";
import { CrudBatchModal } from "../../../../../../components/CrudBatchModal";

type AttendanceStatus = "present" | "absent" | "partial";

const statusChipConfig: Record<
    AttendanceStatus,
    { label: string; variant: "success" | "error" | "warning" }
> = {
    present: { label: "Present", variant: "success" },
    absent: { label: "Absent", variant: "error" },
    partial: { label: "Partially Present", variant: "warning" },
};

const attendanceOptions: DropdownOption<AttendanceStatus>[] = [
    { value: "present", label: <Chip variant="success" className="text-xs">Present</Chip> },
    { value: "absent", label: <Chip variant="error" className="text-xs">Absent</Chip> },
    { value: "partial", label: <Chip variant="warning" className="text-xs">Partially Present</Chip> },
];

const SortIcon = () => (
    <svg className="w-3.5 h-3.5 text-text-muted inline-block ml-1" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3.5l3 4H5l3-4zM8 12.5l-3-4h6l-3 4z" />
    </svg>
);

interface StudentRow {
    id: number;
    name: string;
    status: AttendanceStatus;
    modified: boolean;
    progress: number;
}

const mockStudents: StudentRow[] = [
    { id: 1, name: "Jan 1, 2026", status: "present", modified: true, progress: 70 },
    { id: 2, name: "Jan 2, 2026", status: "present", modified: false, progress: 88 },
    { id: 3, name: "Jan 3, 2026", status: "partial", modified: false, progress: 94 },
    { id: 4, name: "Jan 4, 2026", status: "present", modified: false, progress: 64 },
    { id: 5, name: "Jan 5, 2026", status: "absent", modified: true, progress: 89 },
    { id: 6, name: "Jan 6, 2026", status: "present", modified: false, progress: 100 },
    { id: 7, name: "Jan 7, 2026", status: "absent", modified: false, progress: 78 },
];

export default function BatchDetailPage() {
    const params = useParams<{ id: string }>();
    const batchId = params.id;
    const queryClient = useQueryClient();
    const { data, isLoading } = useGetBatchId(batchId);
    const { data: meetingsData } = useGetBatchIdMeetings(batchId);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    const batch = data?.status === 200 ? data.data.data : null;

    // Build session options from meetings
    const meetings =
        meetingsData?.status === 200 && Array.isArray(meetingsData.data?.data)
            ? meetingsData.data.data
            : [];

    const sessionOptions: DropdownOption<string>[] = meetings.map((m) => {
        const date = new Date(m.scheduled_start_time);
        const label = `${m.title} — ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        return { value: m.id, label: <span className="text-sm text-text-secondary">{label}</span> };
    });

    // Auto-select first session if none selected
    const activeSessionId =
        selectedSessionId || (meetings.length > 0 ? meetings[0].id : "");
    const activeSession = meetings.find((m) => m.id === activeSessionId);

    const selectedDate = activeSession
        ? new Date(activeSession.scheduled_start_time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : "No sessions";

    const totalStudents = 21;
    const presentStudents = 18;
    const avgProgress = 84;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary flex">
                <SidebarNav activeIndex={1} />
                <main className="flex-1 flex items-center justify-center">
                    <Spinner size="lg" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary flex">
            {/* Sidebar */}
            <SidebarNav activeIndex={1} />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">
                            {batch?.batch_name ?? "Batch Management"}
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Manage attendance and track student progress.
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setShowEditModal(true)}>
                        Edit Batch
                    </Button>
                </div>

                {/* Filters & Summary */}
                <section className="mb-6 max-w-2xl">
                    {/* Batch dropdown */}
                    <button className="flex w-full items-center justify-between px-5 py-3 rounded-xl bg-bg-card border border-border-default text-sm text-text-secondary">
                        <span>Sessions Dropdown with search</span>
                        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                    </button>

                    {/* Date & Session row */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <Dropdown
                            value={activeSessionId}
                            options={sessionOptions.length > 0 ? sessionOptions : [{ value: "", label: <span className="text-sm text-text-muted">No sessions available</span> }]}
                            onChange={(id) => setSelectedSessionId(id)}
                            disabled={meetings.length === 0}
                            trigger={(selected) => (
                                <div className="flex flex-1 items-center justify-between px-5 py-3 rounded-xl bg-black text-sm text-text-secondary min-w-[200px]">
                                    <span className="truncate">
                                        {activeSession?.title || "Select Session"}
                                    </span>
                                    <svg className="w-4 h-4 text-text-muted shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            menuClassName="min-w-[280px]"
                        />
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-sm text-text-secondary">
                            <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" clipRule="evenodd" /></svg>
                            <span>{selectedDate}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-5 space-y-2 text-sm text-text-muted">
                        <div className="flex items-center justify-between">
                            <span>Total Students</span>
                            <span className="text-text-primary font-medium">{totalStudents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Present</span>
                            <span className="text-text-primary font-medium">
                                {presentStudents}/{totalStudents}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Avg Progress</span>
                            <span className="text-text-primary font-medium">{avgProgress}%</span>
                        </div>
                    </div>

                </section>

                {/* Search + Date row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 max-w-md">
                        <Input placeholder="Search students..." />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-default bg-bg-primary text-sm text-text-secondary">
                        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" clipRule="evenodd" /></svg>
                        <span>{selectedDate}</span>
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-lg overflow-hidden border border-border-default">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-bg-secondary">
                                <th className="px-6 py-3.5 text-left text-xs font-medium text-primary">
                                    Name of student <SortIcon />
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-medium text-primary">
                                    Status <SortIcon />
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-medium text-primary">
                                    Modified <SortIcon />
                                </th>
                                <th className="px-6 py-3.5 text-right text-xs font-medium text-primary">
                                    Progress <SortIcon />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-primary">
                            {mockStudents.map((student) => (
                                <tr
                                    key={student.id}
                                    className="border-t border-border-default"
                                >
                                    <td className="px-6 py-4 text-text-primary">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Dropdown
                                            value={student.status}
                                            options={attendanceOptions}
                                            trigger={(selected) => {
                                                const config = statusChipConfig[selected.value as AttendanceStatus];
                                                return (
                                                    <Chip variant={config.variant} className="text-xs">
                                                        {config.label}
                                                    </Chip>
                                                );
                                            }}
                                            menuClassName="min-w-[180px]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">
                                        {student.modified ? "Yes" : "No"}
                                    </td>
                                    <td className="px-6 py-4 text-text-muted text-right">
                                        {student.progress}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Edit Batch Modal */}
            <CrudBatchModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                batch={batch}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: getGetBatchIdQueryKey(batchId) });
                }}
            />
        </div>
    );
}


