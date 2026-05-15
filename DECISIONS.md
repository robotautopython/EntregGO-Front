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
