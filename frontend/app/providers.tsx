"use client";

import {
    QueryClient,
    QueryClientProvider,
    QueryCache,
    MutationCache,
} from "@tanstack/react-query";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Error handler helper
function handleApiError(error: unknown) {
    console.error("API Error:", error);

    let message = "An unexpected error occurred";

    if (error instanceof Error) {
        message = error.message;

        // Handle specific HTTP errors
        if (message.includes("401") || message.includes("Unauthorized")) {
            message = "Session expired. Please log in again.";
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            return;
        }

        if (message.includes("403") || message.includes("Forbidden")) {
            message = "You don't have permission to perform this action.";
        }

        if (message.includes("404") || message.includes("Not Found")) {
            message = "The requested resource was not found.";
        }

        if (message.includes("500") || message.includes("Internal Server")) {
            message = "Server error. Please try again later.";
        }

        if (message.includes("Network") || message.includes("fetch")) {
            message = "Network error. Please check your connection.";
        }
    }

    toast.error(message);
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error) => handleApiError(error),
                }),
                mutationCache: new MutationCache({
                    onError: (error) => handleApiError(error),
                }),
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            if (error instanceof Error) {
                                if (error.message.includes("401") || error.message.includes("403")) {
                                    return false;
                                }
                            }
                            return failureCount < 2;
                        },
                    },
                    mutations: {
                        retry: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "var(--color-bg-elevated)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border-default)",
                    },
                    success: {
                        iconTheme: {
                            primary: "var(--color-success)",
                            secondary: "var(--color-bg-elevated)",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "var(--color-error)",
                            secondary: "var(--color-bg-elevated)",
                        },
                    },
                }}
            />
        </QueryClientProvider>
    );
}

// Export toast for manual usage
export { toast };
