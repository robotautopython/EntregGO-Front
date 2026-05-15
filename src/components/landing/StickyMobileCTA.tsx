'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 transition-transform duration-ride ease-ride md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      aria-hidden={!visible}
    >
      <div className="border-t border-paper-line glass px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
        <ButtonLink href="/registro" variant="primary" size="lg" width="full">
          Cadastrar agora
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </div>
  );
}
