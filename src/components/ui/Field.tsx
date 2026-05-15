import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="flex items-center gap-1 text-sm font-bold text-asphalt-950">
        {label}
        {required && <span className="text-brand-600">*</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-xs font-semibold text-danger-700">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-asphalt-950/60">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  'w-full rounded-md border bg-white px-3.5 text-base font-medium text-asphalt-950 placeholder:text-asphalt-950/35 outline-none transition-all duration-ui ease-ride focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-paper-deep';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        inputBase,
        'h-12',
        invalid ? 'border-danger-500/60' : 'border-paper-line',
        className,
      )}
      {...rest}
    />
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        inputBase,
        'resize-y py-3 leading-6',
        invalid ? 'border-danger-500/60' : 'border-paper-line',
        className,
      )}
      {...rest}
    />
  );
});
