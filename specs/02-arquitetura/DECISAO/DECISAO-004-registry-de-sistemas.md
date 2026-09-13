# Registro de Decisão — Registry de sistemas de RPG

Data: 12/09/2026  
Status: Aceita

## Contexto

A tela de criação de campanha precisa listar os sistemas disponíveis sem conhecer diretamente as regras específicas de cada sistema.

## Decisão

`systems/registry.js` será o ponto único para listar os sistemas disponíveis e seus metadados básicos. O registry não conterá regras de negócio. A tela de criação consultará o registry, e as regras continuarão dentro do módulo correspondente em `systems/<sistema>/`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter a lista de sistemas diretamente na página de criação | Acopla a tela à configuração dos sistemas e dificulta reutilização. |
| Colocar regras de negócio dentro do registry | Transforma o registry em um ponto central de acoplamento. |

## Consequências

Adicionar um sistema exigirá registrar seus metadados e criar seu módulo próprio. O registry precisará manter um contrato simples e estável para ser consumido pela interface.
