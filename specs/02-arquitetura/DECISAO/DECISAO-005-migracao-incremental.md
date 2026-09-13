# Registro de Decisão — Migração incremental da arquitetura

Data: 12/09/2026  
Status: Aceita

## Contexto

O sistema já possui funcionalidades em uso. Uma reestruturação ampla precisa reduzir o risco de quebrar fichas, campanhas, sessões e progressão existentes.

## Decisão

A migração será incremental, nesta ordem:

1. renomear e separar os serviços remoto e local de campanha;
2. isolar as regras de Assimilação;
3. organizar o núcleo genérico;
4. separar `main.jsx` em páginas;
5. implementar a seleção de sistema ao criar campanha.

As primeiras quatro etapas devem preservar o comportamento existente. A seleção de sistema será a primeira funcionalidade nova da fase.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Reescrever toda a estrutura de uma vez | Aumenta o risco de regressões e dificulta identificar a origem de problemas. |
| Implementar a seleção de sistema antes da reorganização | Criaria a nova funcionalidade sobre limites arquiteturais ainda ambíguos. |

## Consequências

A migração poderá ser verificada em etapas e reduzirá o risco de quebra. Durante o processo haverá períodos temporários de coexistência entre a estrutura antiga e a nova, exigindo cuidado com imports e testes de regressão.
