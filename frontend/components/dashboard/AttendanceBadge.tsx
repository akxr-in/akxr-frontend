export type AttStatus = 'present' | 'partial' | 'absent' | 'live';

interface AttendanceBadgeProps {
  status: AttStatus;
}

const statusConfig: Record<AttStatus, {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  label: string;
}> = {
  present: {
    bg: 'rgba(34,197,94,0.12)',
    text: '#22C55E',
    border: 'rgba(34,197,94,0.2)',
    dotColor: '#22C55E',
    label: 'Present',
  },
  partial: {
    bg: 'rgba(201,150,58,0.10)',
    text: '#C9963A',
    border: 'rgba(201,150,58,0.2)',
    dotColor: '#C9963A',
    label: 'Partial',
  },
  absent: {
    bg: 'rgba(197,34,34,0.14)',
    text: '#C52222',
    border: 'rgba(197,34,34,0.2)',
    dotColor: '#C52222',
    label: 'Absent',
  },
  live: {
    bg: 'rgba(201,150,58,0.12)',
    text: '#C9963A',
    border: 'rgba(201,150,58,0.25)',
    dotColor: '#C9963A',
    label: 'LIVE',
  },
};

export function AttendanceBadge({ status }: AttendanceBadgeProps) {
  const cfg = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span
        className={status === 'live' ? 'w-1.5 h-1.5 rounded-full animate-pulse' : 'w-1.5 h-1.5 rounded-full'}
        style={{ backgroundColor: cfg.dotColor }}
      />
      {cfg.label}
    </span>
  );
}
