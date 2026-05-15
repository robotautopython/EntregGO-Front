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
