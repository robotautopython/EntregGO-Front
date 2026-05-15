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
