import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-8 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Link className="inline-flex text-sm font-semibold text-brand-600" href="/">
            EntregGO
          </Link>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-black text-asphalt-950 sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600">{subtitle}</p>
          </div>
          <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
            <div className="border-l-2 border-brand-500 pl-3">Cadastro pela API</div>
            <div className="border-l-2 border-route-500 pl-3">Sessao pelo Supabase Auth</div>
            <div className="border-l-2 border-gray-300 pl-3">Aprovacao pelo admin</div>
          </div>
        </div>
        <div className="rounded-md border border-orange-100 bg-white p-5 shadow-[0_18px_44px_rgba(11,18,32,0.08)] sm:p-6">
          {children}
        </div>
      </section>
    </main>
  );
}
