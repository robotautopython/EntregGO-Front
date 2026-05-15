'use client';

import { ArrowRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const navLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#para-lojas', label: 'Para lojas' },
  { href: '#para-motoboys', label: 'Para motoboys' },
  { href: '#faq', label: 'Perguntas' },
];

export function BrandHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-ride ease-ride',
        scrolled
          ? 'glass border-b border-paper-line shadow-card'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="EntregGO inicio" className="group inline-flex items-center">
          <Image
            alt="EntregGO"
            src="/brand/entreggo-logo-transparent.png"
            width={1731}
            height={908}
            priority
            className="h-9 w-auto transition-transform duration-ride ease-ride group-hover:-translate-y-0.5 sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Secoes">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-asphalt-950/80 transition-colors duration-ui ease-ride hover:bg-paper-deep hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold text-asphalt-950 transition-colors duration-ui ease-ride hover:text-brand-700"
          >
            Entrar
          </Link>
          <ButtonLink href="/registro" variant="dark" size="md">
            Cadastrar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>

        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-paper-line bg-white text-asphalt-950 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="border-t border-paper-line bg-paper px-5 pb-8 pt-4">
            <nav className="flex flex-col gap-1" aria-label="Menu mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-base font-semibold text-asphalt-950 hover:bg-paper-deep"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ButtonLink href="/login" variant="secondary" size="lg" width="full">
                Entrar
              </ButtonLink>
              <ButtonLink href="/registro" variant="primary" size="lg" width="full">
                Cadastrar
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
