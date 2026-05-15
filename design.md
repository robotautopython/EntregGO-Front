# DESIGN - EntregGO Front

## Direcao Criativa

EntregGO deve parecer uma central de entregas viva: rapida, confiavel e operacional. A marca combina o laranja de movimento com o azul de confianca. O produto nao deve parecer um app generico de dashboard; deve lembrar rota, caixa em movimento, decisao rapida e controle administrativo.

Conceito: **Energia de rua, controle de central.**

## Paleta

- Laranja principal: `#ff5a0a`
- Laranja forte: `#ea4b00`
- Azul rota: `#0b86ff`
- Azul forte: `#0670df`
- Amarelo destaque: `#ffd21f`
- Asfalto: `#0b1220`
- Papel quente: `#fffaf4`
- Linha suave: `#f1e7dc`

Uso:
- Laranja para acao primaria, cadastro, estados de progresso e elementos de velocidade.
- Azul para confianca, status, sessao, links secundarios e contexto operacional.
- Asfalto para comandos fortes, headers internos e contraste premium.
- Papel quente como fundo base para reduzir frieza visual e conectar com a logo.

## Tipografia

- Fonte base: Inter/system, ja configurada em `globals.css`.
- Titulos: peso `900`, linhas curtas, impacto direto.
- Corpo: `16px` a `20px`, `line-height` generoso.
- Labels: claros, sempre visiveis, sem depender de placeholder.

## Layout Global

### Landing `/`

A landing e a porta de entrada do produto e deve cumprir quatro funcoes:

1. Mostrar a marca no primeiro viewport.
2. Explicar rapidamente a promessa: loja, motoboy e admin no mesmo fluxo.
3. Direcionar para `/registro` como acao primaria e `/login` como acao secundaria.
4. Nao prometer recursos fora do escopo atual, como push real, realtime real ou dashboard completo.

Estrutura:
- Header com logo e acoes diretas.
- Hero editorial com logo em marca d'agua e CTA de cadastro/login.
- Faixa de principios operacionais.
- Secao "Rota do sistema" com tres papeis: loja, motoboy e admin.
- Secao escura explicando o plano visual e as fronteiras sensiveis.

### Autenticacao

As rotas `/login`, `/registro` e `/aguardando-aprovacao` usam o mesmo clima visual:

- Fundo papel quente.
- Cartao unico de formulario, sem cards aninhados.
- Laranja para cadastro/API.
- Azul para sessao/Supabase Auth.
- Asfalto para comando final quando a decisao for sensivel.

### Paineis Internos

Admin, loja e motoboy seguem uma interface de operacao, nao marketing:

- Topbar compacta com status.
- Sidebar ou rail lateral em desktop.
- Conteudo denso, escaneavel e com filtros claros.
- Cards apenas para itens repetidos, resumos e modais.
- Tabelas/listas com paginacao ou limite antes de qualquer volume real.
- Fluxos de entrega sem backend real devem ser tratados como previa, simulacao ou demonstracao.

## Componentes Esperados

- `BrandHeader`: logo, login, cadastro, status.
- `RoleRoute`: bloco visual para loja/motoboy/admin.
- `StatusBadge`: status `pendente`, `ativo`, `bloqueado`.
- `ActionButton`: variantes `primary`, `secondary`, `dark`.
- `OperationalShell`: layout atual dos paineis internos.
- `ComingSoonPanel`: placeholder honesto para telas sem endpoint real.

## Regras de UX

- Uma acao primaria por tela.
- Todos os botoes com alvo minimo de `44px`.
- Foco visivel sempre ativo.
- Contraste AA entre texto e fundo.
- Animacoes apenas em `transform` e `opacity`.
- Respeitar `prefers-reduced-motion`.
- Nada de dashboard fake antes do ciclo real.
- Nada de push/realtime/aceite concorrente prometido como real antes do backend correspondente.

## Regras de Seguranca

- Nenhum secret privado no frontend.
- Landing pode apontar para cadastro/login, mas nao bypassa aprovacao.
- Dados de negocio continuam via API backend.
- Supabase no frontend somente para Auth/Realtime documentados.
- Nao exibir dados sensiveis em HTML, `data-*`, `aria-label` ou logs.

## Plano Surpreendente

1. **Agora:** landing de marca com rota operacional, CTAs reais de auth e copy honesta sobre recursos futuros.
2. **Concluido:** `/login`, `/registro`, admin, loja e motoboy usam o mesmo sistema visual e `OperationalShell`.
3. **Proximo ciclo backend:** implementar entrega real, push/realtime e aceite concorrente somente com Security/Performance Validator.
4. **Antes de PWA real:** redesenhar estado offline/instalavel com Security Validator.
5. **Quando dashboard existir:** usar visual de "torre de controle", com listas densas, status claros e alertas sem excesso decorativo.

## Arquivos Relevantes

- `src/app/page.tsx`: landing page.
- `src/app/globals.css`: tokens globais.
- `tailwind.config.ts`: paleta Tailwind.
- `public/brand/entreggo-logo.png`: logo oficial usada na UI.
- `src/components/auth/AuthShell.tsx`: base visual de login/cadastro.
- `src/components/shell/OperationalShell.tsx`: shell atual dos paineis internos.
- `src/components/shared/ComingSoonPanel.tsx`: placeholder alinhado com a paleta e com contratos ausentes.
- `src/components/loja/NovaEntregaFlow.tsx`: fluxo visual demonstrativo ate existir backend de entregas.
- `src/components/motoboy/CourierHomeFlow.tsx`: fluxo visual demonstrativo ate existir push/realtime/aceite real.
