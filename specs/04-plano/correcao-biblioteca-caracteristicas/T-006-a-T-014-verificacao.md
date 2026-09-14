# T-006 a T-014 — Implementação e verificações

Feature: `correcao-biblioteca-caracteristicas`  
Data: 13/09/2026

## T-006 — Estado identificável para falha

Foi adicionado um Error Boundary local ao fluxo de Características em
`src/pages/Campaigns/pages.jsx`. Em caso de erro durante a renderização da página ou
do catálogo, o usuário recebe **Biblioteca indisponível** com orientação para voltar
ao menu da campanha, evitando uma tela branca silenciosa.

## T-007 — Controle de acesso

- Mestre DEV autorizado: acesso à biblioteca confirmado, com 49 cards.
- Jogador DEV participante: acesso à biblioteca confirmado, com 49 cards.
- Usuário não participante: fora do escopo; não é uma vertente válida desta feature.

A regra existente `canViewCampaignCharacteristics` permanece sem alteração.

## T-008 — Apresentação

A biblioteca foi exibida com título, contador de 49 entradas, cards legíveis, busca e
filtro de custo. O conteúdo observado corresponde ao contrato funcional registrado em
T-003.

## T-009 — Ligação do menu

O clique no menu abriu a rota da campanha correta e o botão de retorno levou novamente
ao menu da mesma campanha.

## T-010 — Integridade do catálogo

O catálogo não foi alterado. A verificação do diff não encontrou mudanças em
`src/systems/assimilacao/characteristicsCatalog.js`.

## T-011 — Validações técnicas

- `pnpm build`: aprovado.
- `pnpm validate:assimilations`: aprovado — 52 assimilações e 266 habilidades
  validadas, sem habilidades sem custo de aquisição.
- `git diff --check`: aprovado.

## T-012 — Caminho feliz

Executado localmente, conectado ao Supabase DEV: abrir a campanha, clicar em
**Características** e confirmar a biblioteca com 49 cards. A rota correta foi
`/campaigns/4eb73077-7d82-4c77-8fb0-bf562858fcf0/characteristics` e não houve erro no
console.

Também foram verificados o filtro de custo de 5 pontos, retornando 2 cards, e a busca
por **Viajado**, retornando 1 card.

## T-013 — Caminho de erro

O estado de erro foi implementado em T-006. A validação de uma falha controlada será
realizada posteriormente em produção, conforme decisão do responsável; não foi
adicionado comportamento temporário apenas para simular esse teste localmente.

## T-014 — Regressão mínima

No usuário jogador participante, foram confirmadas as rotas de participantes, itens,
assimilações, sessões, visualização de personagem e criação de personagem. A rota de
criação apresentou o bloqueio esperado porque o usuário já possui ficha na campanha.

## Status

T-006 a T-014 foram aprovadas pelo responsável e marcadas como concluídas em
`tarefas.md`. A validação de T-013 permanece planejada para produção.
