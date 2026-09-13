# Evidência de revisão de escopo — T-020

Tarefa: T-020 [FR-008] Revisar a ordem e o escopo da migração  
Feature: Reestruturação Arquitetural Inicial  
Data da verificação: 13/09/2026  
Status da evidência: Revisão executada; tarefa aprovada pelo responsável

## Ordem verificada

A estrutura atual e o histórico da implementação foram revisados contra a ordem da DECISÃO-005:

1. separação dos serviços remoto e local de campanha;
2. isolamento dos módulos de Assimilação em `systems/assimilacao/`;
3. organização do núcleo genérico em `core/`;
4. separação da interface em `app/`, `pages/` e `shared/`.

Não foi identificada implementação da etapa posterior de seleção de sistema antes dessas etapas.

## Itens explicitamente fora do escopo confirmados

- `src/systems/registry.js` não foi criado;
- não há referência ativa a `systemId` ou persistência de sistema em campanhas;
- não foi criado um segundo sistema de RPG;
- não foi adicionada migration para identificar o sistema de campanhas antigas;
- não foi adicionada sincronização entre `localStorage` e Supabase;
- não foram incluídas regras novas de produto durante a revisão.

## Conclusão de escopo

Não foi encontrada estrutura paralela ou funcionalidade futura incluída silenciosamente. A falha de XP observada na regressão é uma inconsistência a corrigir, não uma alteração de escopo da reestruturação, e foi registrada no backlog de correções.
