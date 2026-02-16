"use client";

import { useMemo } from "react";
import { Spinner } from "@akxr/design-system";
import {
    useGetUser,
    useGetBatchId,
    useGetAdminCourses,
    useGetAdminUsers,
} from "@akxr/api";
import type { GetAdminCourses200DataItem } from "@akxr/api";
import { SidebarNav } from "../../../../../components/SidebarNav";
import { CourseCard } from "../../../../../components/CourseCard";
import { HeroCourseProgress } from "../../../../../components/HeroCourseProgress";
import type { CourseStatus } from "../../../../../components/CourseCard";

export default function StudentLmsPage() {
    const { data: userData, isLoading: isLoadingUser } = useGetUser();
    const { data: usersData } = useGetAdminUsers();

    // Get student's first batch
    const user = userData?.status === 200 ? userData.data.data : null;
    const batchId = user?.batch_ids?.[0] ?? "";

    const { data: batchData, isLoading: isLoadingBatch } = useGetBatchId(
        batchId,
        { query: { enabled: !!batchId } }
    );
    const { data: coursesData, isLoading: isLoadingCourses } =
        useGetAdminCourses();

    const batch = batchData?.status === 200 ? batchData.data.data : null;

    // Build course map: id → full course object
    const courseMap = useMemo(() => {
        const map = new Map<string, GetAdminCourses200DataItem>();
        if (
            coursesData?.status === 200 &&
            Array.isArray(coursesData.data?.data)
        ) {
            for (const c of coursesData.data.data) {
                map.set(c.id, c);
            }
        }
        return map;
    }, [coursesData]);

    // Build mentor name lookup
    const mentorName = useMemo(() => {
        if (
            !batch?.mentor_ids?.length ||
            usersData?.status !== 200 ||
            !Array.isArray(usersData.data?.data)
        ) {
            return "Mentor";
        }
        const mentor = usersData.data.data.find(
            (u) => u.id === batch.mentor_ids[0]
        );
        return mentor?.full_name ?? "Mentor";
    }, [batch, usersData]);

    // Derive course statuses
    const completedSet = useMemo(
        () => new Set(batch?.completed_course_ids ?? []),
        [batch]
    );
    const currentCourseId = batch?.current_course_id ?? null;

    const getCourseStatus = (courseId: string): CourseStatus => {
        if (completedSet.has(courseId)) return "completed";
        if (courseId === currentCourseId) return "ongoing";
        return "locked";
    };

    // All courses in this batch, in order
    const batchCourses = useMemo(() => {
        if (!batch?.course_ids) return [];
        return batch.course_ids
            .map((id) => courseMap.get(id))
            .filter(Boolean) as GetAdminCourses200DataItem[];
    }, [batch, courseMap]);

    // Current course (hero)
    const currentCourse = useMemo(() => {
        if (currentCourseId) return courseMap.get(currentCourseId) ?? null;
        // Fallback: first non-completed course
        for (const id of batch?.course_ids ?? []) {
            if (!completedSet.has(id)) {
                return courseMap.get(id) ?? null;
            }
        }
        return null;
    }, [currentCourseId, batch, courseMap, completedSet]);

    const isLoading = isLoadingUser || isLoadingBatch || isLoadingCourses;

    // Hero module counts
    const heroTotalModules = currentCourse
        ? currentCourse.weekly_content.length ||
        currentCourse.lesson_ids.length
        : 0;
    const heroCompletedModules =
        currentCourse && heroTotalModules > 0
            ? Math.floor(heroTotalModules / 2)
            : 0;

    const batchName = batch?.batch_name ?? "Course";

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-primary flex">
                <SidebarNav activeIndex={0} />
                <main className="flex-1 flex items-center justify-center">
                    <Spinner size="lg" />
                </main>
            </div>
        );
    }

    if (!batchId || !batch) {
        return (
            <div className="min-h-screen bg-bg-primary flex">
                <SidebarNav activeIndex={0} />
                <main className="flex-1 p-8">
                    <div className="text-center py-16">
                        <p className="text-text-muted">
                            You are not enrolled in any batch yet.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary flex">
            <SidebarNav activeIndex={0} />

            <main className="flex-1 p-8 overflow-auto">
                {/* Hero: Current Course Progress */}
                {currentCourse && (
                    <HeroCourseProgress
                        course={currentCourse}
                        mentorName={mentorName}
                        courseName={batchName}
                        totalModules={heroTotalModules}
                        completedModules={heroCompletedModules}
                    />
                )}

                {/* All Courses */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold text-text-primary mb-4">
                        All Courses
                    </h2>

                    {batchCourses.length === 0 ? (
                        <p className="text-text-muted text-sm">
                            No courses added to this batch yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {batchCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    status={getCourseStatus(course.id)}
                                    mentorName={mentorName}
                                    courseName={batchName}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
