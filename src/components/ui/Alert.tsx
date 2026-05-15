import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type AlertTone = 'info' | 'success' | 'warn' | 'danger';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const toneMap: Record<
  AlertTone,
  { container: string; icon: typeof Info; iconClass: string }
> = {
  info: {
    container: 'border-route-200 bg-route-50 text-route-700',
    icon: Info,
    iconClass: 'text-route-600',
  },
  success: {
    container: 'border-success-500/30 bg-success-50 text-success-700',
    icon: CheckCircle2,
    iconClass: 'text-success-500',
  },
  warn: {
    container: 'border-warn-500/30 bg-warn-50 text-warn-700',
    icon: AlertTriangle,
    iconClass: 'text-warn-500',
  },
  danger: {
    container: 'border-danger-500/30 bg-danger-50 text-danger-700',
    icon: XCircle,
    iconClass: 'text-danger-500',
  },
};

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { container, icon: Icon, iconClass } = toneMap[tone];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3 text-sm',
        container,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden="true" />
      <div className="space-y-1">
        {title ? <p className="font-extrabold leading-5">{title}</p> : null}
        <div className="font-medium leading-6">{children}</div>
      </div>
    </div>
  );
}
