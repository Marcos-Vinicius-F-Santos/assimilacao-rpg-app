# Checklist de Convergência — Ajuste de tonalidade na aba de progressão

Feature: `specs/03-features/ajuste-tonalidade-progressao/spec.md`  
Plano: `specs/04-plano/ajuste-tonalidade-progressao/plano.md`  
Tarefas: `specs/04-plano/ajuste-tonalidade-progressao/tarefas.md`  
Arquitetura: `specs/02-arquitetura/ARQUITETURA/ARQUITETURA_RPG_MANAGER.md`  
Data da revisão: 13/09/2026  
Status: **Revisão concluída com ressalvas; deploy não aprovado**

Escopo da comparação: **SPEC DA FEATURE ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTES**.

## 1. Rastreabilidade das tarefas

- [x] T-001 a T-011: tarefas da padronização visual de características aprovadas e concluídas pelo responsável.
- [x] T-012 a T-017: tarefas da decisão tardia para o histórico de XP aprovadas e concluídas pelo responsável.
- [x] T-018 e T-019: revisão do diff, rollback e handoff aprovados e concluídos pelo responsável.
- [x] O plano está em `Em andamento`, coerente com a ausência de deploy e com a revisão final ainda sob responsabilidade de Marcos.

## 2. Critérios de aceite

- [ ] **AC-001 — caminho feliz:** os valores CSS do bloco de características correspondem à paleta das aptidões, mas a tela autenticada com aptidões e características visíveis não pôde ser reaberta nesta revisão.
- [x] **AC-002 — caminho de erro:** foi feita comparação estática das regras de características e histórico com a BR-003; qualquer divergência permanece definida como reprovação. A validação runtime de uma tela autenticada não foi possível.
- [ ] **AC-003 — histórico de XP:** os seletores do bloco e dos registros foram verificados no CSS, mas o histórico visível em uma sessão autenticada não pôde ser confirmado nesta revisão.

## 3. Requisitos funcionais e regras de negócio

| Requisito | Código/plano | Evidência | Status |
|---|---|---|---|
| FR-001 — características usam a tonalidade das aptidões | `.progression-characteristics` e seletores internos em `src/styles.css`; T-005/T-006 | Fundo `#f8efdb`, bordas `#c7ab84`, textos e botões alinhados à BR-003 | Parcial: runtime visual não confirmado |
| FR-002 — preservar conteúdo, estados funcionais e ações | Somente `src/styles.css` alterado; `src/pages/CharacterSheet/pages.jsx` sem diff | Nenhuma alteração em JSX, catálogos, serviços ou persistência; build passou | Parcial: interação em sessão autenticada não confirmada nesta revisão |
| FR-003 — histórico de XP usa a tonalidade das aptidões | `.progression-history`, `.progression-history-row`, `.progression-history-row strong` e `.progression-history p` em `src/styles.css`; T-012/T-014 | Fundo `#f8efdb`, bordas/separadores `#c7ab84`, destaque `#713b35` e texto auxiliar `#866e59` | Parcial: runtime visual não confirmado |
| BR-001/BR-002 — aptidões são a referência e não há paleta própria | `.progression-aptitude-group` comparado aos seletores de características/histórico | Valores correspondentes reutilizados no CSS | Confirmado estaticamente |
| BR-003/BR-004 — valores exatos reutilizados | Regras em `src/styles.css` e mapa da Spec | Valores da tabela da Spec conferidos nos seletores alterados | Confirmado estaticamente |

### Observação sobre possível divergência visual

O texto de descrição de cada transação é um `span` dentro de `.progression-history-row` e herda `#866e59`, tratado nesta revisão como texto auxiliar. A Spec não mapeia nominalmente esse texto para “principal” ou “auxiliar”; portanto, a equivalência visual desse elemento permanece **não confirmada** até inspeção da tela autenticada.

## 4. Suposições e perguntas abertas

- [x] A decisão tardia DT-001 foi incorporada à Spec e ao plano/tarefas.
- [x] A abrangência inclui fundo, textos, bordas, separadores, botões, estados e elementos internos.
- [ ] A classificação visual do texto descritivo dos registros de XP como texto auxiliar ainda precisa de confirmação visual.

## 5. Arquitetura e limites

- [x] A alteração de código ficou restrita a `src/styles.css`, dentro da interface existente da progressão.
- [x] `src/pages/CharacterSheet/pages.jsx` foi mantido sem alteração funcional.
- [x] Não houve alteração em `core/`, `systems/assimilacao/`, catálogos, serviços, persistência ou `supabase/`.
- [x] Não foram criados componentes, módulos, serviços, migrations ou novas fronteiras arquiteturais.
- [x] As regras agrupadas de `.progression-lock` e `.progression-error` foram preservadas com o fundo anterior `#ead9bd80`.
- [x] Não há indício de cruzamento dos limites definidos na arquitetura.

## 6. Testes e prioridades

O plano não classifica os FRs numericamente por prioridade. FR-001, FR-002 e FR-003 foram tratados como requisitos de prioridade alta por representarem o objetivo central da feature e estarem ligados aos critérios AC-001 e AC-003.

| Requisito prioritário | Teste | Resultado |
|---|---|---|
| FR-001 | Inspeção dos seletores e valores CSS; `pnpm build`; comparação da paleta | Confirmado estaticamente; visual runtime não confirmado |
| FR-002 | Diff sem JSX/lógica/dados; build; validação do catálogo | Sem indício estático de regressão; interação runtime não confirmada |
| FR-003 | Inspeção dos seletores do histórico; `pnpm build`; comparação da paleta | Confirmado estaticamente; histórico runtime não confirmado |

- [x] `pnpm build` passou. O aviso de chunk acima de 500 kB já existente não impediu o build.
- [x] `pnpm validate:assimilations` passou: 52 assimilações, 266 habilidades e nenhuma habilidade sem custo de aquisição.
- [x] `git diff --check` passou; o aviso foi apenas de conversão de finais de linha.
- [x] A aplicação local carregou conteúdo na rota inicial, sem overlay de erro e sem erros de console observados.
- [ ] A aba de progressão em uma sessão autenticada não foi exercitada nesta revisão.
- [ ] A comparação visual final em desktop e viewport menor não foi confirmada nesta revisão.

## 7. Regressão de funcionalidades existentes

- [x] Não houve diff em `src/pages/CharacterSheet/pages.jsx`, portanto não foram alteradas renderização JSX, ações ou navegação.
- [x] Não houve diff em serviços, catálogos, persistência, banco ou autenticação.
- [x] Bloqueios e erros mantiveram seus estilos anteriores após a separação das regras CSS.
- [x] Build e validação do catálogo continuam passando.
- [ ] Expansão de descrição, botões, estados e navegação não foram reexercitados em uma sessão autenticada nesta revisão.
- [ ] Outras rotas/telas do aplicativo não foram percorridas end-to-end nesta revisão.

Resultado: não há indício de regressão no diff ou nas validações técnicas. A ausência de uma sessão autenticada impede confirmar a regressão funcional completa e a apresentação final da progressão.

## 8. Divergências ou itens não confirmados

1. Não foi encontrada divergência estrutural ou funcional no código: a alteração está restrita a `src/styles.css`.
2. AC-001 e AC-003 não puderam ser confirmados visualmente em runtime porque o navegador local não tinha uma sessão autenticada com campanha/personagem.
3. A cor herdada do texto descritivo dos registros (`#866e59`) permanece como ponto de confirmação visual, pois a Spec não define explicitamente sua classificação entre texto principal e auxiliar.
4. A aplicação inicial carregou sem erro, mas isso não substitui a validação da rota autenticada de progressão.

## 9. Rollback, entrega e decisão de deploy

- [x] Não houve alteração de schema, migration, persistência ou deploy.
- [x] O ponto de rollback está registrado como `0b61a61616ee70e2d52330ac3cafd9068205a636`.
- [x] O rollback é executável para esta feature restaurando somente o arquivo de estilos ao ponto anterior: `git restore --source 0b61a61616ee70e2d52330ac3cafd9068205a636 -- src/styles.css`.
- [x] O diff de código contém somente `src/styles.css`; alterações documentais em Spec/plano/tarefas permanecem separadas do código.
- [ ] Não há procedimento de deploy específico desta feature validado neste checklist; o plano apenas determina handoff e não realizar deploy automaticamente.
- [ ] A convergência não aprova o deploy automaticamente.
- [ ] A aprovação explícita do deploy pelo responsável ainda não foi dada.
