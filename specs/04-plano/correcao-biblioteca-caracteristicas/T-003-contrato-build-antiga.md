# T-003 — Contrato observável da build antiga

Tarefa: `T-003`  
Feature: `correcao-biblioteca-caracteristicas`  
Requisito relacionado: `FR-002`  
Data: 13/09/2026

## Referência localizada

A referência da build antiga está disponível no histórico Git, no commit pai de `e402d41` (`e402d41^`). Naquela versão, o fluxo ainda estava concentrado em `src/main.jsx`.

Trechos observados na referência:

- `src/main.jsx:1167` — item **Características** na navegação da campanha.
- `src/main.jsx:1249-1265` — `CampaignCharacteristicsPage` e sua apresentação.
- `src/main.jsx:791-824` — `ExpandableCharacteristicDescription` e `toggleExpandedId`.
- `src/styles.css` — estilos específicos da apresentação de características.

## Contrato funcional confirmado

Ao abrir a seção **Características** de uma campanha, a build antiga apresentava:

- página contextualizada na campanha, com o título **Características**;
- descrição de consulta das opções oficiais para criação e evolução;
- contador da quantidade de características visíveis;
- campo de busca por nome, requisito ou descrição;
- filtro por custo, incluindo a opção de todos os custos;
- cards da biblioteca com nome, custo, requisito e descrição;
- indicação de características somente para criação inicial;
- indicação de características que exigem aprovação do Mestre;
- indicação de características que incluem uma escolha;
- expansão da descrição com **VER MAIS** e recolhimento com **MOSTRAR MENOS** quando o texto excedia o espaço inicial;
- estado vazio identificável quando nenhum item atendia à busca ou ao filtro.

Esse é o comportamento observável a ser restaurado. A correção deve reutilizar o catálogo existente e preservar seus dados, custos, requisitos e regras.

## Limites confirmados

- Não criar novas características.
- Não alterar custos, requisitos, descrições ou regras do catálogo.
- Não transformar a biblioteca em fluxo de edição ou seleção de personagem.
- Não alterar o controle de acesso da campanha.
- Não introduzir persistência, chamada nova ao Supabase ou estrutura fora de `pages/` e `systems/assimilacao/`.

## Conclusão da T-003

O contrato da build antiga foi localizado e confirmado no histórico Git. A Spec não precisa ser ampliada para definir o comportamento visual/funcional mínimo da biblioteca. A implementação das dependências ausentes e a validação do resultado pertencem às tarefas seguintes.

T-003 foi aprovada pelo responsável e marcada como concluída em `tarefas.md`.
