export type AttStatus = "present" | "partial" | "absent" | "live";

interface AttendanceBadgeProps {
  status: AttStatus;
}

const statusTooltip: Record<AttStatus, string> = {
  present: "Present for the full session",
  partial: "Joined but missed part of the session",
  absent: "Did not join the session",
  live: "Session is happening right now",
};

// Tone via canonical status tokens — same scheme as the reference
// `Pill` primitive (ds.jsx). Live reuses the gold tone but adds a pulsing
// dot to read as "happening now".
const statusConfig: Record<AttStatus, { className: string; label: string; pulse?: boolean }> = {
  present: { className: "bg-success-subtle text-success border-success-muted",   label: "Present" },
  partial: { className: "bg-brand-subtle   text-brand-ink border-brand-muted",   label: "Partial" },
  absent:  { className: "bg-error-subtle   text-error border-error-muted",       label: "Absent" },
  live:    { className: "bg-brand-subtle   text-brand-ink border-brand-muted",   label: "LIVE", pulse: true },
};

export function AttendanceBadge({ status }: AttendanceBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      title={statusTooltip[status]}
      aria-label={statusTooltip[status]}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-medium border ${cfg.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${cfg.pulse ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}
