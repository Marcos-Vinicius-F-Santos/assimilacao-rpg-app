# Registro de Decisão — Localização da persistência de equipamento inicial

Data: 13/09/2026  
Status: Aceita

## Contexto

Durante a extração de `src/pages/legacyApp.jsx`, a função `persistStartingEquipment` precisa deixar de ser importada pelo bootstrap e deixar de ficar acoplada ao módulo monolítico de interface. A função é executada no fluxo de criação de personagem e grava o equipamento inicial no armazenamento local.

Esta mudança deve preservar a persistência local existente e não pode criar sincronização entre `localStorage` e Supabase.

## Decisão

Mover a persistência de equipamento inicial para um módulo de suporte local relacionado ao inventário/criação de personagem, mantendo a página responsável apenas por orquestrar o fluxo. O módulo não poderá importar componentes de UI, depender de `legacyApp.jsx` ou introduzir comunicação remota.

O contrato e o efeito observável da função devem permanecer equivalentes ao comportamento atual.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter a função em `legacyApp.jsx` | Prolonga a dependência do módulo legado e impede a remoção da ponte de extração. |
| Colocar a função em `shared/` | `shared/` deve conter componentes reutilizáveis, não persistência específica de inventário. |
| Criar sincronização com Supabase durante a mudança | Está fora do escopo e contrariaria a separação entre dados locais e remotos. |

## Consequências

A criação de personagem continuará gravando o equipamento inicial no armazenamento local, mas a responsabilidade ficará fora da UI monolítica. O destino concreto deverá respeitar a estrutura já existente de `core/`/sistema e será validado antes da remoção de `legacyApp.jsx`.

