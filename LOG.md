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

## 2026-05-15 - FAVICON PRODUCAO CORRIGIDO

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Adicionado `public/favicon.ico` a partir do simbolo oficial existente em `public/brand/entreggo-logo-transparent.png`, sem dependencia nova e sem alterar layout, manifest, auth, API, rotas admin ou backend. O objetivo foi remover o `404` de favicon observado no smoke pos-deploy de `/admin/insights`.
**Arquivos modificados:** `public/favicon.ico`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, TestEngineer, Documentador
**Status:** fechado em producao

**Validacoes:** Antes do patch, `https://entreggo.vercel.app/favicon.ico` retornava `404`. Localmente, `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram; `http://127.0.0.1:3010/favicon.ico` retornou `200` e `/admin/insights` retornou `200`. Apos push do commit `587af96`, o auto-deploy da Vercel passou a servir `https://entreggo.vercel.app/favicon.ico` com `200` e `/admin/insights` continuou retornando `200`.

## 2026-05-15 - NAV ADMIN CONSOLIDADO (ADR-006)

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O ImpactValidator confirmou duplicacao funcional entre as 5 abas admin: `Dashboard` (sem filtro) era identica a `Usuarios` e `Aprovacoes` era `Usuarios?status=pendente`. As duas entradas foram removidas do `navConfig.admin`, `/admin/page.tsx` e `/admin/aprovacoes/page.tsx` viraram redirects server-side (`/admin/usuarios` e `/admin/usuarios?status=pendente`), e `AdminUsersPanel` ganhou leitura de `?status` via `useSearchParams` e um chip pulsante de pendentes no topo do painel ("X cadastros pendentes - Ver agora") com contagem real obtida por uma chamada lateral `listAdminUsers({ status: 'pendente', limit: 1 })`. `LoginForm.getDestination`, `ApprovalStatus` e `roleHome` foram atualizados para apontar admin a `/admin/usuarios`. Sidebar e bottom-nav passaram a refletir os 4 itens canonicos: Usuarios, Lojas, Motoboys, Insights.
**Arquivos modificados:** `src/components/shell/ShellNavConfig.ts`, `src/components/admin/AdminUsersPanel.tsx`, `src/app/admin/page.tsx`, `src/app/admin/aprovacoes/page.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/auth/ApprovalStatus.tsx`, `STATUS.md`, `LOG.md`, `DECISIONS.md`
**Agentes utilizados:** Camisa10, ImpactValidator, Documentador
**Status:** fechado localmente

**Validacoes:** `npm run typecheck` e `npm run build` passaram. Build gera 24 rotas; `/admin` e `/admin/aprovacoes` agora exportam como 140 B (apenas redirect), e `/admin/usuarios` continua como a pagina canonica. Nenhum endpoint backend novo foi tocado; o chip de pendentes reaproveita `GET /api/admin/users?status=pendente&limit=1` ja existente.

## 2026-05-15 - MIGRACAO NEXT 15 VALIDADA E FECHADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O ciclo pendente foi fechado sem feature nova. O frontend foi validado em Next.js `15.5.18`, `eslint-config-next@15.5.18`, React `19.2.6` e React DOM `19.2.6`; o `package-lock.json` passou a refletir a arvore do Next 15/React 19 e o `next-env.d.ts` foi atualizado automaticamente pelo build do Next 15 com a referencia gerada de rotas. A consolidacao admin feita no ciclo anterior foi mantida sem reverter mudancas do Claude.
**Arquivos modificados:** `package.json`, `package-lock.json`, `next-env.d.ts`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`, `DECISIONS.md`, `README.md`, `CONTRACTS.md`
**Agentes utilizados:** Camisa10, PromptRefiner, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente com ressalva de auditoria moderada residual

**Validacoes:** `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram. `npm run lint` avisou que `next lint` esta deprecado e sera removido no Next 16. `npm audit --json` falhou com 2 vulnerabilidades moderadas: `next` via `postcss` interno `8.4.31`; sem vulnerabilidades altas ou criticas. Smoke local em `http://127.0.0.1:3015` retornou `200` para `/`, `/login`, `/registro`, `/aguardando-aprovacao`, `/admin/insights`, `/admin/usuarios`, `/admin/lojas` e `/admin/motoboys`; `/admin` retornou `307 -> /admin/usuarios` e `/admin/aprovacoes` retornou `307 -> /admin/usuarios?status=pendente`.

## 2026-05-15 - AUDITORIA DE PADRONIZACAO (CAMISA10 + DESIGN AGENT)

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Camisa10 acionou o Design Agent + ImpactGuard em modo read-only para auditar padronizacao de layout das 24 rotas + 50 componentes. Resultado: padronizacao alta (todas as telas internas usam `PageHeader`, 0 cores hardcoded em codigo vivo, primitives `Button`/`Field`/`Input`/`Alert`/`Badge`/`Card` consistentes, drawer/modal pattern unificado, motion controlado em transform/opacity, reduced-motion respeitado). Achados pontuais corrigidos: (a) acentuacao PT-BR ausente em `ComingSoonPanel` (afetava 4 rotas placeholder: `/admin/insights`, `/admin/pagamentos`, `/admin/entregas`, `/admin/configuracoes` — corrigido: "Em preparacao" -> "Em preparação", "Area reservada" -> "Área reservada", "Esta pagina ja esta..." -> "Esta página já está..."); (b) acentuacao na pagina `/admin/insights` (labels "Usuarios" -> "Usuários", "Usuarios por perfil e status" -> "Usuários...", "Ultimos cadastros pendentes" -> "Últimos...", "horario da API" -> "horário da API", empty state e erro padrao); (c) mensagens de erro padrao em `src/lib/api.ts` ("Nao foi possivel concluir a requisicao" -> "Não foi possível concluir a requisição") e `src/components/admin/AdminUsersPanel.tsx` ("Nao foi possivel carregar o perfil expandido." -> "Não foi possível..."); (d) remocao de dois arquivos orfaos: `src/components/shared/PlaceholderPage.tsx` (substituido pelo `ComingSoonPanel`, era o unico com hex hardcoded `bg-[#fffaf4]` e `text-gray-600` fora dos tokens) e `src/components/motoboy/MotoboyHome.tsx` (substituido por `CourierHomeFlow` em F6). Itens deixados para ciclo futuro (Baixa prioridade): criar `Select` primitive em `components/ui/Field.tsx` para os 2 selects nativos do `AdminUsersPanel` e usar `Input type="search"` no `ShellTopbar` em vez do `<input>` cru.
**Arquivos modificados:** `src/components/shared/ComingSoonPanel.tsx`, `src/app/admin/insights/page.tsx`, `src/lib/api.ts`, `src/components/admin/AdminUsersPanel.tsx`, `STATUS.md`, `LOG.md`
**Arquivos removidos:** `src/components/shared/PlaceholderPage.tsx`, `src/components/motoboy/MotoboyHome.tsx`
**Agentes utilizados:** Camisa10, Design Agent, ImpactGuard, Documentador
**Status:** fechado localmente

**Validacoes:** `npm run typecheck` e `npm run build` passaram. Build mantem 24 rotas estaticas; nenhum endpoint backend tocado, nenhum contrato de componente alterado, nenhum handler ou validacao removida. PlaceholderPage e MotoboyHome confirmados como nao-importados antes da exclusao via grep do projeto inteiro.

## 2026-05-15 - CONFORMIDADE POS-LAYOUT SEM FEATURE NOVA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Foi feita correcao cirurgica de copy/estado/documentacao para impedir que o layout finalizado prometa push real, realtime, aceite concorrente, envio real de entrega ou historico real antes dos contratos backend. Landing, loja e motoboy agora tratam os fluxos de entrega como previa, demonstracao ou recurso planejado. `design.md` deixou de tratar `OperationalShell` como futuro, removeu a referencia ao `PlaceholderPage` e registrou `ComingSoonPanel`, `NovaEntregaFlow` e `CourierHomeFlow` conforme o estado real. `CONTRACTS.md` passou a explicitar que entrega loja/motoboy ainda nao chama endpoints de entrega, push, realtime, aceite concorrente ou historico real.
**Arquivos modificados:** `src/components/landing/*`, `src/components/auth/AuthShell.tsx`, `src/components/loja/*`, `src/components/motoboy/*`, `design.md`, `CONTRACTS.md`, `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, Design Agent, ImpactValidator, TestEngineer, Documentador
**Status:** fechado localmente, sem mudanca de dependencia, backend, API, auth, rotas ou schema

**Validacoes:** `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram. Smoke local em `http://127.0.0.1:3101` retornou `200` para `/`, `/login`, `/registro`, `/aguardando-aprovacao`, `/admin/insights`, `/admin/usuarios`, `/admin/lojas`, `/admin/motoboys`, `/loja` e `/motoboy`; `/admin` e `/admin/aprovacoes` seguiram redirecionando para `/admin/usuarios`. `npm audit --json` permanece com 2 vulnerabilidades moderadas conhecidas (`next` via `postcss` interno), sem altas ou criticas.

## 2026-05-15 - LANDING SIMPLIFICADA (DESIGN AGENT)

**Fase:** fundacao/design
**O que aconteceu:** PromptRefiner gerou prompt cirurgico (`tipo: implementacao`, agente: Design Agent, gate: Camisa10 + ImpactValidator read-only) para simplificar a landing `/` de acordo com pedido do usuario: tirar leilao, admin, timer, central, mensalidade; reduzir informacao; trocar mockups tecnicos por imagens reais; aumentar a logo. Defaults aprovados via AskUserQuestion + retorno do prompt completo. O Design Agent executou em 11 edicoes:

- `HeroMockup.tsx`: removeu `CountdownRing`, `RouteLine`, `<Badge tone="brand" pulsing>demo</Badge>` e os dois floating cards ("Previa criada" / "Aceite concorrente planejado · Sem leilao"). Virou um `<Image>` `aspect-[4/3]` apontando para `/landing/hero.webp` com placeholder `/brand/entreggo-logo-transparent.png` ate o asset chegar. Mantem moldura `rounded-2xl` com `shadow-pop` e glows laterais para sensacao visual.
- `Hero.tsx`: H1 reescrito para "Pedidos saindo da sua loja em minutos." (era "Pedido sai. Motoboy assume. Cliente recebe."). Removidos o eyebrow "Central de entregas sob demanda" (virou "EntregGO para sua cidade"), os 3 trust points (`Aprovacao manual`, `Sem mensalidade automatica`, `PWA pra celular`) e os 3 stats (`60s`, `1 toque`, `0 leilao`). CTA `Sou motoboy` renomeado para `Quero ser motoboy`. Marca-d'agua reforcada (largura 1200->1320px, opacidade 0.04->0.07). Imports `CheckCircle2` e `Clock3` removidos.
- `RouteSteps.tsx`: reduzido de 3 para 2 passos. Eyebrow "Rota do sistema" -> "Como funciona". H2 "Tres papeis, um fluxo..." -> "Dois passos. Sem complicacao.". Removido completamente o cartao "Admin governa". Grid passou de `lg:grid-cols-3` para `lg:grid-cols-2`. Linha pontilhada SVG ajustada (x1=200, x2=1000). Import `ShieldCheck` removido.
- `StorePitch.tsx`: mockup `BoxMark` + "previa da loja" trocado por `<Image>` `aspect-[4/5]` para `/landing/loja.webp`. Features `Timer de 60 segundos` e `Relacao direta com a central` removidas, substituidas por "Vários motoboys conectados" e "Acompanhe cada entrega". Imports `BoxMark`, `Clock3` e `Wallet` removidos.
- `CourierPitch.tsx`: mockup interativo do painel motoboy (avatar Bike, botao Power "Online · Previa de corridas", card "Solicitacao demo" com botoes Recusar/Aceitar) trocado por `<Image>` `aspect-[4/5]` para `/landing/motoboy.webp`. Benefits "primeiro toque vence" e "disputa real" removidos, substituidos por "Avisos no seu celular", "Voce decide quando aparecer" e "Aceite e siga". Imports `Badge`, `Bell` ainda usado, `Power` removido.
- `TrustSeals.tsx`: 4 selos tecnicos (RLS, Web Push, PWA, signed URLs) reduzidos a 3 selos voltados ao usuario ("Cadastro com aprovacao", "Funciona no celular", "Sem instalacao"). H2 reescrito para "Simples de comecar, simples de usar.". Removidos imports `Bell`, `Lock`.
- `FAQ.tsx`: 6 perguntas reduzidas a 4. Removidas perguntas sobre cobranca automatica/central, Web Push real, recepcao de solicitacoes com push/realtime, timer de 60 segundos. Mantidas (reescritas): "Tem custo pra usar?", "Funciona no celular?", "Como comeco?", "Posso me cadastrar como loja e motoboy ao mesmo tempo?".
- `CTABand.tsx`: removido o segundo CTA "Falar com a central" (mailto) e o import `MessageCircle`. Copy reescrito ("Comece em poucos minutos.") sem mencao a "pedido real e aceite entram depois, em ciclo validado". Logo de fundo aumentada (520->560px, opacidade 0.10->0.12).
- `BrandHeader.tsx`: logo aumentada de `h-9 sm:h-10` para `h-11 sm:h-12`, sem ultrapassar a altura de 64px do header.
- `SiteFooter.tsx`: logo aumentada de `h-11` para `h-12 sm:h-14`. Tagline e copyright reescritos sem "controle de central"; passou a "Sua loja conectada a motoboys da regiao..." + "© EntregGO · Pedidos saindo da sua loja em minutos.".
- `public/landing/.gitkeep`: pasta criada para receber `hero.webp`, `loja.webp` e `motoboy.webp` quando estiverem prontas.

`src/app/page.tsx` nao precisou mudar — os 9 imports continuaram validos e a ordem foi preservada.

**Arquivos modificados:** `src/components/landing/Hero.tsx`, `src/components/landing/HeroMockup.tsx`, `src/components/landing/RouteSteps.tsx`, `src/components/landing/StorePitch.tsx`, `src/components/landing/CourierPitch.tsx`, `src/components/landing/TrustSeals.tsx`, `src/components/landing/FAQ.tsx`, `src/components/landing/CTABand.tsx`, `src/components/landing/BrandHeader.tsx`, `src/components/landing/SiteFooter.tsx`, `STATUS.md`, `LOG.md`
**Arquivos criados:** `public/landing/.gitkeep`
**Agentes utilizados:** PromptRefiner v2, Camisa10, Design Agent, ImpactValidator (read-only), Documentador
**Status:** fechado localmente, pendente troca dos `src` para `.webp` quando o operador subir os 3 assets reais

**Validacoes:** `npm run typecheck` ✓, `npm run lint` ✓ (zero warnings; aviso esperado de `next lint` deprecado no Next 15), `npm run build` ✓ (24 rotas estaticas, `/` em 3.64 kB — queda de 4.71 kB para 3.64 kB porque o `HeroMockup` deixou de carregar `CountdownRing` e os mockups interativos sairam). Grep final `rg -i "leilao|admin governa|primeiro aceite|primeiro toque|timer de 60|relacao direta|mensalidade|central"` em `src/components/landing` retornou 0 ocorrencias em texto visivel — unicas matches sao comentarios `// DESIGN AGENT:` documentando o que foi removido. Nenhum handler, rota, contrato, primitive ou validacao foi tocado. Os 3 CTAs (`/registro?papel=loja`, `/registro?papel=motoboy`, `/registro`) continuam funcionais; `RegisterForm` segue lendo `?papel` via `useSearchParams`. `aria-label`, `aria-hidden`, `focus-visible` e `prefers-reduced-motion` preservados. ImpactValidator (read-only) confirmou zero quebra cross-stack: landing e estatica, sem API/banco/auth.

## 2026-05-15 - M-04B FRONTEND CRIACAO DE ENTREGA PELA LOJA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A tela `/loja/nova-entrega` deixou de simular envio e passou a consumir o contrato real `POST /api/deliveries` com Bearer token da sessao Supabase/Auth. `OperationalShell` entrega o `accessToken` ao fluxo, `src/lib/api.ts` ganhou client tipado `createDeliveryRequest`, e o formulario envia payload explicito contendo apenas `destinationAddress` e `notes`, sem `store_id` ou campos de status/loja. A UI mostra loading, sucesso honesto com status `aguardando`, erros estaveis de validacao/permissao/sessao e bloqueia duplo envio enquanto a requisicao esta em andamento. O sucesso nao aciona countdown, cancelamento, aceite, push, realtime, cron ou historico.
**Arquivos criados:** `src/types/delivery.ts`
**Arquivos modificados:** `src/lib/api.ts`, `src/app/loja/nova-entrega/page.tsx`, `src/components/loja/NovaEntregaFlow.tsx`, `src/components/loja/NovaEntregaForm.tsx`, `src/components/loja/LojaHome.tsx`, `src/components/loja/delivery-types.ts`, `src/components/loja/SearchingState.tsx`, `CONTRACTS.md`, `README.md`, `STATUS.md`, `LEARNINGS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** validado localmente em ambiente controlado com usuarios ficticios e limpeza automatica

**Validacoes:** `npm run typecheck`, `npm run lint`, `npm test --if-present` e `npm run build` passaram novamente apos os ajustes de validacao. `npm test --if-present` nao executou suite porque o frontend ainda nao possui script `test`. Build gerou 24 rotas e `/loja/nova-entrega` ficou em 5.3 kB. Varredura confirmou ausencia de `destinationDetails`, ausencia de `supabase.from`, ausencia de `console.log`, ausencia de acesso Supabase direto a `delivery_requests` e ocorrencias de `store_id` apenas no tipo/resposta/documentacao, nao no payload enviado. Smoke autenticado controlado com Playwright, API local e usuarios ficticios aprovou: deslogado sem formulario, logista pendente/bloqueado sem formulario e sem `POST /api/deliveries`, motoboy sem acesso a criacao, erro `VALIDATION_ERROR` legivel, logista ativo criando uma entrega com exatamente 1 request `POST /api/deliveries`, Bearer presente e payload observado contendo somente `destinationAddress,notes`. A limpeza automatica removeu entrega, perfis e usuarios ficticios. O sucesso exibiu status `aguardando` e texto explicito de que historico, push/notificacao, realtime, aceite concorrente, cancelamento e expiracao automatica seguem bloqueados. Backend nao foi alterado; smoke Auth/RLS backend existente tambem passou em ambiente controlado. Durante a validacao, `next dev` falhou ao compilar a rota por `require` em `tailwind.config.ts` em contexto ESM; por isso o smoke de navegador foi executado com `next build` + `next start`, e a build normal do projeto foi refeita ao final.

**Commit:** `8ed1838` — `feat(loja): M-04B criação de entrega via POST /api/deliveries` (13 arquivos: 12 modificados + `src/types/delivery.ts` novo). Stage seletivo por nome explicito; nenhum `git add -A`.

## 2026-05-15 - M-04C FRONTEND DESTINO OPCIONAL

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A tela `/loja/nova-entrega` foi ajustada ao novo contrato backend de criacao de entrega com `destinationAddress` opcional. O formulario removeu a obrigatoriedade visual e o bloqueio de submit por endereco vazio, monta payload minimo sem strings vazias e permite `{}` quando nenhum campo util foi preenchido. A copy de `VALIDATION_ERROR` ficou neutra, sem afirmar que destino e obrigatorio. O sucesso continua exibindo `aguardando` e a tela segue sem liberar aceite, realtime, push, cron, historico, cancelamento ou expiracao.
**Arquivos criados:** nenhum
**Arquivos modificados:** `src/types/delivery.ts`, `src/components/loja/delivery-types.ts`, `src/components/loja/NovaEntregaForm.tsx`, `src/components/loja/NovaEntregaFlow.tsx`, `src/components/loja/ExpiredState.tsx`, `src/components/loja/SearchingState.tsx`, `src/components/loja/LojaHome.tsx`, `CONTRACTS.md`, `README.md`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`
**Arquivos fora de escopo preservados:** `src/components/auth/ApprovalStatus.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/landing/SiteFooter.tsx`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente com ressalva operacional: smoke autenticado real depende da migration M-04C aplicada no Supabase alvo

**Validacoes:** `npm run typecheck`, `npm run lint`, `npm run build`, `npm test --if-present` e `git diff --check` passaram. `npm test --if-present` nao executou suite porque nao ha script `test`. A varredura dos arquivos frontend alterados confirmou ausencia de `supabase.from`, `console.log` e acesso direto a `delivery_requests`; `store_id`, `status` e `courier_id` aparecem apenas nos tipos/resposta ou exibicao do retorno backend, nao no payload enviado. Smoke controlado de navegador nao foi executado neste ciclo porque a migration M-04C ainda precisa ser aplicada no banco alvo antes de criar entrega real sem endereco.

## 2026-05-15 - M-04C POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A M-04C foi validada em producao contra frontend `https://entreggo.vercel.app` no commit `d304339` e backend `https://entreggoback.vercel.app` no commit `d70e45e`. Os dois repositorios estavam limpos, em `main`, com upstream `origin/main` e `HEAD...origin/main` em `0 0`. O smoke publico confirmou que `POST /api/deliveries` sem token retorna `401 AUTH_REQUIRED`, que `/loja/nova-entrega` retorna `200` e que o bundle publicado da rota contem o marcador funcional de payload minimo incremental sem strings vazias. O smoke autenticado usou env local seguro e recursos ficticios temporarios, sem imprimir token/header/cookie, criou entrega como `logista` ativo com payload `{}` e limpou os recursos no `finally`.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, TestEngineer, FinalValidator, Documentador
**Status:** fechado em producao

**Validacoes:** Smoke autenticado de producao retornou `201`, `success=true`, `destination_address=null`, `status=aguardando`, `courier_id=null` e `store_id` derivado da sessao. O payload enviado nao continha string vazia, `store_id`, `status` nem `courier_id`; as chaves enviadas foram `[]`. Cleanup retornou `completed`. Nenhum SQL adicional foi executado. Nenhum secret, token, cookie ou header sensivel foi impresso.

## 2026-05-15 - M-05 FRONTEND HISTORICO REAL DA LOJA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A tela `/loja/historico` deixou de usar o mock `sampleHistory` e passou a consumir `GET /api/deliveries`. Foi criado o client `listMyDeliveries(accessToken, query)` em `src/lib/api.ts`, os tipos `StoreDeliveryListItem`/`StoreDeliveryListResult`/`ListMyDeliveriesQuery` em `src/types/delivery.ts` (status unificado com o contrato real `DeliveryRequestStatus`), e a pagina passou a usar o render-prop do `OperationalShell` para obter o Bearer token, igual a `/loja/nova-entrega`. O componente `HistoricoEntregas` foi reescrito com estados de loading, erro recuperavel (com "Tentar novamente" e mapeamento de codigos), vazio honesto e lista paginada real agrupada por dia, filtro por status do contrato (server-side via query) e paginacao Anterior/Proxima usando `pagination`. Os cards de metricas que fingiam agregado total foram removidos; o resumo agora e rotulado como "nesta pagina"/"no total" a partir do `pagination` real. O mock `sampleHistory`, o enum divergente de status e os helpers so usados pelo historico foram removidos de `src/components/loja/delivery-types.ts`, preservando `DeliveryFlowState`/`DeliveryDraft`/`AcceptedDelivery`/`DeliveryStatus` ainda usados pelos placeholders de aceite. Nenhum `supabase.from` e nenhuma leitura direta de `delivery_requests` foi adicionada. Aceite, realtime, push, cron, cancelamento, expiracao, detalhe unico, busca textual, filtro por data e dados de motoboy seguem fora de escopo.
**Arquivos criados:** nenhum
**Arquivos modificados:** `src/types/delivery.ts`, `src/lib/api.ts`, `src/components/loja/delivery-types.ts`, `src/components/loja/HistoricoEntregas.tsx`, `src/app/loja/historico/page.tsx`, `CONTRACTS.md`, `README.md`, `STATUS.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente; smoke autenticado real e deploy pendentes

**Validacoes:** `npm run typecheck`, `npm run lint` (sem warnings/erros apos limpar deps de useMemo), `npm run build` (build estatico OK) e `git diff --check` passaram. `npm test --if-present` nao executou suite porque o frontend ainda nao tem testes. Nenhum acesso direto ao Supabase foi adicionado; toda leitura de dominio passa pela API backend.

## 2026-05-16 - M-05 POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A M-05 foi fechada em producao com backend `https://entreggoback.vercel.app` no commit `f30bfc7` e frontend `https://entreggo.vercel.app` no commit `6833695`. O smoke publico confirmou o backend publicado (`GET` e `POST /api/deliveries` sem token com `401 AUTH_REQUIRED`) e a rota `/loja/historico` com `200`. O smoke autenticado foi executado contra a URL de producao do backend usando dados ficticios temporarios e cleanup completo, validando o contrato consumido pela tela de historico sem expor token, cookie, header ou secret.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, TestEngineer, SecurityValidator, PerformanceValidator, FinalValidator, Documentador
**Status:** fechado em producao

**Validacoes:** Smoke autenticado de producao validou que logista ativo lista somente entregas da propria loja, entrega de outra loja nao aparece, filtro `status=aceita` funciona, paginacao `page=1&limit=1` funciona, `limit=51`, `status=invalido` e `store_id` desconhecido retornam `VALIDATION_ERROR`, resposta nao inclui `store_id` nem `courier_id`, ordem `created_at desc` foi preservada e pendente/motoboy/admin foram negados. Cleanup retornou `completed`. Nenhum SQL, migration, RLS, grant ou policy foi executado ou alterado. Nenhum secret, token, cookie ou header sensivel foi impresso.

## 2026-05-16 - DIAGNOSTICO NOME DA LOJA (ADMIN E MOTOBOY)

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Investigacao read-only da queixa do nome da loja. `src/components/admin/UserDetailDrawer.tsx:355` ja renderiza `Nome da loja` via `profile.name`, alimentado por `GET /api/admin/users/:id`. A listagem `src/components/admin/AdminUsersPanel.tsx` nao tem coluna de loja e o contrato `GET /api/admin/users` so traz `DomainUser`. `src/components/motoboy/CorridaAtiva.tsx:94,107` usa `ride.store.name` vindo de mock (`src/components/motoboy/courier-types.ts`); nao existe contrato backend de loja para o motoboy. Nenhum codigo foi alterado.
**Decisao de escopo:** Admin = correcao cirurgica em ciclo proprio (causa provavel: contrato de listagem nao traz o nome), com ImpactValidator + PerformanceValidator e sem N+1. Motoboy = backlog para o ciclo de aceite com SecurityValidator (PII/contrato entre atores). Sem SQL, migration ou RLS.
**Agentes utilizados:** Camisa10, ImpactValidator (planejado), Documentador
**Status:** diagnostico registrado; sem codigo

## 2026-05-16 - CIRURGICO ADMIN: COLUNA LOJA NA LISTAGEM

**Fase:** fundacao/auth-operacao
**O que aconteceu:** `AdminUsersPanel` passou a exibir a coluna `Loja` consumindo `store_name` do contrato estendido `GET /api/admin/users` (novo tipo `AdminUserListItem = DomainUser + store_name: string | null` em `src/types/auth.ts`). A celula mostra `store_name` ou `—` quando `null` (`admin`/`motoboy`). Nao ha chamada ao detalhe por linha (sem N+1), nenhum `supabase.from`, nenhum campo de Storage/PII novo. O backend resolveu o campo via embed 1:1 do PostgREST na mesma query (ciclo backend correspondente no LOG do repo `EntregGO-Back`). Motoboy permanece backlog.
**Arquivos modificados:** `src/types/auth.ts`, `src/components/admin/AdminUsersPanel.tsx`, `CONTRACTS.md`, `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, ImpactValidator, PerformanceValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente; deploy pendente

**Validacoes:** `npm run typecheck`, `npm run lint` (sem warnings), `npm run build` (rotas admin geradas), `npm test --if-present` (sem suite no frontend) e `git diff --check` passaram. Tipo base `DomainUser` preservado; `AdminUserListItem` isola o campo so na listagem. Nenhum secret/token/header exposto.

## 2026-05-16 - CIRURGICO ADMIN POS-DEPLOY

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Frontend publicado (`6833695..506c740`) apos o backend (`f30bfc7..946d84d`), ambos `0 0` com `origin/main`. Smoke publico confirmou `/admin/usuarios` `200` e o bundle publicado contendo o codigo M-cirurgico.
**Agentes utilizados:** Camisa10, TestEngineer, FinalValidator, Documentador
**Status:** fechado em producao com ressalva de smoke autenticado

**Validacoes:** `/admin/usuarios` -> `200`; o chunk compartilhado publicado `87-*.js` contem `store_name`, a coluna `Loja` e `api/admin/users`, confirmando o deploy. Backend `GET /api/admin/users` sem token -> `401 AUTH_REQUIRED` e `GET /api/health` -> `200`. A verificacao autenticada da coluna preenchida por sessao admin real depende do gate de credencial da M-05 e nao foi executada para nao expor secret/token/header. Sem `supabase.from`, sem SQL/migration/RLS. Motoboy segue backlog do ciclo de aceite com SecurityValidator.

## 2026-05-16 - FATIA 1 ACEITE MOTOBOY DOCUMENTADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O frontend foi atualizado apenas como contrato/documentacao para a Fatia 1 do aceite do motoboy. `CONTRACTS.md` passou a registrar `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept`, os erros esperados, a regra de PII do motoboy (`store.name` e `store.address` permitidos; nunca `destination_address`, `notes`, `store_id`, `owner_name`, `logo_url`, `description`) e o que continua fora. `DECISIONS.md` recebeu ADR propria para documentar que `CorridaAtiva.tsx` permanece mock e nenhum client, tipo runtime, rota ou UI real foi ligado nesta fatia.
**Arquivos modificados:** `CONTRACTS.md`, `STATUS.md`, `LOG.md`, `DECISIONS.md`, `LEARNINGS.md`
**Arquivos de UI preservados:** `src/components/motoboy/CorridaAtiva.tsx`, `src/lib/api.ts`, `src/types/delivery.ts`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, PerformanceValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente como documentacao frontend; backend implementado no repo `EntregGO-Back`

**Gates:** ImpactValidator aprovado (front sem runtime novo, contrato cross-stack documentado); SecurityValidator aprovado (nenhum secret, nenhum Supabase direto, PII proibida explicitada); PerformanceValidator aprovado (sem UI/lista/polling/realtime no frontend nesta fatia; riscos de lista/concorrencia tratados no backend).

**Validacoes:** Frontend `npm run typecheck`, `npm run lint`, `npm run build` e `npm test --if-present` passaram. Backend `npm run typecheck`, `npm test` (65), `npm run lint` e `npm run build` passaram no ciclo correspondente. `git diff --check` passou nos dois repositorios. Nenhum SQL, migration, RLS, grant ou policy foi criado, executado ou alterado. Nenhum secret, token, cookie ou header sensivel foi impresso.

**Fora do escopo:** UI real do motoboy para fila/aceite, realtime, push/Web Push/VAPID, cron/expiracao automatica, cancelamento, transicoes pos-aceite, pagamentos, Storage, historico admin e historico do motoboy.

## 2026-05-16 - FATIA 1 UI REAL DO MOTOBOY (DESCOBERTA + ACEITE)

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementada a primeira UI real do motoboy. `/motoboy` sem query passou a renderizar `FilaDisponivel`, que consome `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept` via Bearer token do `OperationalShell`. `CourierHomeFlow` virou seletor: sem query usa a UI real; com `?demo=ativo`/`?demo=solicitacao` usa o fluxo mock isolado (`CourierDemoFlow`, antigo corpo, com `CorridaAtiva`/`SolicitacaoCard`/`PushPrimeSheet`). A fila tem loading, erro recuperavel mapeado, vazio honesto, paginacao real (limit 20), botao "Atualizar" manual (sem polling/`setInterval`), aceite com lock anti duplo-clique, tratamento de `ALREADY_ACCEPTED`/`DELIVERY_EXPIRED`/`DELIVERY_NOT_FOUND` (remove item + recarrega) e confirmacao estatica pos-aceite sem navegar para corrida. Introduzida a primeira suite de testes do frontend (Vitest + Testing Library + jsdom) com 25 testes.
**Arquivos criados:** `src/components/motoboy/FilaDisponivel.tsx`, `src/components/motoboy/__tests__/FilaDisponivel.test.tsx`, `src/components/motoboy/__tests__/mapCourierError.test.ts`, `src/lib/__tests__/api.deliveries.test.ts`, `vitest.config.ts`, `vitest.setup.ts`, `vitest-env.d.ts`
**Arquivos modificados:** `src/types/delivery.ts`, `src/lib/api.ts`, `src/components/motoboy/CourierHomeFlow.tsx`, `src/app/motoboy/page.tsx`, `package.json`, `package-lock.json`, `CONTRACTS.md`, `STATUS.md`, `DECISIONS.md`, `LOG.md`, `LEARNINGS.md`
**Arquivos de mock preservados:** `src/components/motoboy/CorridaAtiva.tsx`, `src/components/motoboy/courier-types.ts`, `src/components/motoboy/SolicitacaoCard.tsx`, `src/components/motoboy/PushPrimeSheet.tsx`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, PerformanceValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente; deploy e smoke autenticado pendentes

**Gates (aprovados antes de codar):** ImpactValidator aprovado (mudancas em `delivery.ts`/`api.ts` aditivas, sem regressao nas telas/contratos da loja, sem backend novo). SecurityValidator aprovado (somente REST com Bearer do fluxo existente, sem `supabase.from`, sem secret em codigo/log, PII restrita a `store.name`/`store.address`, `courier_id` nao exibido). PerformanceValidator aprovado (lista paginada limit 20, sem polling/`setInterval` no caminho real, payload curto, sem N+1; aceite e chamada unica).

**Validacoes:** `npm run typecheck` ✓, `npm run lint` ✓ (sem warnings; aviso esperado de `next lint` deprecado), `npm run build` ✓ (24 rotas estaticas, `/motoboy` 10.8 kB), `npm test` ✓ (25/25 em 3 arquivos), `git diff --check` ✓ (apenas avisos LF/CRLF, sem erro de whitespace). Nenhum SQL/migration/RLS/grant/policy criado ou alterado. Nenhum secret, token, cookie ou header sensivel impresso. Backend nao foi alterado.

**Fora do escopo:** transicoes pos-aceite (`coletada`/`em_transito`/`entregue`), realtime, push/Web Push/VAPID, cron/expiracao automatica, cancelamento, online/offline operacional, pagamentos, Storage, historico admin e historico do motoboy.

## 2026-05-16 - FATIA 1 MOTOBOY POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** A UI real do motoboy foi validada em producao contra frontend `https://entreggo.vercel.app` no commit `7db7fad` e backend `https://entreggoback.vercel.app` no commit `f5ab8d8`. O primeiro smoke publico havia mostrado backend stale (`404` nos endpoints); depois do deploy backend, o smoke publico passou e o smoke autenticado foi executado com usuarios/perfis/entregas ficticios temporarios e cleanup em `finally`, sem imprimir token, cookie, header ou secret.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, TestEngineer, SecurityValidator, PerformanceValidator, FinalValidator, Documentador
**Status:** fechado em producao

**Validacoes:** Smoke publico confirmou `GET /api/deliveries/available` sem token -> `401 AUTH_REQUIRED`, `POST /api/deliveries/:id/accept` sem token -> `401 AUTH_REQUIRED`, `/motoboy` -> `200` e bundle publicado contendo `/api/deliveries/available`. Smoke autenticado confirmou listagem sem `destination_address`, `notes`, `store_id` ou `courier_id`, expondo somente `store.name` e `store.address` como dados da loja; aceite concorrente com um sucesso e um `ALREADY_ACCEPTED`; aceite expirado com `DELIVERY_EXPIRED`; resposta pos-aceite estatica em `status=aceita`, sem transicao para corrida; negacoes para motoboy offline, pendente, bloqueado e role errado. Cleanup retornou `completed`. Nenhum SQL, migration, RLS, grant ou policy foi executado ou alterado.

**Fora do escopo preservado:** transicoes pos-aceite (`coletada`/`em_transito`/`entregue`), realtime, push/Web Push/VAPID, cron/expiracao automatica, cancelamento, online/offline operacional, pagamentos, Storage, historico admin e historico do motoboy.

## 2026-05-16 - FATIA 2 UI REAL POS-ACEITE DO MOTOBOY

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementada a UI real de corrida aceita somente leitura. `MotoboyRealFlow` consulta `GET /api/deliveries/active` antes de abrir a fila; se o backend retorna `data: null`, renderiza `FilaDisponivel`; se retorna uma corrida `aceita`, renderiza `CorridaAtivaReal` com loja/coleta, destino e observacao. `FilaDisponivel` ganhou `onAccepted` opcional para, no caminho real, recarregar a corrida ativa apos o aceite. `CorridaAtiva.tsx` e o demo por `?demo=ativo`/`?demo=solicitacao` permanecem isolados.
**Arquivos criados:** `src/components/motoboy/CorridaAtivaReal.tsx`, `src/components/motoboy/MotoboyRealFlow.tsx`, `src/components/motoboy/__tests__/MotoboyRealFlow.test.tsx`, `src/components/motoboy/__tests__/CourierHomeFlow.test.tsx`
**Arquivos modificados:** `src/types/delivery.ts`, `src/lib/api.ts`, `src/components/motoboy/FilaDisponivel.tsx`, `src/components/motoboy/CourierHomeFlow.tsx`, `src/lib/__tests__/api.deliveries.test.ts`, `CONTRACTS.md`, `STATUS.md`, `DECISIONS.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, PerformanceValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado localmente; deploy/smoke autenticado real pendentes

**Gates pre-codigo:** ImpactValidator aprovado (fluxo aditivo, sem quebrar demo nem Fatia 1); SecurityValidator aprovado (sem Supabase direto, Bearer existente, PII pos-aceite somente via `/active`); PerformanceValidator aprovado (uma chamada inicial e uma pos-aceite, sem polling/`setInterval`, sem listas novas).

**Validacoes parciais durante implementacao:** Frontend `npm run typecheck` passou; `npm test` passou com 5 arquivos e 31 testes. Nenhum secret, token, cookie ou header sensivel foi impresso.

**Fora do escopo:** transicoes pos-aceite (`coletada`/`em_transito`/`entregue`), cancelamento, realtime, push/Web Push/VAPID, cron/expiracao automatica, online/offline operacional, historico do motoboy, historico admin, pagamentos e Storage.

## 2026-05-16 - FATIA 2 MOTOBOY POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Frontend publicado em producao no commit `53a8e72` apos o backend `af4d0df`. `/motoboy` foi validado contra `https://entreggo.vercel.app` e o endpoint `GET /api/deliveries/active` contra `https://entreggoback.vercel.app`. O smoke autenticado usou usuarios/perfis/entregas ficticios temporarios com cleanup em `finally`, sem imprimir token, cookie, header Authorization ou secret.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, PerformanceValidator, TestEngineer, FinalValidator, Documentador
**Status:** fechado em producao

**Validacoes locais antes dos commits:** Frontend `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` (5 arquivos, 31 testes) e `git diff --check` passaram. Backend `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` (6 arquivos, 73 testes) e `git diff --check` passaram. O frontend tambem foi aberto localmente em `/motoboy`; sem sessao, exibiu o estado esperado de sessao ausente.

**Validacoes pos-deploy:** Smoke publico confirmou `/motoboy` -> `200`, bundle publicado contendo `/api/deliveries/active` e `GET /api/deliveries/active` sem token -> `401 AUTH_REQUIRED`. Smoke autenticado confirmou que o motoboy dono ve sua corrida `aceita` em modo somente leitura, outro motoboy recebe `data: null`, offline/pendente/bloqueado/role errado sao negados e a politica de PII foi preservada: pre-aceite somente `store.name`/`store.address`; pos-aceite `destination_address`/`notes` apenas para o courier atribuido. Cleanup retornou `completed`. Nenhum SQL, migration, RLS, grant ou policy foi executado ou alterado.

**Fora do escopo preservado:** transicoes pos-aceite (`coletada`/`em_transito`/`entregue`), cancelamento, realtime, push/Web Push/VAPID, cron/expiracao automatica, online/offline operacional, historico do motoboy, historico admin, pagamentos e Storage.

## 2026-05-16 - FATIA 3 UI REAL STATUS OPERACIONAL DO MOTOBOY

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementada localmente a UI real de online/offline. `MotoboyRealFlow` passou a consultar `GET /api/couriers/me/status` antes de chamar qualquer endpoint de entregas. Quando `is_online=false`, renderiza controle "Ficar online" e estado honesto sem chamar `/api/deliveries/active` nem `/api/deliveries/available`. Ao ficar online, chama `PATCH /api/couriers/me/status`, carrega corrida ativa e, se nao houver, a fila. Ao ficar offline, limpa corrida/fila/erros ativos e pausa carregamentos. O demo por `?demo=` permanece isolado.
**Arquivos modificados:** `src/types/auth.ts`, `src/lib/api.ts`, `src/lib/__tests__/api.deliveries.test.ts`, `src/components/motoboy/MotoboyRealFlow.tsx`, `src/components/motoboy/FilaDisponivel.tsx`, `src/components/motoboy/__tests__/MotoboyRealFlow.test.tsx`, `src/components/motoboy/__tests__/mapCourierError.test.ts`, `CONTRACTS.md`, `STATUS.md`, `DECISIONS.md`, `LOG.md`, `LEARNINGS.md`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, TestEngineer, Documentador
**Status:** fechado localmente; deploy/smoke de producao pendentes

**Gates:** ImpactValidator aprovado (mudanca aditiva, fluxo demo preservado, Fatias 1/2 consumidas sem quebrar contrato); SecurityValidator aprovado (sem Supabase direto, sem `courier_id`, Bearer token existente, resposta de status sem PII, sem logs sensiveis).

**Validacoes:** Frontend `npm run typecheck` passou. Frontend `npm test` passou com 5 arquivos e 36 testes. Nenhum secret, token, cookie ou header sensivel foi impresso.

**Fora do escopo:** geolocalizacao/GPS, disponibilidade por raio, historico de presenca, realtime, push/Web Push/VAPID, cron, transicoes pos-aceite, cancelamento, pagamentos, Storage e documentos.

## 2026-05-16 - FATIA 3 MOTOBOY POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Frontend publicado em producao no commit `3201d77` apos o backend `001a1c6`. `/motoboy` foi validado contra `https://entreggo.vercel.app` e o contrato de status contra `https://entreggoback.vercel.app`. O smoke autenticado usou usuarios/perfis/loja/entrega ficticios temporarios com cleanup em `finally`, sem imprimir token, cookie, header Authorization, service role ou secret.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Status:** fechado em producao

**Validacoes locais antes dos commits:** Frontend `npm run typecheck`, `npm test` (5 arquivos, 36 testes), `npm run lint`, `npm run build` e `git diff --check` passaram. Backend `npm run typecheck`, `npm test` (7 arquivos, 85 testes), `npm run lint`, `npm run build` e `git diff --check` passaram.

**Validacoes pos-deploy:** Smoke publico confirmou `/motoboy` -> `200`, bundle publicado contendo `/api/couriers/me/status`, `GET /api/couriers/me/status` sem token -> `401 AUTH_REQUIRED` e `PATCH /api/couriers/me/status` sem token -> `401 AUTH_REQUIRED`. Smoke autenticado confirmou motoboy ativo iniciando `is_online=false`, resposta de status somente `{ is_online, updated_at }`, `/api/deliveries/active` negado offline com `COURIER_OFFLINE`, `PATCH { isOnline: true }` retornando `is_online=true`, `/api/deliveries/active` online retornando a fixture aceita, `PATCH { isOnline: false }` retornando `is_online=false`, payloads com `courier_id`, `user_id`, `is_online` ou campo extra retornando `VALIDATION_ERROR`, role errada retornando `FORBIDDEN_ROLE`, pendente retornando `USER_PENDING` e bloqueado retornando `USER_BLOCKED`. No browser autenticado em producao, antes de clicar em "Ficar online", os recursos observados tinham `/api/couriers/me/status` e zero chamadas a `/api/deliveries/active` ou `/api/deliveries/available`; apos o clique, a UI exibiu "Corrida aceita" e chamou `/api/deliveries/active`. Cleanup retornou `completed`.

**Fora do escopo preservado:** SQL/migration/RLS/grants/policies, PII nova, Supabase direto no frontend, realtime, push/Web Push/VAPID, polling, cron, geolocalizacao/GPS, disponibilidade por raio, historico de presenca, transicoes pos-aceite, cancelamento, pagamentos, Storage e documentos.

## 2026-05-16 - FATIA 4A UI REAL TRANSICOES POS-ACEITE

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Implementada localmente a UI minima para transicoes pos-aceite no caminho real `/motoboy`. `src/lib/api.ts` ganhou `updateDeliveryStatus(accessToken, deliveryId, status)` consumindo `PATCH /api/deliveries/:id/status` com Bearer token e body `{ status }`. `ActiveDelivery` passou a aceitar `aceita|coletada|em_transito`. `CorridaAtivaReal` mostra a proxima acao por status, bloqueia duplo clique durante a requisicao e mantem "Atualizar" manual. `MotoboyRealFlow` atualiza a corrida em `coletada`/`em_transito` e remove a ativa quando o backend retorna `entregue`, voltando para a fila real.
**Arquivos modificados:** `src/lib/api.ts`, `src/types/delivery.ts`, `src/components/motoboy/MotoboyRealFlow.tsx`, `src/components/motoboy/CorridaAtivaReal.tsx`, `src/components/motoboy/FilaDisponivel.tsx`, `src/components/motoboy/__tests__/MotoboyRealFlow.test.tsx`, `src/lib/__tests__/api.deliveries.test.ts`, `CONTRACTS.md`, `STATUS.md`, `DECISIONS.md`, `LOG.md`
**Agentes utilizados:** Camisa10, ImpactValidator, SecurityValidator, PerformanceValidator, TestEngineer
**Status:** fechado localmente; deploy/smoke de producao pendentes

**Gates pre-codigo:** ImpactValidator/Cetico, SecurityValidator, PerformanceValidator e TestEngineer aprovaram a fatia com ressalvas de escopo, PII, sem polling/cache e cobertura de testes.

**Validacoes locais:** Frontend `npm run typecheck`, `npm test` (5 arquivos, 41 testes), `npm run lint`, `npm run build` e `git diff --check` passaram. Backend `npm run typecheck`, `npm test` (7 arquivos, 107 testes), `npm run lint`, `npm run build` e `git diff --check` passaram. Nenhum secret, token, cookie ou header sensivel foi impresso.

**Fora do escopo:** Supabase direto no frontend, realtime, push/Web Push/VAPID, polling, cron, cancelamento, historico do motoboy, historico admin, pagamentos, Storage/documentos, geolocalizacao/GPS e disponibilidade por raio.

## 2026-05-16 - FATIA 4A MOTOBOY POS-DEPLOY PRODUCAO APROVADA

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Frontend publicado em producao no commit `b9239dcce3ac25535990d148f8f2480df1bcb232` apos o backend `a84df437cb30b62c592454fe22b25b173fce9f83`. A UI real `/motoboy` foi validada contra `https://entreggo.vercel.app/motoboy` e o backend contra `https://entreggoback.vercel.app`. O smoke autenticado de UI usou Playwright em Chromium headless com usuarios/perfis/entrega ficticios temporarios e cleanup em `finally`, sem imprimir token, cookie, header Authorization, service role ou secret.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Status:** fechado em producao

**Validacoes pos-deploy:** Smoke publico confirmou `/motoboy` -> `200` e bundle publicado contendo `Confirmar coleta`, `Iniciar transito`, `Concluir entrega` e chamada `/status`. No backend, `GET /api/health` retornou `200`, `GET /api/deliveries/active` sem token retornou `401 AUTH_REQUIRED` e `PATCH /api/deliveries/:id/status` sem token retornou `401 AUTH_REQUIRED`. Smoke API autenticado confirmou transicoes, idempotencia, isolamento de outro courier, payload strict, sanitizacao e remocao de `entregue` do `/active`. Smoke UI autenticado confirmou login real como motoboy ficticio, corrida ativa com `Confirmar coleta`, avanco para `Iniciar transito`, avanco para `Concluir entrega`, conclusao com remocao da corrida ativa, timestamps `collected_at`, `in_transit_at` e `delivered_at` preenchidos no banco, ausencia de `store_id`, `courier_id`, `owner_name`, `logo_url`, documentos, Storage, token, header ou secret na UI, e rede sem polling (`GET /api/couriers/me/status` 1x, `GET /api/deliveries/active` 1x, `PATCH /api/deliveries/:id/status` 3x, `GET /api/deliveries/available` 1x). Cleanup retornou completo.

**Decisao de tooling:** Playwright fica como ferramenta oficial de smoke UI autenticado controlado. A instalacao adicionou `playwright` como `devDependency` e alterou `package.json`/`package-lock.json`; deve entrar em commit separado de tooling, sem misturar com codigo funcional da Fatia 4A. `npm audit --json` apos a instalacao reporta 7 vulnerabilidades moderadas, sem altas ou criticas, ligadas a `next`/`postcss` e `vitest`/`vite`; nao foi aplicado `npm audit fix --force`.

**Fora do escopo preservado:** Supabase direto no frontend, SQL/migration/RLS/grants/policies, realtime, push/Web Push/VAPID, polling, cron, cancelamento, historico do motoboy, historico admin, pagamentos, Storage/documentos, geolocalizacao/GPS e disponibilidade por raio.

## 2026-05-16 - AJUSTE UX MOTOBOY LOJA SOLICITANTE E ENDERECO AUSENTE

**Fase:** fundacao/auth-operacao
**O que aconteceu:** Ajuste frontend local no caminho real `/motoboy`: `FilaDisponivel` e `CorridaAtivaReal` agora rotulam o nome da loja como `Loja solicitante`; enderecos vazios, nulos ou whitespace deixam de renderizar linha de endereco, placeholder `Endereco nao informado`, alerta `Destino nao informado` e acao `Abrir no mapa`. A fila continua sem `destination_address`/`notes` antes do aceite, e a corrida ativa continua exibindo destino/notas somente pos-aceite para o courier atribuido.
**Arquivos criados:** nenhum
**Arquivos modificados:** `src/components/motoboy/FilaDisponivel.tsx`, `src/components/motoboy/CorridaAtivaReal.tsx`, `src/components/motoboy/__tests__/FilaDisponivel.test.tsx`, `src/components/motoboy/__tests__/MotoboyRealFlow.test.tsx`, `STATUS.md`, `LOG.md`
**Status:** fechado localmente; deploy/smoke pendentes

**Validacoes:** `npm run typecheck`, `npm test` (5 arquivos, 46 testes), `npm run lint`, `npm run build` e `git diff --check` passaram. `npm run lint` manteve apenas o aviso conhecido de deprecacao do `next lint`; `git diff --check` exibiu apenas avisos LF/CRLF do Windows. Nenhum secret, token, cookie ou header sensivel foi impresso.

**Impacto:** Contrato e PII preservados; nao houve backend, endpoint, tipo de API, SQL, migration, RLS, grant ou policy. O ajuste reduz ruido visual quando endereco nao existe e mantem o nome da loja solicitante como informacao principal.

**Fora do escopo preservado:** Supabase direto no frontend, realtime, push/Web Push/VAPID, polling, cron, GPS, Storage/documentos, cancelamento, historico do motoboy, historico admin e pagamentos.

## 2026-05-16 - AJUSTE UX MOTOBOY POS-DEPLOY PRODUCAO APROVADO

**Fase:** fundacao/auth-operacao
**O que aconteceu:** O ajuste UX do `/motoboy` foi validado em producao em `https://entreggo.vercel.app/motoboy`, com frontend publicado ate `ecc1e66734eebe72401ebf270ac4a3cf356bd3f1` e backend publicado ate `57a38723d749e39a578925e3da529695346af4dd`. A rota respondeu `200`; os assets publicados contem `Loja solicitante` e nao contem `Endereco nao informado` nem `Destino nao informado`.
**Arquivos criados:** nenhum
**Arquivos modificados:** `STATUS.md`, `LOG.md`
**Status:** fechado em producao

**Validacoes pos-deploy:** Smoke UI autenticado confirmou `Loja solicitante` na fila disponivel e na corrida ativa, pre-aceite sem destino/notas, destino ausente sem card `Entrega`, placeholder, alerta, mapa de destino ou botao `Abrir no mapa`, inclusive no cenario controlado com todos os enderecos ausentes. A UI nao expos `store_id`, `courier_id`, `owner_name`, `logo_url`, documentos, Storage, Authorization ou Bearer. Foram criados e limpos 2 auth users, 2 domain users, 1 store, 1 courier e 2 deliveries; cleanup completo, com `0` usuarios smoke restantes.

**Fora do escopo preservado:** backend funcional, contrato API novo, SQL, migration, RLS, grant, policy, realtime, push, polling, cron, GPS, Storage, cancelamento, historico e diretorios locais de agentes.
