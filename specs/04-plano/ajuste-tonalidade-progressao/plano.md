# Plano de Implementação — Ajuste de tonalidade na aba de progressão

Spec relacionada: `specs/03-features/ajuste-tonalidade-progressao/spec.md`  
Status: Em andamento

## 1. Resumo técnico

A implementação será uma alteração visual incremental nos estilos já existentes da aba de progressão. Os estilos dos três blocos de aptidões, definidos em `src/styles.css`, serão tratados como fonte dos valores de referência e reutilizados nos blocos de características e de histórico de XP e em seus elementos internos.

A mudança ficará no limite já previsto para a interface da ficha/progressão em `src/pages/CharacterSheet/` e `src/styles.css`. Não serão criados componentes, módulos, serviços, regras de progressão, persistência ou estruturas arquiteturais novas.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/styles.css` | Ajustar as regras de `.progression-characteristics`, `.progression-history` e seus elementos internos para reutilizar os valores dos blocos `.progression-aptitude-group` e seus descendentes | Médio: há regras agrupadas com estados de bloqueio, erro e histórico; uma alteração ampla pode mudar outras mensagens ou seções |
| `src/pages/CharacterSheet/pages.jsx` | Inspecionar os elementos renderizados pela `ProgressionPage` e `ProgressionPanel`; nenhuma alteração funcional prevista | Baixo: alteração desnecessária neste arquivo poderia afetar navegação, ações ou permissões |
| Catálogos, serviços e persistência | Nenhuma mudança | Baixo |

## 3. Componentes novos

Não haverá componentes, módulos ou pastas novos.

A implementação deve reutilizar os seletores e a estrutura de renderização existentes. Se uma regra CSS agrupada impedir a aplicação isolada da tonalidade, ela poderá ser separada em regras mais específicas dentro de `src/styles.css`, sem criar uma nova camada ou alterar a arquitetura.

## 4. Mudança de dados/banco (se houver)

Não haverá mudança de dados, banco de dados, migration, RPC, `localStorage` ou contratos de serviços.

O rollback será feito revertendo as alterações de estilo em `src/styles.css` para os valores anteriores, especialmente o fundo atual `#ead9bd80` dos blocos de características e histórico de XP.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar o baseline da aba de progressão em uma viewport desktop e, se disponível, mobile.
2. Confirmar no código e na tela os seletores usados pelos blocos de aptidões e características.
3. Registrar os valores atuais das aptidões definidos na BR-003 e as diferenças existentes nas características.
4. Executar a validação técnica disponível antes da alteração para distinguir falhas preexistentes de falhas introduzidas pela feature.

### Fase 2 — Lógica principal

1. Mapear cada elemento visual correspondente entre aptidões e características: fundo, bordas, separadores, títulos, textos principais, textos auxiliares, botões e estados.
2. Mapear também os elementos correspondentes do histórico de XP: fundo, bordas, separadores, títulos, textos e estados.
3. Isolar as regras específicas de características e histórico das regras compartilhadas com bloqueios e erros quando isso for necessário para evitar regressão visual.
4. Manter intactos os dados, as regras de progressão, os estados funcionais e as ações existentes, conforme FR-002 e FR-003.

### Fase 3 — Interface

1. Aplicar ao bloco de características o fundo de referência `#f8efdb` e os demais valores da BR-003.
2. Ajustar os elementos internos e estados das características para usar os valores correspondentes das aptidões, incluindo textos, bordas, separadores, botões, detalhes expansíveis, estado desabilitado e ações de solicitação/revisão.
3. Aplicar ao bloco de histórico de XP o fundo de referência `#f8efdb` e os demais valores da BR-003, incluindo seus registros, títulos, separadores e estados.
4. Conferir que os ajustes visuais permanecem corretos nas larguras responsivas já suportadas, sem alterar layout, conteúdo ou interação.

### Fase 4 — Testes

1. Executar `pnpm build` e as validações existentes do projeto.
2. Verificar o caminho feliz com a aba de progressão aberta e os três blocos de aptidões, o bloco de características e o histórico de XP visíveis.
3. Comparar os valores computados ou as regras aplicadas em cada elemento correspondente; qualquer divergência em características ou histórico deve reprovar a validação, conforme AC-002.
4. Executar regressão mínima das ações da progressão: expansão de descrição, estados dos botões, progressão de aptidões e navegação de retorno.
5. Confirmar que outras telas que usam os estilos de campanha continuam visualmente e funcionalmente acessíveis.

### Fase 5 — Entrega (deploy/rollback)

1. Revisar o diff contra a Spec aprovada, a BR-003, a BR-004 e os limites da arquitetura.
2. Confirmar que o diff contém somente a alteração visual prevista para características e histórico e não inclui dados, serviços, migrations ou mudanças funcionais.
3. Registrar o ponto anterior da implementação como referência de rollback.
4. Encaminhar o resultado para revisão e aprovação de Marcos; não realizar deploy como parte deste plano.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Registro de Decisão? |
|---|---|---|---|---|
| As regras agrupadas de `.progression-characteristics` e `.progression-history` também atingirem `.progression-lock` ou `.progression-error` | Média | Médio | Separar somente as declarações necessárias e executar regressão visual dessas seções | Não. É uma correção local e reversível dentro da estrutura existente |
| A alteração de cores de estados específicos, como solicitação/revisão, reduzir a distinção visual desses estados | Média | Médio | Usar exatamente os valores das aptidões, como confirmado na Spec, e validar todos os estados na tela | Não. A decisão de padronização visual já foi definida pelo solicitante |
| Algum elemento exclusivo do histórico, como o destaque de registros, continuar usando `#315e60` ou outra cor fora da BR-003 | Média | Médio | Inspecionar `.progression-history-row`, títulos, textos e estados individualmente e comparar com a referência das aptidões | Não. A decisão tardia define reutilização da paleta existente |
| A tonalidade ficar correta em desktop, mas destoar em viewport menor | Baixa | Médio | Verificar ao menos uma largura responsiva e preservar os media queries existentes | Não. Não altera limite arquitetural |
| Uma mudança acidental em `pages.jsx` alterar ações ou navegação | Baixa | Alto | Não modificar JSX sem necessidade; validar expansão, botões, permissões e retorno | Não. O plano mantém a interface existente |
| Não haver testes automatizados específicos para CSS | Alta | Baixo | Combinar `pnpm build` com inspeção visual e comparação objetiva dos valores de estilo | Não. Não justifica introduzir um framework de testes nesta feature |

## 7. Perguntas abertas antes de começar

Nenhuma pergunta aberta bloqueante. A Spec define a abrangência da padronização, os valores exatos a serem reutilizados e a decisão tardia DT-001 para o histórico de XP.

Se a implementação revelar necessidade de criar uma nova fronteira entre `core`, `pages` e `systems`, alterar comportamento funcional ou modificar persistência, a tarefa afetada deve parar e um Registro de Decisão deve ser proposto antes de continuar.
