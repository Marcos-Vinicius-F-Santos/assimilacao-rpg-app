# Checklist de Convergência — Correção do acesso à criação de personagem

Feature: `correcao-criacao-personagem`  
Data: 14/09/2026  
Status: Revisão antes da aprovação de deploy

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da Spec ou está documentado como decisão consciente fora da Spec.
  - FR-001/FR-003: preservação da rota `/characters/new` e do callback existente.
  - FR-002: restauração dos helpers necessários para renderizar `CharacterCreationPage`.
  - FR-004: `CharacterCreationErrorBoundary` com a mensagem aprovada e estilo visual correspondente.
  - O registro de erro no console é um detalhe diagnóstico consciente e não altera o comportamento funcional.
- [ ] Critério de aceite reflete o comportamento final de verdade.
  - A implementação e o código correspondem aos três critérios, mas a abertura autenticada da tela e o fallback ainda não foram confirmados visualmente no navegador local.

## Arquitetura

- [x] A estrutura de pastas/módulos ainda respeita `specs/02-arquitetura/`.
  - Alterações restritas a `src/app/`, `src/pages/CampaignCreate/` e `src/styles.css`.
  - Nenhuma regra de Assimilação foi movida para `core/`.
- [x] Se cruzou algum limite, isso foi uma decisão consciente.
  - Não houve cruzamento arquitetural. O fallback permaneceu no módulo de criação existente e não criou camada nova.

## Dados

- [x] Migration testada, se houve mudança de schema.
  - Não houve mudança de schema; migration não se aplica.
- [x] Sei como reverter se a migration der problema.
  - Não há migration nem alteração de banco para reverter.

## Testes

- [ ] Requisitos de prioridade alta têm verificação feita.
  - Validações técnicas passaram: `pnpm build`, `pnpm validate:assimilations` e `git diff --check`.
  - Os caminhos prioritários FR-001/FR-002/FR-003 e o erro FR-004 não tiveram confirmação funcional autenticada; T-011–T-014 foram marcadas como concluídas por aprovação do responsável, mas a limitação permanece registrada.
- [ ] Regressão checada (nada que já existia quebrou).
  - Há evidência estática e build aprovado; a regressão funcional no navegador não foi confirmada por falta de sessão autenticada.

## Entrega

- [ ] Procedimento de deploy corresponde ao que realmente vou fazer.
  - Nenhum deploy foi executado e este checklist não aprova deploy. A etapa de deploy ainda precisa seguir o procedimento autorizado pelo responsável.
- [x] Rollback é executável (eu sei os passos, não é teórico).
  - Ponto anterior registrado: `b410d0af5857acfde7b16454afed9e16513f1794`.
  - As alterações estão sem commit; qualquer rollback deve preservar arquivos não relacionados e ser executado somente após revisão explícita.

## Divergências encontradas

1. **Localização documental versus código:** a Spec indica `src/pages/CharacterSheet/`, mas `CharacterCreationPage` está efetivamente em `src/pages/CampaignCreate/`. O plano e a implementação mantiveram a localização efetiva; nenhum arquivo foi movido. Não é uma nova fronteira arquitetural.
2. **Status dos documentos:** a Spec e o plano ainda exibem `Status: Rascunho`, embora tenham sido aprovados pelo responsável. Isso é divergência de metadado documental e não foi alterado nesta revisão.
3. **Cobertura funcional autenticada:** T-011–T-014 foram aprovadas e marcadas como concluídas pelo responsável, mas a evidência disponível registra somente validação estática/técnica para esses caminhos, pois o ambiente local exigiu autenticação. Esse ponto permanece explicitamente não confirmado para a decisão de deploy.
4. **Escopo do fallback:** o boundary foi aplicado somente ao fluxo pessoal (`personal-create`), conforme T-007 e o escopo da feature. O fluxo de criação em campanha não recebeu esse fallback.

## Conclusão da revisão

- T-001 a T-016 estão marcadas como concluídas em `specs/04-plano/correcao-criacao-personagem/tarefas.md`.
- A convergência estrutural e de código foi revisada.
- Os requisitos de prioridade alta e a regressão funcional não estão totalmente confirmados por execução autenticada.
- Não aprovo o deploy; a decisão permanece com Marcos.
