# Checklist de Convergência — Modo DEV com Supabase local em Docker

Feature: `specs/03-features/modo-dev-docker-supabase/spec.md`  
Plano: `specs/04-plano/modo-dev-docker-supabase/plano.md`  
Data da revisão: 13/09/2026  
Status: Convergência aprovada pelo responsável; ressalvas aceitas para a fase atual; deploy ainda depende da aprovação explícita

Escopo da comparação: SPEC DA FEATURE ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTES.

## Execução dos critérios de aceite — 13/09/2026

- [x] **AC-001 — execução local:** com o Docker ativo e `.env.local`, a aplicação abriu
      campanha, ficha e progressão; exibiu XP 1 e histórico da sessão, sem tela de
      configuração e sem erros ou avisos no navegador.
- [x] **AC-002 — aprovado com ressalva:** o deploy público respondeu HTTP 200, carregou a SPA
      e o bundle contém destino Supabase remoto sem URL local. O fluxo autenticado em
      produção não foi executado por não haver conta de produção autorizada para teste;
      a limitação foi aceita pelo responsável para esta fase.
- [x] **AC-003 — backend local indisponível:** com o Docker parado, a aplicação exibiu
      “Backend local indisponível” e informou que não faria fallback para produção.
- [x] **AC-004 — configuração de produção ausente:** um build de produção real sem as
      variáveis Supabase exibiu “Configuração de produção ausente” e informou que não
      usaria o Docker local.

## Execução dos testes TST-001 a TST-008 — 13/09/2026

- [x] **TST-001:** caminho local completo e consulta do banco confirmados.
- [x] **TST-002:** regressão no DEV remoto confirmada com mestre e jogador.
- [x] **TST-003:** deploy público inspecionado em leitura, sem alterações.
- [x] **TST-004:** troca de ambiente na mesma origem e restauração local confirmadas.
- [x] **TST-005:** cenários de indisponibilidade, configuração ausente, portas, migration
      divergente e ausência de fallback confirmados.
- [x] **TST-006 — aprovado com ressalva:** nova aba do navegador interno carregou a aplicação, mas não havia outro
      navegador ou perfil disponível para confirmar a cobertura adicional.
- [x] **TST-007:** regressão local e remota das features existentes confirmada.
- [x] **TST-008:** ensaio de rollback em cópia descartável passou em build e validação; o
      working tree atual não foi revertido.

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da spec (ou está
      documentado como decisão consciente fora da spec).
  - A lógica de ambiente corresponde aos FRs e está centralizada.
  - Há uma divergência documental: a Spec ainda cita `src/lib/supabase.js`, enquanto o
    código atual usa `src/core/lib/supabase.js`, conforme a arquitetura e a migração
    incremental aprovada.
  - O código impede URL local em build de produção, mas aceita qualquer URL remota; a
    garantia de que essa URL é especificamente a de produção depende da configuração do
    deploy e não é validada pelo código.

- [x] Critério de aceite reflete o comportamento final de verdade; AC-002 permanece
      aprovado com a ressalva de cobertura autenticada em produção:
  - AC-001, AC-003 e AC-004 foram exercitados localmente.
  - AC-002 foi confirmado parcialmente: o deploy público respondeu HTTP 200 e o bundle
    contém destino Supabase remoto sem URL local, mas não houve uso autenticado completo
    em produção.

## Arquitetura

- [x] A estrutura de pastas/módulos ainda respeita `specs/02-arquitetura/`.
  - O cliente está em `src/core/lib/supabase.js`.
  - A busca encontrou um único `createClient`, nenhum acesso direto ao Supabase em
    `src/app`, `src/pages` ou `src/shared`, e nenhum import de `systems/` em `src/core`.
  - `supabase/config.toml` e `supabase/migrations/` permanecem fora de `src/`.

- [x] Se cruzou algum limite, isso foi uma decisão consciente (registrar se for grande).
  - Não foi identificado cruzamento arquitetural novo. A diferença entre `src/lib` na
    Spec/plano antigo e `src/core/lib` no código é consequência documentada da
    reestruturação arquitetural, não uma segunda implementação do cliente.

## Dados

- [x] Migration testada, se houve mudança de schema.
  - Não houve migration nova nesta feature.
  - As 10 migrations locais foram listadas e o `supabase db diff --local --schema public`
    terminou com `No schema changes found`.
  - O cenário negativo de remover deliberadamente uma migration não foi simulado, pois
    exigiria reset/alteração temporária do banco DEV e não é necessário para confirmar o
    schema atualmente aplicado.

- [x] Sei como reverter se a migration der problema.
  - O rollback de dados está limitado ao ambiente local e usa `pnpm supabase:reset`.
  - Não existe rollback de migration remota nesta feature.

## Testes

- [x] Requisitos de prioridade alta têm verificação feita; as limitações registradas foram
      aceitas pelo responsável:
  - FR-001 e FR-002 passaram no caminho feliz local; FR-004 e FR-005 passaram na troca e
    no contrato comum entre local e DEV remoto; FR-006 passou nos cenários negativos.
  - FR-003 foi confirmado quanto ao destino remoto compilado no deploy e ao uso do DEV
    remoto, mas não quanto ao fluxo autenticado completo em produção.
  - O cenário de migration deliberadamente ausente também não foi executado.

- [x] Regressão checada (nada que já existia quebrou); as ressalvas de cobertura foram
      aceitas pelo responsável:
  - O caminho local completo passou: autenticação, campanha, ficha, sessão, XP e
    progressão; a consulta local confirmou sessão fechada, +3 XP e saldo final 1 após
    a melhoria.
  - A regressão no DEV remoto também passou: mestre e jogador acessaram a mesma campanha,
    ficha e progressão; o jogador visualizou XP 3 e o histórico “XP da Sessão 1”, sem
    erros ou avisos no navegador.
  - Porém, `specs/04-plano/reestruturacao-arquitetural/fix-backlog.md` mantém FB-001 como
    evidência histórica aberta, com o resultado antigo de XP 0 no jogador. A ressalva foi
    aceita pelo responsável e não bloqueia a convergência desta fase.
  - Não foi executado teste em outro navegador ou dispositivo.

## Entrega

- [x] Procedimento de deploy corresponde ao que realmente vou fazer.
  - O procedimento local e de ambientes está documentado em `docs/local-supabase.md`.
  - O procedimento real de produção está em `specs/06-deploy/deploy.md`.

- [x] Rollback é executável (eu sei os passos, não é teórico).
  - O ponto de retorno e os limites estão registrados em
    `specs/04-plano/modo-dev-docker-supabase/T-021-rollback-revisao.md`.
  - O ensaio foi executado em cópia descartável extraída de `ae923b6`; build e validação
    passaram. O working tree atual não foi revertido nem alterado pelo rollback.

## Rastreabilidade dos requisitos

| Requisito | Plano/tarefa | Código verificado | Teste/evidência | Status |
|---|---|---|---|---|
| FR-001 | T-003, T-004, T-015 | `supabase/config.toml`, cliente central | Fluxo completo no Docker local | Confirmado |
| FR-002 | T-004, T-010, T-015 | Serviços `core` e migrations | Campanhas, ficha, sessão, XP e progressão locais | Confirmado |
| FR-003 | T-005, T-006, T-016, T-020 | Configuração central e bundle remoto | Bundle remoto verificado; fluxo autenticado de produção não executado | Parcial |
| FR-004 | T-005, T-006, T-007 | `src/core/lib/supabase.js` e consumidores | Alternância por ambiente sem editar consumidores | Confirmado |
| FR-005 | T-006, T-007, T-010, T-016 | Contrato único dos serviços | Local + DEV remoto autorizado | Confirmado |
| FR-006 | T-008, T-009, T-011, T-017 | Estados de configuração/indisponibilidade | Docker parado, configuração ausente e troca de origem | Confirmado |

## Divergências encontradas

1. **Spec/plano versus caminho atual do cliente:** a documentação antiga cita
   `src/lib/supabase.js`; o código convergido usa `src/core/lib/supabase.js`. É uma
   divergência documental explicável pela reestruturação, mas a Spec deve ser atualizada
   antes da aprovação final para não deixar o caminho desatualizado.
2. **Garantia de produção:** o código rejeita URL local em build de produção, porém não
   consegue distinguir sozinho um Supabase remoto DEV de um Supabase remoto de produção.
   A garantia de BR-002 depende das variáveis configuradas no provedor.
3. **Evidência de XP:** a confirmação manual recente difere do resultado histórico de
   FB-001. A divergência permanece registrada e foi aceita como não bloqueadora nesta fase.
4. **Cobertura não confirmada:** não foi executado fluxo autenticado completo no deploy de
   produção, nem teste em outro navegador/dispositivo, nem simulação destrutiva de migration
   ausente.

## Aprovação da convergência

- [x] O responsável aprovou os testes, checklists e ressalvas documentadas para esta fase.
- [x] Os itens aceitos como irrelevantes para a fase atual permanecem registrados como
      ressalvas, sem bloquear a convergência.
- [x] O procedimento operacional de deploy foi criado em `specs/06-deploy/deploy.md`.
- [ ] O deploy ainda não foi aprovado automaticamente; depende da resposta explícita
      registrada fora deste checklist.
