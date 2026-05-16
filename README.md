# EntregGO Front

Frontend web do EntregGO, responsavel pela landing page, paineis de admin, loja e motoboy, PWA e consumo da API REST do backend.

## Estado atual

Fase de fundacao/auth-operacao com Next.js `15.5.18`, React `19.2.6`, auth/cadastro minimo, direcao visual inicial, painel admin operacional sobre os contratos backend M-02A/Track B e criacao de entrega pela loja via `POST /api/deliveries` com endereco de destino opcional. O admin lista usuarios, aprova/bloqueia/desbloqueia, possui paginas segmentadas por papel/status, drawer com perfil expandido sanitizado e insights minimos via `GET /api/admin/insights`. `/admin` e `/admin/aprovacoes` existem apenas como redirects para a rota canonica de usuarios. Ainda nao possui dashboards complexos, aceite concorrente, historico real de entregas, push real, realtime real ou suite de testes.

## Responsabilidades

- Renderizar a experiencia web dos usuarios.
- Consumir dados de negocio pela API REST do backend.
- Usar Supabase Auth e Realtime apenas conforme documentado.
- Manter apenas variaveis publicas com prefixo `NEXT_PUBLIC_`.
- Preparar base para PWA e Service Worker em etapa futura.
- Manter a identidade visual descrita em `design.md`.

## Design

O layout usa a logo oficial em `public/brand/entreggo-logo.png`, com foco em laranja e azul. A landing em `/` e o ponto inicial para cadastro e login.

Documento base: `design.md`.

## Fora da fundacao atual

- Implementar push real, realtime real ou dashboard complexo.
- Implementar aceite concorrente, listagem/historico de entregas, cron de expiracao ou notificacao para motoboys.
- Exibir documentos/CNH/fotos sem pipeline backend de Storage com signed URLs e Security Validator.
- Marcar pagamentos como pagos sem endpoints backend, auditoria e persistencia.
- Inserir secrets reais ou variaveis privadas.

## Comandos

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run lint` (`next lint` segue ativo, mas esta deprecado no Next 15 e deve ser substituido antes de Next 16)

## Proximo passo

Aceite, listagem/historico de entregas, realtime, push, cron, pagamentos e documentos dependem de endpoints backend e validadores especializados antes de virar UI funcional. Dashboards mais ricos devem passar por Performance Validator antes de novas agregacoes, cache, polling ou listas grandes. PWA/Service Worker real deve aguardar Security Validator e acompanhamento do residual moderado de auditoria em Next/PostCSS.
