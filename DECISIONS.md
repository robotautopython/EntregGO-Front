# DECISIONS - EntregGO Front

## ADR-001 - Frontend e backend separados

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** A documentacao define dois projetos independentes: `entreggo-front` e `entreggo-api`, cada um com repositorio, deploy e variaveis proprias.

**Decisao:** Manter frontend e backend desacoplados. O frontend consome a API por REST/JSON e nao acessa o banco diretamente, exceto Supabase Auth e Supabase Realtime conforme documentado.

**Consequencias:** Deploys independentes, contratos de API precisam ser estaveis, e secrets permanecem somente no backend.

## ADR-002 - Supabase no frontend apenas para Auth e Realtime documentados

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** O produto usa Supabase Auth para sessao e Supabase Realtime para notificacoes de solicitacoes no painel do motoboy.

**Decisao:** O frontend pode usar apenas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e recursos documentados de Auth/Realtime. Dados de negocio passam pela API.

**Consequencias:** A anon key e publica e deve depender de RLS no Supabase. Service role, JWT secret e VAPID private key ficam proibidos no frontend.

## ADR-003 - Estruturar frontend antes das dependencias

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** O frontend ainda nao possui manifesto, codigo ou dependencias. Criar dependencias antes de documentar fronteiras aumentaria o risco de expor variaveis privadas ou acoplar o projeto ao backend.

**Decisao:** Executar o M-00A antes do `package.json`: criar governanca minima, estrutura de pastas, `.env.example`, README, STRUCTURE e CONTRACTS, sem instalar pacotes e sem implementar telas.

**Consequencias:** O proximo passo de criacao de dependencias parte de uma estrutura documentada e com fronteira de seguranca explicita.

## ADR-004 - Fundacao Next.js sem fluxos reais

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** O frontend precisava de runtime validavel sem antecipar auth, dashboards, realtime ou push.

**Decisao:** Criar Next.js com App Router minimo, rotas placeholder, Tailwind, clients base e manifest PWA sem implementar fluxos reais.

**Consequencias:** Build, lint e typecheck passam a existir. Funcionalidades sensiveis continuam bloqueadas ate validacao especializada.

## ADR-005 - Identidade visual laranja/azul e landing como porta de entrada

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** A logo oficial do EntregGO foi fornecida e combina laranja, azul, amarelo e preto. O frontend ja possui rotas reais de login/cadastro minimo e precisava deixar de parecer scaffold generico.

**Decisao:** Definir a direcao visual em `design.md` e transformar `/` na landing inicial do sistema, com foco em cadastro e login. A paleta principal passa a usar laranja para acao, azul para confianca/status e asfalto para contraste operacional.

**Consequencias:** O frontend ganha uma linguagem visual propria sem implementar dashboard, push, realtime ou regras de negocio fora do escopo. Futuras telas devem seguir `design.md` e preservar handlers/validacoes existentes.

## ADR-006 - Consolidacao da navegacao admin

**Data:** 2026-05-15
**Status:** aceito

**Contexto:** O painel admin entrou em F7 Track A com cinco abas no menu lateral: `Dashboard` (`/admin`), `Aprovacoes` (`/admin/aprovacoes`), `Lojas` (`/admin/lojas`), `Motoboys` (`/admin/motoboys`) e `Usuarios` (`/admin/usuarios`). As tres ultimas usam o mesmo `AdminUsersPanel` com presets diferentes (`forcedRole=logista`, `forcedRole=motoboy`, sem filtro). `Dashboard` era visualmente identica a `Usuarios` (mesmo conteudo, sem filtro) e `Aprovacoes` era apenas `Usuarios` com `forcedStatus=pendente`. O ImpactValidator confirmou duplicacao funcional sem ganho de informacao, e o usuario solicitou consolidacao.

**Decisao:** Remover `Dashboard` e `Aprovacoes` do `navConfig.admin`. Manter apenas tres itens em `Cadastros`: `Usuarios`, `Lojas`, `Motoboys`. A rota canonica do admin passa a ser `/admin/usuarios`. `/admin` e `/admin/aprovacoes` sao mantidas apenas como redirects server-side (`redirect('/admin/usuarios')` e `redirect('/admin/usuarios?status=pendente')`) para nao quebrar bookmarks nem destinos de login antigos. `AdminUsersPanel` passa a ler `?status` da URL como filtro inicial e ganha um chip pulsante destacado no topo (`{n} cadastros pendentes - Ver agora`) que aplica o filtro inline, alimentado por contagem real via `GET /api/admin/users?status=pendente&limit=1`. `LoginForm.getDestination`, `ApprovalStatus` e `roleHome.admin` apontam admin direto a `/admin/usuarios`.

**Consequencias:** Menos abas, menos confusao, mesma funcionalidade. Bottom-nav mobile passa a expor `Usuarios`, `Lojas`, `Motoboys` e `Insights` (4 slots disponiveis, todos ocupados). Pendentes nao perdem destaque visual: o chip pulsa apenas quando existem cadastros pendentes na rede inteira e some quando o filtro ja esta em `status=pendente`. Bookmarks antigos seguem funcionando via redirect. Nenhum endpoint backend novo foi necessario, nenhum contrato mudou e o build manteve 24 rotas estaticas.

## ADR-007 - Next 15 como linha intermediaria corrigida do frontend

**Data:** 2026-05-15
**Status:** aceito

**Contexto:** O frontend estava em `next@14.2.35` e a auditoria apontava riscos residuais no Next/PostCSS interno. Migrar direto para Next 16 aumentaria o risco de tooling e removals, enquanto permanecer no Next 14 manteria o projeto preso ao bloqueio antigo antes de PWA/push real.

**Decisao:** Usar Next.js `15.5.18`, `eslint-config-next@15.5.18`, React `19.2.6` e React DOM `19.2.6` como salto intermediario validado. As versoes foram fixadas sem range em `package.json` para preservar reprodutibilidade do lockfile. Nao aplicar codemod enquanto typecheck, lint e build nao exigirem mudanca concreta.

**Consequencias:** O frontend passa a rodar em Next 15/React 19 com build local aprovado e sem alterar contratos backend. `next lint` continua funcionando, mas fica deprecado e precisa ser substituido antes de Next 16. `npm audit --json` ainda aponta residual moderado no `postcss@8.4.31` embutido pelo Next, entao PWA/push real continuam aguardando novo ciclo de seguranca.

## ADR-008 - M-02B usa Supabase Auth somente para sessao no browser

**Data:** 2026-05-14
**Status:** aceito

**Contexto:** O backend M-02A concentra cadastro, validacao server-side e service role. O frontend precisa oferecer login/cadastro minimo sem receber secrets privados nem acessar tabelas de negocio diretamente.

**Decisao:** O frontend usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` somente para Supabase Auth no browser. Cadastro de loja/motoboy passa pela API backend; `/api/auth/me` recebe o access token da sessao como Bearer para carregar o usuario de dominio.

**Consequencias:** Service role, JWT secret, senha de banco e VAPID private key permanecem fora do frontend. A anon key continua publica e depende de RLS; smoke real de policies com usuario autenticado deve usar dados ficticios e plano de limpeza em ciclo de hardening.

## ADR-009 - Fatia 1 do aceite documentada sem UI real do motoboy

**Data:** 2026-05-16
**Status:** aceito

**Contexto:** O backend passou a expor `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept` para descoberta e aceite atomico do motoboy. A tela do motoboy ainda tem `CorridaAtiva.tsx` mockada, e liberar UI real agora puxaria realtime, push, estado offline/online operacional, expiracao visual e transicoes pos-aceite.

**Decisao:** Nesta fatia, o frontend atualiza somente `CONTRACTS.md` para registrar os dois endpoints novos, erros e politica de PII. Nenhum client em `src/lib/api.ts`, tipo runtime, componente, rota ou UI de motoboy sera ligado ao backend ainda. O motoboy podera ver no contrato apenas `store.name` e `store.address`; `destination_address`, `notes`, `store_id`, `courier_id` na descoberta e demais PII continuam fora da UI.

**Consequencias:** O deploy frontend permanece compativel e sem mudanca funcional. A proxima fatia de UI deve revalidar SecurityValidator e PerformanceValidator antes de conectar fila/aceite real, principalmente por envolver PII entre atores, listas de entregas, realtime/push e experiencia concorrente.

## ADR-010 - Fatia 1 UI real do motoboy com separacao mock/real por query

**Data:** 2026-05-16
**Status:** aceito

**Contexto:** O backend da Fatia 1 ja expunha `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept` e o ADR-009 deixou o frontend apenas em contrato. Era necessario entregar a primeira UI real de descoberta/aceite sem puxar realtime, push, cron, online/offline operacional ou transicoes pos-aceite, e sem misturar o mock de corrida com dado real.

**Decisao:** Implementar `src/components/motoboy/FilaDisponivel.tsx` espelhando o padrao de `HistoricoEntregas.tsx` (loading, erro recuperavel, vazio honesto, paginacao real). `CourierHomeFlow.tsx` virou um seletor: sem query renderiza a UI real (`FilaDisponivel`); com `?demo=ativo`/`?demo=solicitacao` renderiza o fluxo mock isolado (`CourierDemoFlow`, antigo corpo do componente, incluindo `CorridaAtiva`/`SolicitacaoCard`/`PushPrimeSheet`). Mock e dado real nunca coexistem na mesma arvore React. Atualizacao da fila e manual via botao "Atualizar"; nenhum `setInterval`/polling no caminho real. Aceite usa lock `acceptingId` (anti duplo-clique e anti aceite paralelo) e trata `ALREADY_ACCEPTED`/`DELIVERY_EXPIRED`/`DELIVERY_NOT_FOUND` removendo o item e recarregando. Sucesso mostra confirmacao estatica, sem navegar para corrida. O runner de testes escolhido foi Vitest + Testing Library (jsdom), compativel com Next 15/React 19, com 25 testes cobrindo `mapCourierError`, `FilaDisponivel` e o client de API.

**Consequencias:** O motoboy passa a ver e aceitar entregas reais consumindo apenas REST com Bearer token, sem acesso direto ao Supabase e sem PII alem de `store.name`/`store.address` (`courier_id` retornado no aceite nao e exibido). `CorridaAtiva.tsx` e `courier-types.ts` permanecem mock intocados, agora alcancaveis so via `?demo=`. O frontend ganha sua primeira suite de testes automatizada (`npm test`). Transicoes pos-aceite (coletada/em_transito/entregue), realtime, push, cron, cancelamento, online/offline operacional e historico do motoboy seguem fora de escopo e exigem contrato backend e novos gates.

## ADR-011 - Corrida ativa real separada do mock de transicoes

**Data:** 2026-05-16
**Status:** aceito

**Contexto:** A Fatia 1 aceitava entregas reais, mas apos o aceite a UI mostrava apenas confirmacao estatica. Reaproveitar `CorridaAtiva.tsx` diretamente misturaria dados reais com botoes de transicao mockados (`coletou`, `em_transito`, `entregue`) e poderia fazer a UI prometer mutacoes que o backend ainda nao possui.

**Decisao:** Criar um fluxo real separado (`MotoboyRealFlow` + `CorridaAtivaReal`). `/motoboy` sem query consulta `GET /api/deliveries/active` antes da fila; se houver corrida aceita, mostra a tela real somente leitura. Se nao houver, mostra `FilaDisponivel`. Apos `acceptDelivery`, a fila chama o parent para recarregar `GET /api/deliveries/active` e usar a fonte de verdade do backend para destino/notas. `CorridaAtiva.tsx`, `courier-types.ts`, `SolicitacaoCard` e `PushPrimeSheet` seguem isolados no demo por `?demo=`.

**Consequencias:** A UI pos-aceite passa a exibir dados reais permitidos (`destination_address`/`notes`) apenas quando o backend confirma a corrida atribuida. Nao ha polling, realtime, push, cancelamento ou botoes de status. A separacao evita que o mock de transicoes contamine o caminho real e deixa as proximas mutacoes para um contrato backend proprio.

## ADR-012 - Status operacional antes de corrida/fila

**Data:** 2026-05-16
**Status:** aceito

**Contexto:** O caminho real `/motoboy` dependia de endpoints que exigem `couriers.is_online=true`, mas o motoboy nasce offline e nao havia controle real para mudar esse estado. Chamar `/api/deliveries/active` offline gera `COURIER_OFFLINE` por design.

**Decisao:** `MotoboyRealFlow` passa a consultar `GET /api/couriers/me/status` antes de qualquer endpoint de entregas. Quando offline, renderiza apenas o controle de status e um estado honesto, sem chamar corrida ativa nem fila. `PATCH /api/couriers/me/status` liga/desliga o status; ao ficar online, a tela carrega corrida ativa e depois fila se necessario. O fluxo demo por `?demo=` permanece isolado.

**Consequencias:** O erro de producao deixa de aparecer como falha recuperavel de entregas e vira estado operacional claro. O frontend continua sem Supabase direto, sem `courier_id`, sem PII nova e sem polling/realtime/push. Localizacao, raio, historico de presenca e transicoes de entrega continuam fora de escopo.

## ADR-013 - Transicoes pos-aceite reais no fluxo do motoboy

**Data:** 2026-05-16
**Status:** aceito

**Contexto:** O backend passou a expor `PATCH /api/deliveries/:id/status` para avancar a corrida atribuida em `aceita -> coletada -> em_transito -> entregue`. A UI real ja separava `CorridaAtivaReal` do mock `CorridaAtiva.tsx`, evitando misturar botoes demo com dados de producao.

**Decisao:** Ligar `CorridaAtivaReal` ao novo client `updateDeliveryStatus`, exibindo uma unica proxima acao por status ativo: "Confirmar coleta", "Iniciar transito" ou "Concluir entrega". Durante a requisicao, os botoes de acao/atualizacao ficam desabilitados para evitar duplo PATCH. Em `coletada` e `em_transito`, a corrida em tela e atualizada pelo retorno sanitizado; em `entregue`, a corrida sai da tela ativa e o fluxo volta para a fila real. O demo por `?demo=` permanece isolado.

**Consequencias:** O caminho padrao `/motoboy` passa a cobrir descoberta, aceite, leitura ativa, online/offline e transicoes pos-aceite via REST. Nao ha polling, realtime, push, cron, cancelamento, GPS, historico ou acesso direto ao Supabase. A UI continua sem enviar ou renderizar `courier_id`, `store_id`, timestamps de transicao, Storage/documentos ou dados sensiveis.
