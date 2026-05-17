type Role = "STUDENT" | "MENTOR" | "ADMIN";

interface RoleBadgeProps {
  role: Role;
}

// Tone → token mapping mirrors the reference `Pill` primitive
// (axar_design_extracted/js/ds.jsx::Pill). Values come from CSS
// custom properties so theme changes don't need a code edit.
const roleConfig: Record<Role, { className: string; label: string }> = {
  STUDENT: {
    className: "bg-info-subtle text-info border-info-muted",
    label: "Student",
  },
  MENTOR: {
    className: "bg-brand-subtle text-brand-ink border-brand-muted",
    label: "Mentor",
  },
  ADMIN: {
    className: "bg-error-subtle text-error border-error-muted",
    label: "Admin",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const cfg = roleConfig[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--r-sm)] font-mono text-[10px] uppercase tracking-[0.06em] font-medium border ${cfg.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
