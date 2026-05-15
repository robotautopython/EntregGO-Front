import { cn } from '@/lib/cn';

interface PasswordStrengthProps {
  value: string;
  className?: string;
}

function score(value: string): number {
  if (!value) return 0;
  let s = 0;
  if (value.length >= 8) s += 1;
  if (value.length >= 12) s += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s += 1;
  if (/\d/.test(value)) s += 1;
  if (/[^A-Za-z0-9]/.test(value)) s += 1;
  return Math.min(s, 4);
}

const levels = [
  { label: 'Vazia', tone: 'bg-paper-line text-asphalt-950/50' },
  { label: 'Fraca', tone: 'bg-danger-500 text-danger-700' },
  { label: 'Média', tone: 'bg-warn-500 text-warn-700' },
  { label: 'Boa', tone: 'bg-route-500 text-route-700' },
  { label: 'Forte', tone: 'bg-success-500 text-success-700' },
];

export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const s = score(value);
  const level = levels[s];

  return (
    <div className={cn('space-y-1.5', className)} aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-ui',
              step <= s ? level.tone.split(' ')[0] : 'bg-paper-line',
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs font-bold',
          level.tone.split(' ').slice(1).join(' ') || 'text-asphalt-950/50',
        )}
      >
        {value ? `Senha: ${level.label}` : 'Use 8+ caracteres, com letras, números e um símbolo'}
      </p>
    </div>
  );
}
