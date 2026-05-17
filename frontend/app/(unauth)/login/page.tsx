"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserGithubLogin, usePostUserAuthSignin, setAuthTokens } from "@akxr/api";
import { resetAuthQueries } from "@/lib/auth-session";
import { toast } from "../../providers";
import { useQueryClient } from "@tanstack/react-query";

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11.5px] font-medium text-ink-3 tracking-[-0.003em]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="
          w-full bg-paper-2 text-ink border border-line rounded-[var(--r-sm)]
          px-[11px] py-[9px] text-[13px] font-sans outline-none
          transition-[border-color,box-shadow,background] duration-100
          placeholder:text-ink-4
          focus:border-gold focus:bg-card focus:shadow-[0_0_0_3px_var(--gold-soft)]
        "
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = usePostUserAuthSignin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const handleGitHub = async () => {
    if (isGithubLoading) return;
    setIsGithubLoading(true);
    try {
      const response = await getUserGithubLogin();
      if (response?.status === 200 && response?.data?.data?.auth_url) {
        window.location.href = response.data.data.auth_url;
      } else {
        toast.error("Failed to initiate GitHub login");
        setIsGithubLoading(false);
      }
    } catch {
      toast.error("Failed to initiate GitHub login");
      setIsGithubLoading(false);
    }
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (response) => {
          if (response?.status !== 200 || !response?.data?.data) {
            toast.error(response?.data?.message || "Login failed");
            return;
          }
          const { access_token, refresh_token, user } = response.data.data;
          setAuthTokens(access_token, refresh_token);
          void resetAuthQueries(queryClient).then(() => {
            if (user.profile_status === "AUTHENTICATED") {
              router.push("/complete-profile");
            } else {
              router.push("/");
            }
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans">
      {/* 3-segment progress strip: step 1 of 3 (sign-in → profile → ready) */}
      <div className="flex h-[3px] bg-line">
        <div className="flex-1 bg-ink" />
        <div className="flex-1 bg-transparent" />
        <div className="flex-1 bg-transparent" />
      </div>

      {/* Topbar */}
      <header className="flex items-center gap-3.5 px-5 py-3 flex-shrink-0 border-b border-line bg-paper">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Akxr — go to home"
          title="Go to home"
          className="flex items-center gap-3 -ml-1 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/akxr-logo.svg" alt="Akxr" className="h-[22px] w-auto flex-shrink-0" />
          <span className="text-[14px] font-semibold text-ink tracking-[-0.01em]">
            <em className="not-italic font-normal text-ink-3">Control Plane</em>
          </span>
        </button>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2 py-1 rounded-[var(--r-sm)] text-[10px] font-medium tracking-[0.06em] uppercase font-mono border border-line text-ink-4 bg-paper-2">
            STEP 1 / 3
          </span>
        </div>
      </header>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="w-[360px] text-center">
          <h1 className="text-[38px] leading-[1.05] tracking-[-0.02em] font-semibold mb-2.5 text-ink">
            Sign in to <em className="not-italic text-ink-3">continue</em>
          </h1>

          <p className="text-ink-3 text-[13.5px] leading-[1.55] mb-7">
            Akxr uses your GitHub identity for everyone — students, mentors and
            admins. Roles are assigned after your first sign-in.
          </p>

          {/* GitHub button — inverted (white on dark page) per reference */}
          <button
            type="button"
            onClick={handleGitHub}
            disabled={isGithubLoading || loginMutation.isPending}
            className="
              w-full flex items-center justify-center gap-2 px-3.5 py-3 font-sans
              text-[14px] font-medium tracking-[-0.003em] rounded-[var(--r-sm)]
              border border-ink bg-ink text-paper
              transition-[background,border-color,opacity] duration-100
              hover:bg-[var(--ink-2)] hover:border-[var(--ink-2)]
              disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-[var(--ink-2)]
            "
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            {isGithubLoading ? "Redirecting to GitHub…" : "Continue with GitHub"}
          </button>
          {/* Terms */}
          <p className="mt-7 text-[11.5px] text-ink-4 leading-[1.55]">
            By continuing you accept the Akxr terms and privacy policy.
            Your role (student · mentor · admin) is set by an admin from your domain.
          </p>
        </div>
      </div>
    </div>
  );
}
