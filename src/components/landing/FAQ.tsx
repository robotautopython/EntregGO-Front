'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { cn } from '@/lib/cn';

const faqs = [
  {
    q: 'Tem cobrança automática ou taxa por corrida?',
    a: 'Não. A EntregGO é uma central de operação — a relação financeira fica direta entre você e a central, sem gateway integrado nem cobrança automática no app.',
  },
  {
    q: 'Funciona no celular como app?',
    a: 'A base PWA/manifest já existe. Notificações com som e vibração ainda dependem do ciclo de Web Push real com backend, service worker e validação de segurança.',
  },
  {
    q: 'Quanto tempo demora a aprovação?',
    a: 'Depende da central. Em geral horas. Enquanto isso, sua conta fica em "aguardando aprovação" e você não consegue operar — é proposital, para garantir verificação real.',
  },
  {
    q: 'Como o motoboy recebe as solicitações?',
    a: 'Nesta fundação, o painel do motoboy mostra uma simulação do fluxo. O recebimento real por push/realtime e o primeiro aceite entram em ciclo backend separado.',
  },
  {
    q: 'E se nenhum motoboy aceitar?',
    a: 'A interface demonstra um timer de 60 segundos. A expiração real e o retry operacional dependem do endpoint de entregas e do validador de performance.',
  },
  {
    q: 'Posso me cadastrar como loja e motoboy ao mesmo tempo?',
    a: 'Cada conta tem um papel. Se você atua nos dois, use emails diferentes — assim cada painel fica limpo e a aprovação acontece separada.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative bg-paper py-20 sm:py-24"
      aria-labelledby="faq-titulo"
    >
      <Container size="md">
        <div className="mb-10 text-center">
          <SectionEyebrow tone="route" className="mx-auto inline-block">
            Perguntas frequentes
          </SectionEyebrow>
          <h2
            id="faq-titulo"
            className="mx-auto mt-3 max-w-2xl text-3xl font-black text-asphalt-950 sm:text-4xl"
          >
            O que aparece antes da primeira corrida.
          </h2>
        </div>

        <ul className="divide-y divide-paper-line rounded-lg border border-paper-line bg-white shadow-card">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <li key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-paper-deep"
                >
                  <span className="text-base font-extrabold text-asphalt-950 sm:text-lg">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-asphalt-950/60 transition-transform duration-ui ease-ride',
                      isOpen && 'rotate-180 text-brand-600',
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={cn(
                    'grid overflow-hidden transition-all duration-ride ease-ride',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="min-h-0">
                    <p className="px-5 pb-5 text-base leading-7 text-asphalt-950/75">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
