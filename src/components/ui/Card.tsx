import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'white' | 'dark' | 'outline';
  hover?: boolean;
  children: ReactNode;
}

const variants = {
  paper: 'bg-paper border border-paper-line',
  white: 'bg-white border border-paper-line shadow-card',
  dark: 'bg-asphalt-950 text-white border border-white/10',
  outline: 'bg-transparent border border-asphalt-950/10',
};

export function Card({
  variant = 'white',
  hover = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-6 transition-all duration-ui ease-ride',
        variants[variant],
        hover &&
          'hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(11,18,32,0.10)] hover:border-brand-200',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
