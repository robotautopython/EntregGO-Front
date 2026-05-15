# STRUCTURE - EntregGO Front

Estrutura planejada para o frontend antes da instalacao de dependencias.

```txt
public/
  brand/                    # logo e assets oficiais da marca
  icons/                    # icones PWA futuros
  sounds/                   # sons de notificacao futuros
src/
  app/
    admin/                  # area administrativa
    aguardando-aprovacao/   # estado de conta pendente/bloqueada
    login/                  # login
    loja/                   # painel da loja
    motoboy/                # painel do motoboy
    registro/               # cadastro
  components/
    admin/                  # componentes do painel admin
    delivery/               # componentes de entregas
    landing/                # componentes da landing page
    layout/                 # layout, sidebar e topbar
    shared/                 # componentes compartilhados
    ui/                     # base shadcn/ui futura
  hooks/                    # hooks React
  lib/                      # clients e helpers do frontend
  styles/                   # estilos globais
  types/                    # tipos compartilhados do frontend
tests/                      # testes automatizados futuros
design.md                   # direcao visual, tokens, layout e plano de evolucao
```

Pastas ainda vazias devem manter `.gitkeep` ate receberem arquivos reais.
