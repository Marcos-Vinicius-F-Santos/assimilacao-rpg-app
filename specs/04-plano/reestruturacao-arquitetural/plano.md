# Plano de Implementação — Reestruturação Arquitetural Inicial

Spec relacionada: `specs/03-features/reestruturacao-arquitetural/spec.md`  
Status: Aprovado

## 1. Resumo técnico

A implementação será incremental e cobrirá somente as Fases 0–3 da arquitetura aprovada. Primeiro serão separados e renomeados os serviços remoto e local de campanha; depois as regras de Assimilação serão movidas para `systems/assimilacao/`; em seguida, o núcleo genérico será organizado em `core/`; por fim, a interface será extraída de `main.jsx` para `app/`, `pages/` e `shared/`.

Não haverá mudança de comportamento de produto, migration de banco, `systems/registry.js`, seleção de sistema, sincronização entre `localStorage` e Supabase ou implementação de segundo sistema.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/main.jsx` | Reduzido a bootstrap/providers/rotas e terá a UI extraída para páginas e componentes compartilhados | Alto: arquivo central concentra a maior parte da aplicação e pode gerar regressões de navegação ou estado |
| `src/campaignService.js` | Renomeado e movido para `core/campaigns/campaignLocalDraftService.js` | Alto: contém regras locais, Homebrew, inventário, permissões e personagens |
| `src/services/campaignService.js` | Renomeado e movido para `core/campaigns/campaignRemoteService.js` | Alto: contém comunicação remota, RPCs e entrada/criação de campanhas |
| Módulos específicos na raiz de `src/` | Movidos para `systems/assimilacao/` | Médio/alto: imports e dependências podem quebrar durante a movimentação |
| `src/auth/`, `src/lib/` e `src/services/sessionService.js`/`authService.js` | Reorganizados dentro de `core/` | Médio: imports e limites de dependência precisam ser preservados |
| `src/styles.css` e `src/assets/` | Reavaliados durante a extração de páginas e componentes, sem mudança visual planejada | Médio: estilos ou assets podem depender da estrutura atual de `main.jsx` |
| `supabase/migrations/` | Não será alterado nesta feature | Baixo: nenhuma mudança de banco faz parte das Fases 0–3 |

## 3. Componentes novos

Serão criadas pastas e módulos de organização, conforme a arquitetura aprovada:

```text
src/
  app/
  pages/
  core/
    auth/
    campaigns/
    sessions/
    lib/
  systems/
    assimilacao/
  shared/
```

Os serviços `campaignRemoteService.js` e `campaignLocalDraftService.js` são reorganizações de componentes existentes, não novas regras de negócio. As páginas e componentes compartilhados serão extraídos da UI atual, sem criar fluxos de produto novos.

## 4. Mudança de dados/banco (se houver)

Não haverá migration de banco nesta feature.

Também não haverá alteração na persistência local nem tentativa de sincronização entre `localStorage` e Supabase. A identificação explícita do sistema em campanhas novas pertence à feature posterior de seleção de sistema.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar o estado inicial e executar a verificação de baseline antes de mover arquivos.
2. Criar a estrutura de diretórios aprovada sem adicionar uma arquitetura paralela.
3. Renomear e mover os dois serviços de campanha, mantendo suas responsabilidades separadas.
4. Atualizar imports diretamente relacionados aos serviços e confirmar que não existem referências antigas restantes.

### Fase 2 — Lógica principal

1. Mover os módulos específicos de Assimilação para `systems/assimilacao/`.
2. Mover autenticação, cliente Supabase e serviços genéricos para `core/`.
3. Ajustar imports entre os módulos.
4. Verificar que `core/` não importa `systems/` e que as regras de Assimilação continuam no módulo do sistema.

### Fase 3 — Interface

1. Criar `app/main.jsx` como ponto de bootstrap, providers e rotas.
2. Extrair as telas existentes para as pastas de `pages/` previstas na arquitetura.
3. Extrair para `shared/` somente componentes reutilizados por duas ou mais telas.
4. Preservar estilos, assets, navegação e estado existentes durante a extração.

### Fase 4 — Testes

1. Verificar referências antigas, imports inválidos e violações dos limites arquiteturais.
2. Executar build e validação do catálogo de Assimilação.
3. Reexecutar os fluxos existentes de autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação.
4. Validar os caminhos de erro de importação indevida, serviço incorreto e ausência de sincronização local/remota.

### Fase 5 — Entrega (deploy/rollback)

1. Revisar o diff completo contra a Spec da Feature e a Spec de Arquitetura.
2. Confirmar que não foram incluídos `registry.js`, seleção de sistema, migration de banco ou nova funcionalidade de produto.
3. Registrar um ponto de rollback antes da entrega.
4. Fazer a entrega somente após a aprovação da Spec, plano, tarefas e verificação de regressão.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Registro de Decisão? |
|---|---|---|---|---|
| Quebra de imports ao mover ou renomear os dois serviços de campanha | Alta | Alto | Fazer a Fase 0 isoladamente, atualizar referências imediatamente e executar build antes de avançar | Não. Coberto pela DECISÃO-002 e pela tarefa de verificação de referências antigas |
| Mistura entre persistência remota e rascunho local | Média | Alto | Manter os serviços separados, preservar os contratos atuais e não tentar sincronizá-los | Não. Coberto pela DECISÃO-002 |
| Regressão causada pela extração de `main.jsx` | Alta | Alto | Extrair em passos pequenos, preservar estado/navegação e executar regressão dos fluxos existentes | Não neste momento. Se surgir uma nova fronteira arquitetural, parar e propor novo Registro de Decisão |
| Regras de Assimilação importadas pelo `core` | Média | Alto | Revisar dependências e rejeitar imports que cruzem o limite proibido | Não. Coberto pela DECISÃO-001 |
| Alteração acidental de comportamento durante a reorganização | Média | Alto | Comparar baseline antes/depois e manter mudanças de produto fora do escopo | Não. Coberto pela DECISÃO-005 |
| Descoberta de uma dependência que exija sincronização `localStorage`/Supabase | Baixa | Alto | Preservar o comportamento atual e registrar a necessidade como backlog separado | Sim, somente se for necessário mudar a decisão de não sincronizar nesta fase |

## 7. Perguntas abertas antes de começar

- Os comandos e cenários definitivos de verificação devem ser formalizados no plano de testes de `specs/05-verificacao/` antes da Fase 4.
- Qualquer nova decisão sobre sincronização, mudança de comportamento ou quebra dos limites `core`/`systems` deve interromper a execução da tarefa afetada e passar pelo template de Registro de Decisão antes de continuar.
