"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthTokens } from "@/lib/utils";
import { toast } from "../../providers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants";

export default function GithubCallbackPage() {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(true);

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

        // Store tokens in both localStorage and cookies
        setAuthTokens(access_token, refresh_token);

        if (is_new_user) {
            toast.success("Account created successfully!");
            // New users should complete their profile
            router.push("/complete-profile");
        } else {
            toast.success("Login successful!");
            // Existing users redirect based on profile status
            if (profile_status === "AUTHENTICATED") {
                router.push("/complete-profile");
            } else {
                router.push("/");
            }
        }

        setIsProcessing(false);
    }, [router]);

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                <p className="text-text-secondary">Completing GitHub authentication...</p>
            </div>
        </div>
    );
}