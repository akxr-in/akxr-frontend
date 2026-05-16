"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@akxr/design-system";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarNav } from "../../../../../components/SidebarNav";
import { BatchCard } from "../../../../../components/BatchCard";
import { CrudBatchModal } from "../../../../../components/CrudBatchModal";
import { useGetBatch, getGetBatchQueryKey, useGetAdminUsers } from "@akxr/api";

// Main Page Component
export default function BatchManagementPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useGetBatch();
    const { data: usersData } = useGetAdminUsers();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const batchData = Array.isArray(data?.data?.data) ? data.data.data : [];

    const allUsers = useMemo(() => {
        if (usersData?.status === 200 && Array.isArray(usersData.data?.data)) {
            return usersData.data.data;
        }
        return [];
    }, [usersData]);

    const studentCountByBatch = useMemo(() => {
        const counts: Record<string, number> = {};
        allUsers.forEach((u) => {
            if (u.role === "STUDENT") {
                (u.batch_ids ?? []).forEach((bId) => {
                    counts[bId] = (counts[bId] ?? 0) + 1;
                });
            }
        });
        return counts;
    }, [allUsers]);

    const mentorNameByBatch = useMemo(() => {
        const names: Record<string, string> = {};
        batchData.forEach((batch) => {
            if (batch.mentor_ids.length > 0) {
                const mentor = allUsers.find((u) => u.id === batch.mentor_ids[0]);
                names[batch.id] = mentor?.full_name ?? "Mentor assigned";
            }
        });
        return names;
    }, [batchData, allUsers]);

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
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                        Add new batch
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Error State */}
                {error ? (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
                        <p className="font-medium">Failed to load batches</p>
                        <p className="text-sm mt-1">
                            {error instanceof Error
                                ? error.message
                                : typeof error === "string"
                                    ? error
                                    : "An error occurred while loading batches"}
                        </p>
                    </div>
                ) : null}

                {/* Batch Grid */}
                {!isLoading && !error && (
                    <>
                        {batchData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-text-muted">
                                    No batches found. Create your first batch to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batchData.map((batch) => (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        studentCount={studentCountByBatch[batch.id] ?? 0}
                                        mentorDisplayName={mentorNameByBatch[batch.id]}
                                        onViewDetails={() =>
                                            router.push(`/control-panel/admin/batches/${batch.id}`)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create Batch Modal */}
            <CrudBatchModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: getGetBatchQueryKey() });
                }}
            />
        </div>
    );
}
