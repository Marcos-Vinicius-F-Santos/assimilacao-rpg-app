# Tarefas — Correção do acesso à criação de personagem

Plano relacionado: `specs/04-plano/correcao-criacao-personagem/plano.md`

## Regra das tarefas

Cada tarefa deve ser pequena o suficiente para revisar de uma vez, referenciar o requisito (FR-XXX) que ela implementa, e dizer como verificar que ficou pronta.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002, FR-003, FR-004] Registrar o baseline e reproduzir a tela vazia
  - Arquivos/módulos: aplicação em execução; `src/pages/CharacterSheet/pages.jsx`; `src/app/main.jsx`; navegador; `package.json`
  - Verificação: clicar em **Novo personagem**, acessar diretamente `/characters/new`, registrar a URL, o estado visual e qualquer erro de console/runtime; executar `pnpm build` como baseline.

- [x] T-002 [FR-001, FR-002, FR-003] Rastrear a cadeia de rota, export e renderização
  - Arquivos/módulos: `src/app/main.jsx`; `src/pages/CharacterSheet/pages.jsx`; `src/pages/CampaignCreate/index.jsx`; `src/pages/CampaignCreate/pages.jsx`
  - Verificação: identificar se a falha está no callback do botão, no parser de `/characters/new`, na resolução de `personal-create`, no export/import ou na renderização de `CharacterCreationPage`; registrar a causa sem alterar código.

- [x] T-003 [FR-002, FR-003] Confirmar o contrato da tela de criação existente
  - Arquivos/módulos: `src/pages/CampaignCreate/pages.jsx`; `src/systems/assimilacao/characterCreation.js`; referência da tela existente
  - Verificação: registrar os elementos mínimos que devem reaparecer — título de criação, progresso, primeira etapa, campos/controles e navegação — sem propor redesign ou regra nova.

## Fase 2 — Lógica principal

- [x] T-004 [FR-001, FR-003] Corrigir a resolução de `/characters/new`
  - Arquivos/módulos: `src/app/main.jsx`; `src/pages/CharacterSheet/pages.jsx` ou `src/pages/CampaignCreate/index.jsx` somente se a investigação apontar essa causa
  - Verificação: o clique em **Novo personagem** e o acesso direto a `/characters/new` devem resolver o mesmo tipo de rota e instanciar a tela de criação pessoal existente.

- [x] T-005 [FR-002] Restaurar a renderização da tela existente no modo pessoal
  - Arquivos/módulos: `src/pages/CampaignCreate/pages.jsx`; `src/pages/CampaignCreate/index.jsx`; dependências diretamente usadas pela tela
  - Verificação: a tela deve renderizar a interface existente de criação, sem tela vazia, preservando as nove etapas e os controles já disponíveis.

- [x] T-006 [FR-002] Preservar rascunho, cancelamento e conclusão da criação pessoal
  - Arquivos/módulos: `src/pages/CampaignCreate/pages.jsx`; `src/core/campaigns/campaignLocalDraftService.js`; `src/systems/assimilacao/characterCreation.js`
  - Verificação: confirmar que cancelar retorna para `/characters`, que o rascunho continua sendo mantido conforme o comportamento existente e que concluir continua salvando o personagem pessoal e navegando para `/characters/:id`.

- [x] T-007 [FR-004] Adicionar tratamento identificável para falha de resolução ou renderização
  - Arquivos/módulos: limite existente de composição em `src/app/main.jsx` ou `src/pages/CampaignCreate/pages.jsx`; estilos existentes se necessários
  - Verificação: sob uma condição controlada de falha, a aplicação deve exibir exatamente “Não foi possível carregar a tela. Consulte o administrador.” e não deixar a página totalmente vazia.

## Fase 3 — Interface

- [x] T-008 [FR-002] Confirmar a apresentação da tela de criação pessoal
  - Arquivos/módulos: `src/pages/CampaignCreate/pages.jsx`; `src/styles.css`
  - Verificação: pelo botão e pela URL direta, confirmar que título, descrição, progresso, primeira etapa, campos e ações da tela existente estão visíveis e utilizáveis.

- [x] T-009 [FR-004] Confirmar a apresentação do estado de erro
  - Arquivos/módulos: módulo que renderiza o fallback; `src/styles.css` somente se necessário
  - Verificação: a mensagem de erro deve ser legível, identificável e exibida no lugar da tela vazia, sem alterar o layout normal da criação.

## Fase 4 — Testes

- [x] T-010 [FR-001, FR-002, FR-003] Executar validações técnicas
  - Arquivos/módulos: projeto inteiro; scripts de `package.json`
  - Verificação: `pnpm build` conclui sem erro; `pnpm validate:assimilations` continua aprovado; `git diff --check` não encontra problemas.

- [x] T-011 [FR-001, FR-002] Verificar o caminho feliz iniciado pelo botão
  - Arquivos/módulos: aplicação local; tela **Personagens**; fluxo de criação pessoal
  - Verificação: abrir a biblioteca pessoal, clicar em **Novo personagem** e confirmar a tela existente visível, sem erro no console ou página em branco.

- [x] T-012 [FR-003] Verificar o caminho feliz por acesso direto
  - Arquivos/módulos: aplicação local; URL `/characters/new`
  - Verificação: abrir diretamente `/characters/new` e confirmar que a mesma tela de criação pessoal é carregada e pode avançar normalmente.

- [x] T-013 [FR-004] Verificar o caminho de erro
  - Arquivos/módulos: fluxo de criação pessoal e mecanismo de fallback implementado
  - Verificação: provocar uma condição controlada de falha de resolução/renderização e registrar a mensagem “Não foi possível carregar a tela. Consulte o administrador.”, sem falha silenciosa.

- [x] T-014 [FR-001, FR-002, FR-003] Executar regressão mínima dos fluxos relacionados
  - Arquivos/módulos: biblioteca pessoal; personagem pessoal existente; criação de personagem em campanha; visualização de personagem; menu de campanha
  - Verificação: confirmar que essas rotas continuam acessíveis e que nenhuma delas passa a abrir a tela de criação pessoal ou uma página vazia indevidamente.

## Fase 5 — Entrega

- [x] T-015 [FR-001, FR-002, FR-003, FR-004] Revisar o diff contra a Spec e a arquitetura
  - Arquivos/módulos: diff da implementação; `specs/03-features/correcao-criacao-personagem/spec.md`; `specs/02-arquitetura/`
  - Verificação: confirmar que `/characters/new` foi preservada, que a tela existente foi reutilizada, que a mensagem de erro atende FR-004 e que não foram criadas estruturas paralelas ou mudanças de banco.

- [x] T-016 [FR-001, FR-002, FR-003, FR-004] Preparar rollback e handoff para aprovação
  - Arquivos/módulos: histórico/diff da implementação; evidências de T-010 a T-014
  - Verificação: registrar o ponto anterior à correção, anexar evidências de caminho feliz, acesso direto, erro e regressão, e encaminhar para revisão de Marcos; não realizar deploy.

## Adiado (fora do escopo desta rodada)

- [ ] Criar uma nova tela ou um novo fluxo de criação de personagem.
- [ ] Mover `CharacterCreationPage` para outra pasta ou criar uma nova camada arquitetural.
- [ ] Alterar campos, validações, regras, custos ou conteúdo da criação de personagem.
- [ ] Alterar a criação de personagem dentro de campanhas, salvo regressão causada diretamente pela correção compartilhada.
- [ ] Alterar persistência, banco de dados, migrations ou sincronização entre `localStorage` e Supabase.
- [ ] Alterar características, assimilações, itens, inventário, XP ou progressão.
