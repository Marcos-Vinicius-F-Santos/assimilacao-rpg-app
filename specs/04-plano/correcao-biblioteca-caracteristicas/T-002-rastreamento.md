# T-002 — Rastreamento da navegação e renderização

Tarefa: `T-002`  
Feature: `correcao-biblioteca-caracteristicas`  
Requisitos relacionados: `FR-001`, `FR-002`  
Data: 13/09/2026

## Cadeia rastreada

| Etapa | Local | Resultado |
|---|---|---|
| 1. Item do menu | `src/pages/Campaigns/pages.jsx:340-352`, em `CampaignReferenceNav` | O botão **Características** monta corretamente a rota `/campaigns/:campaignId/characteristics` e dispara `popstate`. |
| 2. Resolução da rota | `src/app/main.jsx:44-50`, em `parseAppRoute` | A URL é reconhecida como `campaign-characteristics` e o `campaignId` é extraído corretamente. |
| 3. Composição da página | `src/app/main.jsx:107` | A aplicação instancia `CampaignCharacteristicsPage` com `store`, `user`, `campaignId` e `onBack`. |
| 4. Exportação | `src/pages/Campaigns/pages.jsx:522-530` e `src/pages/Campaigns/index.jsx:1-10` | A página está exportada e importada corretamente; isso não é o ponto da falha observada. |
| 5. Catálogo | `src/pages/Campaigns/pages.jsx:36-42` e `:434-437` | `characteristicCatalog` e `formatCharacteristicRequirement` são importados do módulo correto de Assimilação e o filtro é executado. |
| 6. Renderização dos cards | `src/pages/Campaigns/pages.jsx:440` | A renderização falha no primeiro card ao tentar resolver `ExpandableCharacteristicDescription`. |

## Causa identificada

`CampaignCharacteristicsPage` usa `ExpandableCharacteristicDescription` na linha 440 de `src/pages/Campaigns/pages.jsx`, mas esse símbolo não é declarado nem importado nesse módulo.

Existe uma implementação com o mesmo nome em `src/pages/CampaignCreate/pages.jsx:185`, porém ela é uma função local daquele módulo e não está disponível automaticamente em `Campaigns/pages.jsx`.

O mesmo trecho de `Campaigns/pages.jsx:440` também chama `toggleExpandedId`, que só foi localizado em `src/pages/CampaignCreate/pages.jsx:216` e igualmente não está declarado nem importado em `Campaigns/pages.jsx`. Depois de resolver o primeiro erro, essa referência também precisará ser tratada pela tarefa de correção correspondente.

## Evidência de execução

Com o usuário Mestre de teste autenticado no Supabase DEV:

- o menu da campanha abriu normalmente;
- o clique em **Características** levou à rota correta;
- o DOM resultante ficou vazio;
- o console registrou `ReferenceError: ExpandableCharacteristicDescription is not defined` em `CampaignCharacteristicsPage`;
- o React registrou o warning de erro no componente.

## Conclusão da T-002

O fluxo de navegação atende ao caminho até a página. O ponto que impede o FR-002 é a renderização de `CampaignCharacteristicsPage`, por dependência ausente no módulo de campanhas. Nenhum código foi alterado nesta tarefa.

T-002 permanece aberta para aprovação. A correção das referências e a validação da biblioteca pertencem às tarefas seguintes.
