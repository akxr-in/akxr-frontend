"use client";

import React from "react";
import { Avatar } from "@/components/dashboard/Avatar";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { clearAuthTokens } from "@/lib/utils";
import { useRouter } from "next/navigation";

type LmsRole = "STUDENT" | "MENTOR" | "ADMIN";

interface LmsTab {
  id: string;
  label: string;
}

interface LmsLayoutProps {
  role: LmsRole;
  heading: string;
  subtitle: string;
  userName: string;
  tabs: LmsTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function LmsLayout({
  role,
  heading,
  subtitle,
  userName,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
}: LmsLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <header className="flex items-center gap-3.5 px-5 py-3 border-b border-border-default bg-bg-primary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/akxr-logo.svg" alt="Akxr" className="h-[22px] w-auto flex-shrink-0" />
        <div>
          <div className="text-[14px] font-semibold text-white tracking-tight">
            <em className="text-text-muted font-normal not-italic">LMS</em>
          </div>
        </div>
        <RoleBadge role={role} />
        <div className="ml-auto flex items-center gap-3.5 text-text-muted">
          <button
            type="button"
            className="text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Logout"
            onClick={() => {
              clearAuthTokens();
              router.push("/login");
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
          <Avatar name={userName} size="sm" />
        </div>
      </header>

      <div className="px-6 py-5 border-b border-border-default bg-bg-primary">
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">{heading}</h1>
            <p className="text-[13px] text-text-muted mt-1">{subtitle}</p>
          </div>
          {actions}
        </div>
      </div>

      <nav className="flex items-center gap-0.5 px-6 border-b border-border-default bg-bg-primary">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cx(
                "px-3 py-2.5 text-[12.5px] font-medium border-b-[1.5px] -mb-px transition-colors",
                active
                  ? "text-text-primary border-brand"
                  : "text-text-muted border-transparent hover:text-text-secondary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

export function Panel({
  title,
  sub,
  right,
  children,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-white">{title}</h3>
          {sub ? <p className="text-[11px] text-text-muted mt-0.5">{sub}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</div>
      <div className="text-[26px] text-white font-semibold tracking-[-0.02em] mt-1">{value}</div>
      <div className="text-[11.5px] text-text-muted mt-1">{sub}</div>
    </div>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return <p className="text-[12.5px] text-text-muted text-center py-10">{text}</p>;
}

export const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";

export const fmtDateTime = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";

export const pct = (n: number): string => `${Math.round(n * 100)}%`;

function cx(...parts: Array<string | false>): string {
  return parts.filter(Boolean).join(" ");
}
