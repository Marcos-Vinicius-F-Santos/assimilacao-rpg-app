# Registro de Decisão — Separação entre núcleo da plataforma e sistemas de RPG

Data: 12/09/2026  
Status: Aceita

## Contexto

O código atual concentra a interface em `main.jsx` e mantém regras específicas de Assimilação diretamente na raiz de `src/`. A plataforma precisa suportar novos sistemas de RPG sem acoplar essas regras ao núcleo de autenticação, campanhas, participantes, convites e sessões.

## Decisão

Adotar uma estrutura com `app/`, `pages/`, `core/`, `systems/` e `shared/`. O `core/` conterá funcionalidades genéricas da plataforma, enquanto cada sistema de RPG terá seu próprio módulo em `systems/`, começando por `systems/assimilacao/`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter a estrutura atual, com regras na raiz de `src/` | Mantém o acoplamento e dificulta adicionar outros sistemas. |
| Organizar tudo apenas por tipo de arquivo | Não deixa explícita a fronteira entre o núcleo da plataforma e as regras de cada sistema. |

## Consequências

Essa decisão torna a fronteira entre plataforma e sistemas explícita e facilita futuras extensões. A migração exigirá mover arquivos, ajustar imports e manter temporariamente uma estrutura híbrida durante as etapas de transição.
