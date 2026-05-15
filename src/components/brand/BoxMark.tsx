import { cn } from '@/lib/cn';

interface BoxMarkProps {
  size?: number;
  className?: string;
  motion?: boolean;
  tone?: 'color' | 'mono' | 'paper';
}

export function BoxMark({
  size = 96,
  className,
  motion = false,
  tone = 'color',
}: BoxMarkProps) {
  const isMono = tone === 'mono';
  const isPaper = tone === 'paper';

  const top = isMono ? '#1c2638' : isPaper ? '#fbeedd' : '#ffd21f';
  const left = isMono ? '#0b1220' : isPaper ? '#f1e7dc' : '#ff5a0a';
  const right = isMono ? '#141c2c' : isPaper ? '#fffaf4' : '#ea4b00';
  const stroke = isPaper ? '#f1e7dc' : '#0b1220';
  const trail = isMono ? '#0b1220' : isPaper ? '#f1e7dc' : '#0b86ff';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={cn(motion && 'animate-bob', className)}
      aria-hidden="true"
    >
      <g opacity="0.5">
        <line
          x1="6"
          y1="68"
          x2="22"
          y2="68"
          stroke={trail}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="2"
          y1="80"
          x2="18"
          y2="80"
          stroke={trail}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
      <path
        d="M30 38 L60 24 L90 38 L60 52 Z"
        fill={top}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M30 38 L30 84 L60 100 L60 52 Z"
        fill={left}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M90 38 L90 84 L60 100 L60 52 Z"
        fill={right}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M53 27 L53 50 L67 50 L67 27"
        fill={isMono ? '#1c2638' : '#0b1220'}
        opacity="0.85"
      />
    </svg>
  );
}
