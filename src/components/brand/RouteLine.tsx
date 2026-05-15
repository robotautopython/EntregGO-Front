import { cn } from '@/lib/cn';

interface RouteLineProps {
  from?: string;
  to?: string;
  className?: string;
  variant?: 'horizontal' | 'compact';
}

export function RouteLine({
  from = 'Coleta',
  to = 'Destino',
  className,
  variant = 'horizontal',
}: RouteLineProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-xs font-semibold', className)}>
        <span className="flex h-2.5 w-2.5 rounded-full bg-route-500" aria-hidden="true" />
        <span className="text-asphalt-950 truncate">{from}</span>
        <svg
          width="40"
          height="6"
          viewBox="0 0 40 6"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <line
            x1="2"
            y1="3"
            x2="38"
            y2="3"
            stroke="#ff5a0a"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="dashed-route"
          />
        </svg>
        <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
        <span className="text-asphalt-950 truncate">{to}</span>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-3 w-3 shrink-0 rounded-full bg-route-500 ring-4 ring-route-50" aria-hidden="true" />
        <svg
          height="6"
          viewBox="0 0 200 6"
          preserveAspectRatio="none"
          fill="none"
          className="h-1.5 flex-1"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="3"
            x2="200"
            y2="3"
            stroke="#ff5a0a"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="dashed-route"
          />
        </svg>
        <span className="flex h-3 w-3 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50" aria-hidden="true" />
      </div>
      <div className="mt-2 flex items-start justify-between gap-4 text-xs font-semibold">
        <div className="max-w-[45%]">
          <p className="text-route-700 uppercase tracking-wider">Coleta</p>
          <p className="mt-0.5 text-asphalt-950 truncate">{from}</p>
        </div>
        <div className="max-w-[45%] text-right">
          <p className="text-brand-700 uppercase tracking-wider">Destino</p>
          <p className="mt-0.5 text-asphalt-950 truncate">{to}</p>
        </div>
      </div>
    </div>
  );
}
