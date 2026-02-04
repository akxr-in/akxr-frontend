"use client";

import { useRouter } from "next/navigation";
import {
    Button,
    CalendarIcon,
    UsersIcon,
    CheckCircleIcon,
} from "@akxr/design-system";

// Types
type BatchStatus = "to_be_started" | "ongoing" | "completed";

interface BatchCardProps {
    id: string;
    name: string;
    mentorName: string;
    description: string;
    status: BatchStatus;
    startDate: string;
    endDate: string;
    studentsEnrolled: number;
    totalSeats?: number;
    seatsAvailable?: boolean;
    attendance?: number;
    courseProgress?: number;
    onViewDetails?: () => void;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: BatchStatus }) => {
    const statusConfig = {
        to_be_started: {
            label: "To be started",
            dotColor: "bg-text-muted",
            bgColor: "bg-bg-elevated",
            textColor: "text-text-secondary",
        },
        ongoing: {
            label: "Ongoing",
            dotColor: "bg-success",
            bgColor: "bg-success/10",
            textColor: "text-success",
        },
        completed: {
            label: "Completed",
            dotColor: "bg-success",
            bgColor: "bg-success/10",
            textColor: "text-success",
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
};

// Progress Bar Component
const ProgressBar = ({
    value,
    variant = "brand",
}: {
    value: number;
    variant?: "brand" | "success";
}) => {
    const bgColor = variant === "success" ? "bg-success" : "bg-brand";

    return (
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
                className={`h-full ${bgColor} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
};

// Batch Card Component
const BatchCard = ({
    name,
    mentorName,
    description,
    status,
    startDate,
    endDate,
    studentsEnrolled,
    seatsAvailable,
    attendance,
    courseProgress,
    onViewDetails,
}: BatchCardProps) => {
    const isOngoingOrCompleted = status === "ongoing" || status === "completed";
    const progressValue = courseProgress ?? (studentsEnrolled / 30) * 100;

    return (
        <div className="bg-bg-card border border-border-default rounded-lg p-5 flex flex-col">
            {/* Status Badge */}
            <div className="mb-3">
                <StatusBadge status={status} />
            </div>

            {/* Title & Mentor */}
            <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
            <p className="text-text-muted text-sm mt-0.5">by {mentorName}</p>

            {/* Description */}
            <p className="text-text-secondary text-sm mt-3 line-clamp-3 flex-1">
                {description}
            </p>

            {/* Stats Section - varies by status */}
            <div className="mt-4 space-y-3">
                {isOngoingOrCompleted ? (
                    <>
                        {/* Students & Attendance Row */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-text-muted">
                                <UsersIcon size={16} />
                                Students enrolled: {studentsEnrolled}
                            </span>
                            {attendance !== undefined && (
                                <span className="text-brand font-medium">
                                    Attendance: {attendance}%
                                </span>
                            )}
                        </div>

                        {/* Course Progress */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Course progress</span>
                                <span className="text-text-primary">{courseProgress}%</span>
                            </div>
                            <ProgressBar
                                value={courseProgress ?? 0}
                                variant={status === "completed" ? "success" : "brand"}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-1.5 text-text-muted text-sm">
                            <CalendarIcon size={16} />
                            {startDate} - {endDate}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Date Range for "To be started" */}
                        <div className="flex items-center gap-1.5 text-text-muted text-sm">
                            <CalendarIcon size={16} />
                            {startDate} - {endDate}
                        </div>

                        {/* Students & Seats Row */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">
                                {studentsEnrolled} Students enrolled
                            </span>
                            {seatsAvailable && (
                                <span className="flex items-center gap-1.5 text-success">
                                    <CheckCircleIcon size={16} />
                                    Seats Available
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <ProgressBar value={progressValue} />
                    </>
                )}
            </div>

            {/* View Details Button */}
            <Button
                variant="secondary"
                size="sm"
                className="w-full mt-5"
                onClick={onViewDetails}
            >
                View details
            </Button>
        </div>
    );
};

// Sidebar Navigation Item
const NavItem = ({ active = false }: { active?: boolean }) => (
    <div
        className={`w-10 h-10 rounded-md ${active ? "bg-brand" : "bg-brand-muted"
            } cursor-pointer hover:bg-brand-hover transition-colors`}
    />
);

// Main Page Component
export default function BatchManagementPage() {
    const router = useRouter();

    // Mock data - replace with actual API data
    const batches: BatchCardProps[] = [
        {
            id: "1",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "to_be_started",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            seatsAvailable: true,
        },
        {
            id: "2",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "ongoing",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            attendance: 98,
            courseProgress: 68,
        },
        {
            id: "3",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "to_be_started",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            seatsAvailable: true,
        },
        {
            id: "4",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "ongoing",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            attendance: 98,
            courseProgress: 68,
        },
        {
            id: "5",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "to_be_started",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            seatsAvailable: true,
        },
        {
            id: "6",
            name: "Name of Batch",
            mentorName: "Mentor Name",
            description:
                "Learn how to build scalable, accessible, and performant user interfaces using modern design systems and component architecture...",
            status: "completed",
            startDate: "Jan 1, 2026",
            endDate: "Jan 7, 2026",
            studentsEnrolled: 21,
            attendance: 88,
            courseProgress: 100,
        },
    ];

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
                    <Button variant="primary" onClick={() => console.log("Add new batch")}>
                        Add new batch
                    </Button>
                </div>

                {/* Batch Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            {...batch}
                            onViewDetails={() =>
                                router.push(`/control-panel/admin/batches/${batch.id}`)
                            }
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
