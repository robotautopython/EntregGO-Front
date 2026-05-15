# PROJECT - EntregGO Front

## Visao

**Objetivo:** Interface web do EntregGO para landing page, autenticacao, paineis de admin, loja e motoboy, PWA e consumo da API REST.
**Publico-alvo:** Administradores da operacao, lojas/logistas e motoboys.
**Resultado esperado:** Usuarios acessam fluxos web desacoplados do backend, consumindo dados de negocio via API e usando Supabase Auth/Realtime apenas nos casos documentados.

## Arquitetura

**Frontend:** Next.js 14+ App Router, React, TypeScript, Tailwind CSS, shadcn/ui, PWA/Service Worker.
**Backend consumido:** EntregGO API em Node.js 20+ LTS, Express e TypeScript.
**Banco:** Supabase PostgreSQL com RLS, Storage e Realtime, acessado pelo frontend somente nos limites documentados.
**Hospedagem:** Vercel em projeto separado do backend.

## Fronteiras

- Frontend: UI, landing page, paineis, Supabase Auth no client, Realtime para painel do motoboy, PWA e consumo da API REST.
- Backend: regras de negocio, autorizacao, validacao server-side, uploads, envio de push, jobs e acesso com service role ao Supabase.
- Banco: integridade, enums, constraints, indices, RLS e dados persistentes.

## Regras de Producao

- Nenhum secret privado no frontend.
- Frontend nunca acessa banco diretamente, exceto Supabase Auth e Realtime documentados.
- Dados de negocio devem passar pela API REST.
- Variaveis publicas devem usar prefixo `NEXT_PUBLIC_`.
- Contratos com backend seguem resposta padrao `{ success, data, message }` ou `{ success, error }`.
