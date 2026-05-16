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

## 2026-05-15 - Criacao persistida nao deve cair em estado demonstrativo

Ao ligar `/loja/nova-entrega` ao `POST /api/deliveries`, o risco principal era criar uma linha real no backend e reutilizar o fluxo antigo de countdown/cancelamento/expiracao local. O padrao correto e separar sucesso persistido de demo visual: apos a API retornar `201`, a tela mostra confirmacao honesta e explicita que aceite, notificacao, realtime, cron e historico ainda nao existem. Isso evita que a UI prometa cancelamento ou expiracao que o backend ainda nao implementa.

## 2026-05-15 - Erros tipados do client nao devem ser remapeados

`assertApiUrlConfigured()` lanca `ClientApiError` antes da chamada Axios. O mapper de API precisa preservar esse erro tipado; caso contrario, codigos como `API_URL_MISSING` viram erro generico de request e a UI perde a mensagem operacional correta. O padrao seguro e checar `error instanceof ClientApiError` antes de tratar `axios.isAxiosError`.

## 2026-05-15 - Smoke autenticado deve isolar ambiente e cache do Next

O smoke M-04B precisou rodar com API local temporaria e `NEXT_PUBLIC_API_URL` de teste. Para evitar contaminar a build normal, o processo removeu apenas `.next` com checagem de caminho, limpou `NODE_PATH`/`NODE_ENV` do processo Next, executou `next build` + `next start` para o navegador e refez a build normal ao final. `next dev` nao foi usado no veredito porque falhou ao compilar `/loja/nova-entrega` por `require` em `tailwind.config.ts` em contexto ESM; isso deve ser tratado como manutencao separada se o fluxo de dev local precisar dessa rota.

## 2026-05-15 - Payload minimo evita strings vazias no contrato opcional

**Tipo:** Padrao
**Fase:** fundacao/auth-operacao
**Contexto:** Ajuste de `/loja/nova-entrega` para aceitar criacao sem endereco de destino.

### O que aconteceu
Quando `destinationAddress` virou opcional, a UI precisou parar de bloquear o submit vazio e, ao mesmo tempo, evitar enviar `destinationAddress: ""` ou `notes: ""`.

### Por que aconteceu
Campos opcionais em formularios podem virar strings vazias por padrao no React. Se a UI envia essas strings, ela cria ambiguidade entre "campo nao informado" e "campo informado vazio".

### Como foi resolvido
O formulario passou a montar um objeto incremental: inclui `destinationAddress` e `notes` somente quando `trim()` tem texto; caso contrario envia `{}`.

### O que fazer diferente da proxima vez
Sempre que um campo vira opcional no contrato, revisar tambem disabled state, required visual, copy de erro, tipo TypeScript e montagem do payload.

### Impacto no projeto
O frontend ficou alinhado ao backend sem acessar `delivery_requests` diretamente e sem liberar aceite, push, realtime, cron, historico, cancelamento ou expiracao.

## 2026-05-15 - Trocar mock por contrato real exige podar UI que o contrato nao entrega

**Tipo:** Padrao
**Fase:** fundacao/auth-operacao
**Contexto:** M-05 substituiu o historico mockado da loja por `GET /api/deliveries`.

### O que aconteceu
A UI mockada tinha busca textual por destino/motoboy, coluna de motoboy e cards de agregado total. O contrato M-05 nao entrega `courier_id`, nao suporta busca textual e so retorna `pagination` da pagina/filtro atual. Manter esses elementos criaria UI que finge dados inexistentes.

### Por que aconteceu
Mocks costumam exibir mais do que o backend real expoe. Trocar o data source sem revisar a UI propaga campos fantasma e metricas falsas.

### Como foi resolvido
Removidos busca textual e exibicao de motoboy; o resumo passou a ser rotulado como "nesta pagina"/"no total" usando o `pagination` real, sem agregado inventado. O mock `sampleHistory` e o enum divergente foram apagados de `delivery-types.ts`, mantendo apenas os tipos ainda usados por outros fluxos placeholder.

### O que fazer diferente da proxima vez
Ao integrar um endpoint real numa tela antes mockada, listar cada elemento da UI e confirmar se o contrato realmente fornece aquele dado; remover ou rotular honestamente o que nao for entregue antes de chamar a tela de pronta.

### Impacto no projeto
Historico real da loja entregue alinhado ao contrato, sem `supabase.from`, sem leitura direta de `delivery_requests`, sem dados de motoboy e sem metrica falsa; aceite, realtime, push, cron, detalhe unico, busca textual e filtro por data seguem fora de escopo.

## 2026-05-16 - Confirmar contrato antes de culpar a UI

A queixa "nome da loja nao aparece" parecia bug de frontend, mas o drawer admin (`UserDetailDrawer.tsx:355`) ja exibe `profile.name` e o backend de detalhe ja entrega o campo. A lacuna real esta no contrato de listagem `GET /api/admin/users`, que so traz `DomainUser`. Padrao: antes de alterar o componente, rastrear o endpoint/contrato que alimenta o campo; incluir campo em endpoint de listagem e mudanca de contrato (ImpactValidator + PerformanceValidator por risco N+1), nao ajuste cosmetico. Expor dado de um ator a outro (loja -> motoboy, hoje mock em `CorridaAtiva.tsx`) e sempre gate de SecurityValidator e ciclo dedicado.

## 2026-05-16 - Separar mock e dado real por branch de rota, nao por estado compartilhado

**Tipo:** Padrao
**Fase:** fundacao/auth-operacao
**Contexto:** Fatia 1 ligou a UI real do motoboy mantendo o fluxo demo (`CorridaAtiva`/`SolicitacaoCard`/`PushPrimeSheet`) ainda usado pela landing/onboarding via `?demo=`.

### O que aconteceu
A tentativa inicial de fazer early-return da UI real antes dos hooks do fluxo demo violaria as regras de hooks do React (chamadas condicionais). Misturar os dois fluxos no mesmo componente tambem arriscaria o mock spawnar `setInterval` no caminho real.

### Como foi resolvido
`CourierHomeFlow` virou um seletor fino: le `?demo=` e renderiza `CourierDemoFlow` (antigo corpo, com todos os hooks do mock) OU `FilaDisponivel` (UI real). Cada caminho e um componente separado, entao os hooks de cada um so montam quando aquele caminho esta ativo. Mock e dado real nunca coexistem na arvore.

### O que fazer diferente da proxima vez
Para conviver mock e real sem violar hooks nem vazar timers, separar em componentes distintos e escolher por branch de rota/query no topo, em vez de tentar ramificar dentro de um unico componente cheio de hooks.

### Impacto no projeto
UI real de descoberta/aceite entregue sem remover o mock (ainda referenciado pela landing) e sem polling invisivel no caminho real. Primeira suite de testes do frontend (Vitest+RTL) introduzida; `actionError` deixou de ser limpo dentro de `load()` para que avisos de `ALREADY_ACCEPTED`/`DELIVERY_EXPIRED` sobrevivam ao reload disparado pelo proprio erro.

## 2026-05-16 - Contrato novo nao obriga UI imediata

A Fatia 1 do aceite do motoboy entregou contratos backend reais para descoberta e aceite, mas o frontend permaneceu somente em documentacao. Esse foi o corte correto porque conectar `CorridaAtiva.tsx` ao backend puxaria fila real, online/offline operacional, realtime/push, expiracao visual, concorrencia de aceite e PII entre loja e motoboy. Padrao: quando o backend abre um contrato sensivel, registrar shape, erros e campos proibidos em `CONTRACTS.md`, mas so ligar UI em fatia propria com SecurityValidator e PerformanceValidator novamente.

## 2026-05-16 - Apos aceitar, buscar a fonte de verdade do backend

**Tipo:** Padrao
**Fase:** fundacao/auth-operacao
**Contexto:** Fatia 2 do motoboy, corrida aceita real somente leitura.

### O que aconteceu
A resposta de `POST /api/deliveries/:id/accept` continua sanitizada para o momento do aceite e nao traz destino/notas. A tela real pos-aceite precisa desses dados, mas so depois que o backend confirma que a entrega esta atribuida ao motoboy.

### Como foi resolvido
`FilaDisponivel` passou a aceitar `onAccepted`; no caminho real, o parent (`MotoboyRealFlow`) chama `GET /api/deliveries/active` apos o aceite e renderiza `CorridaAtivaReal`. Assim, a tela usa a fonte de verdade pos-aceite e nao tenta inferir dados sensiveis a partir da resposta de aceite.

### O que fazer diferente da proxima vez
Quando uma acao muda permissao de leitura, fazer uma nova leitura no contrato autorizado em vez de inflar a resposta da acao. Isso evita vazar PII cedo demais e separa claramente comando de consulta.

### Impacto no projeto
Destino/notas aparecem apenas na corrida aceita real, sem mexer no mock, sem polling e sem criar transicoes falsas.

## 2026-05-16 - Guard offline precisa virar estado antes de erro

**Tipo:** Padrao
**Fase:** fundacao/auth-operacao
**Contexto:** Fatia 3 do motoboy, status operacional real.

### O que aconteceu
`/motoboy` chamava `/api/deliveries/active` logo ao montar. Quando o motoboy estava offline, o backend retornava `COURIER_OFFLINE`, que a UI mostrava como erro recuperavel. O erro era tecnicamente correto, mas ruim como experiencia porque offline e um estado esperado.

### Como foi resolvido
`MotoboyRealFlow` passou a consultar `GET /api/couriers/me/status` antes de entregas. Se `is_online=false`, a tela nao chama corrida ativa nem fila e mostra o controle "Ficar online". Ao ligar, chama `PATCH /api/couriers/me/status` e so entao entra no fluxo de corrida/fila.

### O que fazer diferente da proxima vez
Quando um endpoint falha por uma guard que representa estado operacional esperado, criar uma consulta de estado antes de chamar o endpoint protegido. Erro fica para falhas excepcionais; estado fica na UI principal.

### Impacto no projeto
O motoboy deixa de ver `COURIER_OFFLINE` como falha de producao e passa a controlar a disponibilidade real sem Supabase direto, sem `courier_id`, sem PII nova e sem polling.
