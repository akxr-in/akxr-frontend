"use client";

import { Button, Input, GithubIcon } from "@akxr/design-system";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostUserAuthSignin, getUserGithubLogin } from "@akxr/api";
import { toast } from "../../providers";
import { setAuthTokens } from "@/lib/utils";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const loginMutation = usePostUserAuthSignin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        loginMutation.mutate(
            { data: { email: data.email, password: data.password } },
            {
                onSuccess: (response) => {
                    // Check if response has the expected structure
                    if (response?.status !== 200 || !response?.data?.data) {
                        toast.error(response?.data?.message || "Login failed");
                        return;
                    }

                    const { access_token, refresh_token, user } = response.data.data;

                    // Store tokens in both localStorage and cookies
                    setAuthTokens(access_token, refresh_token);

                    toast.success("Login successful!");

                    // Redirect based on profile status
                    if (user.profile_status === "AUTHENTICATED") {
                        router.push("/complete-profile");
                    } else {
                        router.push("/");
                    }
                },
            }
        );
    };

    return (
        <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Welcome back
                    </h1>
                    <p className="text-text-secondary">Login to your Akxr account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Input */}
                    <Input
                        label="Email/username"
                        placeholder="m@example.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-text-primary">
                                Password
                            </label>
                            {/* <Link
                                href="/forgot-password"
                                className="text-sm text-text-secondary hover:text-text-primary underline transition-colors"
                            >
                                Forgot your password?
                            </Link> */}
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            error={errors.password?.message}
                            showPasswordToggle
                        />
                    </div>

                    {/* Login Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={loginMutation.isPending}
                    >
                        Login
                    </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-border-default" />
                    <span className="text-text-muted text-sm">Or continue with</span>
                    <div className="flex-1 h-px bg-border-default" />
                </div>

                {/* GitHub Login */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    leftIcon={<GithubIcon />}
                    onClick={async () => {
                        try {
                            const response = await getUserGithubLogin();
                            if (response?.status === 200 && response?.data?.data?.auth_url) {
                                window.location.href = response.data.data.auth_url;
                            } else {
                                toast.error("Failed to initiate GitHub login");
                            }
                        } catch (error) {
                            toast.error("Failed to initiate GitHub login");
                        }
                    }}
                >
                    Login with Github
                </Button>

                {/* Sign Up Link */}
                <p className="text-center mt-6 text-text-secondary text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-text-primary underline hover:text-brand transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
