'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Container } from '@/components/ui/Container';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';
import { cn } from '@/lib/cn';

// DESIGN AGENT: FAQ reduzido a 4 perguntas voltadas ao usuário final.
// Removidas perguntas sobre timer, leilão, push real, validadores e mecânica
// interna de aceite concorrente.
const faqs = [
  {
    q: 'Tem custo pra usar?',
    a: 'O cadastro é gratuito. Qualquer combinado financeiro entre sua loja e os motoboys é feito fora do app, do jeito que vocês preferirem.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. A EntregGO abre direto no navegador do seu celular, sem precisar instalar nada da loja de apps.',
  },
  {
    q: 'Como começo?',
    a: 'Clique em "Cadastrar minha loja" ou "Quero ser motoboy", preencha os dados e aguarde a aprovação. Assim que liberado, você já pode operar.',
  },
  {
    q: 'Posso me cadastrar como loja e motoboy ao mesmo tempo?',
    a: 'Cada conta tem um papel. Se você atua nos dois, use emails diferentes — assim cada painel fica organizado.',
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
