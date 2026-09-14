# Plano de Implementação — Correção do acesso à criação de personagem

Spec relacionada: `specs/03-features/correcao-criacao-personagem/spec.md`  
Status: Rascunho

## 1. Resumo técnico

A implementação será uma correção incremental do fluxo já existente de criação de personagem pessoal. Primeiro será reproduzido o problema pelo botão **Novo personagem** e pelo acesso direto a `/characters/new`; depois será rastreada a cadeia entre o parser de rotas, a composição em `src/app/main.jsx`, os exports e a tela `CharacterCreationPage` já existente.

A rota `/characters/new` será mantida. A correção deverá reutilizar a tela e as regras de criação existentes, sem criar um fluxo paralelo, mover módulos ou alterar persistência. Caso a resolução ou renderização falhe, será incluído o tratamento local necessário para exibir a mensagem aprovada: **“Não foi possível carregar a tela. Consulte o administrador.”**

O plano não prevê migration, alteração de banco, nova chamada ao Supabase ou mudança nas regras de criação. A causa técnica ainda deverá ser confirmada durante a fase de base.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/main.jsx` | Verificar e, se necessário, corrigir o parser da rota `/characters/new`, a composição de `personal-create` e o tratamento de falhas da página | Alto: o arquivo concentra o roteamento e também compõe os fluxos de criação em campanha |
| `src/pages/CharacterSheet/pages.jsx` | Verificar a origem do callback da tela **Personagens** e preservar o botão **Novo personagem**; alterar somente se a investigação demonstrar que o acionamento está incorreto | Médio: a página também exibe e abre personagens existentes |
| `src/pages/CampaignCreate/pages.jsx` | Reutilizar e, se necessário, corrigir a renderização de `CharacterCreationPage` no modo `personal`, sem alterar o fluxo de campanha | Alto: contém a tela de criação e as regras de apresentação do fluxo de 9 etapas |
| `src/pages/CampaignCreate/index.jsx` | Confirmar que `CharacterCreationPage` continua exportada pelo caminho usado pelo app | Médio: export incorreto pode causar tela vazia ou quebrar outros fluxos |
| `src/systems/assimilacao/characterCreation.js` | Usar os contratos existentes de rascunho, validação e montagem dos dados; nenhuma mudança funcional prevista | Alto: alterar este módulo pode mudar as regras de criação |
| `src/core/campaigns/campaignLocalDraftService.js` | Verificar o salvamento do personagem pessoal e a compatibilidade com a tela existente; nenhuma mudança de persistência prevista | Alto: pode afetar personagens pessoais, duplicação e uso posterior em campanhas |
| `src/styles.css` | Reutilizar estilos existentes; alterar somente se a investigação comprovar que a tela ou o estado de erro está renderizado, mas invisível | Médio: estilos são compartilhados por outras telas |
| `supabase/` e migrations | Nenhuma alteração prevista | Baixo |

## 3. Componentes novos

Não há componente ou módulo arquitetural novo planejado.

O plano prevê reutilizar `CharacterCreationPage` e os serviços já existentes. Se for necessário um fallback para erro de renderização, ele deverá permanecer no limite do fluxo existente — preferencialmente no módulo de composição da página ou no módulo da própria criação — sem criar uma nova camada em `core/`, `shared/` ou `systems/`.

## 4. Mudança de dados/banco (se houver)

Não haverá migration, alteração de tabela, RPC, chamada nova ao Supabase ou mudança no contrato de persistência.

O rascunho da criação e o personagem pessoal continuarão usando os mecanismos locais já existentes. Se a investigação demonstrar que uma alteração de persistência seria necessária, a implementação deverá parar para revisão da Spec e criação de uma migration ou Registro de Decisão apropriado.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar o baseline técnico e reproduzir o clique em **Novo personagem** dentro da biblioteca pessoal.
2. Acessar diretamente `/characters/new` e comparar o resultado com o fluxo iniciado pelo botão.
3. Registrar URL, estado visual, erros de console/runtime e resultado do build antes da alteração.
4. Rastrear a cadeia entre `PersonalCharactersPage`, `navigate("/characters/new")`, `parseAppRoute`, a resolução de `personal-create`, o export de `CharacterCreationPage` e sua renderização.
5. Confirmar se a tela vazia ocorre por rota não resolvida, export/import, exceção de renderização, dependência ausente ou condição de dados.

### Fase 2 — Lógica principal

1. Corrigir somente o ponto identificado na cadeia de rota ou renderização, mantendo `/characters/new`.
2. Garantir que o fluxo pelo botão e o acesso direto à URL instanciem `CharacterCreationPage` no modo `personal`.
3. Preservar cancelamento, conclusão, rascunho local, salvamento do personagem pessoal e navegação pós-criação.
4. Implementar, no limite do fluxo existente, o fallback para falhas de resolução/renderização com a mensagem aprovada, evitando tela vazia silenciosa.
5. Não alterar a composição ou as regras do fluxo de criação de personagem de campanha, salvo ajustes estritamente necessários para compartilhar a correção sem mudança de comportamento.

### Fase 3 — Interface

1. Confirmar que a tela existente de criação aparece com cabeçalho, progresso, primeira etapa, controles e ações disponíveis.
2. Confirmar que a apresentação permanece a da tela existente, sem redesign, remoção de campos ou alteração das nove etapas.
3. Confirmar que o estado de erro é visível, legível e contém exatamente a mensagem aprovada.
4. Reutilizar estilos existentes e alterar `src/styles.css` somente se houver evidência de que o conteúdo está presente, mas oculto visualmente.

### Fase 4 — Testes

1. Executar `pnpm build` e as validações disponíveis no projeto.
2. Verificar o caminho feliz pelo botão **Novo personagem** na tela **Personagens**.
3. Verificar o caminho feliz acessando diretamente `/characters/new`.
4. Verificar o caminho de erro com uma condição controlada de falha de resolução ou renderização e confirmar a mensagem aprovada, sem tela totalmente vazia.
5. Confirmar que o fluxo de criação pessoal preserva rascunho, cancelamento e conclusão conforme o comportamento existente.
6. Executar regressão mínima das rotas relacionadas: biblioteca pessoal, abertura de personagem pessoal, criação de personagem em campanha, visualização de personagem e páginas principais de campanha.

### Fase 5 — Entrega (deploy/rollback)

1. Revisar o diff contra a Spec aprovada, o plano e os limites de `specs/02-arquitetura/`.
2. Confirmar que não houve alteração de catálogo, regras de criação, persistência, banco ou fluxo de campanha fora do necessário.
3. Registrar o ponto de rollback e as evidências dos testes de caminho feliz, erro e regressão.
4. Encaminhar a implementação para revisão e aprovação de Marcos.
5. Não realizar deploy como parte deste plano sem aprovação posterior.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| A rota já existir, mas a tela falhar durante a renderização por erro de runtime ou dependência ausente | Alta | Alto | Reproduzir antes, capturar o erro exato e corrigir o menor ponto possível; validar build e navegador | Não, enquanto a correção permanecer no limite existente |
| Alteração em `src/app/main.jsx` afetar a criação de personagem em campanha ou outras rotas | Média | Alto | Comparar as duas formas de criação e executar regressão das rotas de campanha após a correção | Não |
| A localização indicada na Spec (`src/pages/CharacterSheet/`) divergir da implementação atual, que exporta `CharacterCreationPage` por `src/pages/CampaignCreate/` | Alta | Médio | Tratar a localização atual como referência de implementação, sem mover módulos; revisar a divergência na convergência final | Não, salvo se for proposta mudança estrutural |
| Adicionar um fallback de erro mascarar a causa original ou capturar falhas fora do escopo | Média | Médio | Limitar o fallback ao fluxo de criação, manter a mensagem aprovada e registrar o erro durante a investigação | Não |
| Correção alterar acidentalmente rascunho local, salvamento ou conclusão da criação | Média | Alto | Não alterar serviços sem evidência, verificar cancelamento/conclusão e comparar o comportamento antes/depois | Não |
| Não existir um template de teste em `specs/05-verificacao/` com o caminho citado pela Spec | Média | Médio | Usar as verificações existentes do projeto e registrar evidências em documento próprio de verificação, sem bloquear o escopo funcional | Não |

## 7. Perguntas abertas antes de começar

Não há pergunta funcional pendente: a rota `/characters/new`, o escopo do botão e do acesso direto e a mensagem de erro foram confirmados.

Permanece pendente apenas a causa técnica, que deverá ser identificada na Fase 1 sem alterar o escopo. A divergência entre a localização descrita na Spec e a localização atual do componente deve ser resolvida por confirmação no diff, não por movimentação automática de arquivos.
