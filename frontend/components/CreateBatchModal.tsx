"use client";

import { useRef, useEffect } from "react";
import { Button, Input, MultiSelect } from "@akxr/design-system";
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
    totalClasses: z.number({ message: "Total classes is required" }).min(1, "Must be at least 1"),
    mentorIds: z.array(z.string()),
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
            totalClasses: 0,
            mentorIds: [],
            courseIds: [],
            startDate: "",
            endDate: "",
        },
    });

    const selectedMentorIds = watch("mentorIds");
    const selectedCourseIds = watch("courseIds");

    // Build mentor options from admin users
    const allUsers =
        usersData?.status === 200 && Array.isArray(usersData.data?.data)
            ? usersData.data.data
            : [];
    const mentorOptions = allUsers
        .filter((u) => u.role === "MENTOR")
        .map((m) => ({ value: m.id, label: m.full_name }));

    // Build course options from backend
    const allCourses =
        coursesData?.status === 200 && Array.isArray(coursesData.data?.data)
            ? coursesData.data.data
            : [];
    const courseOptions = allCourses.map((c) => ({
        value: c.id,
        label: c.name,
    }));

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

    const onSubmit = (data: CreateBatchFormData) => {
        const body: PostBatchBody = {
            total_classes: data.totalClasses,
            batch_name: data.batchName,
            batch_code: data.batchCode,
            description: data.description,
            batch_start_date: data.startDate,
            batch_end_date: data.endDate,
            estimated_end_date: data.endDate,
            mentor_ids: data.mentorIds,
            course_ids: data.courseIds,
        };

        postBatch.mutate(
            { data: body },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                    onSuccess?.();
                },
            }
        );
    };

    const handleCancel = () => {
        reset();
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

                    {/* Total Classes */}
                    <Input
                        type="number"
                        label="Total Classes"
                        placeholder="Enter number of classes"
                        min={1}
                        {...register("totalClasses", { valueAsNumber: true })}
                        error={errors.totalClasses?.message}
                    />

                    {/* Assign Mentors */}
                    <MultiSelect
                        label="Assign Mentors"
                        placeholder="Search and select mentors"
                        options={mentorOptions}
                        value={selectedMentorIds}
                        onChange={(ids) => setValue("mentorIds", ids)}
                    />

                    {/* Courses */}
                    <MultiSelect
                        label="Courses"
                        placeholder="Search and select courses"
                        options={courseOptions}
                        value={selectedCourseIds}
                        onChange={(ids) => setValue("courseIds", ids)}
                    />

                    {/* Start Date & End Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Start Date"
                            className="scheme-dark"
                            {...register("startDate")}
                            error={errors.startDate?.message}
                        />
                        <Input
                            type="date"
                            label="End Date"
                            className="scheme-dark"
                            {...register("endDate")}
                            error={errors.endDate?.message}
                        />
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
