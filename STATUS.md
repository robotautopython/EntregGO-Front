# STATUS - EntregGO Front

## Estado Atual

**Fase:** fundacao/auth-operacao
**Ultima atualizacao:** 2026-05-16
**Atualizado por:** Codex/Camisa10

## Em Andamento

- [ ] Manter abas de documentos, entregas, pagamento e notas como placeholders honestos ate existirem endpoints reais.
- [ ] Receber 3 imagens reais em `public/landing/` (hero.webp 4:3, loja.webp 4:5, motoboy.webp 4:5) e trocar os `src` em HeroMockup, StorePitch e CourierPitch. Hoje os 3 `<Image>` apontam para `public/brand/entreggo-logo-transparent.png` como placeholder neutro.

## Proximas Tarefas

- [ ] Expandir a suite de testes frontend conforme novos componentes ganharem comportamento.
- [ ] Planejar detalhe unico de entrega, historico admin/motoboy, realtime, push e cron somente depois dos contratos backend e validadores especializados.
- [ ] Planejar pagamentos e documentos somente depois de endpoints com auditoria, signed URLs e Security Validator.
- [ ] Preparar PWA/Service Worker real somente apos acompanhar o residual de auditoria do Next/PostCSS e validar seguranca.
- [ ] Planejar cancelamento e dados complementares do motoboy somente com contrato backend e validadores.

## Concluido

- [x] Governanca minima espelhada no frontend.
- [x] Estrutura de pastas M-00A criada com `.gitkeep`.
- [x] `.env.example` publico criado sem secrets privados.
- [x] README, STRUCTURE e CONTRACTS criados.
- [x] Dependencias, manifests e lockfile criados.
- [x] Next.js App Router minimo criado com rotas placeholder.
- [x] Typecheck, build e lint executados com sucesso.
- [x] Auditoria de dependencias reduzida: `next-pwa` removido por estar sem uso real e `glob` transitivo do lint fixado via override restrito.
- [x] M-02B implementado: login minimo com Supabase Auth, cadastro loja/motoboy pela API backend e tela de status de aprovacao.
- [x] Smoke anon read-only confirmou negacao `401` nas tabelas de dominio, incluindo `payments`.
- [x] Chave publica Supabase do frontend corrigida para publishable key e smoke Auth/RLS real aprovado pelo backend com sessao real.
- [x] Direcao visual inicial criada em `design.md`, com landing page em `/` usando logo oficial, paleta laranja/azul e CTAs para cadastro/login.
- [x] M-03 admin minimo implementado: `/admin` lista usuarios paginados pela API backend e permite aprovar, bloquear e desbloquear com Bearer token de admin ativo.
- [x] F7 Track A enxuta implementada: `AdminUsersPanel` com presets/filtros fixos, linhas clicaveis e drawer lateral estrutural de usuario.
- [x] Paginas admin segmentadas: `/admin`, `/admin/lojas`, `/admin/motoboys`, `/admin/aprovacoes` e `/admin/usuarios` reutilizam o painel com escopo honesto.
- [x] ComingSoonPanel refinado em `/admin/insights`, `/admin/pagamentos`, `/admin/entregas` e `/admin/configuracoes` para explicitar endpoints/validadores faltantes.
- [x] Backend Track B inicial disponivel: `GET /api/admin/users/:id` retorna perfil administrativo sanitizado sem campos de Storage/documentos.
- [x] Drawer admin integrado ao `GET /api/admin/users/:id`, exibindo perfil expandido sanitizado de loja/motoboy sem liberar documentos/pagamentos.
- [x] `/admin/insights` integrado ao backend real `GET /api/admin/insights`, sem mocks, exibindo apenas agregados e pendentes previstos no contrato.
- [x] Smoke pos-deploy final de `/admin/insights` aprovado em producao contra backend real: frontend `93d0175`, backend `b34f30d`, chamada autenticada `200` e UI renderizando dados reais.
- [x] Favicon de producao corrigido com asset oficial estatico; `/favicon.ico` passou de `404` para `200` no deploy frontend `587af96`.
- [x] Navegacao admin consolidada (ADR-006): `Dashboard` e `Aprovacoes` removidos do menu por duplicacao funcional; `/admin` e `/admin/aprovacoes` viraram redirects server-side; `AdminUsersPanel` ganhou chip pulsante de pendentes e leitura de `?status` da URL.
- [x] Migracao segura validada para Next.js `15.5.18`, `eslint-config-next@15.5.18`, React `19.2.6` e React DOM `19.2.6`, sem codemod e sem feature nova.
- [x] Auditoria de padronizacao executada (Camisa10 + Design Agent): acentuacao PT-BR corrigida em ComingSoonPanel, `/admin/insights` e mensagens de erro padrao; arquivos orfaos `PlaceholderPage` e `MotoboyHome` removidos do componentes/shared e componentes/motoboy.
- [x] Correcao cirurgica de conformidade pos-layout: landing, loja e motoboy deixam claro que entrega, push, realtime e aceite concorrente ainda sao demonstrativos/planejados; `design.md` e `CONTRACTS.md` refletem `OperationalShell`, `ComingSoonPanel` e fluxos demo.
- [x] Landing simplificada (Design Agent): removidas todas as mencoes a leilao, admin, timer/contagem, central e cobranca; HeroMockup deixou de usar `CountdownRing` e virou imagem estatica; RouteSteps reduzido a 2 papeis (loja->motoboy); FAQ reduzido a 4 perguntas; TrustSeals reduzido a 3 selos voltados ao usuario; CTABand passa a ter 1 CTA unico; logo aumentada no header (h-9/h-10 -> h-11/h-12) e footer (h-11 -> h-12 sm:h-14). Pasta `public/landing/` criada para receber `hero.webp`, `loja.webp` e `motoboy.webp`; ate la, os tres `<Image>` apontam para o logo oficial como placeholder neutro.
- [x] M-04B implementado e validado no frontend: `/loja/nova-entrega` usa `POST /api/deliveries` com Bearer token de logista ativo, envia somente `destinationAddress` e `notes`, mostra loading/sucesso/erros estaveis, impede duplo envio e teve smoke autenticado controlado aprovado com usuarios ficticios e limpeza automatica.
- [x] M-04C frontend ajustado ao contrato opcional: `/loja/nova-entrega` permite criar solicitacao sem endereco, monta payload minimo sem strings vazias e preserva os bloqueios de aceite, realtime, push, cron, historico, cancelamento e expiracao.
- [x] M-04C validada pos-deploy em producao: smoke publico confirmou `401 AUTH_REQUIRED` sem token, rota `/loja/nova-entrega` `200` e bundle com payload minimo; smoke autenticado criou entrega com payload `{}`, `destination_address=null`, `status=aguardando`, `courier_id=null` e cleanup completo, sem SQL adicional nem exposicao de secrets.
- [x] M-05 frontend implementado: `/loja/historico` consome `GET /api/deliveries` via Bearer token do `OperationalShell` (`listMyDeliveries` em `src/lib/api.ts`), com estados loading/erro recuperavel/vazio honesto/lista paginada real, filtro por status do contrato e paginacao real; mock `sampleHistory` e enum divergente removidos de `delivery-types.ts`; sem `supabase.from`, sem leitura direta de `delivery_requests`, sem busca textual, filtro por data ou dados de motoboy; `typecheck`, `lint`, `build`, `test --if-present` e `git diff --check` passaram.
- [x] M-05 validada pos-deploy em producao: backend `f30bfc7` e frontend `6833695` publicados; smoke publico confirmou `GET`/`POST /api/deliveries` sem token com `401 AUTH_REQUIRED` e `/loja/historico` com `200`; smoke autenticado contra producao validou listagem real da loja, isolamento multi-tenant, filtro, paginacao, validacoes negativas, ausencia de `store_id`/`courier_id` e cleanup completo, sem SQL/migration/RLS/grants/policies nem exposicao de secrets.
- [x] Cirurgico admin: `AdminUsersPanel` ganhou a coluna `Loja` consumindo `store_name` de `GET /api/admin/users` (tipo `AdminUserListItem`), sem chamar o detalhe por linha (sem N+1) e sem campos de Storage/PII; `typecheck`, `lint`, `build`, `test --if-present` e `git diff --check` passaram. Publicado em producao (frontend `506c740`, backend `946d84d`); smoke publico confirmou `/admin/usuarios` `200` e bundle com `store_name`.
- [x] Fatia 1 do aceite do motoboy documentada no frontend sem UI real: `CONTRACTS.md` registra `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept`, erros e politica de PII; `CorridaAtiva.tsx` permanece mock e nenhum client/componente foi ligado ao backend. Gates ImpactValidator + SecurityValidator + PerformanceValidator aprovados no ciclo cross-stack; frontend `typecheck`, `lint`, `build` e `npm test --if-present` passaram.
- [x] Fatia 1 UI real do motoboy implementada: `/motoboy` (sem query) renderiza `FilaDisponivel` consumindo `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept` via Bearer token do `OperationalShell`; client `listAvailableDeliveries`/`acceptDelivery` e tipos `AvailableDeliveryItem`/`AvailableDeliveriesResult`/`AvailableDeliveriesQuery`/`AcceptedDelivery`. Estados loading/erro recuperavel/vazio honesto/lista paginada real, botao "Atualizar" manual (sem polling), aceite com lock anti duplo-clique, tratamento de `ALREADY_ACCEPTED`/`DELIVERY_EXPIRED`/`DELIVERY_NOT_FOUND`/`COURIER_OFFLINE` e demais erros, confirmacao estatica pos-aceite. `CorridaAtiva.tsx` permanece mock isolado por `?demo=`. PII mantida (`store.name`/`store.address`; `courier_id` nao exibido). Runner Vitest+RTL introduzido com 25 testes. Gates ImpactValidator + SecurityValidator + PerformanceValidator aprovados antes de codar; `typecheck`, `lint`, `build`, `test` (25/25) e `git diff --check` passaram.
- [x] Fatia 1 UI real do motoboy validada pos-deploy em producao: frontend `7db7fad` e backend `f5ab8d8`; smoke publico confirmou `/motoboy` `200`, bundle com `/api/deliveries/available` e endpoints backend sem token com `401 AUTH_REQUIRED`; smoke autenticado confirmou politica de PII (`store.name`/`store.address` somente), aceite atomico com `ALREADY_ACCEPTED`, expirado com `DELIVERY_EXPIRED`, confirmacao estatica pos-aceite, negacoes de offline/pendente/bloqueado/role errado e cleanup completo.
- [x] Fatia 2 UI real do motoboy implementada localmente: `/motoboy` consulta `GET /api/deliveries/active` antes da fila; com corrida `aceita`, renderiza `CorridaAtivaReal` somente leitura com coleta, destino e observacao permitidos pos-aceite; sem ativa, renderiza `FilaDisponivel`; apos aceite, recarrega a corrida ativa real. `CorridaAtiva.tsx` permanece mock em `?demo=`. Sem polling, push, realtime, cancelamento ou botoes de status. Testes frontend passaram com 31/31 durante a implementacao.
- [x] Fatia 2 UI real do motoboy validada pos-deploy em producao: frontend `53a8e72` e backend `af4d0df`; smoke publico confirmou `/motoboy` `200`, bundle com `/api/deliveries/active` e backend sem token com `401 AUTH_REQUIRED`; smoke autenticado confirmou corrida ativa somente do courier dono, outro motoboy com `data: null`, negacoes de offline/pendente/bloqueado/role errado, PII pre-aceite limitada a `store.name`/`store.address`, destino/observacao apenas pos-aceite e cleanup completo.
- [x] Fatia 3 UI real do motoboy implementada localmente: `/motoboy` consulta `GET /api/couriers/me/status` antes de entregas; offline mostra controle "Ficar online" e nao chama `/api/deliveries/active` nem `/api/deliveries/available`; online chama corrida ativa e depois fila; `PATCH /api/couriers/me/status` liga/desliga o status real. Sem `courier_id` no client, sem PII nova, sem Supabase direto, sem polling/realtime/push. Testes frontend passaram com 36/36 durante a implementacao.
- [x] Fatia 3 UI real do motoboy validada pos-deploy em producao: frontend `3201d77` e backend `001a1c6`; smoke publico confirmou `/motoboy` `200`, bundle com `/api/couriers/me/status` e backend sem token com `401 AUTH_REQUIRED` em `GET`/`PATCH /api/couriers/me/status`. Smoke autenticado com motoboy ficticio offline confirmou que a UI renderiza "Ficar online" sem chamar `/api/deliveries/active` nem `/api/deliveries/available`; apos o clique, chamou `/api/deliveries/active` e exibiu "Corrida aceita". API smoke confirmou `PATCH true/false`, resposta `{ is_online, updated_at }`, payloads proibidos com `VALIDATION_ERROR`, role errada/pendente/bloqueado negados e cleanup completo.
- [x] Fatia 4A UI real do motoboy implementada localmente: `CorridaAtivaReal` passou a exibir a proxima acao real por status (`Confirmar coleta`, `Iniciar transito`, `Concluir entrega`) consumindo `PATCH /api/deliveries/:id/status` via `updateDeliveryStatus`. A UI bloqueia duplo clique durante a transicao, atualiza a corrida em `coletada`/`em_transito` e remove a corrida ativa ao receber `entregue`, voltando para a fila. Sem `courier_id`/`store_id` no client, sem timestamps de transicao, sem Supabase direto, sem polling/realtime/push. `typecheck`, `test` (41), `lint`, `build` e `git diff --check` passaram.
- [x] Fatia 4A UI real do motoboy validada pos-deploy em producao: frontend `b9239dcce3ac25535990d148f8f2480df1bcb232` e backend `a84df437cb30b62c592454fe22b25b173fce9f83` publicados. Smoke publico confirmou `/motoboy` -> `200`, bundle com `Confirmar coleta`, `Iniciar transito`, `Concluir entrega` e `/status`; backend confirmou `GET /api/health` -> `200`, `/api/deliveries/active` sem token -> `401 AUTH_REQUIRED` e `PATCH /api/deliveries/:id/status` sem token -> `401 AUTH_REQUIRED`. Smoke UI autenticado com Playwright confirmou login real, corrida ativa, os tres botoes de transicao, timestamps no banco, remocao da corrida ativa apos `entregue`, UI sem `store_id`/`courier_id`/owner/logo/documentos/secrets e cleanup completo.
- [x] Ajuste UX do `/motoboy` validado em producao: frontend `ecc1e66734eebe72401ebf270ac4a3cf356bd3f1`, backend `57a38723d749e39a578925e3da529695346af4dd` e `https://entreggo.vercel.app/motoboy` com `200`. Smoke UI autenticado confirmou `Loja solicitante` na fila e na corrida ativa, pre-aceite sem destino/notas, destino ausente sem card `Entrega`, placeholder, alerta, mapa ou `Abrir no mapa`, UI sem `store_id`/`courier_id`/owner/logo/documentos/Storage/Authorization/Bearer e cleanup completo com `0` usuarios smoke restantes. Sem backend, contrato API, SQL/migration/RLS/grants/policies, PII nova, polling/realtime/push/cron/GPS/Storage/cancelamento/historico.

## Bloqueios

- Projeto ainda nao possui dashboards complexos, push real, realtime real ou cron. O historico real da loja (M-05), a UI real de descoberta/aceite do motoboy (Fatia 1), a leitura real da corrida ativa (Fatia 2), o status online/offline real (Fatia 3) e transicoes pos-aceite REST (Fatia 4A) ja existem; detalhe unico, busca textual, filtro por data e cancelamento seguem fora de escopo.
- Documentos/CNH/fotos seguem bloqueados por LGPD ate pipeline de Storage com signed URLs e Security Validator.
- Pagamentos seguem bloqueados ate endpoints com auditoria server-side e Security Validator.
- `npm audit --json` ainda falha com 7 vulnerabilidades moderadas: `next@15.5.18` aponta `postcss` interno e a cadeia de testes `vitest`/`vite` aponta advisories moderados com fix semver-major. Sem alto/critico; exige acompanhamento de release/advisory antes de PWA/push real ou upgrade major do runner.
- Logo/paleta inicial definida em `design.md`; refinamentos finais ainda dependem de validacao visual nas proximas telas.
- VAPID ainda pendente e nao deve ser hardcoded.
- Visao demo de corrida do motoboy (`src/components/motoboy/CorridaAtiva.tsx`) permanece mock e so aparece no fluxo demo (`?demo=`); a UI real de descoberta/aceite, leitura pos-aceite e transicoes REST (`FilaDisponivel.tsx`/`CorridaAtivaReal.tsx`) ja esta no caminho padrao.

## Saude do Projeto

**Build:** passando
**Lint:** passando (`next lint` deprecado no Next 15; migrar antes de Next 16)
**Testes:** Vitest + Testing Library (46 testes; `npm test`); Playwright instalado como ferramenta de smoke UI autenticado controlado
**Deploy:** publicado em Vercel
**Riscos abertos:** 4
