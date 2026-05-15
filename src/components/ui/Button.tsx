import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export const buttonStyles = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold transition-all duration-ui ease-ride disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-route-500',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white shadow-pop hover:bg-brand-600 active:translate-y-px',
        secondary:
          'bg-white text-asphalt-950 border border-paper-line hover:border-brand-300 hover:text-brand-700',
        dark:
          'bg-asphalt-950 text-white shadow-ink hover:bg-asphalt-700 active:translate-y-px',
        ghost:
          'bg-transparent text-asphalt-950 hover:bg-paper-deep hover:text-brand-700',
        outline:
          'bg-transparent text-asphalt-950 border border-asphalt-950/15 hover:border-asphalt-950/40',
        danger:
          'bg-danger-500 text-white hover:bg-danger-700',
        success:
          'bg-success-500 text-white hover:bg-success-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-base',
      },
      width: {
        auto: '',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonStyles>;

interface CommonProps extends ButtonVariantProps {
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, width, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size, width }), className)}
      {...rest}
    >
      {children}
    </button>
  );
});

type ButtonLinkProps = CommonProps &
  Omit<React.ComponentProps<typeof Link>, keyof CommonProps | 'children'>;

export function ButtonLink({
  variant,
  size,
  width,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, width }), className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
