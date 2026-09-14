# Tarefas — Ajuste de tonalidade na aba de progressão

Plano relacionado: `specs/04-plano/ajuste-tonalidade-progressao/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia os requisitos da Feature e possui uma verificação objetiva de conclusão. T-001 a T-011 foram aprovadas e concluídas. As tarefas adicionais da decisão tardia DT-001 permanecem pendentes de execução e aprovação.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002] Registrar o baseline visual e técnico da aba de progressão
  - Arquivos/módulos: `src/styles.css`; `src/pages/CharacterSheet/pages.jsx`; scripts de `package.json`
  - Verificação: abrir a aba de progressão, registrar a diferença entre o fundo das aptidões (`#f8efdb`) e o fundo atual das características (`#ead9bd80`), capturar a referência visual e executar `pnpm build` antes da alteração.

- [x] T-002 [FR-001, FR-002] Mapear os seletores e elementos correspondentes
  - Arquivos/módulos: regras `.progression-aptitude-*`, `.progression-characteristic-*`, `.progression-characteristics` e `.progression-request-review` em `src/styles.css`; renderização em `src/pages/CharacterSheet/pages.jsx`
  - Verificação: produzir uma lista dos elementos de aptidões e características que serão comparados — fundo, bordas, separadores, títulos, textos, botões, detalhes e estados — sem alterar código funcional.

## Fase 2 — Lógica principal

- [x] T-003 [FR-001, FR-002] Consolidar o mapa de valores de referência da BR-003
  - Arquivos/módulos: `src/styles.css`; Spec da Feature, seção BR-003
  - Verificação: confirmar que cada elemento alvo possui um valor de referência definido: `#f8efdb`, `#c7ab84`, `#713b35`, `#4c392c`, `#866e59`, `#9b725e`, `transparent` e opacidade `.45`.

- [x] T-004 [FR-002] Isolar regras de características sem alterar comportamento
  - Arquivos/módulos: `src/styles.css`; `src/pages/CharacterSheet/pages.jsx` somente para inspeção
  - Verificação: confirmar que a abordagem não exige alteração em JSX, catálogos, serviços, permissões, regras de XP, dados ou ações existentes; se regras CSS agrupadas forem separadas, confirmar que apenas o escopo visual necessário foi isolado.

## Fase 3 — Interface

- [x] T-005 [FR-001] Igualar o fundo e a moldura do bloco de características
  - Arquivos/módulos: `.progression-characteristics` em `src/styles.css`
  - Verificação: o bloco de características deve usar fundo `#f8efdb` e borda `#c7ab84`, iguais aos blocos de aptidões, sem alterar o fundo ou a borda de bloqueios, erros e histórico.

- [x] T-006 [FR-001, FR-002] Igualar os elementos internos e estados visuais
  - Arquivos/módulos: `.progression-characteristic-*` e `.progression-request-review` em `src/styles.css`
  - Verificação: textos principais usam `#4c392c`, textos auxiliares `#866e59`, títulos `#713b35`, separadores `#c7ab84`, botões borda `#9b725e`, fundo `transparent`, texto `#713b35` e estado desabilitado opacidade `.45`; nenhuma ação ou estado funcional deixa de existir.

- [x] T-007 [FR-001, FR-002] Confirmar a apresentação responsiva após o ajuste
  - Arquivos/módulos: `src/styles.css`, especialmente media queries da progressão
  - Verificação: abrir a aba em desktop e em uma largura menor, confirmar que características e aptidões mantêm a mesma tonalidade e que não surgem sobreposição, corte de conteúdo ou perda de legibilidade.

## Fase 4 — Testes

- [x] T-008 [FR-001, FR-002] Executar build e validações técnicas
  - Arquivos/módulos: projeto inteiro; scripts `build` e `validate:assimilations` de `package.json`
  - Verificação: `pnpm build` e `pnpm validate:assimilations` concluem sem erro após a alteração.

- [x] T-009 [FR-001] Verificar o caminho feliz visual
  - Arquivos/módulos: aplicação executada localmente; aba de progressão; `src/styles.css`
  - Verificação: com os três blocos de aptidões e o bloco de características visíveis, confirmar que todos os elementos correspondentes apresentam os mesmos valores de estilo e que a seção de características está mais legível.

- [x] T-010 [FR-001, FR-002] Verificar o caminho de erro de divergência visual
  - Arquivos/módulos: estilos computados ou inspeção das regras de `src/styles.css`
  - Verificação: comparar cada elemento interno da característica com a referência das aptidões; qualquer valor diferente em fundo, texto, borda, botão ou estado deve ser registrado como falha e impedir a conclusão da tarefa.

- [x] T-011 [FR-002] Executar regressão funcional mínima da progressão
  - Arquivos/módulos: `src/pages/CharacterSheet/pages.jsx`; componentes/serviços já existentes da progressão
  - Verificação: confirmar que descrições continuam expandindo, botões continuam exibindo os estados corretos, ações de progressão continuam disponíveis conforme as regras existentes e a navegação de retorno continua funcionando.

## Escopo adicional DT-001 — Fase 3: Interface

- [x] T-012 [FR-003] Mapear os seletores e elementos correspondentes do histórico de XP
  - Arquivos/módulos: `.progression-history`, `.progression-history-row`, `.progression-history-row strong`, `.progression-history p` e títulos em `src/styles.css`; renderização em `src/pages/CharacterSheet/pages.jsx`
  - Verificação: listar fundo, bordas, separadores, títulos, textos, destaques e estados do histórico que devem usar os valores da BR-003, sem alterar seu conteúdo ou comportamento.

- [x] T-013 [FR-003] Igualar o fundo e a moldura do histórico de XP
  - Arquivos/módulos: `.progression-history` em `src/styles.css`
  - Verificação: o histórico deve usar fundo `#f8efdb` e borda `#c7ab84`, iguais aos blocos de aptidões, sem alterar bloqueios ou mensagens de erro.

- [x] T-014 [FR-002, FR-003] Igualar os elementos internos e estados do histórico de XP
  - Arquivos/módulos: `.progression-history-row`, `.progression-history-row strong`, `.progression-history p` e seletores internos relacionados em `src/styles.css`
  - Verificação: textos, destaques, separadores e estados do histórico usam os valores correspondentes da BR-003; o conteúdo e a ordem dos registros permanecem inalterados.

## Escopo adicional DT-001 — Fase 4: Testes

- [x] T-015 [FR-003] Verificar o caminho feliz visual do histórico de XP
  - Arquivos/módulos: aplicação executada localmente; histórico de XP; `src/styles.css`
  - Verificação: com o histórico de XP visível, confirmar que o bloco e seus elementos internos apresentam os mesmos valores de estilo dos três blocos de aptidões e mantêm conteúdo e legibilidade.

- [x] T-016 [FR-003] Verificar o caminho de erro de divergência visual do histórico
  - Arquivos/módulos: estilos computados ou inspeção das regras de `src/styles.css`
  - Verificação: comparar cada elemento do histórico com a referência das aptidões; qualquer valor diferente em fundo, texto, borda, separador, destaque ou estado deve ser registrado como falha.

- [x] T-017 [FR-002, FR-003] Executar regressão funcional do histórico e da progressão
  - Arquivos/módulos: `src/pages/CharacterSheet/pages.jsx`; componentes/serviços já existentes da progressão
  - Verificação: confirmar que o histórico mantém conteúdo e ordem, que a expansão de descrições e ações de progressão continuam funcionando e que as alterações anteriores de características não regrediram.

## Fase 5 — Entrega

- [x] T-018 [FR-001, FR-002, FR-003] Revisar o diff contra a Spec e a arquitetura
  - Arquivos/módulos: diff da implementação; `specs/03-features/ajuste-tonalidade-progressao/spec.md`; `specs/02-arquitetura/`
  - Verificação: confirmar que a implementação atende FR-001/FR-002/FR-003, usa os valores da BR-003 e BR-004, permanece na interface existente e não altera regras, dados, serviços ou limites arquiteturais.

- [x] T-019 [FR-001, FR-002, FR-003] Preparar rollback e handoff para aprovação
  - Arquivos/módulos: histórico da alteração; evidências de T-008 a T-017
  - Verificação: registrar o ponto anterior às alterações de `src/styles.css`, anexar evidências dos caminhos felizes, das divergências visuais e das regressões, e encaminhar para revisão de Marcos; não realizar deploy sem aprovação posterior.

## Adiado (fora do escopo desta rodada)

- [ ] Criar nova paleta de cores ou redesenhar a aba de progressão.
- [ ] Alterar regras, custos, níveis, requisitos ou conteúdo de aptidões/características.
- [ ] Alterar navegação, permissões ou ações funcionais da progressão.
- [ ] Criar componentes, módulos, serviços, migrations ou sincronização de dados.
- [ ] Criar uma nova infraestrutura automatizada de testes visuais.
