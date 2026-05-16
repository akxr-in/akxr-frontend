"use client";

import { useRouter } from "next/navigation";

interface NavEntry {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const HOME_ICON = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
);

const GRID_ICON = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const LOGOUT_ICON = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
);

const NAV_ENTRIES: NavEntry[] = [
    { label: "Home", href: "/", icon: HOME_ICON },
    { label: "Batches", href: "/control-panel/admin/batches", icon: GRID_ICON },
];

interface SidebarNavProps {
    activeIndex?: number;
}

export const SidebarNav = ({ activeIndex = 0 }: SidebarNavProps) => {
    const router = useRouter();

    return (
        <aside className="w-16 bg-bg-primary border-r border-border-default py-6 flex flex-col items-center gap-2">
            {NAV_ENTRIES.map((entry, index) => {
                const active = index === activeIndex;
                return (
                    <button
                        key={entry.href}
                        type="button"
                        onClick={() => router.push(entry.href)}
                        aria-label={entry.label}
                        aria-current={active ? "page" : undefined}
                        title={entry.label}
                        className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 focus:ring-offset-bg-primary ${
                            active
                                ? "bg-brand text-text-inverted"
                                : "text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
                        }`}
                    >
                        {entry.icon}
                    </button>
                );
            })}

            <div className="flex-1" />

            <button
                type="button"
                onClick={() => router.push("/logout")}
                aria-label="Sign out"
                title="Sign out"
                className="w-10 h-10 rounded-md flex items-center justify-center text-text-muted hover:bg-error/10 hover:text-error transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-1 focus:ring-offset-bg-primary"
            >
                {LOGOUT_ICON}
            </button>
        </aside>
    );
};
