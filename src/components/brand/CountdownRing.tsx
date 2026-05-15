'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

interface CountdownRingProps {
  durationSeconds?: number;
  size?: number;
  stroke?: number;
  autoStart?: boolean;
  loop?: boolean;
  label?: string;
  className?: string;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function CountdownRing({
  durationSeconds = 60,
  size = 240,
  stroke = 12,
  autoStart = true,
  loop = false,
  label = 'Procurando motoboy',
  className,
  onComplete,
  onTick,
}: CountdownRingProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  useEffect(() => {
    onTickRef.current?.(remaining);
    if (remaining === 0 && !loop && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [remaining, loop]);

  useEffect(() => {
    if (!autoStart) return;
    if (remaining <= 0) {
      if (loop) {
        completedRef.current = false;
        const id = setTimeout(() => setRemaining(durationSeconds), 800);
        return () => clearTimeout(id);
      }
      return;
    }
    const id = setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [autoStart, durationSeconds, loop, remaining]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / durationSeconds;
  const dashOffset = circumference * (1 - progress);

  const tone =
    remaining <= 5
      ? { stroke: '#dc2626', text: 'text-danger-500', label: 'Últimos segundos...' }
      : remaining <= 15
        ? { stroke: '#f59e0b', text: 'text-warn-500', label: 'Quase lá, aguarde...' }
        : { stroke: '#ff5a0a', text: 'text-brand-600', label };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="timer"
      aria-live="polite"
      aria-label={`${tone.label} ${remaining} segundos restantes`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1e7dc"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 320ms ease-out',
            filter:
              remaining <= 15
                ? 'drop-shadow(0 0 12px rgba(245,158,11,0.45))'
                : 'drop-shadow(0 0 12px rgba(255,90,10,0.35))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono font-extrabold font-tnum tabular-nums leading-none',
            tone.text,
          )}
          style={{ fontSize: size * 0.32 }}
        >
          {remaining.toString().padStart(2, '0')}
        </span>
        <span className="mt-2 text-xs font-bold uppercase tracking-widest text-asphalt-950/70">
          segundos
        </span>
      </div>
    </div>
  );
}
