# LEARNINGS - EntregGO Front

## 2026-05-14 - Validacao atual e documental

Como ainda nao existe codigo, manifests, build, rotas ou testes, qualquer validacao desta etapa vale apenas para arquitetura, escopo e organizacao. Assim que o scaffolding existir, os planos devem ser revalidados contra arquivos reais.

## 2026-05-14 - Auditoria de dependencias PWA/Next

`npm audit` reportou vulnerabilidades transitivas no frontend apos instalar Next.js e next-pwa. A correcao automatica exige upgrades quebraveis, entao deve ser tratada como ciclo proprio de hardening antes de PWA/push real.

## 2026-05-14 - next-pwa deve esperar o ciclo PWA real

`next-pwa@5.6.0` trazia Workbox e `serialize-javascript` vulneraveis, mas ainda nao estava configurado em `next.config.js` nem havia Service Worker real no runtime. Remover a dependencia agora reduz a superficie sem perder funcionalidade; o `public/manifest.json` permanece como placeholder PWA-ready. Quando PWA/push real entrar no escopo, escolher biblioteca ativa/compativel com a versao corrente do Next e validar com Security Validator.

## 2026-05-14 - Zerar o audit exige migracao major do Next

Apos remover `next-pwa` e corrigir o `glob` transitivo do lint, o residual do audit ficou concentrado em `next@14.2.35` e no `postcss@8.4.31` embutido pelo Next. O audit aponta correcao via Next 16.2.6 e tambem existe Next 15.5.16 como linha corrigida minima observada, mas qualquer saida e migracao major e deve ter ADR/plano proprio antes de aplicar.

## 2026-05-14 - Sessao real de RLS precisa de limpeza operacional

O frontend M-02B permite obter uma sessao real Supabase Auth pelo login, mas o smoke automatizado completo criaria usuario Auth e linhas de dominio no ambiente remoto. Como a service role foi exposta anteriormente no chat e a rotacao ainda nao esta confirmada nos documentos, e como nao ha endpoint operacional de limpeza, o gate correto e bloquear a criacao automatica e validar apenas anon/read-only ate existir plano seguro de usuario temporario.

## 2026-05-15 - Supabase query builder deve ser aguardado explicitamente

No smoke do painel admin, tentar usar `.catch()` diretamente apos encadear um query builder Supabase (`service.from(...).delete().in(...)`) falhou porque o objeto ainda nao e uma Promise comum naquele ponto. O padrao seguro e atribuir `const result = await query` e entao verificar `result.error`, especialmente em blocos de limpeza que nao podem mascarar sobras temporarias.

## 2026-05-15 - Placeholder honesto e melhor que simulacao de admin

Na Track A do admin, o validator rejeitou KPIs, documentos regulados e pagamentos funcionais porque os contratos backend e validacoes ainda nao existem. O caminho correto foi entregar estrutura real apenas sobre endpoints existentes e usar placeholders que dizem exatamente qual endpoint e qual validador faltam. Isso preserva confianca do operador e evita UI enganosa, especialmente em documentos LGPD e marcacao de pagamento.

## 2026-05-15 - Drawer deve consumir detalhe expandido sem reabrir documentos

Com `GET /api/admin/users/:id` disponivel no backend, o proximo patch de frontend pode enriquecer a aba Perfil com dados de loja/motoboy. Esse consumo nao libera documentos, fotos, pagamentos ou historico: estes continuam exigindo endpoints proprios e validadores especializados. A integracao deve tratar loading/erro do drawer sem duplicar a listagem admin.

## 2026-05-15 - Detalhe expandido no drawer deve ser efemero

O drawer admin passou a buscar `GET /api/admin/users/:id` ao selecionar uma linha, mas o perfil expandido fica apenas em estado React e e limpo ao fechar/trocar usuario. Esse padrao evita persistir PII administrativa em storage local, preserva a listagem paginada como fonte base e permite fallback visual quando o detalhe falha.

## 2026-05-15 - Insights admin devem espelhar exatamente o contrato

Mesmo com endpoint real, o painel de insights nao deve inventar campos para "enriquecer" a tela. Como `GET /api/admin/insights` retorna apenas agregados e pendentes sem PII, a UI deve exibir role, status, datas e contagens, deixando nomes, emails, perfis, documentos e qualquer ranking para contratos futuros validados.

## 2026-05-15 - Smoke de deploy precisa separar stale front e stale back

O fechamento de `/admin/insights` encontrou dois problemas distintos de publicacao: frontend stale ainda mostrando placeholder e backend stale retornando `404` para a rota nova. O padrao de smoke pos-deploy deve validar, nessa ordem, bundle frontend contendo a chamada esperada, backend sem token retornando `401 AUTH_REQUIRED`, e sessao admin ativa retornando `200` com UI renderizada. Evidencias de Network devem registrar apenas URL, metodo e status; tokens, cookies e headers sensiveis ficam fora do relatorio.

## 2026-05-15 - Ruido de asset estatico tambem entra no fechamento

O `404` de `favicon.ico` nao quebrava fluxo funcional, mas poluia o Network e podia mascarar falhas mais importantes durante smokes de producao. Para esse tipo de polish operacional, o caminho seguro e usar asset oficial existente, adicionar apenas o arquivo estatico necessario, validar build e smoke HTTP, e evitar transformar a correcao em ciclo de PWA/manifest/branding.

## 2026-05-15 - Migracao major deve fechar tambem artefatos gerados

Ao migrar de Next 14 para Next 15, o `next build` atualizou automaticamente `next-env.d.ts` para apontar para `./.next/types/routes.d.ts` e para a nova URL de documentacao TypeScript. Esse arquivo nao muda comportamento em runtime, mas faz parte do estado gerado esperado pelo tooling; deixar sem registrar faria todo build voltar a sujar a arvore. O padrao seguro e tratar esse tipo de mudanca como artefato de migracao, validar typecheck/build e registrar no LOG.

## 2026-05-15 - Audit SCA pode continuar residual em dependencia embutida

A migracao para Next `15.5.18` removeu o estado antigo de `next@14.2.35`, mas o `npm audit --json` ainda aponta 2 vulnerabilidades moderadas porque o Next empacota `postcss@8.4.31` internamente. Como o scanner sugere um fix automatico inadequado e nao ha alto/critico no relatorio atual, o fechamento correto e documentar o residual, evitar PWA/push real sobre essa superficie e acompanhar releases/advisories do Next em ciclo proprio.
