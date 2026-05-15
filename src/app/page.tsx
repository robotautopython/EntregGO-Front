import {
  ArrowRight,
  Bike,
  Boxes,
  CheckCircle2,
  Clock3,
  MapPinned,
  ShieldCheck,
  Store,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const accessLinks = [
  { href: '/registro', label: 'Comecar cadastro' },
  { href: '/login', label: 'Entrar' },
];

const routes = [
  {
    icon: Store,
    title: 'Loja solicita',
    description: 'Entrada simples para operacoes que precisam sair do balcao sem perder o ritmo.',
  },
  {
    icon: Bike,
    title: 'Motoboy assume',
    description: 'A experiencia futura prioriza aceite claro, status visivel e acao rapida.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin governa',
    description: 'Aprovacao, bloqueios e acompanhamento ficam centralizados antes da escala.',
  },
];

const operatingPrinciples = [
  'Cadastro com aprovacao operacional',
  'Dados de negocio pela API backend',
  'Supabase Auth somente no fluxo permitido',
  'PWA preparado para ciclo futuro seguro',
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf4] text-asphalt-950">
      <section className="relative min-h-[92vh] border-b border-orange-100 px-5 py-5 sm:px-8 lg:px-10">
        <Image
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-24 hidden w-[980px] max-w-none -translate-x-1/2 select-none opacity-[0.075] lg:block"
          height={460}
          priority
          src="/brand/entreggo-logo.png"
          width={980}
        />

        <nav
          aria-label="Navegacao principal"
          className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4"
        >
          <Link className="inline-flex items-center" href="/" aria-label="EntregGO inicio">
            <Image
              alt="EntregGO"
              className="h-auto w-36 sm:w-44"
              height={96}
              priority
              src="/brand/entreggo-logo.png"
              width={320}
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              className="hidden h-11 items-center justify-center rounded-md px-4 text-sm font-semibold text-asphalt-950 transition hover:text-brand-600 sm:inline-flex"
              href="/login"
            >
              Entrar
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-asphalt-950 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(11,18,32,0.18)] transition hover:bg-brand-600"
              href="/registro"
            >
              Cadastrar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-84px)] max-w-7xl flex-col justify-center pb-10 pt-12">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-white/70 px-3 py-2 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Base operacional para entregas sob demanda
            </div>

            <div className="space-y-5">
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] text-asphalt-950 sm:text-7xl lg:text-8xl">
                O caminho mais curto entre pedido, motoboy e entrega.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-gray-700 sm:text-xl">
                A EntregGO nasce como uma central de operacao: lojas entram, motoboys aguardam
                aprovacao e o admin prepara a rede antes da primeira corrida real.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {accessLinks.map((link, index) => (
                <Link
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition ${
                    index === 0
                      ? 'bg-brand-500 text-white shadow-[0_16px_34px_rgba(255,90,10,0.28)] hover:bg-brand-600'
                      : 'border border-route-200 bg-white text-route-700 hover:border-route-500'
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {operatingPrinciples.map((item) => (
              <div
                className="flex min-h-20 items-center gap-3 rounded-md border border-orange-100 bg-white/80 p-4 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur"
                key={item}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10" aria-labelledby="rota-operacional">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase text-route-600">Rota do sistema</p>
              <h2
                id="rota-operacional"
                className="max-w-3xl text-3xl font-black text-asphalt-950 sm:text-5xl"
              >
                Um layout que ja conta a historia do produto.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-gray-600">
              A landing e a primeira camada do sistema: orienta o cadastro, reforca confianca e
              mantem as features sensiveis para os ciclos certos.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {routes.map((route, index) => {
              const Icon = route.icon;

              return (
                <article
                  className="group rounded-md border border-gray-200 bg-[#fffaf4] p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_44px_rgba(11,18,32,0.08)]"
                  key={route.title}
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-asphalt-950 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-black text-brand-500">0{index + 1}</span>
                  </div>
                  <h3 className="text-2xl font-black text-asphalt-950">{route.title}</h3>
                  <p className="mt-3 text-base leading-7 text-gray-600">{route.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-asphalt-950 px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm font-bold uppercase text-brand-500">Plano visual</p>
            <h2 className="text-3xl font-black sm:text-5xl">Energia de rua, controle de central.</h2>
            <p className="max-w-xl text-base leading-7 text-blue-100">
              O laranja carrega velocidade e acao. O azul entra como confianca operacional. O
              fundo claro mantem leitura; o asfalto escuro organiza decisoes importantes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <Boxes className="mb-6 h-6 w-6 text-brand-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-blue-100">Entrada</p>
              <p className="mt-2 text-2xl font-black">Landing + cadastro</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <MapPinned className="mb-6 h-6 w-6 text-route-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-blue-100">Fluxo</p>
              <p className="mt-2 text-2xl font-black">Loja, motoboy, admin</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="mb-6 h-6 w-6 text-[#ffd21f]" aria-hidden="true" />
              <p className="text-sm font-semibold text-blue-100">Regra</p>
              <p className="mt-2 text-2xl font-black">Sem atalhos sensiveis</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
