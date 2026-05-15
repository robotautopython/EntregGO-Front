# EntregGO Front

Frontend web do EntregGO, responsavel pela landing page, paineis de admin, loja e motoboy, PWA e consumo da API REST do backend.

## Estado atual

Fase de fundacao tecnica com auth/cadastro minimo e direcao visual inicial. Este repositorio possui manifest, dependencias, Next.js, TypeScript, Tailwind, App Router, landing page de entrada, rotas de login/cadastro/status e paineis placeholder. Ainda nao possui dashboards, push real, realtime real ou suite de testes.

## Responsabilidades

- Renderizar a experiencia web dos usuarios.
- Consumir dados de negocio pela API REST do backend.
- Usar Supabase Auth e Realtime apenas conforme documentado.
- Manter apenas variaveis publicas com prefixo `NEXT_PUBLIC_`.
- Preparar base para PWA e Service Worker em etapa futura.
- Manter a identidade visual descrita em `design.md`.

## Design

O layout usa a logo oficial em `public/brand/entreggo-logo.png`, com foco em laranja e azul. A landing em `/` e o ponto inicial para cadastro e login.

Documento base: `design.md`.

## Fora da fundacao atual

- Implementar push real, realtime real ou dashboard.
- Inserir secrets reais ou variaveis privadas.

## Comandos

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run lint`

## Proximo passo

Planejar migracao segura de Next.js para versao corrigida, validar RLS com sessao real apos rotacao de secrets e evoluir o layout dos fluxos internos sem sair do escopo sensivel.
