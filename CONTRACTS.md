# CONTRACTS - EntregGO Front

## Fronteira frontend

O frontend entrega UI, PWA, Supabase Auth no client, Supabase Realtime documentado e consumo da API REST. Regras de negocio, validacao server-side, uploads, push server-side e acesso privilegiado ao Supabase pertencem ao backend.

## Consumo da API

Sucesso esperado:

```json
{
  "success": true,
  "data": {},
  "message": "Operacao realizada com sucesso"
}
```

Erro esperado:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem legivel para o usuario",
    "details": []
  }
}
```

## Status de dominio

- Usuario: `pendente`, `ativo`, `bloqueado`
- Role: `admin`, `logista`, `motoboy`
- Entrega: `aguardando`, `aceita`, `coletada`, `em_transito`, `entregue`, `expirada`, `cancelada`

## Entregas M-04B

### Criacao pela loja

Tela: `/loja/nova-entrega`

Uso permitido:
- `POST /api/deliveries` com `Authorization: Bearer <access_token>`.
- Apenas usuario de dominio `role=logista` e `status=ativo` deve chegar ao formulario funcional.
- O payload enviado pelo frontend contem somente `destinationAddress` e `notes` quando esses campos tiverem texto util.
- `destinationAddress` e opcional; se vazio, nao e enviado.
- `notes` e opcional; se vazio, nao e enviado.
- Payload vazio `{}` e permitido pelo contrato backend.
- `store_id` nunca e enviado pelo frontend; o backend deriva a loja a partir da sessao.
- O frontend nao acessa `delivery_requests` diretamente. Escrita/leitura de dominio segue pela API backend.
- A resposta usada pela UI nao inclui `store_id` nem `courier_id`; a navegacao para o detalhe usa somente `id`.

Body:

```json
{
  "notes": "Observacao opcional"
}
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "destination_address": null,
    "notes": "Observacao opcional",
    "status": "aguardando",
    "created_at": "2026-05-15T20:00:00.000Z",
    "expires_at": "2026-05-15T20:01:00.000Z",
    "accepted_at": null,
    "collected_at": null,
    "in_transit_at": null,
    "delivered_at": null,
    "updated_at": "2026-05-15T20:00:00.000Z"
  },
  "message": "Solicitacao de entrega criada"
}
```

Erros tratados pela UI:
- `VALIDATION_ERROR`: mostra erro estavel no formulario.
- `USER_PENDING`: informa que o cadastro aguarda aprovacao.
- `USER_BLOCKED`: informa conta bloqueada.
- `FORBIDDEN_ROLE` e `STORE_PROFILE_REQUIRED`: mostram permissao negada para criar entrega.
- `AUTH_REQUIRED`, `INVALID_TOKEN` e `DOMAIN_USER_NOT_FOUND`: mostram sessao invalida.
- Falha de rede/timeout: mostra erro recuperavel e reabilita o botao.

Fora do escopo atual:
- envio/notificacao real para pool de motoboys;
- Web Push/VAPID e Service Worker operacional;
- assinatura Realtime para fila de entregas;
- aceite concorrente com primeira aceitacao vencendo;
- cancelamento pela UI;
- expiracao automatica por cron/job;
- dashboard real de entregas para motoboy/admin.

## Entregas M-05

### Historico real da loja

Tela: `/loja/historico`

Uso permitido:
- `GET /api/deliveries` com `Authorization: Bearer <access_token>` obtido do `OperationalShell` (mesmo padrao de `/loja/nova-entrega`).
- Client API `listMyDeliveries(accessToken, query)` em `src/lib/api.ts`.
- Query enviada: `page`, `limit` (fixo 20) e `status` opcional do contrato; nenhum outro parametro.
- `store_id` nunca e enviado; o backend deriva a loja da sessao e nao retorna `store_id`/`courier_id`.
- O frontend nao acessa `delivery_requests` nem usa `supabase.from`.

Resposta consumida:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "destination_address": null,
        "notes": "Observacao opcional",
        "status": "aguardando",
        "created_at": "2026-05-15T20:00:00.000Z",
        "expires_at": "2026-05-15T20:01:00.000Z",
        "accepted_at": null,
        "collected_at": null,
        "in_transit_at": null,
        "delivered_at": null,
        "updated_at": "2026-05-15T20:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1 }
  },
  "message": "Entregas encontradas"
}
```

Estados de UI:
- loading: spinner enquanto busca;
- erro recuperavel: alerta com botao "Tentar novamente" (mapeia `USER_PENDING`, `USER_BLOCKED`, `FORBIDDEN_ROLE`, `STORE_PROFILE_REQUIRED`, `AUTH_REQUIRED`, `INVALID_TOKEN`, `DOMAIN_USER_NOT_FOUND`, `API_URL_MISSING` e falha de rede);
- vazio honesto: mensagem clara, sem dados falsos;
- lista paginada real agrupada por dia, com filtro por status e navegacao Anterior/Proxima; resumo sempre rotulado como "nesta pagina"/"no total" a partir de `pagination`, sem agregado fake.

Fora do escopo atual (M-05):
- aceite no historico da loja, realtime, push, cron, cancelamento, expiracao;
- busca textual, filtro por data;
- qualquer dado de motoboy (a tela informa explicitamente que nao mostra motoboy);
- historico admin/dashboard real.

## Entregas M-06

### Detalhe/acompanhamento real da loja

Tela: `/loja/entregas/[id]`

Uso permitido:
- `GET /api/deliveries/:id` com `Authorization: Bearer <access_token>` obtido do `OperationalShell`.
- Client API `getMyDelivery(accessToken, id)` em `src/lib/api.ts`.
- Tipos `StoreDeliveryDetail`/`StoreDeliveryListItem` em `src/types/delivery.ts`.
- Query enviada: nenhuma. O frontend nunca envia `store_id`, `courier_id` ou `user_id`.
- O frontend nao acessa `delivery_requests`, nao usa `supabase.from`, nao faz polling automatico e nao assina Realtime.

Resposta consumida:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "destination_address": "Endereco de destino",
    "notes": "Observacao opcional",
    "status": "em_transito",
    "created_at": "2026-05-17T12:00:00.000Z",
    "expires_at": "2026-05-17T12:01:00.000Z",
    "accepted_at": "2026-05-17T12:00:20.000Z",
    "collected_at": "2026-05-17T12:02:00.000Z",
    "in_transit_at": "2026-05-17T12:04:00.000Z",
    "delivered_at": null,
    "updated_at": "2026-05-17T12:04:00.000Z"
  },
  "message": "Entrega encontrada"
}
```

Estados de UI:
- loading enquanto busca o detalhe;
- erro recuperavel com botao "Tentar novamente";
- nao encontrado honesto para `DELIVERY_NOT_FOUND`, sem expor se o id e de outra loja;
- detalhe com status real, destino, observacao, `created_at`, `expires_at`, `updated_at` e timeline de `accepted_at`, `collected_at`, `in_transit_at` e `delivered_at`;
- atualizacao manual por botao "Atualizar"; sem `setInterval`, polling automatico, push ou realtime.

Entradas para a tela:
- `/loja/nova-entrega` exibe CTA "Acompanhar entrega" apos criar uma entrega real.
- `/loja/historico` exibe "Abrir entrega" em cada item expandido.

PII preservada:
- a UI nao recebe nem renderiza `store_id`, `courier_id`, nome/documento/foto do motoboy, owner da loja, Storage, tokens ou headers;
- se o produto decidir mostrar dados pessoais do motoboy, isso exige contrato backend novo e validacao de PII antes de entrar no frontend.

Fora desta fatia:
- realtime, push, polling automatico, cancelamento, cron/expiracao automatica, pagamento externo, historico admin, documentos/Storage, GPS/mapa/raio e dados pessoais do motoboy.

## Entregas Fatia 1 - Motoboy

Status frontend nesta fatia: UI real de descoberta e aceite implementada. `src/components/motoboy/FilaDisponivel.tsx` consome `GET /api/deliveries/available` e `POST /api/deliveries/:id/accept` via Bearer token do `OperationalShell`. `src/components/motoboy/CorridaAtiva.tsx` permanece mock e so e renderizado no fluxo demo (`?demo=ativo`/`?demo=solicitacao`); mock e dado real nunca coexistem na mesma arvore. Realtime, push, cron, expiracao automatica, cancelamento e status pos-aceite seguem fora de escopo.

Tela: `/motoboy` (padrao, sem query). Client API em `src/lib/api.ts`: `listAvailableDeliveries(accessToken, { page, limit })` e `acceptDelivery(accessToken, id)`. Tipos em `src/types/delivery.ts`: `AvailableDeliveryItem`, `AvailableDeliveriesQuery`, `AvailableDeliveriesResult`, `AcceptedDelivery`.

Estados de UI:
- loading: spinner enquanto busca a fila;
- vazio honesto: "Nenhuma entrega disponivel agora." + aviso explicito de que a lista nao atualiza sozinha (sem realtime);
- erro recuperavel: `Alert` com "Tentar novamente" mapeando `ALREADY_ACCEPTED`, `DELIVERY_EXPIRED`, `DELIVERY_NOT_FOUND`, `COURIER_OFFLINE`, `COURIER_PROFILE_REQUIRED`, `USER_PENDING`, `USER_BLOCKED`, `FORBIDDEN_ROLE`, `AUTH_REQUIRED`, `INVALID_TOKEN`, `DOMAIN_USER_NOT_FOUND`, `API_URL_MISSING` e falha de rede;
- lista paginada real (limit fixo 20) com `Anterior`/`Proxima` a partir de `pagination`, resumo "nesta pagina"/"no total";
- atualizacao manual via botao "Atualizar"; nao ha polling automatico nem `setInterval` no caminho real;
- aceite: botao por item com lock de estado (`acceptingId`) que desabilita todos os botoes enquanto um aceite esta em voo (anti duplo-clique e anti aceite paralelo); `ALREADY_ACCEPTED`/`DELIVERY_EXPIRED`/`DELIVERY_NOT_FOUND` removem o item e recarregam a lista;
- sucesso: o item sai da lista e a tela exibe confirmacao estatica com `store.name`/`store.address` da resposta; nao ha navegacao para fluxo de corrida.

PII preservada: a UI le e renderiza apenas `store.name` e `store.address`. `destination_address`, `notes`, `store_id`, `courier_id`, `owner_name`, `logo_url` e `description` nao sao recebidos no contrato.

### Descoberta de entregas disponiveis

Contrato backend:
- `GET /api/deliveries/available` com `Authorization: Bearer <access_token>`.
- Apenas usuario de dominio `role=motoboy` e `status=ativo`, com perfil `couriers` e `is_online=true`.
- Query permitida: `page` (>=1, default 1) e `limit` (1..50, default 20). Qualquer outro parametro gera `VALIDATION_ERROR`.
- A resposta lista somente entregas `status='aguardando'`, `courier_id is null` e `expires_at > now()`, filtradas no backend via service role.
- O backend traz `stores(name,address)` no mesmo select; nao ha chamada por item nem acesso direto ao Supabase pelo frontend.

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "status": "aguardando",
        "created_at": "2026-05-16T12:00:00.000Z",
        "expires_at": "2026-05-16T12:01:00.000Z",
        "store": {
          "name": "Nome da loja",
          "address": "Endereco operacional da loja"
        }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1 }
  },
  "message": "Entregas disponiveis encontradas"
}
```

Campos que o motoboy nao recebe neste endpoint:
- `store_id`
- `courier_id`
- `destination_address`
- `notes`
- `owner_name`
- `logo_url`
- `description`
- qualquer PII fora de `store.name` e `store.address`

### Aceite de entrega

Contrato backend:
- `POST /api/deliveries/:id/accept` com `Authorization: Bearer <access_token>`.
- Mesmos guards da descoberta.
- Aceite atomico/idempotente no backend: update condicional por `id`, `status='aguardando'`, `courier_id is null` e `expires_at > now()`.
- Re-aceite pelo mesmo motoboy retorna `200` com estado atual.

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "aceita",
    "accepted_at": "2026-05-16T12:00:20.000Z",
    "created_at": "2026-05-16T12:00:00.000Z",
    "expires_at": "2026-05-16T12:01:00.000Z",
    "store": {
      "name": "Nome da loja",
      "address": "Endereco operacional da loja"
    }
  },
  "message": "Entrega aceita"
}
```

Erros esperados:
- `AUTH_REQUIRED`, `INVALID_TOKEN`, `DOMAIN_USER_NOT_FOUND`
- `USER_PENDING`, `USER_BLOCKED`, `FORBIDDEN_ROLE`
- `COURIER_PROFILE_REQUIRED`, `COURIER_OFFLINE`
- `VALIDATION_ERROR`
- `DELIVERY_NOT_FOUND`
- `ALREADY_ACCEPTED`
- `DELIVERY_EXPIRED`
- `DELIVERY_AVAILABLE_LIST_FAILED`, `DELIVERY_ACCEPT_FAILED`

Fora desta fatia no frontend:
- detalhe pos-aceite real;
- Realtime/Supabase subscription;
- Web Push/VAPID/Service Worker operacional;
- cron/expiracao automatica;
- cancelamento;
- transicoes pos-aceite (`coletada`, `em_transito`, `entregue`);
- confirmacao de pagamento externo, Storage, historico admin e historico do motoboy.

## Entregas Fatia 2 - Motoboy

Status frontend atual: `/motoboy` consulta primeiro o status operacional da Fatia 3. Quando o motoboy esta online, consulta `GET /api/deliveries/active`. Se houver corrida ativa, renderiza `CorridaAtivaReal`. Se nao houver, renderiza `FilaDisponivel`. Apos um aceite bem-sucedido, o frontend consulta novamente `GET /api/deliveries/active` e troca a confirmacao estatica pela tela real da corrida ativa. `CorridaAtiva.tsx` permanece mock e so aparece em `?demo=ativo`/`?demo=solicitacao`.

Tela: `/motoboy` (padrao, sem query). Client API em `src/lib/api.ts`: `getActiveDelivery(accessToken)`. Tipo em `src/types/delivery.ts`: `ActiveDelivery`.

Contrato consumido:
- `GET /api/deliveries/active` com `Authorization: Bearer <access_token>`.
- Apenas usuario de dominio `role=motoboy`, `status=ativo`, com perfil `couriers` e `is_online=true`.
- Query params: nenhum.
- Resposta com corrida ativa ou `data: null`.

Resposta com corrida ativa:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "destination_address": "Endereco de destino",
    "notes": "Observacao opcional",
    "status": "aceita",
    "accepted_at": "2026-05-16T12:00:20.000Z",
    "created_at": "2026-05-16T12:00:00.000Z",
    "expires_at": "2026-05-16T12:01:00.000Z",
    "store": {
      "name": "Nome da loja",
      "address": "Endereco operacional da loja"
    }
  },
  "message": "Corrida ativa encontrada"
}
```

Estados de UI:
- loading inicial: verifica corrida ativa antes de abrir a fila;
- erro recuperavel: alerta com "Tentar novamente" usando o mesmo mapper da fila;
- sem corrida ativa: renderiza a fila real da Fatia 1;
- com corrida ativa: mostra loja, endereco de coleta, destino, observacao, botao manual "Atualizar" e a proxima acao da Fatia 4A;
- nao ha polling automatico, `setInterval`, realtime, push ou cancelamento.

PII:
- pre-aceite continua limitado a `store.name` e `store.address`;
- pos-aceite pode exibir `destination_address` e `notes` somente porque a entrega ja esta atribuida ao motoboy autenticado;
- a UI nao recebe nem renderiza `store_id`, `courier_id`, `owner_name`, `logo_url`, `description`, Storage/documentos ou timestamps de transicao.

### M-06.1 - Loja e endereco no fluxo real do motoboy

Auditoria e regressao sem rota nova, sem acesso direto ao Supabase, sem realtime, push, polling automatico, cron, cancelamento, GPS/mapa novo, Storage ou dados pessoais do motoboy.

Regras de renderizacao no caminho real `/motoboy`:

- Na fila disponivel, `FilaDisponivel` mostra o label `Loja solicitante`, o `store.name` e o endereco operacional `store.address` somente quando ele vem preenchido.
- Na fila disponivel, a UI nao renderiza `destination_address`, `notes`, `store_id`, `courier_id`, `owner_name`, `logo_url`, `description`, documentos, Storage, token, header ou payload sensivel.
- Apos aceite, `MotoboyRealFlow` recarrega a fonte de verdade via `GET /api/deliveries/active`; o payload reduzido de `POST /accept` nao e usado para renderizar destino ou observacoes.
- Na corrida ativa, `CorridaAtivaReal` mostra `Loja solicitante`, o card `Coleta` com `store.address` quando existir, o card `Destino` com `destination_address` somente pos-aceite e observacoes somente quando `notes` tiver texto util.
- Enderecos e observacoes vazios ou compostos apenas por espacos nao geram placeholder, alerta, card vazio, acao de mapa ou texto operacional inventado.

Fora do fluxo atual:
- cancelamento;
- realtime/push/Web Push/VAPID;
- cron/expiracao automatica;
- historico do motoboy;
- historico admin, confirmacao de pagamento externo, Storage/documentos.

## Motoboy Fatia 3 - Status operacional online/offline

Status frontend nesta fatia: `/motoboy` usa `GET /api/couriers/me/status` antes de qualquer chamada de entrega. Se `is_online=false`, renderiza controle "Ficar online" e estado honesto offline; nesse estado nao chama `GET /api/deliveries/active` nem `GET /api/deliveries/available`. Ao ficar online, chama `PATCH /api/couriers/me/status`, entao carrega corrida ativa e, se necessario, a fila. Ao ficar offline, limpa corrida/fila/erros ativos e pausa carregamentos. O fluxo demo `?demo=` permanece isolado.

Tela: `/motoboy` (padrao, sem query). Client API em `src/lib/api.ts`: `getCourierStatus(accessToken)` e `updateCourierStatus(accessToken, isOnline)`. Tipo em `src/types/auth.ts`: `CourierOperationalStatus`.

Contrato consumido:
- `GET /api/couriers/me/status` com `Authorization: Bearer <access_token>`.
- `PATCH /api/couriers/me/status` com `Authorization: Bearer <access_token>` e body strict `{ "isOnline": true }`.
- Apenas usuario de dominio `role=motoboy` e `status=ativo`, com perfil `couriers`.
- O backend deriva `couriers.user_id` pela sessao; o frontend nunca envia `courier_id`.

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "is_online": true,
    "updated_at": "2026-05-16T12:01:00.000Z"
  },
  "message": "Status operacional atualizado"
}
```

Estados de UI:
- loading inicial: verifica status operacional antes de abrir corrida/fila;
- offline: mostra controle de status e aviso de que o app nao consulta corrida ativa nem fila;
- online: mostra controle de status e segue para corrida ativa/fila;
- erro recuperavel no status: alerta com "Tentar novamente" quando nao ha status carregado; erro de atualizacao preserva a tela atual;
- sem polling, `setInterval`, realtime, push ou acesso direto ao Supabase.

PII preservada:
- a resposta de status contem somente `is_online` e `updated_at`;
- a UI nao recebe nem renderiza `id`, `user_id`, `full_name`, documentos, Storage, dados de loja ou entregas neste contrato.

Fora desta fatia:
- geolocalizacao/GPS;
- disponibilidade por raio;
- historico de presenca;
- realtime/push/Web Push/VAPID;
- cron;
- cancelamento, confirmacao de pagamento externo, Storage/documentos.

## Motoboy Fatia 4A - Transicoes pos-aceite

Status frontend nesta fatia: `CorridaAtivaReal` exibe a proxima acao permitida para a corrida ativa. O clique chama `PATCH /api/deliveries/:id/status` via Bearer token e body strict `{ status }`. Ao receber `coletada` ou `em_transito`, a UI atualiza a corrida em tela. Ao receber `entregue`, a corrida sai da tela ativa e o fluxo volta para a fila real.

Tela: `/motoboy` (padrao, sem query). Client API em `src/lib/api.ts`: `updateDeliveryStatus(accessToken, deliveryId, status)`. Tipos em `src/types/delivery.ts`: `ActiveDeliveryStatus`, `DeliveryTransitionStatus` e `DeliveryStatusUpdateResult`.

Contrato consumido:
- `PATCH /api/deliveries/:id/status` com `Authorization: Bearer <access_token>`.
- Body strict: `{ "status": "coletada" | "em_transito" | "entregue" }`.
- Apenas usuario de dominio `role=motoboy`, `status=ativo`, com perfil `couriers`, `is_online=true` e entrega atribuida ao proprio courier.
- O frontend nunca envia `courier_id`, `store_id`, `user_id`, `is_online` ou timestamps.

Estados de UI:
- `aceita`: mostra botao "Confirmar coleta";
- `coletada`: mostra botao "Iniciar transito";
- `em_transito`: mostra botao "Concluir entrega";
- loading de acao: desabilita acao e atualizar para evitar duplo PATCH;
- erro recuperavel: alerta no topo da corrida sem limpar a entrega ativa.

PII preservada:
- pos-aceite pode exibir `destination_address` e `notes` apenas para o courier atribuido;
- a UI nao recebe nem renderiza `store_id`, `courier_id`, `owner_name`, `logo_url`, `description`, Storage/documentos, email, tokens ou timestamps de transicao.

Fora desta fatia:
- cancelamento;
- realtime/push/Web Push/VAPID;
- polling;
- cron/expiracao automatica;
- historico do motoboy;
- historico admin, confirmacao de pagamento externo, Storage/documentos;
- geolocalizacao/GPS e disponibilidade por raio.

## Motoboy Fatia 4B - Historico real

Status frontend nesta fatia: `/motoboy/historico` consome `GET /api/deliveries/history` via Bearer token do `OperationalShell`, substituindo os exemplos visuais por lista real paginada. A tela possui loading, erro recuperavel, vazio honesto, filtro por status do contrato e paginacao real. Em 2026-05-17, o detalhe unico `/motoboy/historico/[id]` foi adicionado como leitura autenticada do proprio historico, sem mutacao e sem ampliar para cancelamento, admin ou pagamento.

Tela: `/motoboy/historico`. Client API em `src/lib/api.ts`: `listCourierHistory(accessToken, { page, limit, status })`. Tipos em `src/types/delivery.ts`: `CourierDeliveryHistoryItem`, `CourierDeliveryHistoryResult` e `ListCourierHistoryQuery`.

Contrato consumido:
- `GET /api/deliveries/history` com `Authorization: Bearer <access_token>`.
- Query strict: `page`, `limit<=50`, `status` opcional.
- Apenas usuario de dominio `role=motoboy`, `status=ativo`, com perfil `couriers`.
- Historico nao exige `is_online=true`.
- O frontend nunca envia `courier_id`, `store_id`, `user_id` ou busca textual.

PII preservada:
- a UI renderiza apenas campos retornados pelo contrato: `status`, `store.name/address`, `destination_address`, `notes` e timestamps operacionais;
- a UI nao recebe nem renderiza `store_id`, `courier_id`, `owner_name`, `logo_url`, `description`, Storage/documentos, email, tokens ou headers.

### Detalhe unico do historico

Tela: `/motoboy/historico/[id]`. Client API em `src/lib/api.ts`: `getCourierHistoryDelivery(accessToken, id)`. Tipo em `src/types/delivery.ts`: `CourierDeliveryHistoryDetail`.

Contrato consumido:
- `GET /api/deliveries/history/:id` com `Authorization: Bearer <access_token>`.
- Params: `id` UUID.
- Query params: nenhum.
- Apenas usuario de dominio `role=motoboy`, `status=ativo`, com perfil `couriers`.
- Historico nao exige `is_online=true`.
- O frontend nunca envia `courier_id`, `store_id`, `user_id`, status, pagina, busca textual ou filtro de data para o detalhe.

Estados de UI:
- loading enquanto busca a corrida;
- erro recuperavel com botao "Tentar novamente";
- nao encontrado honesto para `DELIVERY_NOT_FOUND`, sem expor se o id e de outro courier;
- detalhe com status real, loja, coleta, destino, observacao da loja, `created_at`, `updated_at` e timeline de `accepted_at`, `collected_at`, `in_transit_at` e `delivered_at`;
- atualizacao manual apenas em erro/nao encontrado; sem `setInterval`, polling automatico, push ou realtime.

Entradas para a tela:
- `/motoboy/historico` exibe "Abrir detalhe" em cada item expandido.

PII preservada:
- a UI renderiza apenas os campos do contrato de historico, sem campos internos;
- a UI nao recebe nem renderiza `store_id`, `courier_id`, `owner_name`, `logo_url`, `description`, Storage/documentos, email, `auth_id`, tokens ou headers.

Fora desta fatia:
- busca textual e filtro por data;
- cancelamento;
- realtime/push/Web Push/VAPID;
- polling;
- cron/expiracao automatica;
- historico admin, confirmacao de pagamento externo, Storage/documentos;
- geolocalizacao/GPS e disponibilidade por raio.

## Fluxo principal loja -> motoboy -> loja

A M-06 entrega a tela `/loja/entregas/[id]` consumindo `GET /api/deliveries/:id`, com entrada apos criacao e pelo historico. O caminho minimo loja cria -> motoboy aceita/avanca -> loja acompanha agora existe em REST e UI manual, ainda sem realtime, push, polling automatico, cancelamento, cron ou dados pessoais do motoboy.

## Variaveis permitidas no frontend

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

## Variaveis proibidas no frontend

Qualquer secret privado do backend e proibido no frontend. Os nomes e placeholders dessas variaveis devem ficar documentados apenas no repositorio backend.

## Auth/cadastro M-02B

### Login

Tela: `/login`

Uso permitido:
- Supabase Auth client-side com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `GET /api/auth/me` com `Authorization: Bearer <access_token>` para obter o usuario de dominio.

Redirecionamento local esperado:
- `status != ativo`: `/aguardando-aprovacao`
- `role=admin`: `/admin/usuarios`
- `role=logista`: `/loja`
- `role=motoboy`: `/motoboy`

### Cadastro

Tela: `/registro`

O cadastro chama somente a API backend:
- `POST /api/auth/register/store`
- `POST /api/auth/register/courier`

O frontend nao cria usuarios diretamente no Supabase Auth e nao escreve em tabelas de negocio.

### Status de aprovacao

Tela: `/aguardando-aprovacao`

Consulta a sessao Supabase Auth local e chama `/api/auth/me` quando houver access token.

## Admin M-03/F7 Track A + Insights

Telas:
- `/admin` (redirect server-side para `/admin/usuarios`)
- `/admin/usuarios`
- `/admin/lojas`
- `/admin/motoboys`
- `/admin/aprovacoes` (redirect server-side para `/admin/usuarios?status=pendente`)
- `/admin/insights`

Uso permitido:
- `GET /api/admin/users?page=1&limit=20&role=logista&status=pendente&search=email`
- `GET /api/admin/users/:id`
- `GET /api/admin/insights`
- `PATCH /api/admin/users/:id/approve`
- `PATCH /api/admin/users/:id/block`
- `PATCH /api/admin/users/:id/unblock`

O drawer admin consome `GET /api/admin/users/:id` para enriquecer a aba Perfil com dados administrativos sanitizados de loja/motoboy. As abas de documentos, entregas, pagamento externo e notas continuam estruturais e nao devem chamar endpoints inexistentes.

A listagem `GET /api/admin/users` retorna, por item, os campos de `DomainUser` mais `store_name: string | null` (tipo `AdminUserListItem`). `AdminUsersPanel` exibe a coluna `Loja` com `store_name` (ou `—` quando `null`, caso de `admin`/`motoboy`). A tela nao chama o detalhe por linha (sem N+1) e nao recebe campos de Storage/PII novos.

`/admin/insights` consome `GET /api/admin/insights` com Bearer token de admin ativo. A pagina exibe apenas campos do contrato: contagens por `role/status`, lojas e motoboys ativos, `latest_pending_users.items` limitado pelo backend e `generated_at`. Campos de PII como email, nomes, endereco, perfis e documentos nao fazem parte desta tela.

Campos proibidos no drawer enquanto nao houver pipeline de Storage validado:
- `logo_url`
- `bike_photo_url`
- `license_photo_url`

Contratos backend esperados para proximos ciclos, ainda ausentes:
- `GET /api/admin/users/:id/deliveries?page=1`
- `GET /api/admin/payments`
- `PATCH /api/admin/payments/:id/mark-paid`
- signed URLs para documentos em Storage
- tabela/endpoint de `admin_notes`

Escopo futuro da aba de pagamento: nao existe pagamento integrado no EntregGO. A UI admin deve apenas exibir e confirmar controle interno de pagamento externo de logista/motoboy, usando dados vindos do backend. Fora de escopo: checkout, gateway, PIX, cartao, boleto, repasse, comprovante, carteira, saldo, conciliacao ou exibicao para loja/motoboy. A acao de marcar como pago deve ter loading, bloqueio contra duplo clique, erro recuperavel e nao deve enviar valor financeiro, metodo de pagamento ou dados bancarios.
