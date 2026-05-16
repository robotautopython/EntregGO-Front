# STATUS - EntregGO Front

## Estado Atual

**Fase:** fundacao/auth-operacao
**Ultima atualizacao:** 2026-05-16
**Atualizado por:** Codex/Camisa10

## Em Andamento

- [ ] Manter abas de documentos, entregas, pagamento e notas como placeholders honestos ate existirem endpoints reais.
- [ ] Receber 3 imagens reais em `public/landing/` (hero.webp 4:3, loja.webp 4:5, motoboy.webp 4:5) e trocar os `src` em HeroMockup, StorePitch e CourierPitch. Hoje os 3 `<Image>` apontam para `public/brand/entreggo-logo-transparent.png` como placeholder neutro.

## Proximas Tarefas

- [ ] Criar suite de testes frontend quando houver componentes com comportamento.
- [ ] Planejar aceite, detalhe unico de entrega, historico admin/motoboy, realtime, push e cron somente depois dos contratos backend e validadores especializados.
- [ ] Planejar pagamentos e documentos somente depois de endpoints com auditoria, signed URLs e Security Validator.
- [ ] Preparar PWA/Service Worker real somente apos acompanhar o residual de auditoria do Next/PostCSS e validar seguranca.

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

## Bloqueios

- Projeto ainda nao possui dashboards complexos, aceite concorrente, push real, realtime real, cron ou testes frontend. O historico real da loja ja existe (M-05); aceite, detalhe unico, busca textual, filtro por data e dados de motoboy seguem fora de escopo.
- Documentos/CNH/fotos seguem bloqueados por LGPD ate pipeline de Storage com signed URLs e Security Validator.
- Pagamentos seguem bloqueados ate endpoints com auditoria server-side e Security Validator.
- `npm audit --json` ainda falha com 2 vulnerabilidades moderadas: `next@15.5.18` aponta o `postcss@8.4.31` embutido em `node_modules/next`. Sem alto/critico; exige acompanhamento de release/advisory do Next antes de PWA/push real.
- Logo/paleta inicial definida em `design.md`; refinamentos finais ainda dependem de validacao visual nas proximas telas.
- VAPID ainda pendente e nao deve ser hardcoded.

## Saude do Projeto

**Build:** passando
**Lint:** passando (`next lint` deprecado no Next 15; migrar antes de Next 16)
**Testes:** inexistente
**Deploy:** publicado em Vercel
**Riscos abertos:** 4
