"use client";

import {
    Chip,
    ProgressBar,
    ClockIcon,
    CheckCircleIcon,
    BookIcon,
    LockIcon,
    EyeIcon,
} from "@akxr/design-system";
import type { AdminCourse } from "@akxr/api";

export type CourseStatus = "completed" | "ongoing" | "locked";

const statusConfig: Record<
    CourseStatus,
    { label: string; variant: "success" | "warning" | "neutral" }
> = {
    completed: { label: "Completed", variant: "success" },
    ongoing: { label: "Ongoing", variant: "warning" },
    locked: { label: "Locked", variant: "neutral" },
};

export interface CourseCardProps {
    course: AdminCourse;
    status: CourseStatus;
    mentorName: string;
    courseName: string;
}

export function CourseCard({ course, status, mentorName, courseName }: CourseCardProps) {
    const { label, variant } = statusConfig[status];
    const totalModules = course.lesson_ids.length;

    const completedModules =
        status === "ongoing" ? Math.floor(totalModules / 2) : totalModules;
    const progressPercent =
        totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

    return (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden flex flex-col">
            {/* Thumbnail */}
            <div className="relative h-44 bg-gradient-to-br from-bg-elevated to-bg-primary flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-30 text-[10px] text-text-muted font-mono leading-tight p-3 overflow-hidden select-none">
                    {`import React from 'react';\nimport { useState, useEffect } from 'react';\n\nconst App = () => {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetchData().then(setData);\n  }, []);\n  return <Component data={data} />;\n};\n\nexport default App;`}
                </div>
                {status === "locked" && (
                    <div className="relative z-10 w-14 h-14 rounded-full bg-bg-card/80 border border-border-default flex items-center justify-center">
                        <LockIcon size={24} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                    <Chip variant={variant} className="text-xs py-1 px-2.5">
                        {label}
                    </Chip>
                </div>

                <h3 className="text-base font-semibold text-text-primary">
                    {course.name}
                </h3>
                <p className="text-text-muted text-sm mt-0.5">
                    {courseName} &bull; by {mentorName}
                </p>

                <p className="text-text-secondary text-sm mt-2 line-clamp-3 flex-1">
                    {course.description || "No description available"}
                </p>

                <div className="mt-4">
                    {status === "ongoing" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Progress</span>
                                <span className="text-text-primary">
                                    {progressPercent}%
                                </span>
                            </div>
                            <ProgressBar value={progressPercent} />
                            <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                                <span className="flex items-center gap-1">
                                    <BookIcon size={14} />
                                    Module {completedModules} of {totalModules}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClockIcon size={14} />
                                    {course.time_allotted_in_weeks > 0
                                        ? `${course.time_allotted_in_weeks}h remaining`
                                        : "6h remaining"}
                                </span>
                            </div>
                        </div>
                    )}

                    {status === "completed" && (
                        <div className="flex items-center justify-between text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <EyeIcon size={14} />
                                {totalModules} Modules
                            </span>
                            <span className="flex items-center gap-1 text-success">
                                <CheckCircleIcon size={14} />
                                Course Completed
                            </span>
                        </div>
                    )}

                    {status === "locked" && (
                        <div className="flex items-center justify-between text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <EyeIcon size={14} />
                                {totalModules} Modules
                            </span>
                            <span className="flex items-center gap-1">
                                <LockIcon size={14} />
                                Locked
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
