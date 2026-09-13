# Tarefas — Reestruturação Arquitetural Inicial

Plano relacionado: `specs/04-plano/reestruturacao-arquitetural/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia os requisitos da Feature e possui uma verificação objetiva de conclusão.

## Fase 1 — Base

- [x] T-001 [FR-009] Registrar o baseline funcional antes da migração
  - Arquivos/módulos: fluxos atuais do projeto; `package.json`; `src/`
  - Verificação: executar o build e a validação existente do catálogo; registrar o resultado e confirmar os fluxos atuais de autenticação, campanhas, fichas, sessões, XP e progressão.

- [x] T-002 [FR-001] Criar a estrutura de diretórios aprovada
  - Arquivos/módulos: `src/app/`, `src/pages/`, `src/core/`, `src/systems/`, `src/shared/`
  - Verificação: conferir que as pastas existem conforme a Spec de Arquitetura e que nenhuma estrutura alternativa foi criada.

- [x] T-003 [FR-003] Renomear e mover o serviço remoto de campanha
  - Arquivos/módulos: `src/services/campaignService.js` → `src/core/campaigns/campaignRemoteService.js`
  - Verificação: confirmar que o arquivo remoto está no novo caminho, mantém suas chamadas remotas e não foi fundido com o serviço local.

- [x] T-004 [FR-003] Renomear e mover o serviço de rascunho local
  - Arquivos/módulos: `src/campaignService.js` → `src/core/campaigns/campaignLocalDraftService.js`
  - Verificação: confirmar que o serviço continua responsável pelos dados locais e que não contém chamadas novas de sincronização com o Supabase.

- [x] T-005 [FR-004] Atualizar imports dos serviços de campanha
  - Arquivos/módulos: todos os consumidores dos dois `campaignService.js`
  - Verificação: busca por referências aos caminhos antigos não retorna imports ativos; o build não acusa módulo ausente.

## Fase 2 — Lógica principal

- [x] T-006 [FR-002] Mover os módulos específicos de Assimilação
  - Arquivos/módulos: `assimilationDice.js`, `assimilationsCatalog.js`, `characteristicsCatalog.js`, `characterCreation.js`, `initialAssimilation.js`, `inventoryCatalog.js`, `rollHistory.js` → `src/systems/assimilacao/`
  - Verificação: os sete módulos estão no novo diretório, seus imports foram atualizados e nenhum deles foi movido para `core/`.

- [x] T-007 [FR-004] Atualizar imports dos módulos de Assimilação
  - Arquivos/módulos: consumidores dos módulos específicos, principalmente a composição da aplicação
  - Verificação: não existem referências ativas aos caminhos antigos dos sete módulos e o build continua resolvendo todos os imports.

- [x] T-008 [FR-006] Mover o núcleo genérico para `core/`
  - Arquivos/módulos: autenticação, cliente Supabase e serviços genéricos de `src/auth/`, `src/lib/` e `src/services/`
  - Verificação: os módulos genéricos estão em `core/` conforme a arquitetura; os serviços remoto/local permanecem separados.

- [x] T-009 [FR-006] Ajustar imports do núcleo genérico
  - Arquivos/módulos: consumidores de `AuthProvider`, cliente Supabase, `authService` e `sessionService`
  - Verificação: busca por caminhos antigos não retorna imports ativos e o build resolve autenticação, campanhas e sessões.

- [x] T-010 [FR-006] Verificar os limites entre `core` e `systems`
  - Arquivos/módulos: todos os arquivos em `src/core/` e `src/systems/`
  - Verificação: nenhuma importação de `systems/` parte de `core/`; regras de Assimilação permanecem fora do núcleo.

## Fase 3 — Interface

- [x] T-011 [FR-005] Criar o bootstrap em `app/main.jsx`
  - Arquivos/módulos: `src/main.jsx` → `src/app/main.jsx`
  - Verificação: `app/main.jsx` concentra apenas bootstrap, providers e rotas; a aplicação continua iniciando pelo mesmo ponto configurado.

- [x] T-012 [FR-005] Extrair as telas existentes para `pages/`
  - Arquivos/módulos: telas correspondentes a `Login/`, `Campaigns/`, `CampaignCreate/`, `CampaignJoin/` e `CharacterSheet/`
  - Verificação: cada tela extraída pode ser acessada pelos mesmos fluxos atuais, sem introduzir seleção de sistema ou outro comportamento novo.

- [x] T-013 [FR-005] Extrair componentes compartilhados para `shared/`
  - Arquivos/módulos: componentes usados por duas ou mais telas e estilos/assets relacionados
  - Verificação: somente componentes realmente reutilizados são colocados em `shared/`; não há regra específica de Assimilação adicionada ao diretório.

- [x] T-014 [FR-007] Remover acessos diretos da interface ao cliente Supabase
  - Arquivos/módulos: páginas, componentes e módulos de UI
  - Verificação: busca nos módulos de UI não encontra uso direto de `supabase.js`; os acessos passam por serviços do `core` ou do módulo do sistema.

## Fase 4 — Testes

- [x] T-015 [FR-001] Verificar a estrutura final contra a arquitetura aprovada
  - Arquivos/módulos: `src/app/`, `src/pages/`, `src/core/`, `src/systems/`, `src/shared/`
  - Verificação: comparar a árvore final com `specs/02-arquitetura/ARQUITETURA/ARQUITETURA_RPG_MANAGER.md` e corrigir qualquer divergência.

- [x] T-016 [FR-004] Executar build e validações técnicas
  - Arquivos/módulos: projeto inteiro; scripts definidos em `package.json`
  - Verificação: `pnpm build` e `pnpm validate:assimilations` concluem sem erro.

- [x] T-017 [FR-009] Regressar os fluxos funcionais existentes
  - Arquivos/módulos: autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação
  - Verificação: executar os cenários do baseline e confirmar que os resultados observáveis permanecem equivalentes.

- [x] T-018 [FR-006] Verificar violações de limite arquitetural
  - Arquivos/módulos: imports em `core/`, `systems/`, `pages/` e `shared/`
  - Verificação: não há `core` importando `systems`, UI acessando o cliente Supabase diretamente ou regras de Assimilação fora do módulo próprio.

- [x] T-019 [FR-003] Verificar a separação dos serviços remoto e local
  - Arquivos/módulos: `core/campaigns/campaignRemoteService.js` e `core/campaigns/campaignLocalDraftService.js`
  - Verificação: cada fluxo continua usando o serviço correspondente e nenhum serviço foi apagado, fundido ou conectado a uma sincronização nova.
  - Evidência: `T-019-verificacao-servicos.md`

## Fase 5 — Entrega

- [x] T-020 [FR-008] Revisar a ordem e o escopo da migração
  - Arquivos/módulos: plano, tarefas e diff da implementação
  - Verificação: confirmar que as Fases 0–3 foram executadas na ordem e que seleção de sistema, registry, migration de banco e segundo sistema não foram incluídos.
  - Evidência: `T-020-revisao-escopo.md`

- [x] T-021 [FR-009] Preparar ponto de rollback e entrega
  - Arquivos/módulos: histórico da implementação e configuração de deploy
  - Verificação: registrar o ponto anterior à migração, confirmar que o build de entrega passa e documentar como retornar ao estado anterior se a regressão for identificada.
  - Evidência: `T-021-rollback-entrega.md`

## Adiado (fora do escopo desta rodada)

- [ ] Especificar e implementar a seleção explícita de sistema ao criar campanha.
- [ ] Criar `systems/registry.js` e persistir o sistema em campanhas novas.
- [ ] Implementar um segundo sistema de RPG.
- [ ] Migrar campanhas antigas para um identificador de sistema.
- [ ] Sincronizar `localStorage` com Supabase.
- [ ] Criar novos Registros de Decisão caso a implementação revele uma mudança de limite ou de persistência não coberta pelas decisões aprovadas.
