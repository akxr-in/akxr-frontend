"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input, Tag } from "@akxr/design-system";
import { usePostBatch, useGetAdminUsers, useGetAdminCourses } from "@akxr/api";
import type { PostBatchBody } from "@akxr/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createBatchSchema = z.object({
    batchName: z.string().min(1, "Batch name is required"),
    batchCode: z
        .string()
        .min(1, "Batch code is required")
        .max(4, "Batch code must be at most 4 characters"),
    description: z.string().min(1, "Description is required"),
    mentorId: z.string().optional(),
    courseIds: z.array(z.string()),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
});

type CreateBatchFormData = z.infer<typeof createBatchSchema>;

interface CreateBatchModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateBatchModal({ open, onClose, onSuccess }: CreateBatchModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const postBatch = usePostBatch();
    const { data: usersData } = useGetAdminUsers();
    const { data: coursesData } = useGetAdminCourses();

    // Local UI state for searchable dropdowns (not part of form schema)
    const [mentorSearch, setMentorSearch] = useState("");
    const [mentorDisplayName, setMentorDisplayName] = useState("");
    const [showMentorDropdown, setShowMentorDropdown] = useState(false);
    const [courseSearch, setCourseSearch] = useState("");
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateBatchFormData>({
        resolver: zodResolver(createBatchSchema),
        defaultValues: {
            batchName: "",
            batchCode: "",
            description: "",
            mentorId: "",
            courseIds: [],
            startDate: "",
            endDate: "",
        },
    });

    const selectedCourses = watch("courseIds");
    const selectedMentorId = watch("mentorId");

    // Get mentors from admin users
    const allUsers =
        usersData?.status === 200 && Array.isArray(usersData.data?.data)
            ? usersData.data.data
            : [];
    const mentors = allUsers.filter((u) => u.role === "MENTOR");

    const filteredMentors = mentors.filter((m) =>
        m.full_name.toLowerCase().includes(mentorSearch.toLowerCase())
    );

    // Get courses from backend
    const allCourses =
        coursesData?.status === 200 && Array.isArray(coursesData.data?.data)
            ? coursesData.data.data
            : [];

    const filteredCourses = allCourses.filter(
        (c) =>
            c.name.toLowerCase().includes(courseSearch.toLowerCase()) &&
            !selectedCourses.includes(c.id)
    );

    // Close on overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    const addCourse = (courseId: string) => {
        if (courseId && !selectedCourses.includes(courseId)) {
            setValue("courseIds", [...selectedCourses, courseId]);
        }
        setCourseSearch("");
        setShowCourseDropdown(false);
    };

    const removeCourse = (courseId: string) => {
        setValue(
            "courseIds",
            selectedCourses.filter((c) => c !== courseId)
        );
    };

    const getCourseName = (courseId: string) => {
        return allCourses.find((c) => c.id === courseId)?.name || courseId;
    };

    const handleCourseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredCourses.length > 0) {
                addCourse(filteredCourses[0].id);
            }
        }
    };

    const resetAll = () => {
        reset();
        setMentorSearch("");
        setMentorDisplayName("");
        setCourseSearch("");
        setShowMentorDropdown(false);
        setShowCourseDropdown(false);
    };

    const onSubmit = (data: CreateBatchFormData) => {
        const body: PostBatchBody = {
            batch_name: data.batchName,
            batch_code: data.batchCode,
            description: data.description,
            image_url: "",
            total_classes: 0,
            batch_start_date: data.startDate,
            batch_end_date: data.endDate,
            estimated_end_date: data.endDate,
            mentor_ids: data.mentorId ? [data.mentorId] : [],
            course_ids: data.courseIds,
            current_course_id: null,
            completed_course_ids: [],
            meeting_id: "",
        };

        postBatch.mutate(
            { data: body },
            {
                onSuccess: () => {
                    resetAll();
                    onClose();
                    onSuccess?.();
                },
            }
        );
    };

    const handleCancel = () => {
        resetAll();
        onClose();
    };

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-bg-card border border-border-default rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary">
                        Create new batch
                    </h2>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Batch Name */}
                    <Input
                        label="Batch Name"
                        placeholder="Akxr"
                        {...register("batchName")}
                        error={errors.batchName?.message}
                    />

                    {/* Batch Code */}
                    <Input
                        label="Batch Code"
                        placeholder="AKXR"
                        maxLength={4}
                        hint="Max 4 characters"
                        {...register("batchCode", {
                            onChange: (e) => {
                                e.target.value = e.target.value.toUpperCase();
                            },
                        })}
                        error={errors.batchCode?.message}
                    />

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-text-primary block mb-2">
                            Description
                        </label>
                        <textarea
                            placeholder="Describe the batch..."
                            {...register("description")}
                            rows={3}
                            className={`w-full rounded-md border bg-bg-primary px-4 py-3 text-text-primary outline-none placeholder:text-text-muted transition-all duration-150 focus:border-border-focus focus:ring-1 focus:ring-border-focus resize-none ${errors.description
                                ? "border-error"
                                : "border-border-default"
                                }`}
                        />
                        {errors.description && (
                            <span className="text-sm text-error mt-1 block">
                                {errors.description.message}
                            </span>
                        )}
                    </div>

                    {/* Assign Mentor */}
                    <div>
                        <label className="text-sm font-medium text-text-primary block mb-2">
                            Assign Mentor
                        </label>
                        <div className="relative">
                            <div
                                className={`flex items-center w-full rounded-md border bg-bg-primary h-12 px-4 transition-all duration-150 ${showMentorDropdown
                                    ? "border-border-focus ring-1 ring-border-focus"
                                    : "border-border-default"
                                    }`}
                            >
                                <input
                                    type="text"
                                    placeholder="Search mentor name and choose"
                                    value={mentorDisplayName || mentorSearch}
                                    onChange={(e) => {
                                        setMentorSearch(e.target.value);
                                        setMentorDisplayName("");
                                        setValue("mentorId", "");
                                    }}
                                    onFocus={() => setShowMentorDropdown(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowMentorDropdown(false),
                                            200
                                        )
                                    }
                                    className="flex-1 h-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
                                />
                            </div>
                            {showMentorDropdown && filteredMentors.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {filteredMentors.map((mentor) => (
                                        <button
                                            key={mentor.id}
                                            type="button"
                                            onClick={() => {
                                                setValue("mentorId", mentor.id);
                                                setMentorDisplayName(
                                                    mentor.full_name
                                                );
                                                setMentorSearch("");
                                                setShowMentorDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                                        >
                                            {mentor.full_name}
                                            <span className="text-text-muted text-xs ml-2">
                                                ({mentor.role})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Courses */}
                    <div>
                        <label className="text-sm font-medium text-text-primary block mb-2">
                            Courses
                        </label>
                        <div className="relative">
                            <div
                                className={`flex items-center w-full rounded-md border bg-bg-primary h-12 px-4 transition-all duration-150 ${showCourseDropdown
                                    ? "border-border-focus ring-1 ring-border-focus"
                                    : "border-border-default"
                                    }`}
                            >
                                <input
                                    type="text"
                                    placeholder="Search and select courses"
                                    value={courseSearch}
                                    onChange={(e) =>
                                        setCourseSearch(e.target.value)
                                    }
                                    onFocus={() => setShowCourseDropdown(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowCourseDropdown(false),
                                            200
                                        )
                                    }
                                    onKeyDown={handleCourseKeyDown}
                                    className="flex-1 h-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
                                />
                            </div>
                            {showCourseDropdown &&
                                filteredCourses.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-40 overflow-y-auto">
                                        {filteredCourses.map((course) => (
                                            <button
                                                key={course.id}
                                                type="button"
                                                onClick={() =>
                                                    addCourse(course.id)
                                                }
                                                className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                                            >
                                                {course.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>

                        {/* Selected Course Tags */}
                        {selectedCourses.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedCourses.map((courseId) => (
                                    <Tag
                                        key={courseId}
                                        onRemove={() => removeCourse(courseId)}
                                    >
                                        {getCourseName(courseId)}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Start Date & End Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary">
                                Start Date
                            </label>
                            <div
                                className={`flex items-center w-full rounded-md border bg-bg-primary h-12 px-4 transition-all duration-150 focus-within:border-border-focus focus-within:ring-1 focus-within:ring-border-focus ${errors.startDate
                                    ? "border-error"
                                    : "border-border-default"
                                    }`}
                            >
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className="flex-1 h-full bg-transparent text-text-primary outline-none scheme-dark"
                                />
                            </div>
                            {errors.startDate && (
                                <span className="text-sm text-error">
                                    {errors.startDate.message}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary">
                                End Date
                            </label>
                            <div
                                className={`flex items-center w-full rounded-md border bg-bg-primary h-12 px-4 transition-all duration-150 focus-within:border-border-focus focus-within:ring-1 focus-within:ring-border-focus ${errors.endDate
                                    ? "border-error"
                                    : "border-border-default"
                                    }`}
                            >
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className="flex-1 h-full bg-transparent text-text-primary outline-none scheme-dark"
                                />
                            </div>
                            {errors.endDate && (
                                <span className="text-sm text-error">
                                    {errors.endDate.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-1">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={postBatch.isPending}
                        >
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
