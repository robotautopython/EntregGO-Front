import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type BadgeTone =
  | 'brand'
  | 'route'
  | 'signal'
  | 'success'
  | 'warn'
  | 'danger'
  | 'asphalt'
  | 'paper';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
  pulsing?: boolean;
  children: ReactNode;
}

const toneStyles: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  route: 'bg-route-50 text-route-700 border-route-200',
  signal: 'bg-signal-50 text-signal-600 border-signal-200',
  success: 'bg-success-50 text-success-700 border-success-500/20',
  warn: 'bg-warn-50 text-warn-700 border-warn-500/30',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/30',
  asphalt: 'bg-asphalt-950 text-white border-asphalt-700',
  paper: 'bg-paper-deep text-asphalt-950 border-paper-line',
};

export function Badge({
  tone = 'brand',
  icon,
  pulsing = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
        toneStyles[tone],
        className,
      )}
      {...rest}
    >
      {pulsing && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
