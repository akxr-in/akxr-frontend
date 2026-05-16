"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserGithubLogin, usePostUserAuthSignin } from "@akxr/api";
import { setAuthTokens } from "@/lib/utils";
import { toast } from "../../providers";

const inputStyle: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 13,
  padding: '9px 11px',
  border: '1px solid #262626',
  borderRadius: 4,
  background: '#141414',
  color: '#fafafa',
  outline: 'none',
  width: '100%',
  transition: 'border-color .12s, box-shadow .12s, background .12s',
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: '#C9963A',
  boxShadow: '0 0 0 3px rgba(201,150,58,0.10)',
  background: '#191919',
};

function Field({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11.5, color: '#a3a3a3', fontWeight: 500, letterSpacing: '-0.003em' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = usePostUserAuthSignin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGitHub = async () => {
    try {
      const response = await getUserGithubLogin();
      if (response?.status === 200 && response?.data?.data?.auth_url) {
        window.location.href = response.data.data.auth_url;
      } else {
        toast.error("Failed to initiate GitHub login");
      }
    } catch {
      toast.error("Failed to initiate GitHub login");
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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0a', fontFamily: 'var(--font-geist-sans)', color: '#fafafa' }}
    >
      {/* 3-segment progress strip */}
      <div className="flex h-[3px]" style={{ background: '#262626' }}>
        <div className="flex-1" style={{ background: '#fafafa' }} />
        <div className="flex-1" style={{ background: 'transparent' }} />
        <div className="flex-1" style={{ background: 'transparent' }} />
      </div>

      {/* Topbar */}
      <header
        className="flex items-center gap-3.5 px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #262626', background: '#0a0a0a' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/akxr-logo.svg" alt="Akxr" className="h-[22px] w-auto flex-shrink-0" />
        <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: '#fafafa' }}>
          <em className="not-italic font-normal" style={{ color: '#a3a3a3' }}>Control Plane</em>
        </span>
        <div className="ml-auto">
          <span
            className="inline-flex items-center px-2 py-1 rounded-[4px] text-[10px] font-medium tracking-[0.06em] uppercase"
            style={{ fontFamily: 'var(--font-geist-mono)', border: '1px solid #262626', color: '#737373', background: '#141414' }}
          >
            STEP 1 / 3
          </span>
        </div>
      </header>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '40px 32px' }}>
        <div style={{ width: 360, textAlign: 'center' }}>

          {/* Heading */}
          <h1 style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 600, marginBottom: 10, color: '#fafafa' }}>
            Sign in to{' '}
            <em className="not-italic" style={{ color: '#a3a3a3' }}>continue</em>
          </h1>

          <p style={{ color: '#a3a3a3', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 28px' }}>
            Akxr uses your GitHub identity for everyone — students, mentors and
            admins. Roles are assigned after your first sign-in.
          </p>

          {/* GitHub button */}
          <button
            type="button"
            onClick={handleGitHub}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.003em',
              borderRadius: 4,
              border: '1px solid #fafafa',
              background: '#fafafa',
              color: '#0a0a0a',
              cursor: 'pointer',
              transition: 'background .12s, border-color .12s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d4d4d4';
              e.currentTarget.style.borderColor = '#d4d4d4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fafafa';
              e.currentTarget.style.borderColor = '#fafafa';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#262626' }} />
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#737373' }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: '#262626' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <Field label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                marginTop: 4,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 500,
                letterSpacing: '-0.003em',
                borderRadius: 4,
                border: '1px solid #262626',
                background: loginMutation.isPending ? '#141414' : '#191919',
                color: loginMutation.isPending ? '#737373' : '#fafafa',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'background .12s, border-color .12s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending) {
                  e.currentTarget.style.background = '#27272a';
                  e.currentTarget.style.borderColor = '#404040';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = loginMutation.isPending ? '#141414' : '#191919';
                e.currentTarget.style.borderColor = '#262626';
              }}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Continue with email'}
            </button>
          </form>

          {/* Terms */}
          <p style={{ marginTop: 28, fontSize: 11.5, color: '#737373', lineHeight: 1.55 }}>
            By continuing you accept the Akxr{' '}
            <u style={{ cursor: 'pointer' }}>terms</u> and{' '}
            <u style={{ cursor: 'pointer' }}>privacy</u> policy.
            Your role (student · mentor · admin) is set by an admin from your domain.
          </p>
        </div>
      </div>
    </div>
  );
}
