"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button, Input, Spinner, Chip, Dropdown } from "@akxr/design-system";
import type { DropdownOption } from "@akxr/design-system";
import {
    useGetBatchId, useGetBatchIdMeetings, useGetMeetingIdParticipants,
    useGetAdminUsers, useGetBatchStudents, useGetUser, getGetBatchIdQueryKey,
    useUpdateMeetingAttendance,
    type AttendanceStatus as ApiAttendanceStatus,
} from "@akxr/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SidebarNav } from "../../../../../../components/SidebarNav";
import { CrudBatchModal } from "../../../../../../components/CrudBatchModal";
import { ScheduleClassModal } from "../../../../../../components/ScheduleClassModal";
import { formatDate, formatDateLong } from "../../../../../../lib/format";

type DisplayStatus = "present" | "absent" | "partial";

const API_STATUS_MAP: Record<DisplayStatus, ApiAttendanceStatus> = {
    present: "PRESENT",
    absent: "ABSENT",
    partial: "PARTIALLY_PRESENT",
};

const statusChipConfig: Record<
    DisplayStatus,
    { label: string; variant: "success" | "error" | "warning" }
> = {
    present: { label: "Present", variant: "success" },
    absent: { label: "Absent", variant: "error" },
    partial: { label: "Partially Present", variant: "warning" },
};

const attendanceOptions: DropdownOption<DisplayStatus>[] = [
    { value: "present", label: <Chip variant="success" className="text-xs">Present</Chip> },
    { value: "absent", label: <Chip variant="error" className="text-xs">Absent</Chip> },
    { value: "partial", label: <Chip variant="warning" className="text-xs">Partially Present</Chip> },
];

const SortIcon = () => (
    <svg className="w-3.5 h-3.5 text-text-muted inline-block ml-1" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3.5l3 4H5l3-4zM8 12.5l-3-4h6l-3 4z" />
    </svg>
);

export default function BatchDetailPage() {
    const params = useParams<{ id: string }>();
    const batchId = params.id;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading } = useGetBatchId(batchId);
    const { data: meetingsData } = useGetBatchIdMeetings(batchId);
    const { data: currentUserData } = useGetUser();
    const currentRole = currentUserData?.status === 200 ? currentUserData.data.data.role : undefined;
    const isMentor = currentRole === "MENTOR";

    useEffect(() => {
        if (currentRole === "MENTOR") router.push("/");
    }, [currentRole, router]);

    const { data: adminUsersData } = useGetAdminUsers({ query: { enabled: currentRole === "ADMIN" } });
    const { data: batchStudentsData } = useGetBatchStudents(batchId, { enabled: currentRole === "MENTOR" });
    const { mutateAsync: updateAttendance } = useUpdateMeetingAttendance();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, DisplayStatus>>({});

    const batch = data?.status === 200 ? data.data.data : null;

    const meetings =
        meetingsData?.status === 200 && Array.isArray(meetingsData.data?.data)
            ? meetingsData.data.data
            : [];

    const sessionOptions: DropdownOption<string>[] = meetings.map((m) => {
        const date = new Date(m.scheduled_start_time);
        const label = `${m.title} — ${formatDateLong(date)}`;
        return { value: m.id, label: <span className="text-sm text-text-secondary">{label}</span> };
    });

    const activeSessionId = selectedSessionId || (meetings.length > 0 ? meetings[0].id : "");
    const activeSession = meetings.find((m) => m.id === activeSessionId);

    const selectedDate = activeSession
        ? formatDateLong(activeSession.scheduled_start_time)
        : "No sessions";

    // Clear overrides when session changes so stale overrides don't bleed across sessions
    useEffect(() => {
        setAttendanceOverrides({});
    }, [activeSessionId]);

    const batchStudents = useMemo(() => {
        if (isMentor) {
            if (batchStudentsData?.status === 200 && Array.isArray(batchStudentsData.data?.data)) {
                return batchStudentsData.data.data.filter((u) => u.role === "STUDENT");
            }
            return [];
        }
        if (adminUsersData?.status === 200 && Array.isArray(adminUsersData.data?.data)) {
            return adminUsersData.data.data.filter(
                (u) => u.batch_ids?.includes(batchId) && u.role === "STUDENT"
            );
        }
        return [];
    }, [isMentor, batchStudentsData, adminUsersData, batchId]);

    const { data: participantsData, isLoading: isLoadingParticipants } =
        useGetMeetingIdParticipants(activeSessionId, {
            query: { enabled: !!activeSessionId },
        });

    const participantIds = useMemo(() => {
        if (participantsData?.status === 200 && Array.isArray(participantsData.data?.data)) {
            return new Set(participantsData.data.data.map((p) => p.id));
        }
        return new Set<string>();
    }, [participantsData]);

    const studentRows = useMemo(() => {
        return batchStudents.map((student) => {
            const fromApi: DisplayStatus = activeSessionId
                ? participantIds.has(student.id) ? "present" : "absent"
                : "absent";
            return {
                ...student,
                attendance: attendanceOverrides[student.id] ?? fromApi,
            };
        });
    }, [batchStudents, participantIds, activeSessionId, attendanceOverrides]);

    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return studentRows;
        const q = searchQuery.toLowerCase();
        return studentRows.filter((s) => s.full_name.toLowerCase().includes(q));
    }, [studentRows, searchQuery]);

    const totalStudents = studentRows.length;
    const presentStudents = studentRows.filter((s) => s.attendance === "present").length;
    const partialStudents = studentRows.filter((s) => s.attendance === "partial").length;
    const attendancePct =
        totalStudents > 0
            ? Math.round(((presentStudents + partialStudents * 0.5) / totalStudents) * 100)
            : 0;

    const handleAttendanceChange = async (studentId: string, status: DisplayStatus) => {
        if (!activeSessionId) return;
        setAttendanceOverrides((prev) => ({ ...prev, [studentId]: status }));
        try {
            await updateAttendance({
                meetingId: activeSessionId,
                userId: studentId,
                status: API_STATUS_MAP[status],
            });
        } catch (e) {
            // revert optimistic update on failure
            setAttendanceOverrides((prev) => {
                const next = { ...prev };
                delete next[studentId];
                return next;
            });
            toast.error(e instanceof Error ? e.message : "Failed to update attendance");
        }
    };

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
            <SidebarNav activeIndex={1} />

            <main className="flex-1 p-8 overflow-auto">
                <nav aria-label="Breadcrumb" className="mb-3">
                    <ol className="flex items-center gap-1.5 text-[12px] text-text-muted">
                        <li>
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="hover:text-text-secondary transition-colors"
                            >
                                Control Panel
                            </button>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <button
                                type="button"
                                onClick={() => router.push("/control-panel/admin/batches")}
                                className="hover:text-text-secondary transition-colors"
                            >
                                Batches
                            </button>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li aria-current="page" className="text-text-secondary truncate max-w-[300px]">
                            {batch?.batch_name ?? "Batch"}
                        </li>
                    </ol>
                </nav>
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">
                            {batch?.batch_name ?? "Batch Management"}
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Manage attendance and track student progress.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={() => setShowScheduleModal(true)}>
                            Schedule class
                        </Button>
                        {!isMentor && (
                            <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                Edit Batch
                            </Button>
                        )}
                    </div>
                </div>

                <section className="mb-6 max-w-2xl">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Dropdown
                            value={activeSessionId}
                            options={
                                sessionOptions.length > 0
                                    ? sessionOptions
                                    : [{ value: "", label: <span className="text-sm text-text-muted">No sessions available</span> }]
                            }
                            onChange={(id) => setSelectedSessionId(id)}
                            disabled={meetings.length === 0}
                            trigger={() => (
                                <div className="flex flex-1 items-center justify-between px-5 py-3 rounded-xl bg-black text-sm text-text-secondary min-w-[200px]">
                                    <span className="truncate">
                                        {activeSession?.title || "Select Session"}
                                    </span>
                                    <svg className="w-4 h-4 text-text-muted shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            menuClassName="min-w-[280px]"
                        />
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-sm text-text-secondary">
                            <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" clipRule="evenodd" />
                            </svg>
                            <span>{selectedDate}</span>
                        </div>

                        {activeSession && (activeSession as any).realtime_kit_room_id && (
                            <button
                                type="button"
                                onClick={() => router.push(`/meet/${(activeSession as any).realtime_kit_room_id}`)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-black text-sm font-medium hover:bg-brand/90 transition-colors whitespace-nowrap"
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                Join live class
                            </button>
                        )}
                    </div>

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
                            <span>Attendance</span>
                            <span className="text-text-primary font-medium">{attendancePct}%</span>
                        </div>
                    </div>
                </section>

                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-border-default">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-bg-secondary">
                                <th className="px-6 py-3.5 text-left text-xs font-medium text-primary">
                                    Name of student <SortIcon />
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-medium text-primary">
                                    Status <SortIcon />
                                </th>
                                <th className="px-6 py-3.5 text-right text-xs font-medium text-primary">
                                    Email
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-primary">
                            {isLoadingParticipants ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={`skel-${i}`} className="border-t border-border-default">
                                        <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-bg-elevated animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 rounded bg-bg-elevated animate-pulse" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-48 ml-auto rounded bg-bg-elevated animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-text-muted">
                                        {searchQuery ? (
                                            <p>No students match &ldquo;{searchQuery}&rdquo;.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <p>No students in this batch yet.</p>
                                                <p className="text-[12px]">
                                                    Students self-enroll from their dashboard, or assign them from{" "}
                                                    <button
                                                        type="button"
                                                        onClick={() => router.push("/")}
                                                        className="text-brand hover:opacity-80 transition-opacity"
                                                    >
                                                        People
                                                    </button>
                                                    .
                                                </p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((student) => (
                                    <tr key={student.id} className="border-t border-border-default">
                                        <td className="px-6 py-4 text-text-primary">{student.full_name}</td>
                                        <td className="px-6 py-4">
                                            <Dropdown
                                                value={student.attendance}
                                                options={attendanceOptions}
                                                onChange={(status) => handleAttendanceChange(student.id, status)}
                                                trigger={(selected) => {
                                                    const config = statusChipConfig[selected.value as DisplayStatus];
                                                    return (
                                                        <Chip variant={config.variant} className="text-xs cursor-pointer">
                                                            {config.label}
                                                        </Chip>
                                                    );
                                                }}
                                                menuClassName="min-w-[180px]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-right text-xs">
                                            {student.email}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <CrudBatchModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                batch={batch}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: getGetBatchIdQueryKey(batchId) });
                    setShowEditModal(false);
                }}
            />

            <ScheduleClassModal
                open={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                batchId={batchId}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: getGetBatchIdQueryKey(batchId) });
                }}
            />
        </div>
    );
}
