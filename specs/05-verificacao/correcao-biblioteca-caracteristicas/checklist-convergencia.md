# Checklist de Convergência — Correção da Biblioteca de Características

Feature: `specs/03-features/correcao-biblioteca-caracteristicas/spec.md`  
Plano: `specs/04-plano/correcao-biblioteca-caracteristicas/plano.md`  
Arquitetura: `specs/02-arquitetura/ARQUITETURA/ARQUITETURA_RPG_MANAGER.md`  
Data da revisão: 13/09/2026  
Status: **Revisão concluída com ressalva; deploy não aprovado**

> O caminho literal `specs/05-verificacao/checklist-convergencia.md` não existia no
> workspace. Este checklist foi criado na pasta da feature, seguindo a estrutura dos
> checklists existentes em `specs/05-verificacao/`.

Escopo da comparação: **SPEC DA FEATURE ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTES**.

## 1. Rastreabilidade das tarefas

- [x] T-001 a T-003: baseline, causa técnica e contrato da build antiga registrados.
- [x] T-004: rota e ligação do menu confirmadas.
- [x] T-005: integração com o catálogo existente corrigida e testada.
- [x] T-006: estado identificável para falha de renderização/carregamento implementado.
- [x] T-007 a T-010: acesso autorizado, apresentação, retorno e integridade do catálogo
      verificados.
- [x] T-011 a T-014: build, validações, caminho feliz e regressão mínima executados.
- [x] T-015 e T-016: revisão arquitetural, rollback e handoff registrados.

As tarefas foram marcadas como concluídas pelo responsável. Isso não constitui aprovação
automática do deploy.

## 2. Critérios de aceite

- [x] **AC-001 — caminho feliz:** Mestre e jogador participante abriram a biblioteca pelo
      menu da campanha. A rota correta foi aberta, 49 cards foram renderizados e não houve
      erro de console.
- [ ] **AC-002 — caminho de erro:** o Error Boundary e a mensagem **Biblioteca
      indisponível** estão implementados, mas a falha controlada não foi injetada no
      ambiente local. A validação runtime foi explicitamente deixada para produção.

## 3. Requisitos funcionais e regras de negócio

| Requisito | Código/plano | Evidência | Status |
|---|---|---|---|
| FR-001 — abrir a biblioteca da campanha | `main.jsx`, `Campaigns/pages.jsx`, T-004/T-009 | Clique pelo menu, URL correta e retorno ao menu | Confirmado |
| FR-002 — exibir a biblioteca antiga sem tela branca | `CampaignCharacteristicsPage`, catálogo existente, T-003/T-005/T-008 | 49 cards, filtros, busca, descrições e flags renderizados | Confirmado no caminho feliz |
| BR-001 — Características não leva a página branca | callback e rota preservados | Teste manual local com Mestre e jogador | Confirmado |
| BR-002 — não alterar catálogo ou regras | `characteristicsCatalog.js` sem diff | `git diff` e regressão das rotas | Confirmado |
| AC-002 — falha identificável | Error Boundary local | Implementação revisada; validação de falha pendente em produção | Parcial |

## 4. Suposições e perguntas abertas

- [x] A biblioteca para Mestre e jogador participante foi confirmada.
- [x] Usuário não participante foi definido como fora do escopo, não como uma vertente de
      teste.
- [x] “Como na build antiga” foi tratado como paridade funcional, sem catálogo ou regra
      nova; o contrato está registrado em T-003.
- [ ] A mensagem exata e a possibilidade de nova tentativa em caso de erro continuam sem
      definição específica; a Spec só exige um estado identificável.
- [x] O acesso direto à rota foi exercitado durante a validação local.
- [ ] O comportamento de catálogo completamente vazio não foi exercitado, pois o catálogo
      vigente possui entradas; não há requisito adicional definido para esse cenário.

## 5. Arquitetura e limites

- [x] A alteração de código ficou restrita a `src/pages/Campaigns/pages.jsx`.
- [x] O catálogo permaneceu em `src/systems/assimilacao/characteristicsCatalog.js`.
- [x] `src/app/main.jsx`, `src/core/`, `src/systems/assimilacao/characteristicsCatalog.js`,
      `supabase/` e persistência não receberam alteração nesta correção.
- [x] Não foi criada nova camada, serviço, catálogo, migration ou integração com Supabase.
- [x] A UI continua consumindo o catálogo por import do módulo de sistema já existente;
      nenhum acesso direto novo ao Supabase foi criado.
- [x] Não há indício de cruzamento dos limites entre `core`, `pages` e `systems`.

### Divergência registrada

O plano dizia que não havia componentes novos planejados. Foi criado um Error Boundary
local dentro do módulo de páginas para atender AC-002. A divergência é limitada ao
componente interno, não cria uma fronteira arquitetural ou módulo compartilhado, e foi
registrada como necessária em T-015.

## 6. Testes e prioridades

O plano não rotula FRs em uma seção própria de prioridade. Por serem os requisitos centrais
da feature e estarem ligados ao caminho principal da Fase 4, FR-001 e FR-002 foram tratados
como prioridade alta.

| Requisito prioritário | Teste | Resultado |
|---|---|---|
| FR-001 | Clique pelo menu, rota correta, retorno e regressão das rotas de campanha | Confirmado localmente |
| FR-002 | Renderização do catálogo, 49 cards, busca, filtro e ausência de erro no caminho feliz | Confirmado localmente no caminho feliz |
| AC-002 associado a FR-002 | Error Boundary implementado; falha controlada | Não confirmado localmente; validar em produção |

- [x] `pnpm build` passou.
- [x] `pnpm validate:assimilations` passou: 52 assimilações, 266 habilidades e nenhuma
      habilidade sem custo de aquisição.
- [x] `git diff --check` passou; os avisos foram apenas de conversão de finais de linha.
- [x] O caminho feliz foi testado com os dois perfis DEV autorizados.
- [x] Busca por **Viajado** retornou 1 card e filtro de custo 5 retornou 2 cards.
- [ ] Falha controlada do catálogo/renderização não foi executada localmente; fica para
      produção conforme decisão do responsável.

## 7. Regressão de funcionalidades existentes

- [x] A rota de participantes continuou acessível.
- [x] A rota de itens continuou acessível.
- [x] A rota de assimilações continuou acessível.
- [x] A rota de sessões continuou acessível.
- [x] A visualização de personagem continuou acessível.
- [x] A rota de criação de personagem resolveu e exibiu o bloqueio esperado para o jogador
      que já possuía ficha.
- [x] Não houve erro de console no caminho feliz da biblioteca.

Resultado: não há indício de regressão reproduzida nas rotas exercitadas. A cobertura não
representa todos os fluxos da aplicação, mas cobre as rotas de campanha diretamente
afetadas pelo módulo alterado.

## 8. Divergências ou itens não confirmados

1. O checklist genérico solicitado não existia; o checklist foi criado em
   `specs/05-verificacao/correcao-biblioteca-caracteristicas/` seguindo o padrão existente.
2. A validação runtime de AC-002/T-013 não foi feita localmente e está planejada para
   produção.
3. Catálogo vazio não foi exercitado; o caso permanece sem comportamento específico na
   Spec.
4. O Error Boundary registra o erro no console e reutiliza `CampaignAccessMessage` para o
   feedback; isso atende à identificação do estado, mas a Spec não define componente,
   linguagem ou botão de retry específicos.

## 9. Rollback, entrega e decisão de deploy

- [x] O ponto de rollback está registrado como
      `e402d41a02dc087b52e62e54ac679a525172c702`.
- [x] Não houve alteração de schema, migration, persistência ou deploy.
- [x] O handoff e as evidências estão registrados em `T-015-a-T-016-entrega.md` e
      `T-006-a-T-014-verificacao.md`.
- [ ] A convergência não foi aprovada automaticamente para deploy.
- [ ] A validação de AC-002 em produção ainda não foi realizada.
- [ ] A aprovação explícita do deploy pelo responsável ainda não foi dada.
