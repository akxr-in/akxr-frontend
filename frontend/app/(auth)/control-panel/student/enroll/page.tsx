"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Spinner } from "@akxr/design-system";
import { useGetBatch, useEnrollInBatch, useGetUser, getGetUserQueryKey, getGetBatchQueryKey } from "@akxr/api";
import type { GetBatch200DataItem } from "@akxr/api";
import { SidebarNav } from "../../../../../components/SidebarNav";
import { BatchCard } from "../../../../../components/BatchCard";

export default function StudentEnrollPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: batchesData, isLoading, error } = useGetBatch();
    const { data: userRes } = useGetUser();
    const { mutateAsync: enroll, isPending: isEnrolling } = useEnrollInBatch();
    const [pendingBatchId, setPendingBatchId] = useState<string | null>(null);

    const enrolledBatchIds: string[] =
        userRes?.status === 200 ? userRes.data.data?.batch_ids ?? [] : [];

    const handleEnroll = async (batchId: string) => {
        setPendingBatchId(batchId);
        try {
            await enroll(batchId);
            await queryClient.invalidateQueries({ queryKey: getGetUserQueryKey() });
            toast.success("Enrolled successfully");
            router.push("/");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to enroll");
        } finally {
            setPendingBatchId(null);
        }
    };

    const batches: GetBatch200DataItem[] = useMemo(() => {
        if (batchesData?.status === 200 && Array.isArray(batchesData.data?.data)) {
            return batchesData.data.data;
        }
        return [];
    }, [batchesData]);

    return (
        <div className="min-h-screen bg-bg-primary flex">
            <SidebarNav activeIndex={0} />

            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-text-muted text-sm">
                        One step to get you started
                    </p>
                    <h1 className="text-2xl font-bold text-text-primary mt-1">
                        Enroll in an ongoing batch to start learning
                    </h1>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Error */}
                {error ? (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
                        <p className="font-medium">Failed to load batches</p>
                        <p className="text-sm mt-1">
                            {error instanceof Error
                                ? error.message
                                : "An error occurred while loading batches"}
                        </p>
                    </div>
                ) : null}

                {/* Batch grid */}
                {!isLoading && !error && (
                    <>
                        {batches.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <path d="M16 2v4M8 2v4M3 10h18" />
                                    </svg>
                                </div>
                                <p className="text-text-muted">
                                    No open batches right now. New batches appear here as soon as an admin opens enrollment.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => queryClient.invalidateQueries({ queryKey: getGetBatchQueryKey() })}
                                    className="text-[12.5px] text-brand hover:opacity-80 transition-opacity"
                                >
                                    Check again
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batches.map((batch) => {
                                    const isCompleted =
                                        batch.batch_end_date &&
                                        new Date(batch.batch_end_date) < new Date();
                                    const isEnrolled = enrolledBatchIds.includes(batch.id);
                                    const isThisPending = isEnrolling && pendingBatchId === batch.id;
                                    return (
                                        <BatchCard
                                            key={batch.id}
                                            batch={batch}
                                            actionLabel={
                                                isEnrolled
                                                    ? "Enrolled"
                                                    : isThisPending
                                                    ? "Enrolling…"
                                                    : "Enroll Now"
                                            }
                                            actionDisabled={!!isCompleted || isEnrolled || isEnrolling}
                                            onAction={() => handleEnroll(batch.id)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
