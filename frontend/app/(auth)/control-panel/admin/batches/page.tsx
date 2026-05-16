"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@akxr/design-system";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarNav } from "../../../../../components/SidebarNav";
import { BatchCard } from "../../../../../components/BatchCard";
import { CrudBatchModal } from "../../../../../components/CrudBatchModal";
import { useGetBatch, getGetBatchQueryKey, useGetAdminUsers, useDeleteBatch } from "@akxr/api";
import type { GetBatch200DataItem } from "@akxr/api";

export default function BatchManagementPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useGetBatch();
    const { data: usersData } = useGetAdminUsers();
    const { mutateAsync: doDelete } = useDeleteBatch();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState<GetBatch200DataItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteBatch, setConfirmDeleteBatch] = useState<GetBatch200DataItem | null>(null);

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

    const handleDelete = async (batch: GetBatch200DataItem) => {
        setDeletingId(batch.id);
        try {
            await doDelete(batch.id);
            queryClient.invalidateQueries({ queryKey: getGetBatchQueryKey() });
        } catch {
            alert("Failed to delete batch");
        } finally {
            setDeletingId(null);
            setConfirmDeleteBatch(null);
        }
    };

    const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetBatchQueryKey() });

    return (
        <div className="min-h-screen bg-bg-primary flex">
            <SidebarNav activeIndex={1} />

            <main className="flex-1 p-8 overflow-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Batch Management</h1>
                        <p className="text-text-secondary mt-1">Manage attendance and track student progress.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                        Add new batch
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {error ? (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error">
                        <p className="font-medium">Failed to load batches</p>
                        <p className="text-sm mt-1">
                            {error instanceof Error ? error.message : typeof error === "string" ? error : "An error occurred"}
                        </p>
                    </div>
                ) : null}

                {!isLoading && !error && (
                    <>
                        {batchData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-text-muted">No batches found. Create your first batch to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batchData.map((batch) => (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        studentCount={studentCountByBatch[batch.id] ?? 0}
                                        mentorDisplayName={mentorNameByBatch[batch.id]}
                                        onViewDetails={() => router.push(`/control-panel/admin/batches/${batch.id}`)}
                                        onEdit={() => setEditingBatch(batch)}
                                        onDelete={() => setConfirmDeleteBatch(batch)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create modal */}
            <CrudBatchModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={invalidate}
            />

            {/* Edit modal */}
            <CrudBatchModal
                open={!!editingBatch}
                batch={editingBatch}
                onClose={() => setEditingBatch(null)}
                onSuccess={() => { setEditingBatch(null); invalidate(); }}
            />

            {/* Delete confirmation */}
            {confirmDeleteBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-card border border-border-default rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-text-primary mb-2">Delete batch?</h2>
                        <p className="text-text-secondary text-sm mb-6">
                            <span className="font-semibold text-text-primary">{confirmDeleteBatch.batch_name}</span> will be permanently deleted. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                className="flex-1 bg-error border-error hover:bg-error/90"
                                isLoading={deletingId === confirmDeleteBatch.id}
                                onClick={() => handleDelete(confirmDeleteBatch)}
                            >
                                Delete
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteBatch(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
