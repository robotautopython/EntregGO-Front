import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/ui/Container';

const columns = [
  {
    title: 'Produto',
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#para-lojas', label: 'Para lojas' },
      { href: '#para-motoboys', label: 'Para motoboys' },
      { href: '#faq', label: 'Perguntas' },
    ],
  },
  {
    title: 'Acesso',
    links: [
      { href: '/registro', label: 'Cadastrar' },
      { href: '/login', label: 'Entrar' },
      { href: '/aguardando-aprovacao', label: 'Aguardando aprovação' },
    ],
  },
  {
    title: 'Operação',
    links: [
      { href: 'mailto:suporte@ent.app.br', label: 'Suporte' },
      { href: '#', label: 'Status' },
      { href: '#', label: 'Termos' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-asphalt-950 py-14 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl"
      />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" aria-label="EntregGO inicio" className="inline-flex">
              <Image
                alt="EntregGO"
                src="/brand/entreggo-logo-on-dark.png"
                width={1731}
                height={908}
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              Central de entregas sob demanda. Lojas pedem, motoboys aceitam, a central governa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
                  {column.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} EntregGO · Energia de rua, controle de central.</p>
          <p className="font-mono uppercase tracking-widest">v0.1 · build edge</p>
        </div>
      </Container>
    </footer>
  );
}
