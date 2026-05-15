interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-6 h-6 text-[9px]',
  md: 'w-7 h-7 text-[11px]',
  lg: 'w-10 h-10 text-[13px]',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} bg-bg-elevated border border-border-default rounded-full flex items-center justify-center text-text-secondary font-medium flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
