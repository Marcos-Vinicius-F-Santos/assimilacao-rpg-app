# Plano de Ação Final — Extração de `legacyApp.jsx`

Feature relacionada: `specs/03-features/reestruturacao-arquitetural/spec.md`  
Plano relacionado: `specs/04-plano/reestruturacao-arquitetural/plano.md`  
Tarefas relacionadas: T-011, T-012, T-013, T-014 e T-017  
Status: Aprovado; extração estrutural concluída e ressalvas de regressão aceitas para esta fase

## 1. Objetivo

Concluir a Fase 3 da reestruturação arquitetural, extraindo as implementações de interface que ainda estão concentradas em `src/pages/legacyApp.jsx` para `src/pages/` e `src/shared/`, mantendo o comportamento atual do produto.

Ao final, `legacyApp.jsx` não deve mais ser uma dependência da aplicação. A extração deve eliminar a ponte de reexportação, preservar os fluxos existentes e deixar `src/app/main.jsx` responsável somente pelo bootstrap, providers e rotas.

Este plano não adiciona funcionalidade de produto, não altera regras de Assimilação e não inclui deploy ou migração de banco.

## 2. Situação atual confirmada

`src/pages/legacyApp.jsx` ainda contém implementações ativas de autenticação, campanhas, criação de personagem, fichas, progressão, inventário, sessões e componentes de interface.

As páginas novas ainda são fachadas que reexportam componentes do legado:

- `src/pages/Login/index.jsx` reexporta telas de autenticação.
- `src/pages/Campaigns/index.jsx` reexporta telas de campanhas.
- `src/pages/CampaignCreate/index.jsx` reexporta `CharacterCreationPage`.
- `src/pages/CharacterSheet/index.jsx` reexporta telas de personagens, progressão, ficha e inventário.

Além disso:

- `src/app/main.jsx` ainda importa `persistStartingEquipment` de `../pages/legacyApp`.
- `index.html` ainda inicia a aplicação por `/src/main.jsx`.
- `src/main.jsx` funciona como uma ponte que importa `./app/main`.
- `src/shared/ui.jsx` já contém `Sidebar` e `Topbar`, mas outros componentes compartilháveis ainda permanecem no legado.

Conclusão: a arquitetura foi iniciada, mas a extração das telas ainda não foi concluída. T-011 a T-014 e T-017 continuam sendo o escopo pendente desta ação.

## 3. Escopo

### Incluído

- Transformar as fachadas em módulos de página com implementações reais.
- Separar as telas por responsabilidade nas áreas já aprovadas:
  - `src/pages/Login/`
  - `src/pages/Campaigns/`
  - `src/pages/CampaignCreate/`
  - `src/pages/CampaignJoin/`
  - `src/pages/CharacterSheet/`
- Manter em `src/shared/` somente componentes realmente utilizados por duas ou mais telas.
- Remover a dependência de páginas e do bootstrap em `legacyApp.jsx`.
- Preservar os serviços existentes de `core/` e os módulos de `systems/assimilacao/`.
- Atualizar o entrypoint para que o bootstrap aprovado seja efetivamente `src/app/main.jsx`.
- Executar as verificações arquiteturais, build e regressão dos fluxos existentes.

### Fora do escopo

- Criar novas funcionalidades de campanha, personagem, sessão, XP ou progressão.
- Alterar permissões, regras de XP ou regras de Assimilação.
- Criar seleção de sistema, `systems/registry.js` ou um segundo sistema de RPG.
- Criar ou alterar migrations do Supabase.
- Sincronizar `localStorage` com Supabase.
- Fazer refatoração de regras de negócio que não seja necessária para separar os módulos.
- Alterar o deploy de produção.

## 4. Decisões aprovadas antes da execução

Estas decisões foram aprovadas antes da execução e definem as fronteiras da arquitetura.

### D-EXTRAÇÃO-01 — Destino de `persistStartingEquipment`

Hoje a função está em `legacyApp.jsx`, é chamada durante a criação de personagem e grava o equipamento inicial no armazenamento local. O plano deve movê-la para um módulo de responsabilidade local já existente ou mantê-la como um helper específico da tela de criação, sem criar sincronização nova.

Decisão aprovada: mover a persistência para o módulo de suporte local do sistema de Assimilação relacionado a inventário/criação de personagem, deixando a página responsável apenas por orquestrar a chamada. O módulo não importa UI, não depende de `legacyApp.jsx` e não cria comunicação remota.

Registro: se a escolha alterar o limite definido para `core`, `pages` ou `systems`, criar um Registro de Decisão usando `specs/02-arquitetura/DECISAO/_TEMPLATE.md` antes de codificar.

### D-EXTRAÇÃO-02 — Entrypoint final

Hoje `index.html` aponta para `src/main.jsx`, que apenas importa `src/app/main.jsx`.

Decisão aprovada: fazer `index.html` apontar diretamente para `/src/app/main.jsx` e remover a ponte `src/main.jsx` após validar build e inicialização.

Registro: manter a ponte durante uma etapa intermediária não exige nova decisão; mantê-la como solução final deverá ser justificado no Registro de Decisão se contrariar a arquitetura aprovada.

## 5. Estratégia de execução

Cada etapa deve ser pequena, compilável e verificável antes da seguinte. Nenhuma etapa deve alterar comportamento de produto.

### Etapa 0 — Baseline e proteção

1. Preservar o estado atual de trabalho em um ponto recuperável sem descartar alterações existentes.
2. Executar `pnpm build` e `pnpm validate:assimilations`.
3. Registrar a busca inicial por referências a `legacyApp`, aos caminhos antigos e ao entrypoint.
4. Confirmar os fluxos que serão usados na regressão: autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação.

Saída: baseline registrado e nenhuma alteração de código nesta etapa.

### Etapa 1 — Inventário e contratos de importação

1. Mapear cada export de `legacyApp.jsx` para sua página ou componente de destino.
2. Separar funções de tela, componentes compartilhados, helpers de persistência local e chamadas de serviços.
3. Identificar dependências cruzadas entre telas antes de mover qualquer implementação.
4. Confirmar que as páginas continuarão usando os serviços de `core/` e os módulos de `systems/assimilacao/`, sem acesso direto ao cliente Supabase.

Saída: mapa de extração revisável; nenhum comportamento novo.

### Etapa 2 — Extração de autenticação e campanhas

1. Mover as telas de autenticação para `src/pages/Login/`.
2. Mover as telas de lista, criação/gerenciamento e subseções da campanha para `src/pages/Campaigns/`.
3. Mover o fluxo de criação de personagem para `src/pages/CampaignCreate/`.
4. Manter `CampaignJoin/` alinhado ao fluxo já existente, sem criar uma operação de entrada que não exista hoje.
5. Atualizar `src/app/main.jsx` para importar as implementações dos novos módulos.
6. Remover os reexports correspondentes de `legacyApp.jsx` somente depois que os imports reais estiverem funcionando.

Verificação intermediária: build, busca de imports inválidos e acesso manual aos fluxos de login, lista de campanhas, campanha e criação de personagem.

### Etapa 3 — Extração de personagens, ficha e progressão

1. Mover as telas de personagens pessoais e de campanha para `src/pages/CharacterSheet/`.
2. Mover a ficha, inventário e progressão para o mesmo domínio de página, mantendo componentes internos separados quando isso reduzir acoplamento.
3. Preservar as regras atuais de XP: recebimento após o fechamento da sessão e uso somente no momento permitido pelo comportamento existente.
4. Manter as chamadas de Assimilação nos módulos de `src/systems/assimilacao/`.

Verificação intermediária: build e execução dos fluxos de personagem, ficha, inventário, XP, progressão e Assimilação.

### Etapa 4 — Extração de componentes compartilhados e persistência local

1. Manter `Sidebar` e `Topbar` em `src/shared/`.
2. Mover para `src/shared/` somente componentes sem regra de uma tela específica e usados por duas ou mais telas.
3. Não mover regras de Assimilação, chamadas de serviço ou estado específico de campanha para `shared`.
4. Aplicar a decisão aprovada para `persistStartingEquipment`.
5. Atualizar todos os consumidores e remover a importação de `persistStartingEquipment` a partir de `legacyApp.jsx`.

Verificação intermediária: busca de dependências, build e confirmação de que `shared` não importa `core` de forma indevida, não importa `systems` para executar regra de domínio e não acessa Supabase diretamente.

### Etapa 5 — Remoção da ponte e fechamento de T-011 a T-014

1. Fazer o entrypoint final seguir a decisão D-EXTRAÇÃO-02.
2. Remover as fachadas que ainda reexportam de `legacyApp.jsx`.
3. Confirmar que nenhum arquivo ativo em `src/` importa `legacyApp`.
4. Remover `src/pages/legacyApp.jsx` somente após a busca de referências, build e validações passarem.
5. Confirmar que `src/app/main.jsx` contém apenas composição da aplicação: bootstrap, providers e rotas.

Critério de saída estrutural: a aplicação inicia sem `legacyApp.jsx`, sem reexports de compatibilidade e sem import direto do cliente Supabase pela UI.

### Etapa 6 — Regressão e preparação para aprovação

1. Executar build e validação do catálogo.
2. Executar as verificações de limites arquiteturais.
3. Reexecutar o caminho feliz e os caminhos de erro dos fluxos existentes.
4. Comparar os resultados com o baseline.
5. Atualizar a evidência de T-017.
6. Somente após a revisão do usuário, atualizar os status de T-011 a T-014 e T-017.

## 6. Tarefas da ação

| ID | Relação | Ação | Verificação de pronto |
|---|---|---|---|
| ELA-001 | FR-005 / T-011–T-014 | Produzir o mapa de exports, dependências e destinos antes da extração | Cada export de `legacyApp.jsx` tem um destino aprovado; nenhuma dependência ambígua ficou sem decisão |
| ELA-002 | FR-005 / T-012 | Extrair autenticação para `pages/Login/` | Login, carregamento, setup, recuperação e erros continuam acessíveis; não há reexport para o legado |
| ELA-003 | FR-005 / T-012 | Extrair campanhas, subseções e criação para `pages/Campaigns/`, `CampaignCreate/` e `CampaignJoin/` | Fluxos atuais de campanha e criação funcionam; imports antigos não são usados |
| ELA-004 | FR-005 / T-012 | Extrair personagens, ficha, inventário e progressão para `pages/CharacterSheet/` | Fluxos atuais de personagens, ficha, inventário e progressão funcionam sem mudança de regra |
| ELA-005 | FR-005 / T-013 | Consolidar componentes reutilizados em `shared/` | Apenas componentes reutilizados estão em `shared`; nenhuma regra de Assimilação foi movida para lá |
| ELA-006 | FR-007 / T-014 | Remover acessos indiretos da UI ao legado e aplicar D-EXTRAÇÃO-01 | A UI usa serviços de `core` ou de `systems`; `persistStartingEquipment` não é importado do legado |
| ELA-007 | FR-005 / T-011 | Aplicar D-EXTRAÇÃO-02 e remover a ponte de entrypoint | `index.html` inicia o bootstrap aprovado; build e carregamento inicial passam |
| ELA-008 | FR-005 / T-011–T-014 | Remover `legacyApp.jsx` após zerar as referências ativas | `rg "legacyApp" src` não encontra uso ativo e o arquivo não é necessário para compilar |
| ELA-009 | FR-009 / T-017 | Executar a regressão funcional completa | Resultados observáveis equivalentes ao baseline em autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação |
| ELA-010 | FR-001, FR-004, FR-006 / T-015, T-016, T-018 | Executar a verificação final estrutural e técnica | Build, validação do catálogo e regras de dependência passam; nenhum limite arquitetural é violado |

## 7. Guardrails obrigatórios

- Não introduzir `systems/registry.js`, seleção de sistema ou persistência de sistema em campanhas.
- Não criar um segundo serviço paralelo para o mesmo domínio.
- Não mover regras de Assimilação para `core` ou `shared`.
- Não permitir que `core` importe `systems`.
- Não permitir que páginas ou componentes acessem o cliente Supabase diretamente.
- Não misturar o serviço remoto de campanhas com o serviço de rascunho local.
- Não criar sincronização entre `localStorage` e Supabase.
- Não alterar permissões, regras de sessão, XP, progressão ou comportamento das fichas.
- Não apagar alterações de trabalho existentes nem usar rollback destrutivo para recuperar uma etapa.

## 8. Riscos e mitigação

| Risco | Impacto | Mitigação | Registro de Decisão? |
|---|---|---|---|
| Uma extração quebra imports cruzados do monólito | Alto | Extrair por domínio, compilar após cada etapa e manter o mapa ELA-001 atualizado | Não, salvo se exigir nova fronteira |
| Estado local ou callback deixa de ser preservado | Alto | Identificar estado e callbacks no inventário; executar os fluxos de criação, ficha e progressão após cada movimento | Não |
| `persistStartingEquipment` é colocado no limite errado | Alto | Parar na D-EXTRAÇÃO-01 e aprovar o destino antes de codificar | Sim, se alterar a fronteira arquitetural |
| O entrypoint direto quebra o carregamento inicial | Alto | Aplicar D-EXTRAÇÃO-02 somente após build e teste de inicialização; manter ponto recuperável | Sim, se a solução final contrariar a arquitetura |
| A extração desloca regra de Assimilação para UI genérica | Alto | Revisar imports e manter chamadas nos módulos de `systems/assimilacao/` | Não, se as fronteiras aprovadas forem mantidas |
| A exclusão do legado ocorrer cedo demais | Alto | Exigir zero referências ativas, build e regressão antes de remover o arquivo | Não |
| Alterações locais existentes forem sobrescritas | Alto | Trabalhar em etapas revisáveis e não executar comandos destrutivos no workspace | Não |

## 9. Critérios finais de conclusão

A ação estará pronta para revisão quando todos os critérios abaixo forem verdadeiros:

- `legacyApp.jsx` não for importado nem reexportado por nenhum módulo ativo.
- As pastas de `pages/` contiverem as implementações reais das telas, e não apenas fachadas para o legado.
- `shared/` contiver somente componentes reutilizados e sem regra específica de domínio.
- `src/app/main.jsx` concentrar bootstrap, providers e rotas, sem implementar telas.
- O entrypoint final estiver alinhado à decisão aprovada.
- `persistStartingEquipment` estiver no local aprovado e sem criar sincronização nova.
- Build, validação do catálogo e verificações arquiteturais passarem.
- A regressão funcional dos fluxos existentes for equivalente ao baseline.
- Nenhuma tarefa for marcada como concluída automaticamente; os status serão atualizados somente após sua aprovação.

## 10. Aprovações registradas

As recomendações D-EXTRAÇÃO-01 e D-EXTRAÇÃO-02 foram aprovadas pelo usuário antes da execução e estão registradas em:

- `specs/02-arquitetura/DECISAO/DECISAO-007-persistencia-equipamento-inicial.md`
- `specs/02-arquitetura/DECISAO/DECISAO-008-entrypoint-final-app-main.md`

Novas decisões que alterarem limites arquiteturais ou comportamento deverão continuar sendo registradas antes da implementação correspondente.
