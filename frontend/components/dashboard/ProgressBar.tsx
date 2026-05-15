interface ProgressBarProps {
  value: number; // 0–100
  accent?: boolean;
  color?: string;
}

export function ProgressBar({ value, accent, color }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  let fillClass = 'bg-text-primary';
  if (accent) fillClass = 'bg-brand';

  return (
    <div className="relative h-[4px] bg-bg-elevated rounded-full overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 rounded-full ${color ? '' : fillClass}`}
        style={{ width: `${clampedValue}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  );
}
