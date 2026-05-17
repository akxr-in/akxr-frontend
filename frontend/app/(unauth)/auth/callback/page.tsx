"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGetUserQueryKey, setAuthTokens } from "@akxr/api";
import { toast } from "../../../providers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants";
import { Spinner } from "@akxr/design-system";
import { useQueryClient } from "@tanstack/react-query";

export default function GithubCallbackPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Parse hash parameters from URL (format: #access_token=...&refresh_token=...&is_new_user=...&profile_status=...)
        const hash = window.location.hash.substring(1); // Remove the #
        const params = new URLSearchParams(hash);

        const access_token = params.get(ACCESS_TOKEN_KEY);
        const refresh_token = params.get(REFRESH_TOKEN_KEY);
        const is_new_user = params.get("is_new_user") === "true";
        const profile_status = params.get("profile_status");

        if (!access_token || !refresh_token) {
            toast.error("Missing authentication tokens");
            router.push("/login");
            return;
        }

        setAuthTokens(access_token, refresh_token);
        queryClient.removeQueries({ queryKey: getGetUserQueryKey() });

        if (is_new_user) {
            toast.success("Account created successfully!");
            router.push("/complete-profile");
        } else {
            toast.success("Login successful!");
            if (profile_status === "AUTHENTICATED") {
                router.push("/complete-profile");
            } else {
                router.push("/");
            }
        }
    }, [router, queryClient]);

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-text-secondary text-sm">Completing GitHub sign-in…</p>
                <p className="text-text-muted text-[11.5px]">Hold tight, this should only take a second.</p>
            </div>
        </div>
    );
}