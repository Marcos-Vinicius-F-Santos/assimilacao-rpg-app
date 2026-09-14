# Tarefas — Correção da Biblioteca de Características

Plano relacionado: `specs/04-plano/correcao-biblioteca-caracteristicas/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia os requisitos da Feature e possui uma verificação objetiva de conclusão. O status abaixo reflete a execução e a aprovação de cada portão.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002] Registrar o baseline e reproduzir a página em branco
  - Arquivos/módulos: aplicação em execução; fluxo de campanha; `package.json`
  - Verificação: abrir uma campanha, clicar em **Características**, registrar a URL final, confirmar o estado em branco e guardar o erro de console/runtime, se existir; executar também `pnpm build` como baseline.

- [x] T-002 [FR-001, FR-002] Rastrear a cadeia de navegação e renderização
  - Arquivos/módulos: `src/pages/Campaigns/pages.jsx`, `src/pages/Campaigns/index.jsx`, `src/app/main.jsx`
  - Verificação: identificar o ponto exato em que o fluxo deixa de produzir a biblioteca — item do menu, `onOpenCharacteristics`, parser de rota, export/import ou renderização — e registrar a causa sem alterar código.

- [x] T-003 [FR-002] Confirmar o contrato observável da build antiga
  - Arquivos/módulos: referência da build antiga, quando disponível; Spec da Feature aprovada
  - Verificação: registrar quais elementos funcionais da biblioteca precisam reaparecer; se a build antiga não estiver disponível, confirmar que o contrato mínimo usado será “página da biblioteca visível, sem catálogo ou regra nova”.

## Fase 2 — Lógica principal

- [x] T-004 [FR-001] Corrigir o ponto de navegação ou resolução da rota identificado
  - Arquivos/módulos: `src/app/main.jsx` e, somente se necessário, `src/pages/Campaigns/pages.jsx` ou `src/pages/Campaigns/index.jsx`
  - Verificação: o clique em **Características** deve resolver a rota da campanha correta e instanciar a página correspondente; as rotas de itens, assimilações e sessões devem continuar resolvendo como antes.

- [x] T-005 [FR-002] Corrigir a integração da página com o catálogo existente
  - Arquivos/módulos: `src/pages/Campaigns/pages.jsx`; `src/systems/assimilacao/characteristicsCatalog.js`
  - Verificação: a página deve consumir o catálogo já existente e renderizar suas entradas sem modificar conteúdo, custos, requisitos ou regras usadas por criação/progressão de personagens.

- [x] T-006 [FR-002] Garantir estado identificável para falha de carregamento
  - Arquivos/módulos: `src/pages/Campaigns/pages.jsx` e componentes/estilos de feedback já existentes, se necessários
  - Verificação: provocar uma condição controlada em que a biblioteca não possa ser carregada e confirmar a exibição de estado ou mensagem identificável; não deve haver tela totalmente branca sem explicação.

- [x] T-007 [FR-001, FR-002] Preservar o controle de acesso da campanha
  - Arquivos/módulos: `src/pages/Campaigns/pages.jsx`; serviços locais/remotos apenas para leitura durante a verificação
  - Verificação: um participante autorizado consegue abrir a biblioteca; um usuário que não participa da campanha continua recebendo o tratamento de acesso existente; nenhuma permissão nova é criada.

## Fase 3 — Interface

- [x] T-008 [FR-002] Restaurar a apresentação da biblioteca de características
  - Arquivos/módulos: `src/pages/Campaigns/pages.jsx`; `src/styles.css` somente se uma regra visual comprovadamente impedir a exibição
  - Verificação: comparar a tela com a referência da build antiga ou com o contrato da Spec e confirmar que a biblioteca está visível, legível e não substituída por uma página em branco.

- [x] T-009 [FR-001] Confirmar a ligação do menu à campanha correta
  - Arquivos/módulos: menu/referência de campanha em `src/pages/Campaigns/pages.jsx`; callback em `src/app/main.jsx`
  - Verificação: em uma campanha selecionada, clicar em **Características** abre a biblioteca daquela mesma campanha e o botão de retorno continua levando ao menu da campanha.

- [x] T-010 [FR-002] Confirmar que a correção não altera o catálogo
  - Arquivos/módulos: `src/systems/assimilacao/characteristicsCatalog.js`; páginas de criação e progressão relacionadas
  - Verificação: comparar o catálogo antes/depois e confirmar que não foram adicionadas, removidas ou alteradas características, custos, requisitos ou regras.

## Fase 4 — Testes

- [x] T-011 [FR-001, FR-002] Executar build e validações técnicas
  - Arquivos/módulos: projeto inteiro; scripts de `package.json`
  - Verificação: `pnpm build` e `pnpm validate:assimilations` concluem sem erro após a correção.

- [x] T-012 [FR-001, FR-002] Verificar o caminho feliz da biblioteca
  - Arquivos/módulos: aplicação executada localmente; campanha com usuário participante
  - Verificação: abrir o menu de campanha, clicar em **Características** e confirmar a página da biblioteca visível, com o conteúdo esperado e sem página em branco.

- [x] T-013 [FR-002] Verificar o caminho de erro da biblioteca
  - Arquivos/módulos: página de características e mecanismo de carregamento/renderização usado pela implementação
  - Verificação: executar a condição de falha controlada e confirmar um estado/mensagem de erro identificável, sem falha silenciosa; registrar a evidência.

- [x] T-014 [FR-001, FR-002] Executar regressão mínima das rotas de campanha
  - Arquivos/módulos: menu da campanha; páginas de participantes, itens, assimilações, sessões, criação e visualização de personagens
  - Verificação: confirmar que os fluxos existentes continuam acessíveis e que a mudança não redireciona essas rotas para a biblioteca ou para uma página em branco.

## Fase 5 — Entrega

- [x] T-015 [FR-001, FR-002] Revisar o diff contra a Spec e a arquitetura
  - Arquivos/módulos: diff da implementação; `specs/03-features/correcao-biblioteca-caracteristicas/spec.md`; `specs/02-arquitetura/`
  - Verificação: confirmar que a alteração atende FR-001/FR-002, permanece em `app/pages/systems/assimilacao` conforme os limites existentes e não cria persistência, catálogo ou estrutura paralela.

- [x] T-016 [FR-001, FR-002] Preparar rollback e handoff para aprovação
  - Arquivos/módulos: histórico da implementação; evidências de T-011 a T-014
  - Verificação: registrar o ponto anterior à correção, confirmar que o build passa, anexar as evidências do caminho feliz/erro/regressão e encaminhar para revisão; não realizar deploy sem autorização posterior.

## Adiado (fora do escopo desta rodada)

- [ ] Criar ou alterar características do catálogo.
- [ ] Alterar custos, requisitos ou regras de características.
- [ ] Criar sincronização com Supabase ou alterar migrations.
- [ ] Alterar permissões de Mestre e jogadores.
- [ ] Criar nova estrutura arquitetural ou Registro de Decisão, salvo se a investigação demonstrar que a solução exige uma mudança de limite.
