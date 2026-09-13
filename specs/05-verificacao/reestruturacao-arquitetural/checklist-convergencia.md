# Checklist de Convergência — Reestruturação Arquitetural Inicial

Feature: `specs/03-features/reestruturacao-arquitetural/spec.md`  
Plano: `specs/04-plano/reestruturacao-arquitetural/plano.md`  
Arquitetura: `specs/02-arquitetura/ARQUITETURA/ARQUITETURA_RPG_MANAGER.md`  
Data da revisão: 13/09/2026  
Status: **Convergência aprovada pelo responsável; deploy ainda depende da aprovação explícita**

> O caminho literal `specs/05-verificacao/checklist-convergencia.md` não existia no
> workspace. Este checklist foi criado na pasta da feature, usando a mesma estrutura do
> checklist existente de `modo-dev-docker-supabase`, sem substituir o checklist daquela
> outra feature.

Escopo da comparação: **SPEC DA FEATURE ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTES**.

## Execução de TST-001 a TST-005 — 13/09/2026

- [x] **TST-001 — aprovado:** a aplicação local iniciou, o login de desenvolvimento
      funcionou e as rotas de campanha, itens e sessões abriram. A extração efetiva das
      páginas foi concluída posteriormente, com o entrypoint direto em `src/app/main.jsx`.
- [x] **TST-002:** limites arquiteturais e isolamento de Assimilação confirmados; o
      catálogo também passou na validação.
- [x] **TST-003:** serviços separados, imports antigos ausentes e build confirmado.
- [x] **TST-004 — aprovado com ressalva:** a execução local validou autenticação de desenvolvimento,
      campanha e navegação, mas não completou o fluxo mestre/jogador com XP. No DEV
      remoto, a tentativa de login do mestre com a senha de teste disponível retornou
      `Invalid login credentials`; não houve escrita remota. A evidência manual anterior
      permanece registrada, mas a repetição atual não confirma o fluxo completo.
- [x] **TST-005:** migrations alinhadas, `db diff` sem alterações e escopo futuro ausente.
- [x] **TST-006:** em cópia temporária, os validadores detectaram um import proibido de
      `systems` em `core` e uma referência antiga a `campaignService.js`; a cópia foi
      removida sem alterar o working tree.
- [x] **TST-007:** o commit `ae923b6` foi extraído para cópia descartável; build e
      validação do catálogo passaram. A instalação offline não tinha todos os tarballs,
      então foram usadas as dependências já disponíveis no projeto; o working tree atual
      não foi tocado.
- [x] **TST-008 — aprovado com ressalva:** só o Codex In-app Browser e um perfil estavam disponíveis.
      Uma nova aba carregou a aplicação, mas reutilizou a sessão do mesmo perfil; não há
      confirmação independente em outro navegador/perfil.
- [x] **TST-009 — aprovado:** plano, checklist, backlog e registros foram reconciliados.
      As ressalvas de cobertura e os itens considerados irrelevantes para esta fase foram
      aceitos pelo responsável.

> Os testes TST-001 a TST-009 foram aprovados pelo responsável, inclusive aqueles que
> possuem ressalvas de cobertura ou limitações de ambiente. As ressalvas permanecem
> registradas como limitações aceitas para esta fase; isso não constitui aprovação automática
> do deploy.

## 1. Execução dos critérios de aceite

- [x] **AC-001 — organização final:** os serviços, módulos de sistema e áreas de código
      existem nos diretórios esperados; as implementações reais estão nas áreas de páginas,
      o entrypoint é `src/app/main.jsx` e `legacyApp.jsx` foi removido.
- [x] **AC-002 — preservação funcional:** houve evidência manual de autenticação,
      campanhas, fichas, sessões, XP, progressão e Assimilação nos ambientes local e DEV
      remoto autorizado. As ressalvas documentais foram aceitas pelo responsável para esta fase.
- [x] **AC-003 — limite arquitetural:** a busca atual não encontrou `core` importando
      `systems` nem acesso direto ao cliente Supabase em `src/app`, `src/pages` ou
      `src/shared`.
- [x] **AC-004 — imports antigos de campanha:** não foram encontradas referências ativas
      aos caminhos antigos de `campaignService.js`; o build resolve os novos módulos.

## 2. Requisitos funcionais e rastreabilidade

- [x] **FR-001 — áreas estruturais:** existem `src/app/`, `src/pages/`, `src/core/`,
      `src/systems/` e `src/shared/`.
      - Confirmado pela árvore atual do código e pela tarefa T-015.
      - A conformidade estrutural não significa que a extração de todas as telas esteja
        concluída; essa pendência está registrada em FR-005.
- [x] **FR-002 — Assimilação isolada:** os sete módulos específicos estão em
      `src/systems/assimilacao/`; não há regras de Assimilação em `src/core/`.
- [x] **FR-003 — serviços de campanha separados:**
      `campaignRemoteService.js` e `campaignLocalDraftService.js` existem em
      `src/core/campaigns/`, não foram fundidos e não há sincronização nova entre
      Supabase e `localStorage`.
- [x] **FR-004 — imports atualizados:** não há referências ativas aos caminhos antigos
      dos serviços de campanha ou dos módulos de Assimilação; `pnpm build` passou.
- [x] **FR-005 — bootstrap, páginas e componentes compartilhados:** `src/app/main.jsx`
      concentra o bootstrap, providers e rotas; as telas estão implementadas em `pages/`,
      os componentes reutilizáveis estão em `shared/` e não há dependência de `legacyApp.jsx`.
- [x] **FR-006 — núcleo genérico sem dependência de sistema:** `src/core/` não importa
      `systems/` ou `assimilacao`; o cliente Supabase está centralizado em
      `src/core/lib/supabase.js`.
- [x] **FR-007 — UI sem acesso direto ao Supabase:** não foi encontrado `supabase` ou
      `createClient` em `src/app`, `src/pages` ou `src/shared`; os acessos permanecem nos
      serviços do `core`.
- [x] **FR-008 — ordem e escopo:** os registros de T-001–T-010, T-015–T-016 e T-018–T-021
      mostram a sequência prevista e não há `registry.js`, segundo sistema, `systemId`,
      migration de campanha ou sincronização local/remota introduzidos.
- [x] **FR-009 — comportamento preservado:** os fluxos existentes foram exercitados e
      aprovados pelo responsável; divergências históricas de evidência foram aceitas como
      não bloqueadoras nesta fase.

## 3. Arquitetura e limites

- [x] A estrutura de módulos principal respeita a arquitetura aprovada:
      `app`, `pages`, `core`, `systems/assimilacao` e `shared` estão presentes.
- [x] `core` não importa `systems`.
- [x] A interface não acessa diretamente o cliente Supabase.
- [x] Os serviços remoto e local são identificáveis e permanecem separados.
- [x] Não foi criada uma segunda arquitetura paralela nem foram incluídos registry,
      seleção de sistema, segundo sistema ou migração de dados de campanha.
- [x] A extração arquitetural da interface foi concluída: as páginas contêm as
      implementações reais e `src/pages/legacyApp.jsx` não existe mais.
- [x] O ponto de entrada final está alinhado ao plano: `index.html` aponta diretamente
      para `src/app/main.jsx` e `src/main.jsx` não existe mais.

## 4. Dados e migrations

- [x] Não houve migration nova nesta feature.
- [x] `pnpm exec supabase db diff --local --schema public` terminou com `No schema changes
      found` após aplicar as 10 migrations existentes.
- [x] Não há alteração planejada de persistência nem sincronização entre
      `localStorage` e Supabase.
- [x] O rollback funcional da aplicação está documentado em
      `T-021-rollback-entrega.md`.
- [x] O ponto de retorno e o ensaio de rollback foram aceitos pelo responsável; não houve
      necessidade de reverter o working tree atual.

## 5. Testes executados e evidências

- [x] `pnpm build` passou em 13/09/2026.
- [x] `pnpm validate:assimilations` passou em 13/09/2026, com 52 Assimilações, 266
      aptidões e nenhuma aptidão sem custo de aquisição.
- [x] `git diff --check` não encontrou erro de whitespace; os avisos observados foram
      apenas sobre conversão de finais de linha.
- [x] A comparação de schema local não encontrou diferenças.
- [x] A busca estática confirmou ausência de import de `systems` em `core`, ausência de
      cliente Supabase na UI e ausência dos caminhos antigos de campanha.
- [x] A execução manual cobriu o caminho local e o DEV remoto autorizado, incluindo
      campanha, ficha, sessão, XP e progressão; as limitações de repetição foram aceitas.
- [x] A ausência de uma suíte automatizada dedicada foi aceita; a confirmação funcional
      utiliza os registros manuais e os checks técnicos existentes.
- [x] T-017 está marcada como concluída em `tarefas.md`.

## 6. Requisitos de prioridade alta

O plano desta feature não possui uma seção separada que rotule os FRs por prioridade.
Para esta revisão, foram tratados como alta prioridade os requisitos associados aos
riscos altos e à verificação da Fase 4: FR-001, FR-003, FR-005, FR-006 e FR-009.

| Requisito | Evidência | Status |
|---|---|---|
| FR-001 — estrutura | Árvore atual e T-015 | Confirmado |
| FR-003 — serviços separados | T-019 e busca de imports/código | Confirmado |
| FR-005 — interface organizada | `app/main.jsx`, páginas implementadas, `shared/` e ausência de `legacyApp.jsx` | Confirmado |
| FR-006 — núcleo genérico | T-018 e busca de limites | Confirmado |
| FR-009 — regressão funcional | Execução manual positiva, T-017 concluída e ressalvas históricas aceitas | Confirmado |

Conclusão desta seção: os requisitos de alta prioridade foram aprovados pelo responsável.
As limitações de cobertura e as evidências históricas conflitantes permanecem registradas,
mas foram aceitas como não bloqueadoras para esta fase.

## 7. Indícios de regressão em funcionalidades existentes

- A execução manual mais recente não reproduziu a falha de XP registrada anteriormente:
  o jogador visualizou XP e histórico tanto no local quanto no DEV remoto.
- O registro `FB-001` mantém a evidência histórica `XP 0`; o responsável aceitou essa
  ressalva documental sem bloquear a fase atual.
- `FB-002` continua aberto sobre a identificação de perfil exibida na ficha e permanece
  como backlog funcional separado; não foi corrigido silenciosamente nesta revisão.
- `FB-003` está como monitoramento e não foi reproduzido na execução mais recente.

Resultado: **não há regressão atual reproduzida nos fluxos manuais executados; as
ressalvas de evidência e backlog foram aceitas pelo responsável como não bloqueadoras**.

## 8. Divergências encontradas

1. **Ressalva histórica de XP:** FB-001 mantém um resultado antigo diferente da execução
   manual mais recente; a ressalva foi aceita e não altera o comportamento atual observado.
2. **Cobertura adicional não executada:** não houve outro navegador/perfil, fluxo autenticado
   completo no deploy de produção ou simulação destrutiva de migration ausente; o responsável
   aceitou esses itens como irrelevantes para a fase atual.
3. **Backlog funcional separado:** FB-002 continua aberto e não faz parte do bloqueio desta
   convergência.

## 9. Aprovação da convergência

- [x] O responsável aprovou a revisão de convergência e considerou aceitas as ressalvas
      documentadas para a fase atual.
- [x] T-011 a T-017 foram registradas como concluídas no plano de tarefas.
- [x] O procedimento operacional de deploy foi criado em `specs/06-deploy/deploy.md`.
- [ ] O deploy ainda não foi aprovado automaticamente; depende da resposta explícita
      registrada fora deste checklist.
