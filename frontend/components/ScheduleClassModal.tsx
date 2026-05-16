"use client";

import { useRef, useEffect } from "react";
import { Button, Input } from "@akxr/design-system";
import { usePostMeeting, getGetBatchIdMeetingsQueryKey, getGetMeetingQueryKey } from "@akxr/api";
import type { PostMeetingBody } from "@akxr/api";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    duration: z.number({ message: "Duration is required" }).min(1, "Must be at least 1 minute"),
});

type FormData = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onClose: () => void;
    batchId: string;
    onSuccess?: () => void;
}

export function ScheduleClassModal({ open, onClose, batchId, onSuccess }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { mutate, isPending } = usePostMeeting();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            date: "",
            time: "",
            duration: 60,
        },
    });

    useEffect(() => {
        if (!open) return;
        reset({ title: "", description: "", date: "", time: "", duration: 60 });
    }, [open, reset]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (open) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    const onSubmit = (formData: FormData) => {
        // Combine date + time into an ISO string
        const scheduled_start_time = new Date(`${formData.date}T${formData.time}:00`).toISOString();

        const body: PostMeetingBody = {
            title: formData.title,
            description: formData.description,
            batch_id: batchId,
            scheduled_start_time,
            duration_minutes: formData.duration,
        };

        mutate({ data: body }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getGetBatchIdMeetingsQueryKey(batchId) });
                queryClient.invalidateQueries({ queryKey: getGetMeetingQueryKey() });
                reset();
                onClose();
                onSuccess?.();
            },
        });
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-bg-card border border-border-default rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary">Schedule class</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Title"
                        placeholder="e.g. React Hooks deep dive"
                        {...register("title")}
                        error={errors.title?.message}
                    />

                    <div>
                        <label className="text-sm font-medium text-text-primary block mb-2">Description</label>
                        <textarea
                            placeholder="What will be covered in this class?"
                            {...register("description")}
                            rows={3}
                            className={`w-full rounded-md border bg-bg-primary px-4 py-3 text-text-primary outline-none placeholder:text-text-muted transition-all duration-150 focus:border-border-focus focus:ring-1 focus:ring-border-focus resize-none ${errors.description ? "border-error" : "border-border-default"}`}
                        />
                        {errors.description && (
                            <span className="text-sm text-error mt-1 block">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Date"
                            className="scheme-dark"
                            {...register("date")}
                            error={errors.date?.message}
                        />
                        <Input
                            type="time"
                            label="Time"
                            className="scheme-dark"
                            {...register("time")}
                            error={errors.time?.message}
                        />
                    </div>

                    <Input
                        type="number"
                        label="Duration (minutes)"
                        placeholder="60"
                        min={1}
                        {...register("duration", { valueAsNumber: true })}
                        error={errors.duration?.message}
                    />

                    <div className="flex items-center gap-4 pt-1">
                        <Button type="submit" variant="primary" isLoading={isPending}>
                            Schedule
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
