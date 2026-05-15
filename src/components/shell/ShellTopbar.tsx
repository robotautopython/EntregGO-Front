'use client';

import { Bell, LogOut, Menu, Search, Wifi, WifiOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { AuthContext, UserRole } from '@/types/auth';

import { roleLabels } from './ShellNavConfig';

interface ShellTopbarProps {
  role: UserRole;
  authContext: AuthContext | null;
  title?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  online?: boolean;
  notifications?: number;
  onOpenMobileNav: () => void;
  onSignOut: () => void;
}

export function ShellTopbar({
  role,
  authContext,
  title,
  searchPlaceholder = 'Buscar...',
  showSearch = role === 'admin',
  online = true,
  notifications = 0,
  onOpenMobileNav,
  onSignOut,
}: ShellTopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const initials = (authContext?.user.email ?? 'EG')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!avatarOpen) return;
    function onClick(event: MouseEvent) {
      if (!avatarRef.current?.contains(event.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [avatarOpen]);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-paper-line bg-white/85 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 sm:px-5">
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onOpenMobileNav}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-paper-line bg-white text-asphalt-950 md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link href="/" aria-label="EntregGO inicio" className="inline-flex md:hidden">
          <Image
            alt=""
            src="/brand/entreggo-logo-transparent.png"
            width={1731}
            height={908}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden flex-1 items-center gap-3 md:flex">
          {title ? (
            <h2 className="truncate text-base font-extrabold text-asphalt-950">{title}</h2>
          ) : null}
          {showSearch ? (
            <div className="relative ml-auto w-full max-w-md">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-asphalt-950/45"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-md border border-paper-line bg-paper pl-10 pr-3 text-sm font-medium outline-none transition-all duration-ui ease-ride placeholder:text-asphalt-950/45 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              'hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold sm:inline-flex',
              online
                ? 'border-success-500/30 bg-success-50 text-success-700'
                : 'border-warn-500/30 bg-warn-50 text-warn-700',
            )}
            aria-live="polite"
          >
            {online ? (
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {online ? 'Online' : 'Reconectando'}
          </span>

          <button
            type="button"
            aria-label="Notificações"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-asphalt-950/70 hover:bg-paper-deep hover:text-asphalt-950"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {notifications > 0 ? (
              <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-extrabold text-white">
                {notifications > 9 ? '9+' : notifications}
              </span>
            ) : null}
          </button>

          <div ref={avatarRef} className="relative">
            <button
              type="button"
              aria-label="Conta"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
              onClick={() => setAvatarOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-paper-line bg-white px-2 pr-3 hover:border-brand-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-asphalt-950 text-xs font-extrabold text-white">
                {initials}
              </span>
              <span className="hidden text-sm font-bold text-asphalt-950 sm:inline">
                {roleLabels[role]}
              </span>
            </button>

            {avatarOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-1 w-64 origin-top-right rounded-md border border-paper-line bg-white p-2 shadow-card animate-fade-in"
              >
                <div className="border-b border-paper-line px-3 py-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
                    {roleLabels[role]}
                  </p>
                  <p className="truncate text-sm font-bold text-asphalt-950">
                    {authContext?.user.email ?? 'Sem sessão'}
                  </p>
                  {authContext ? (
                    <Badge
                      tone={
                        authContext.user.status === 'ativo'
                          ? 'success'
                          : authContext.user.status === 'bloqueado'
                            ? 'danger'
                            : 'warn'
                      }
                      className="mt-2"
                    >
                      {authContext.user.status}
                    </Badge>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="mt-1 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-asphalt-950 hover:bg-paper-deep"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
