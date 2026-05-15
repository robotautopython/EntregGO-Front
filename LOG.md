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

## 2026-05-15 - F7 TRACK A ADMIN ENXUTA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementada a Track A aprovada para o admin frontend sem criar contratos falsos. `AdminUsersPanel` passou a aceitar presets com `forcedRole`/`forcedStatus`, as paginas `/admin`, `/admin/lojas`, `/admin/motoboys`, `/admin/aprovacoes` e `/admin/usuarios` reutilizam o painel com copy especifica, e as linhas da tabela abrem `UserDetailDrawer`. O drawer mostra a aba Perfil com os campos de `DomainUser` ja entregues pela API M-02A e mantem Documentos, Entregas, Pagamento e Notas como placeholders explicitos para backend/validadores futuros.
**Arquivos criados:** `src/components/admin/UserDetailDrawer.tsx`
**Arquivos modificados:** `src/components/admin/AdminUsersPanel.tsx`, `src/app/admin/page.tsx`, `src/app/admin/lojas/page.tsx`, `src/app/admin/motoboys/page.tsx`, `src/app/admin/aprovacoes/page.tsx`, `src/app/admin/usuarios/page.tsx`, `src/app/admin/insights/page.tsx`, `src/app/admin/pagamentos/page.tsx`, `src/app/admin/entregas/page.tsx`, `src/app/admin/configuracoes/page.tsx`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`, `README.md`, `CONTRACTS.md`
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, Documentador
**Status:** fechado localmente; depende do backend Track B para dados expandidos

**Validacoes:** Conforme relato do ciclo, `npm run typecheck` e `npm run build` passaram com 24 rotas. Nenhum endpoint backend novo foi criado. Riscos rejeitados pelo validator ficaram fora do escopo: KPIs sem `/api/admin/insights`, CNH/fotos sem Security Validator/signed URLs/RLS de Storage e pagamentos sem persistencia/auditoria.

## 2026-05-15 - BACKEND USER DETAIL DISPONIVEL PARA O DRAWER

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O backend implementou `GET /api/admin/users/:id`, retornando `user` e `profile` sanitizado para loja/motoboy, sem campos de Storage/documentos. O frontend ainda nao consome este endpoint; a proxima tarefa de UI e ligar o drawer admin a esse contrato mantendo documentos, entregas, pagamentos e notas como placeholders.
**Arquivos modificados:** `STATUS.md`, `CONTRACTS.md`, `README.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, Documentador
**Status:** documentado; sem mudanca de codigo frontend

**Validacoes:** Validacoes foram executadas no backend: `npm run typecheck`, `npm test`, `npm run lint` e `npm run build` passaram. Nenhuma validacao frontend foi executada porque este registro e documental.

## 2026-05-15 - DRAWER ADMIN CONSUMINDO USER DETAIL

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O frontend integrou o drawer admin ao endpoint backend `GET /api/admin/users/:id`. Foram adicionados tipos sanitizados para detalhe admin, client `getAdminUserDetail`, carregamento efemero do perfil expandido ao selecionar usuario e exibicao de dados de loja/motoboy na aba Perfil. Admin continua com `profile: null`. Documentos, entregas, pagamento e notas permanecem como placeholders honestos.
**Arquivos modificados:** `src/types/auth.ts`, `src/lib/api.ts`, `src/components/admin/AdminUsersPanel.tsx`, `src/components/admin/UserDetailDrawer.tsx`, `STATUS.md`, `CONTRACTS.md`, `README.md`, `LEARNINGS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente

**Validacoes:** `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram. Build gerou 24 rotas. Nenhum acesso direto ao Supabase de negocio foi adicionado, nenhum secret entrou no frontend e nenhum campo de Storage/documento foi exposto.

## 2026-05-15 - ADMIN INSIGHTS CONSUMINDO BACKEND REAL

**Fase:** fundacao/auth-operacao
**O que aconteceu:** `/admin/insights` deixou de usar `ComingSoonPanel` e passou a consumir `GET /api/admin/insights` com Bearer token de admin ativo. Foram adicionados tipos do contrato, client `getAdminInsights`, UI minima com contagens por role/status, lojas ativas, motoboys ativos, ultimos pendentes limitados pelo backend e `generated_at` formatado. A pagina trata loading, erro e retorno vazio, sem mocks, graficos, cache, realtime, polling ou PII fora do contrato.
**Arquivos modificados:** `src/types/auth.ts`, `src/lib/api.ts`, `src/app/admin/insights/page.tsx`, `STATUS.md`, `CONTRACTS.md`, `README.md`, `LEARNINGS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, ImpactValidator, TestEngineer, Documentador
**Status:** fechado localmente apos validacoes

**Validacoes:** Frontend `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram. Build gerou 24 rotas. Browser local em `http://127.0.0.1:3002/admin/insights` abriu sem o texto antigo do placeholder; sem sessao admin real disponivel no navegador, a verificacao visual ficou limitada ao shell/guard de auth.

## 2026-05-15 - SMOKE POS-DEPLOY ADMIN INSIGHTS APROVADO

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O deploy frontend `https://entreggo.vercel.app` no commit `93d0175` foi validado contra o backend `https://entreggoback.vercel.app` no commit `b34f30d`. Primeiro foi confirmado que o bundle publicado contem `/api/admin/insights`; depois, em sessao real de admin ativo no navegador do operador, a pagina `/admin/insights` chamou `GET https://entreggoback.vercel.app/api/admin/insights` e recebeu `200`. A UI renderizou `Insights da central`, cards de usuarios, lojas ativas, motoboys ativos e informacoes do contrato, sem o placeholder antigo.
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, TestEngineer, Documentador
**Status:** fechado com ressalvas operacionais

**Validacoes:** Chamada sem token ao backend retornou `401 AUTH_REQUIRED`, confirmando rota protegida. Chamada autenticada no navegador do operador retornou `200`, sem compartilhamento de tokens, cookies ou headers sensiveis. A tela nao exibiu `Area reservada`, `Metricas de operacao entram depois...`, `Evitar dashboard fake...` ou `ComingSoonPanel`. Smoke de vazio nao executado porque nao havia dataset seguro naturalmente zerado em producao. Estado de falha foi observado no incidente real anterior de deploy stale, com `Falha ao carregar` e `Tentar novamente`; bloqueio reversivel via DevTools nao foi executado pelo Codex porque a sessao logada estava apenas no navegador do operador. Regressao basica parcial: `/admin` e a navegacao admin foram observadas em producao; acoes destrutivas e logout nao foram executados.
