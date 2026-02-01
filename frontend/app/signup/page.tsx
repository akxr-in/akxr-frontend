"use client";

import { Button, Input, Select, GithubIcon } from "@akxr/design-system";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostUserAuthSignup, type PostUserAuthSignupBody } from "@akxr/api";
import { toast } from "../providers";
import { setAuthTokens } from "@/lib/utils";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z
        .string()
        .min(1, "Username is required")
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be at most 50 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    role: z.string().min(1, "Please select a role"),
});

type SignupFormData = z.infer<typeof signupSchema>;

const roleOptions = [
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
    { value: "manager", label: "Project Manager" },
    { value: "other", label: "Other" },
];

// Required asterisk component
const RequiredAsterisk = () => (
    <span className="text-error ml-1">*</span>
);

export default function SignupPage() {
    const router = useRouter();
    const signupMutation = usePostUserAuthSignup();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: "",
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        // Map form data to API body format
        const signupBody: PostUserAuthSignupBody = {
            full_name: data.fullName,
            username: data.username,
            email: data.email,
            password: data.password,
        };

        signupMutation.mutate(
            { data: signupBody },
            {
                onSuccess: (response) => {
                    if (response?.status !== 201) {
                        toast.error(response?.data?.message || "Signup failed");
                        return;
                    }

                    const { access_token, refresh_token, user } = response?.data?.data;

                    // Store tokens in both localStorage and cookies
                    setAuthTokens(access_token, refresh_token);

                    toast.success("Account created successfully!");

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
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Welcome to Akxr
                    </h1>
                    <p className="text-text-secondary">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-text-primary underline hover:text-brand transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Full Name & Username Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                                Full Name
                                <RequiredAsterisk />
                            </label>
                            <Input
                                placeholder="John Doe"
                                {...register("fullName")}
                                error={errors.fullName?.message}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                                Username
                                <RequiredAsterisk />
                            </label>
                            <Input
                                placeholder="akxr_username"
                                {...register("username")}
                                error={errors.username?.message}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                            Email
                            <RequiredAsterisk />
                        </label>
                        <Input
                            placeholder="m@example.com"
                            {...register("email")}
                            error={errors.email?.message}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                            Password
                            <RequiredAsterisk />
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            error={errors.password?.message}
                        />
                    </div>

                    {/* Role Select */}
                    <div>
                        <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                            Role
                            <RequiredAsterisk />
                        </label>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Select your role"
                                    options={roleOptions}
                                    {...field}
                                    error={errors.role?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Sign Up Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={signupMutation.isPending}
                    >
                        Sign Up
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
                    Continue with GitHub
                </Button>

                {/* Terms */}
                <p className="text-center mt-6 text-text-muted text-sm">
                    By clicking continue, you agree to our{" "}
                    <Link href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}
