interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  positive?: boolean;
}

export function StatCard({ label, value, sub, positive }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className="font-semibold text-[26px] tracking-tight text-white mt-1">{value}</p>
      {sub && (
        <p className={`text-[11.5px] mt-1 ${positive ? 'text-success' : 'text-text-muted'}`}>{sub}</p>
      )}
    </div>
  );
}
