# T-004 — Navegação e resolução da rota

Tarefa: `T-004`  
Feature: `correcao-biblioteca-caracteristicas`  
Requisito relacionado: `FR-001`  
Data: 13/09/2026

## Verificação

A cadeia prevista para o clique em **Características** já está implementada e foi
confirmada durante a reprodução do baseline:

- `src/pages/Campaigns/pages.jsx` monta a rota
  `/campaigns/:campaignId/characteristics` no item de navegação da campanha.
- `src/app/main.jsx` reconhece essa rota como `campaign-characteristics` e extrai o
  `campaignId`.
- `src/app/main.jsx` instancia `CampaignCharacteristicsPage` com o mesmo
  `campaignId` e configura o retorno para o menu da campanha.
- `src/pages/Campaigns/index.jsx` exporta a página usada pelo app principal.
- As rotas de itens, assimilações e sessões permanecem com seus respectivos tipos e
  páginas no mesmo resolvedor.

O teste manual do baseline também confirmou que, após clicar em **Características**,
a URL chega à campanha correta:

`/campaigns/4eb73077-7d82-4c77-8fb0-bf562858fcf0/characteristics`

O estado em branco ocorre depois da resolução da rota, durante a renderização da
página, devido à referência ausente a `ExpandableCharacteristicDescription`. Portanto,
não há correção de navegação a aplicar nesta tarefa; a correção pertence à integração
da página com suas dependências, tratada em T-005.

## Decisão de escopo

Nenhum arquivo de código foi alterado. Alterar o parser, o callback ou os exports neste
ponto não corrigiria a causa observada e aumentaria o risco de regressão nas rotas
existentes. A estrutura atual permanece compatível com a arquitetura aprovada.

## Status

T-004 foi aprovada pelo responsável e marcada como concluída em `tarefas.md`. A
correção da página em branco segue para a integração tratada em T-005.
