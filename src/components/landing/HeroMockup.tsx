import Image from 'next/image';

// DESIGN AGENT: substituído o mock interativo (CountdownRing + RouteLine + badges)
// por uma foto real do contexto loja/motoboy. CountdownRing.tsx continua existindo
// e é usado em /loja/nova-entrega. Aqui a landing fala diretamente para loja e
// motoboy sem revelar mecânica interna (timer, aceite concorrente, etc.).
export function HeroMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-2xl bg-orange-radial opacity-90 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-2xl bg-route-radial opacity-80 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-paper-line bg-white p-3 shadow-pop sm:p-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-paper">
          <Image
            alt="Entregador EntregGO recebendo pedido em uma loja"
            src="/landing/hero.webp"
            fill
            priority
            sizes="(min-width: 1024px) 540px, (min-width: 640px) 80vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
