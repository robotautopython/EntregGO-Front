# STATUS - EntregGO Front

## Estado Atual

**Fase:** fundacao
**Ultima atualizacao:** 2026-05-14
**Atualizado por:** Codex/Camisa10

## Em Andamento

- [ ] Planejar migracao segura de Next.js 14 para versao corrigida antes de PWA/push real.
- [ ] Evoluir login/cadastro e shells internos seguindo `design.md`, preservando handlers e validacoes.

## Proximas Tarefas

- [ ] Criar suite de testes frontend quando houver componentes com comportamento.
- [ ] Preparar hardening de auth/RLS com usuario real ficticio e plano de limpeza.
- [ ] Preparar PWA/Service Worker real somente apos resolver auditoria e validar seguranca.

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

## Bloqueios

- Projeto ainda nao possui dashboards, push real, realtime real ou testes frontend.
- `npm audit --audit-level=moderate` ainda falha por vulnerabilidades em `next@14.2.35` e `postcss@8.4.31` embutido no Next; correcao exige migracao major para Next 15.5.16+ ou 16.x com validacao propria.
- Logo/paleta inicial definida em `design.md`; refinamentos finais ainda dependem de validacao visual nas proximas telas.
- Credenciais de deploy/VAPID ainda pendentes e nao devem ser hardcoded.

## Saude do Projeto

**Build:** passando
**Lint:** passando
**Testes:** inexistente
**Deploy:** inexistente
**Riscos abertos:** 4
