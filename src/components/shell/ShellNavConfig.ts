import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bike,
  ClipboardList,
  History,
  LayoutDashboard,
  PackagePlus,
  Settings,
  Store,
  Users,
  Wallet,
} from 'lucide-react';

import type { UserRole } from '@/types/auth';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: 'live';
  mobile?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const navConfig: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      title: 'Cadastros',
      items: [
        { href: '/admin/usuarios', label: 'Usuários', icon: Users, mobile: true },
        { href: '/admin/lojas', label: 'Lojas', icon: Store, mobile: true },
        { href: '/admin/motoboys', label: 'Motoboys', icon: Bike, mobile: true },
      ],
    },
    {
      title: 'Operação',
      items: [
        { href: '/admin/entregas', label: 'Entregas', icon: ClipboardList },
        { href: '/admin/pagamentos', label: 'Pagamentos', icon: Wallet },
        { href: '/admin/insights', label: 'Insights', icon: BarChart3, mobile: true },
      ],
    },
    {
      items: [{ href: '/admin/configuracoes', label: 'Configurações', icon: Settings }],
    },
  ],
  logista: [
    {
      title: 'Loja',
      items: [
        { href: '/loja', label: 'Início', icon: LayoutDashboard, mobile: true },
        {
          href: '/loja/nova-entrega',
          label: 'Nova entrega',
          icon: PackagePlus,
          badge: 'live',
          mobile: true,
        },
      ],
    },
    {
      title: 'Operação',
      items: [
        { href: '/loja/historico', label: 'Histórico', icon: History, mobile: true },
        { href: '/loja/insights', label: 'Insights', icon: BarChart3 },
      ],
    },
    {
      items: [{ href: '/loja/perfil', label: 'Perfil da loja', icon: Settings, mobile: true }],
    },
  ],
  motoboy: [
    {
      items: [
        { href: '/motoboy', label: 'Corridas', icon: Bike, mobile: true },
        { href: '/motoboy/historico', label: 'Histórico', icon: History, mobile: true },
        { href: '/motoboy/perfil', label: 'Perfil', icon: Settings, mobile: true },
      ],
    },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  logista: 'Loja',
  motoboy: 'Motoboy',
};

export const roleHome: Record<UserRole, string> = {
  admin: '/admin/usuarios',
  logista: '/loja',
  motoboy: '/motoboy',
};
