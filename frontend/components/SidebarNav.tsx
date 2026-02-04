"use client";

interface NavItemProps {
    active?: boolean;
}

const NavItem = ({ active = false }: NavItemProps) => (
    <div
        className={`w-10 h-10 rounded-md ${active ? "bg-brand" : "bg-brand-muted"
            } cursor-pointer hover:bg-brand-hover transition-colors`}
    />
);

interface SidebarNavProps {
    activeIndex?: number;
}

export const SidebarNav = ({ activeIndex = 0 }: SidebarNavProps) => {
    const items = Array.from({ length: 6 });

    return (
        <aside className="w-16 bg-bg-primary border-r border-border-default py-6 flex flex-col items-center gap-3">
            {items.map((_, index) => (
                <NavItem key={index} active={index === activeIndex} />
            ))}
            <div className="flex-1" />
            <NavItem />
        </aside>
    );
};

