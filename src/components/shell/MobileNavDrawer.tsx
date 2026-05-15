'use client';

import { LogOut, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { AuthContext, UserRole } from '@/types/auth';

import { navConfig, roleLabels } from './ShellNavConfig';

interface MobileNavDrawerProps {
  role: UserRole;
  authContext: AuthContext | null;
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export function MobileNavDrawer({
  role,
  authContext,
  open,
  onClose,
  onSignOut,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const groups = navConfig[role];

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-asphalt-950/40 animate-fade-in"
      />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-xs flex-col border-r border-paper-line bg-white shadow-ink animate-slide-in-left">
        <div className="flex h-16 items-center justify-between border-b border-paper-line px-4">
          <Link href="/" aria-label="EntregGO inicio" onClick={onClose}>
            <Image
              alt=""
              src="/brand/entreggo-logo-transparent.png"
              width={1731}
              height={908}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-asphalt-950/70 hover:bg-paper-deep"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {groups.map((group, groupIndex) => (
            <div key={group.title ?? `g-${groupIndex}`} className="space-y-1">
              {group.title ? (
                <p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-asphalt-950/45">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold transition-colors',
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-asphalt-950/80 hover:bg-paper-deep',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isActive ? 'text-brand-600' : 'text-asphalt-950/55',
                          )}
                          aria-hidden="true"
                        />
                        {item.label}
                        {item.badge === 'live' ? (
                          <Badge tone="brand" pulsing className="ml-auto px-1.5 text-[9px]">
                            live
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {authContext ? (
          <div className="border-t border-paper-line p-3">
            <div className="rounded-md bg-paper p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                {roleLabels[authContext.user.role]}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-asphalt-950">
                {authContext.user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-paper-line bg-white px-3 py-2.5 text-sm font-bold text-asphalt-950 hover:border-brand-300"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
