'use client';

import { Bell, Volume2, Vibrate, X, Zap } from 'lucide-react';
import { useEffect } from 'react';

import { BoxMark } from '@/components/brand/BoxMark';

interface PushPrimeSheetProps {
  open: boolean;
  onClose: () => void;
  onEnable: () => void;
}

const benefits = [
  { icon: Volume2, label: 'Som chamativo, mesmo com o app fechado' },
  { icon: Vibrate, label: 'Vibração junto pra você sentir na rua' },
  { icon: Zap, label: 'Aceite em um toque, sem perder corrida' },
];

export function PushPrimeSheet({ open, onClose, onEnable }: PushPrimeSheetProps) {
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="push-title">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-asphalt-950/55"
      />

      <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl border border-paper-line bg-white shadow-ink animate-slide-in-left motion-safe:animate-[fade-in_320ms_cubic-bezier(.2,.8,.2,1)_both] sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-3">
          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-600">
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            Notificações da central
          </p>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-asphalt-950/65 hover:bg-paper-deep hover:text-asphalt-950"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-5 py-7 sm:px-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <BoxMark size={96} />
            <h2 id="push-title" className="text-2xl font-black leading-tight text-asphalt-950">
              Pra receber corridas, ative as notificações.
            </h2>
            <p className="max-w-sm text-sm text-asphalt-950/70">
              O navegador vai pedir permissão depois deste passo. Sem isso, a central não consegue
              te chamar quando uma loja precisar.
            </p>
          </div>

          <ul className="space-y-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li
                  key={benefit.label}
                  className="flex items-center gap-3 rounded-md border border-paper-line bg-paper px-4 py-3 text-sm font-bold text-asphalt-950"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {benefit.label}
                </li>
              );
            })}
          </ul>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onEnable}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-5 text-base font-extrabold text-white shadow-pop transition-colors hover:bg-brand-600 active:translate-y-px"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              Ativar notificações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-full items-center justify-center text-sm font-bold text-asphalt-950/65 hover:text-asphalt-950"
            >
              Agora não
            </button>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-asphalt-950/45">
            Você pode mudar isso depois nas configurações do navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
