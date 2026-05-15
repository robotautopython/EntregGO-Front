# STATUS - EntregGO Front

## Estado Atual

**Fase:** fundacao/auth-operacao
**Ultima atualizacao:** 2026-05-15
**Atualizado por:** Codex/Camisa10

## Em Andamento

- [ ] Manter abas de documentos, entregas, pagamento e notas como placeholders honestos ate existirem endpoints reais.

## Proximas Tarefas

- [ ] Criar suite de testes frontend quando houver componentes com comportamento.
- [ ] Planejar pagamentos, documentos e entregas somente depois dos contratos backend e validadores especializados.
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

## Bloqueios

- Projeto ainda nao possui dashboards complexos, push real, realtime real ou testes frontend.
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
