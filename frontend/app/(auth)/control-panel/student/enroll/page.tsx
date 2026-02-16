"use client";

import { useMemo } from "react";
import { Spinner } from "@akxr/design-system";
import { useGetBatch } from "@akxr/api";
import type { GetBatch200DataItem } from "@akxr/api";
import { SidebarNav } from "../../../../../components/SidebarNav";
import { BatchCard } from "../../../../../components/BatchCard";

export default function StudentEnrollPage() {
    const { data: batchesData, isLoading, error } = useGetBatch();

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
                            <div className="text-center py-16">
                                <p className="text-text-muted">
                                    No batches available right now. Check back later!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batches.map((batch) => {
                                    const isCompleted =
                                        batch.batch_end_date &&
                                        new Date(batch.batch_end_date) < new Date();
                                    return (
                                        <BatchCard
                                            key={batch.id}
                                            batch={batch}
                                            actionLabel="Enroll Now"
                                            actionDisabled={!!isCompleted}
                                            onAction={() => console.log("Enroll in batch", batch.id)}
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
