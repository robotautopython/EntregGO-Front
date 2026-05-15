'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import type { UserRole } from '@/types/auth';

import { navConfig } from './ShellNavConfig';

interface ShellBottomNavProps {
  role: UserRole;
}

export function ShellBottomNav({ role }: ShellBottomNavProps) {
  const pathname = usePathname();
  const items = navConfig[role]
    .flatMap((group) => group.items)
    .filter((item) => item.mobile)
    .slice(0, 4);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-line bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors',
                  isActive ? 'text-brand-700' : 'text-asphalt-950/65 hover:text-asphalt-950',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-0 h-0.5 w-10 rounded-full bg-brand-500 transition-opacity duration-ui',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon
                  className={cn('h-5 w-5', isActive && 'text-brand-600')}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
