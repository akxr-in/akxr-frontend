"use client";

import { Button, Input } from "@akxr/design-system";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// GitHub Icon
const GithubIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log("Login data:", data);
        // Handle login logic here
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
                            <Link
                                href="/forgot-password"
                                className="text-sm text-text-secondary hover:text-text-primary underline transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            error={errors.password?.message}
                        />
                    </div>

                    {/* Login Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isSubmitting}
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
