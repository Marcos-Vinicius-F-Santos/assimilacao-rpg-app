# T-004 a T-007 — Implementação da resolução, renderização e fallback

Feature: `correcao-criacao-personagem`  
Data: 14/09/2026  
Status: Aprovadas; tarefas concluídas

## T-004 — Resolução de `/characters/new`

### Resultado

A investigação confirmou que a resolução já estava correta:

- `parseAppRoute` reconhece `/characters/new` como `personal-create`;
- `PersonalCharactersPage` navega para `/characters/new` pelo callback existente;
- o acesso direto usa o mesmo parser inicial da aplicação.

Não foi alterada a regra da rota. O branch pessoal foi envolvido pelo `CharacterCreationErrorBoundary` para que uma falha na tela resolvida não resulte em uma página vazia.

### FR relacionado

- FR-001
- FR-003

## T-005 — Renderização da tela existente

### Resultado

Foram restaurados em `src/pages/CampaignCreate/pages.jsx` os helpers que `CharacterCreationPage` já utilizava, mas que não estavam definidos nesse módulo:

- `initialAssimilationMutationDetail`;
- `AssimilationSymbol`;
- `dieSymbols`;
- `dieAriaLabel`;
- `CharacterDetailModal`.

As implementações foram alinhadas às versões existentes no módulo de personagens, preservando a tela de criação, seus dados e seus comportamentos. Não foi criada uma nova tela nem alterada a regra de criação.

### FR relacionado

- FR-002

## T-006 — Preservação do fluxo pessoal

### Resultado

Não foram alterados os callbacks nem a persistência do fluxo existente:

- `onCancel` continua navegando para `/characters`;
- `onComplete` continua navegando para `/characters/:id`;
- `CharacterCreationPage` continua usando o rascunho local existente;
- `createCharacterCreationDraft`, `validateCreationDraft`, montagem dos dados e o serviço local não foram alterados.

O fluxo de criação em campanha continua instanciando `CharacterCreationPage` sem o novo boundary pessoal e sem mudança de props ou modo.

### FR relacionado

- FR-002

## T-007 — Fallback para falha de resolução/renderização

### Resultado

Foi criado `CharacterCreationErrorBoundary` dentro do módulo existente `src/pages/CampaignCreate/pages.jsx` e exportado por `src/pages/CampaignCreate/index.jsx`.

O boundary é aplicado somente ao branch `personal-create` em `src/app/main.jsx`. Quando a tela pessoal falhar durante a renderização, o usuário recebe:

> Não foi possível carregar a tela. Consulte o administrador.

A falha original continua sendo registrada no console para diagnóstico, enquanto a interface deixa de ficar vazia.

### FR relacionado

- FR-004

## Verificação executada

- `pnpm build`: aprovado.
- 1933 módulos transformados sem erro de build.
- Aviso existente e não bloqueante sobre chunks maiores que 500 kB após minificação.
- `src/core/campaigns/campaignLocalDraftService.js`: sem alteração.
- `src/systems/assimilacao/characterCreation.js`: sem alteração.
- `supabase/` e migrations: sem alteração.
- Fluxo de criação em campanha: não envolvido pelo boundary e sem mudança de props.

## Divergências do plano

- **T-004:** o plano previa corrigir a resolução se a investigação encontrasse falha. Como a rota, o callback e o parser estavam corretos, não houve alteração de rota; a mudança aplicada foi somente o boundary no branch já resolvido.
- **T-005:** a tela atual fica em `src/pages/CampaignCreate/`, conforme encontrado no código, embora a Spec mencione `CharacterSheet/` como localização arquitetural. Nenhum arquivo foi movido.
- **T-006:** a tarefa foi atendida por preservação e verificação dos contratos existentes; não foi necessária alteração de código de persistência ou callbacks.
- **T-007:** o boundary foi criado no módulo de criação existente, sem nova pasta ou camada arquitetural, conforme permitido pelo plano.

## Pendências para a fase de testes

- Executar o caminho feliz autenticado pelo botão **Novo personagem**.
- Executar o acesso direto autenticado a `/characters/new`.
- Provocar uma falha controlada e confirmar visualmente a mensagem do boundary.
- Executar a regressão mínima dos fluxos relacionados.
- T-004 a T-007 foram aprovadas e marcadas como concluídas em `tarefas.md`.
