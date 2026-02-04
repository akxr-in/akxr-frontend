"use client";

import {
    Button, Input
} from "@akxr/design-system";

// Sidebar Navigation Item (same as other admin pages)
const NavItem = ({ active = false }: { active?: boolean }) => (
    <div
        className={`w-10 h-10 rounded-md ${active ? "bg-brand" : "bg-brand-muted"
            } cursor-pointer hover:bg-brand-hover transition-colors`}
    />
);

type AttendanceStatus = "present" | "absent" | "partial";

const statusConfig: Record<
    AttendanceStatus,
    { label: string; color: string; bg: string }
> = {
    present: {
        label: "Present",
        color: "text-success",
        bg: "bg-success/15",
    },
    absent: {
        label: "Absent",
        color: "text-error",
        bg: "bg-error/15",
    },
    partial: {
        label: "Partially Present",
        color: "text-warning",
        bg: "bg-warning/15",
    },
};

const StatusPill = ({ status }: { status: AttendanceStatus }) => {
    const config = statusConfig[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
};

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
    const selectedDate = "Jan 4, 2026";

    const totalStudents = 21;
    const presentStudents = 18;
    const avgProgress = 84;

    return (
        <div className="min-h-screen bg-bg-primary flex">
            {/* Sidebar */}
            <aside className="w-16 bg-bg-primary border-r border-border-default py-6 flex flex-col items-center gap-3">
                <NavItem active />
                <NavItem />
                <NavItem />
                <NavItem />
                <NavItem />
                <NavItem />
                <div className="flex-1" />
                <NavItem />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">
                            Batch Management
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Manage attendance and track student progress.
                        </p>
                    </div>
                    <Button variant="primary">Edit Batch</Button>
                </div>

                {/* Filters & Summary (left-aligned block like design) */}
                <section className="mb-6 max-w-xl">
                    {/* Top dropdown */}
                    <button className="flex w-full items-center justify-between px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-sm text-text-secondary">
                        <span>Batch Name search from drop dow</span>
                        <span className="text-text-muted">▾</span>
                    </button>

                    {/* Date & Session row */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <button className="flex flex-1 items-center justify-between px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-sm text-text-secondary">
                            <span>Jan 4, 2026</span>
                            <span className="text-text-muted">▾</span>
                        </button>
                        <button className="flex flex-1 items-center justify-between px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-default text-sm text-text-secondary">
                            <span>Select Session</span>
                            <span className="text-text-muted">▾</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 space-y-1.5 text-sm text-text-secondary">
                        <div className="flex items-center justify-between">
                            <span>Total Students</span>
                            <span className="text-text-primary">{totalStudents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Present</span>
                            <span className="text-text-primary">
                                {presentStudents}/{totalStudents}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Avg Progress</span>
                            <span className="text-text-primary">{avgProgress}%</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <Input placeholder="Search students..." />
                    </div>
                </section>

                {/* Table */}
                <div className="bg-bg-card border border-border-default rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-bg-secondary text-text-muted">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">
                                    Name of student
                                </th>
                                <th className="px-6 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left font-medium">
                                    Modified
                                </th>
                                <th className="px-6 py-3 text-left font-medium">
                                    Progress
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockStudents.map((student, index) => (
                                <tr
                                    key={student.id}
                                    className={
                                        index % 2 === 0
                                            ? "bg-bg-card"
                                            : "bg-bg-elevated/40"
                                    }
                                >
                                    <td className="px-6 py-3 text-text-primary">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-3">
                                        <StatusPill status={student.status} />
                                    </td>
                                    <td className="px-6 py-3 text-text-secondary">
                                        {student.modified ? "Yes" : "No"}
                                    </td>
                                    <td className="px-6 py-3 text-text-primary">
                                        {student.progress}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

