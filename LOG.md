# LOG - EntregGO Front

## Como Ler

Registro cronologico de ciclos significativos. Fatos ficam aqui; decisoes vao em DECISIONS; aprendizados vao em LEARNINGS.

## 2026-05-14 - M-00A EXECUTADO

**Fase:** fundacao
**O que aconteceu:** Criada a governanca minima do frontend, estrutura de pastas vazias versionaveis, `.env.example`, README, STRUCTURE e CONTRACTS. Nenhuma dependencia foi instalada e nenhum manifesto `package.json` foi criado.
**Agentes utilizados:** Camisa10, PromptRefiner, Cetico, ImpactValidator, FinalValidator, Documentador
**Status:** fechado com ressalvas documentais

## 2026-05-14 - FUNDACAO TECNICA FRONTEND CRIADA

**Fase:** fundacao
**O que aconteceu:** Criados `package.json`, `package-lock.json`, configs Next.js/TypeScript/Tailwind/PostCSS, App Router minimo, rotas placeholder, clients base `api` e Supabase, manifest PWA e scripts de qualidade.
**Agentes utilizados:** Camisa10, PromptRefiner, Cetico, ImpactValidator, FinalValidator, Documentador
**Status:** fechado com ressalva de auditoria

**Validacoes:** `npm install`, `npm run typecheck`, `npm run build` e `npm run lint` executados com sucesso. `npm audit` reportou vulnerabilidades transitivas que exigem upgrades quebraveis.

## 2026-05-14 - AUDITORIA DE DEPENDENCIAS REDUZIDA

**Fase:** fundacao/hardening de dependencias
**O que aconteceu:** Inventariado `npm audit`, `npm outdated`, `npm view` e `npm why`. Removido `next-pwa` porque nao estava ligado ao runtime (`next.config.js` nao usava `withPWA`, nao havia `sw.js` real e push/PWA real esta fora de escopo). Adicionado override restrito para `@next/eslint-plugin-next` usar `glob@10.5.0`, eliminando a vulnerabilidade transitiva de `glob`.
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, FinalValidator, Documentador
**Status:** fechado com vulnerabilidade residual documentada

**Validacoes:** `npm install`, `npm run typecheck`, `npm run build` e `npm run lint` passaram. `npm audit --audit-level=moderate` ainda falha por `next@14.2.35` e `postcss@8.4.31` interno do Next; a correcao indicada pelo audit exige breaking change para Next 16.2.6.

## 2026-05-14 - M-02B FRONTEND AUTH/CADASTRO MINIMO

**Fase:** fundacao/auth
**O que aconteceu:** Implementado frontend minimo de login/cadastro: login usa Supabase Auth no browser, cadastro de loja/motoboy consome somente a API backend e a tela de status consulta `/api/auth/me` com Bearer token. Nenhum acesso direto a tabelas de negocio foi colocado na UI.
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente com ressalva de smoke real por sessao Supabase Auth

**Validacoes:** Frontend `npm run typecheck`, `npm run build` e `npm run lint` passaram; `npm test --if-present` nao executou suite por nao existir script de testes. `npm audit` segue falhando pelo residual conhecido em `next@14.2.35`/PostCSS interno, cuja correcao exige migracao major. Smoke read-only com anon key retornou `401` para `users`, `stores`, `couriers`, `payments`, `delivery_requests` e `push_subscriptions`. Smoke com sessao real ficou bloqueado ate confirmar rotacao da service role exposta e definir limpeza segura de usuario temporario. Varredura de secrets nao encontrou segredo real fora de `.env.local`; os demais achados sao placeholders/exemplos em documentacao de referencia.

## 2026-05-14 - DIRECAO VISUAL E LANDING INICIAL

**Fase:** fundacao/design
**O que aconteceu:** Criado `design.md` com direcao visual do produto, paleta baseada na logo oficial e plano de evolucao do layout. A rota `/` foi transformada em landing page de entrada para cadastro e login, usando a logo em `public/brand/entreggo-logo.png`, foco em laranja/azul e narrativa operacional loja -> motoboy -> admin.
**Agentes utilizados:** Camisa10, Design Agent, ImpactValidator, FinalValidator, Documentador
**Status:** fechado localmente com validacao tecnica pendente/realizada no ciclo

**Validacoes:** `npm run typecheck`, `npm run build` e `npm run lint` passaram. Smoke HTTP local em `http://127.0.0.1:3002/` retornou `200`, com CTA de cadastro e asset da logo presentes no HTML. Nenhum handler de login/cadastro, contrato de API, segredo, PWA real, realtime real ou dashboard foi implementado neste ciclo.

## 2026-05-14 - SMOKE AUTH/RLS REAL PARCIAL

**Fase:** fundacao/auth hardening
**O que aconteceu:** A rotacao da service role foi confirmada pelo operador e o backend executou smoke real com usuarios ficticios e limpeza completa. As chamadas reais da API backend com sessao real passaram ate os cenarios admin previstos. A validacao RLS client-side positiva nao concluiu porque REST com chave publica anon e Bearer de usuario real retornou `401`.
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** parcial; bloqueado por configuracao/chave publica anon para Auth/REST

**Validacoes:** Frontend `npm run typecheck`, `npm run build`, `npm test --if-present` e `npm run lint` passaram. `npm audit` segue falhando pelo residual conhecido em `next@14.2.35`/PostCSS interno. Nao houve mudanca de codigo frontend.

## 2026-05-14 - SMOKE AUTH/RLS REAL APROVADO

**Fase:** fundacao/auth hardening
**O que aconteceu:** A chave publica Supabase do frontend foi corrigida no `.env.local` local para uma publishable key. O smoke real do backend passou com sessao Supabase Auth real e validou RLS client-side positiva/negativa sem alterar codigo frontend.
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado com sucesso

**Validacoes:** `node scripts/smoke-auth-rls.mjs` passou no backend com limpeza completa. Frontend permanece sem mudanca de codigo neste fechamento; o residual conhecido de `npm audit` em Next/PostCSS continua aberto para ciclo proprio.

## 2026-05-15 - M-03 ADMIN MINIMO

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementado painel admin minimo em `/admin`, substituindo o placeholder por uma tela operacional que valida sessao Supabase Auth, confirma `/api/auth/me`, restringe a UI a `admin` ativo, lista usuarios via API backend com filtros/paginacao e executa aprovar, bloquear e desbloquear com Bearer token. O frontend nao acessa tabelas Supabase diretamente e nao recebeu secrets privados.
**Arquivos modificados:** `src/app/admin/page.tsx`, `src/components/admin/AdminUsersPanel.tsx`, `src/lib/api.ts`, `src/types/auth.ts`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente; pendente deploy do novo commit frontend

**Validacoes:** Frontend `npm run typecheck`, `npm run lint` e `npm run build` passaram. Backend `npm run typecheck`, `npm test`, `npm run lint` e `npm run build` passaram sem mudanca de codigo backend. Smoke de producao com admin temporario validou `/api/auth/me`, `GET /api/admin/users`, `PATCH approve` para `israel.souza@ent.app.br` e `PATCH block/unblock` em usuario temporario; limpeza confirmou zero linhas temporarias restantes e o motoboy ficou `ativo`.
