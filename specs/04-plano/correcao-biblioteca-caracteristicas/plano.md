# Plano de Implementação — Correção da Biblioteca de Características

Spec relacionada: `specs/03-features/correcao-biblioteca-caracteristicas/spec.md`  
Status: Aprovado

## 1. Resumo técnico

A implementação será uma correção incremental do fluxo já existente de características. Primeiro será reproduzido o problema e rastreada a cadeia entre o menu da campanha, a rota em `src/app/main.jsx`, a exportação da página e a renderização de `CampaignCharacteristicsPage` em `src/pages/Campaigns/`. Em seguida, será corrigido somente o ponto que causa a página em branco.

A biblioteca deverá continuar usando o catálogo específico de Assimilação em `src/systems/assimilacao/characteristicsCatalog.js`. A navegação, a página e o catálogo permanecerão nas áreas já previstas pela arquitetura. Não serão criadas pastas, camadas, serviços ou estruturas alternativas.

Se a falha ocorrer no carregamento ou na renderização, a correção deverá produzir o estado de erro identificável previsto na Spec, sem mover regras de Assimilação para `core/` e sem alterar o conteúdo ou as regras do catálogo.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/main.jsx` | Verificar e, se necessário, corrigir a resolução da rota e o callback que abre `/campaigns/:campaignId/characteristics` | Alto: o arquivo concentra a composição das páginas e uma alteração pode afetar outras rotas |
| `src/pages/Campaigns/pages.jsx` | Corrigir a renderização da biblioteca e/ou seu estado de erro, preservando o layout e o comportamento existentes | Alto: o arquivo contém várias páginas e componentes de campanha |
| `src/pages/Campaigns/index.jsx` | Ajustar apenas a exportação/importação caso ela seja a causa do branco | Médio: um export incorreto pode quebrar a resolução da página |
| `src/systems/assimilacao/characteristicsCatalog.js` | Usar o catálogo existente; alterar somente se a investigação demonstrar um erro de integração, sem mudar seu conteúdo funcional | Médio: o catálogo também é usado na criação e progressão de personagens |
| `src/styles.css` | Reutilizar estilos existentes; alterar apenas se a biblioteca estiver sendo renderizada mas permanecer visualmente vazia por uma regra de estilo comprovada | Médio: estilos são compartilhados por outras telas |
| `supabase/` e persistência | Nenhuma alteração prevista | Baixo |

## 3. Componentes novos

Não há componentes ou módulos novos planejados.

O plano prevê reparar a página e a navegação existentes. Um componente compartilhado só poderá ser criado se a investigação demonstrar reutilização real em pelo menos duas telas e se isso não for necessário para resolver esta feature; caso contrário, o estado de erro deve permanecer no limite da página de características.

## 4. Mudança de dados/banco (se houver)

Não haverá migration, alteração de tabela, alteração de RPC, alteração de persistência ou chamada nova ao Supabase.

A biblioteca continuará lendo o catálogo de características já existente no módulo `systems/assimilacao/`.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar o baseline técnico e reproduzir o clique em **Características** dentro de uma campanha.
2. Confirmar a URL alcançada, o estado visual e qualquer erro de execução associado à página em branco.
3. Rastrear o fluxo completo entre o item do menu, a navegação, o parser de rota, o componente exportado e o catálogo consumido.
4. Comparar o comportamento observável com a referência da build antiga, quando ela estiver disponível, sem iniciar uma reescrita da tela.

### Fase 2 — Lógica principal

1. Corrigir a causa encontrada na resolução da rota, no callback, no export ou na integração da página, mantendo o contrato `/campaigns/:campaignId/characteristics`.
2. Garantir que `CampaignCharacteristicsPage` consiga renderizar o catálogo existente dentro do contexto da campanha.
3. Garantir que uma falha identificável de carregamento/renderização resulte em estado ou mensagem de erro, e não em uma página branca silenciosa.
4. Preservar a regra de acesso existente para participantes e não alterar permissões sem uma nova decisão aprovada.

### Fase 3 — Interface

1. Restaurar a apresentação da biblioteca conforme a build antiga e a Spec aprovada, reutilizando o layout, os componentes e os estilos de campanha existentes.
2. Confirmar que o item **Características** do menu continua visualmente e funcionalmente ligado à biblioteca da campanha correta.
3. Confirmar que a correção não altera o conteúdo, os custos, os requisitos ou as regras das características.

### Fase 4 — Testes

1. Executar build e validações técnicas disponíveis no projeto.
2. Verificar o caminho feliz pelo menu da campanha e, quando aplicável, pela rota da biblioteca.
3. Verificar o caminho de erro com uma condição controlada de falha e confirmar que há mensagem/estado identificável em vez de tela em branco.
4. Regressar as páginas de campanha relacionadas, incluindo participantes, itens, assimilações, sessões e criação/visualização de personagens.

### Fase 5 — Entrega

1. Revisar o diff contra a Spec da Feature e a arquitetura aprovada.
2. Confirmar que a mudança ficou restrita ao fluxo da biblioteca e não introduziu catálogo novo, persistência nova ou estrutura paralela.
3. Registrar um ponto de rollback antes da entrega.
4. Encaminhar a implementação para revisão e aprovação; nenhum deploy deve ocorrer como parte deste plano sem autorização posterior.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Registro de Decisão? |
|---|---|---|---|---|
| A causa estar no roteador central ou no callback da campanha | Média | Alto | Reproduzir antes, alterar o menor trecho possível e regressar as demais rotas | Não. A arquitetura existente já define `app/main.jsx` como ponto de rotas |
| A causa estar em export/import da página | Média | Alto | Verificar a cadeia de exportação antes de criar qualquer módulo novo e executar build após a correção | Não. Não cria uma nova fronteira arquitetural |
| A biblioteca da build antiga não estar disponível para comparação direta | Média | Médio | Usar a Spec aprovada como contrato mínimo e registrar qualquer diferença observada antes de ampliar o escopo | Não. É risco de referência funcional, não decisão de arquitetura |
| Alteração acidental do catálogo usado na criação ou progressão de personagens | Baixa | Alto | Tratar `characteristicsCatalog.js` como fonte existente, evitar mudanças de dados e executar regressão desses fluxos | Não. Coberto pelos limites de `systems/assimilacao/` |
| A correção de erro alterar permissões de Mestre ou jogador | Média | Alto | Preservar a verificação de acesso atual e testar ao menos um participante autorizado e um usuário não participante | Não. A Spec proíbe alteração silenciosa de permissões |
| Uma solução exigir uma camada compartilhada ou mudança de limite entre `core`, `pages` e `systems` | Baixa | Alto | Parar a tarefa afetada e propor um Registro de Decisão usando `specs/02-arquitetura/DECISAO_TEMPLATE.md` antes de mudar a arquitetura | Sim, somente se essa necessidade surgir |
| Não existir infraestrutura automatizada de testes de interface | Alta | Médio | Usar build, validações existentes e verificação manual documentada do caminho feliz, erro e regressão | Não. Não justifica criar framework de testes nesta feature |

## 7. Perguntas abertas antes de começar

- A referência da build antiga deve estar disponível para a verificação de paridade; se não estiver, a equipe deve seguir o contrato funcional da Spec aprovada e não inventar conteúdo novo.
- O estado de erro pode usar a linguagem e os componentes de feedback já existentes na aplicação; a mensagem exata não precisa ser definida nesta etapa, desde que seja identificável e não resulte em tela em branco.
- Se a investigação mostrar que a correção exige nova persistência, nova fronteira de módulo ou alteração de permissões, a implementação deve parar nesse ponto e solicitar um Registro de Decisão antes de continuar.
