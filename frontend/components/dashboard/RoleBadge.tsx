type Role = 'STUDENT' | 'MENTOR' | 'ADMIN';

interface RoleBadgeProps {
  role: Role;
}

const roleConfig: Record<Role, {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  label: string;
}> = {
  STUDENT: {
    bg: 'rgba(103,141,229,0.12)',
    text: '#678DE5',
    border: 'rgba(103,141,229,0.2)',
    dotColor: '#678DE5',
    label: 'Student',
  },
  MENTOR: {
    bg: 'rgba(201,150,58,0.10)',
    text: '#C9963A',
    border: 'rgba(201,150,58,0.2)',
    dotColor: '#C9963A',
    label: 'Mentor',
  },
  ADMIN: {
    bg: 'rgba(197,34,34,0.14)',
    text: '#C52222',
    border: 'rgba(197,34,34,0.2)',
    dotColor: '#C52222',
    label: 'Admin',
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const cfg = roleConfig[role];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.06em] font-medium border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
}
