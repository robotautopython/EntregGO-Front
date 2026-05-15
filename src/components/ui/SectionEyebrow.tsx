import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface SectionEyebrowProps {
  tone?: 'brand' | 'route' | 'paper';
  className?: string;
  children: ReactNode;
}

const tones = {
  brand: 'text-brand-600',
  route: 'text-route-600',
  paper: 'text-paper-line',
};

export function SectionEyebrow({ tone = 'brand', className, children }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-extrabold uppercase tracking-[0.18em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
