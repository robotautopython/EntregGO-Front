'use client';

import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { AuthContext, UserRole } from '@/types/auth';

import { navConfig, roleLabels } from './ShellNavConfig';

interface ShellSidebarProps {
  role: UserRole;
  authContext: AuthContext | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSignOut: () => void;
}

export function ShellSidebar({
  role,
  authContext,
  collapsed,
  onToggleCollapsed,
  onSignOut,
}: ShellSidebarProps) {
  const pathname = usePathname();
  const groups = navConfig[role];

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-paper-line bg-white transition-all duration-ride ease-ride md:flex',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      )}
      aria-label="Navegação principal"
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-paper-line px-3',
          collapsed ? 'justify-center' : 'justify-between px-4',
        )}
      >
        <Link href="/" aria-label="EntregGO inicio" className="inline-flex items-center gap-2">
          <Image
            alt=""
            src="/brand/entreggo-logo-transparent.png"
            width={1731}
            height={908}
            priority
            className={cn('h-8 w-auto', collapsed && 'hidden')}
          />
          <div
            aria-hidden="true"
            className={cn(
              'h-8 w-8 rounded-md bg-brand-500 ring-2 ring-brand-200',
              collapsed ? 'block' : 'hidden',
            )}
          />
        </Link>
        {!collapsed ? (
          <button
            type="button"
            aria-label="Recolher menu"
            onClick={onToggleCollapsed}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-asphalt-950/60 hover:bg-paper-deep hover:text-asphalt-950"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {collapsed ? (
          <button
            type="button"
            aria-label="Expandir menu"
            onClick={onToggleCollapsed}
            className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-asphalt-950/60 hover:bg-paper-deep hover:text-asphalt-950"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}

        {groups.map((group, groupIndex) => (
          <div key={group.title ?? `g-${groupIndex}`} className="space-y-1">
            {group.title && !collapsed ? (
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
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-ui ease-ride',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-asphalt-950/75 hover:bg-paper-deep hover:text-asphalt-950',
                        collapsed && 'justify-center px-0',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-md bg-brand-500 transition-opacity duration-ui',
                          isActive ? 'opacity-100' : 'opacity-0',
                          collapsed && 'hidden',
                        )}
                      />
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-brand-600' : 'text-asphalt-950/55 group-hover:text-asphalt-950',
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn('flex-1 truncate', collapsed && 'sr-only')}>
                        {item.label}
                      </span>
                      {item.badge === 'live' && !collapsed ? (
                        <Badge tone="brand" pulsing className="px-1.5 py-0 text-[9px]">
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

      <div
        className={cn(
          'border-t border-paper-line px-3 py-3 transition-colors',
          collapsed ? 'flex flex-col items-center gap-2' : '',
        )}
      >
        {!collapsed && authContext ? (
          <div className="rounded-md bg-paper p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-asphalt-950/55">
              {roleLabels[authContext.user.role]}
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-asphalt-950">
              Conta {authContext.user.status}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sair"
          className={cn(
            'mt-2 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-asphalt-950/70 transition-colors duration-ui hover:bg-paper-deep hover:text-asphalt-950',
            collapsed ? 'mt-0 w-auto justify-center px-2' : 'w-full',
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className={cn(collapsed && 'sr-only')}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
