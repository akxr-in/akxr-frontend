"use client";

import { useRouter } from "next/navigation";
import { Button } from "@akxr/design-system";
import { SidebarNav } from "../../../../components/SidebarNav";
import { BatchCard, type BatchCardProps } from "../../../../components/BatchCard";

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
            <SidebarNav activeIndex={1} />

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
                    <Button variant="secondary" onClick={() => console.log("Add new batch")}>
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
