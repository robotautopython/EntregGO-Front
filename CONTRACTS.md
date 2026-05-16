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
    "store_id": "uuid",
    "destination_address": null,
    "notes": "Observacao opcional",
    "status": "aguardando",
    "courier_id": null,
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
- aceite, realtime, push, cron, cancelamento, expiracao;
- detalhe unico, busca textual, filtro por data;
- qualquer dado de motoboy (a tela informa explicitamente que nao mostra motoboy);
- historico admin/dashboard real.

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

O drawer admin consome `GET /api/admin/users/:id` para enriquecer a aba Perfil com dados administrativos sanitizados de loja/motoboy. As abas de documentos, entregas, pagamento e notas continuam estruturais e nao devem chamar endpoints inexistentes.

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
