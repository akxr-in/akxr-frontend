"use client";

import React from "react";
import { cn } from "@akxr/design-system";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { clearAuthTokens } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface AppShellProps {
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
  userName: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  topbarRight?: React.ReactNode;
  navRight?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  role,
  userName,
  tabs,
  activeTab,
  onTabChange,
  topbarRight,
  navRight,
  children,
}: AppShellProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthTokens();
    router.push('/login');
  };

  return (
    <div
      className="min-h-screen bg-bg-primary flex flex-col"
      style={{ fontFamily: 'var(--font-geist-sans)' }}
    >
      {/* Topbar */}
      <header className="flex items-center gap-3.5 px-5 py-3 border-b border-border-default bg-bg-primary flex-shrink-0">
        {/* Brand mark */}
        <div
          className="w-[22px] h-[22px] rounded-[5px] flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E2B566 0%, #C9963A 45%, #B27C19 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px #262626',
          }}
        />
        {/* Brand name */}
        <span className="text-[14px] font-semibold text-white tracking-tight">
          Akxr<em className="text-text-muted font-normal ml-1.5 not-italic">Control Plane</em>
        </span>
        <RoleBadge role={role} />
        <div className="ml-auto flex items-center gap-3.5 text-text-muted">
          {topbarRight}
          {/* Bell icon */}
          <button
            type="button"
            className="text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="text-text-muted hover:text-text-secondary transition-colors"
            aria-label="Logout"
            title="Logout"
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

      {/* Subnav */}
      <nav className="flex items-center gap-0.5 px-5 border-b border-border-default bg-bg-primary flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-3 py-2.5 text-[12.5px] font-medium border-b-[1.5px] -mb-px transition-colors',
              activeTab === tab.id
                ? 'text-text-primary border-brand'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            )}
          >
            {tab.label}
          </button>
        ))}
        {navRight && <div className="ml-auto">{navRight}</div>}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
