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
- `role=admin`: `/admin`
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
