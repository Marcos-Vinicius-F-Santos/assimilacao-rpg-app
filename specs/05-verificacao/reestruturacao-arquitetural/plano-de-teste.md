# Plano de Verificação — Reestruturação Arquitetural Inicial

Spec relacionada: `specs/03-features/reestruturacao-arquitetural/spec.md`  
Checklist relacionada: `specs/05-verificacao/reestruturacao-arquitetural/checklist-convergencia.md`  
Plano de implementação: `specs/04-plano/reestruturacao-arquitetural/plano.md`  
Arquitetura: `specs/02-arquitetura/ARQUITETURA/ARQUITETURA_RPG_MANAGER.md`

Status: **TST-001 a TST-009 aprovados pelo responsável, com ressalvas registradas; deploy não aprovado**

> O template solicitado não estava presente no repositório. O plano segue o template
> original localizado em `C:/Users/marco/Downloads/marcos-spec-kit/marcos-spec-kit/`.

## Resultados da execução — 13/09/2026

- [x] **TST-001 — aprovado com ressalva:** a aplicação local iniciou, o login de desenvolvimento
      funcionou e as rotas de campanha, itens e sessões abriram. O critério de extração
      efetiva das páginas não passou: os módulos de `pages/` ainda reexportam
      `src/pages/legacyApp.jsx`, e `index.html` continua apontando para `src/main.jsx`.
- [x] **TST-002 — passou:** não há import de `systems` em `core`, acesso direto ao
      Supabase na UI ou regra de Assimilação fora de `systems/assimilacao/`; a validação
      do catálogo passou.
- [x] **TST-003 — passou:** os dois serviços permanecem separados, não há referências
      ativas aos caminhos antigos e o build passou.
- [x] **TST-004 — aprovado com ressalva:** o ambiente local iniciou e permitiu validar autenticação de
      desenvolvimento, campanha e navegação; o fluxo completo mestre/jogador com XP não
      foi concluído nesta execução. No DEV remoto, a tentativa de autenticação do mestre
      com a senha de teste disponível retornou `Invalid login credentials`; não houve
      escrita remota. A execução manual anterior continua registrada na checklist, mas a
      repetição atual não confirma o teste completo.
- [x] **TST-005 — passou:** as 10 migrations locais estão alinhadas, `db diff` terminou
      com `No schema changes found`, e não foram encontrados registry, `systemId`, segundo
      sistema ou migration nova da feature.
- [x] **TST-006 — passou:** em cópia temporária, buscas detectaram tanto um import
      proibido de `systems` dentro de `core` quanto uma referência antiga a
      `campaignService.js`; a cópia foi removida sem alterar o working tree.
- [x] **TST-007 — passou:** o commit `ae923b6` foi extraído para cópia descartável;
      build e validação do catálogo passaram. A instalação offline não tinha todos os
      tarballs, então a cópia usou as dependências já disponíveis no projeto; o working
      tree atual não foi tocado.
- [x] **TST-008 — aprovado com ressalva:** só o Codex In-app Browser e um perfil estavam disponíveis.
      Uma nova aba carregou a aplicação, mas reutilizou a sessão do mesmo perfil; não há
      confirmação independente em outro navegador/perfil.
- [x] **TST-009 — aprovado com ressalva:** o plano, a checklist, o backlog e os registros T-019–T-021
      foram reconciliados. T-011–T-014 e T-017 permanecem abertas, e FB-001/FB-002
      continuam pendentes; portanto, a documentação ainda não permite declarar
      convergência total.

## 1. Estratégia

Testar por prioridade e impacto, concentrando a confirmação nas pendências que impedem
a convergência: extração real da interface, limites entre camadas e regressão dos fluxos
existentes.

| Prioridade | O que é | Como testar |
|---|---|---|
| Alta | Estrutura final, separação dos serviços, limites `core`/`systems`, UI sem acesso direto ao Supabase e preservação funcional | Inspeção estática, build, validação do catálogo e roteiro manual local + DEV remoto autorizado |
| Média | Caminhos de erro, ausência de mudanças de schema, escopo fora da feature e reversibilidade | Cópia descartável, comparação de migrations, buscas de imports e ensaio de rollback |
| Baixa | Outro navegador/perfil e conferências documentais auxiliares | Repetição manual; registrar como pendência se o ambiente não estiver disponível |

### Regras de segurança

- Não alterar, publicar, promover ou reverter o Vercel de produção.
- Não escrever no Supabase remoto de produção.
- Usar o Supabase local e o projeto Supabase DEV autorizado para qualquer operação que
  exija escrita.
- Não executar `git reset --hard`, `git checkout --` ou qualquer rollback destrutivo no
  working tree atual.
- Usar uma cópia temporária para simular imports proibidos, migrations divergentes ou
  rollback.
- Não corrigir o código durante a execução dos testes; registrar falhas e atualizar a
  checklist somente com evidências observadas.

## 2. Rastreio

| Requisito | Teste/evidência | Nível | Status |
|---|---|---|---|
| FR-001 | TST-001 — árvore final e pontos de entrada | Estático + build | Planejado |
| FR-002 | TST-002 — módulos de Assimilação isolados | Estático + validação | Planejado |
| FR-003 | TST-003 — serviços remoto/local separados | Estático + manual | Planejado |
| FR-004 | TST-003 — imports novos e ausência dos caminhos antigos | Estático + build | Planejado |
| FR-005 | TST-001 — bootstrap, páginas e componentes compartilhados efetivamente extraídos | Estático + manual | Planejado; pendência atual |
| FR-006 | TST-002 — núcleo genérico sem dependência de sistema | Estático | Planejado |
| FR-007 | TST-002 — UI sem acesso direto ao cliente Supabase | Estático + build | Planejado |
| FR-008 | TST-005 — escopo, migrations e ausência de funcionalidades futuras | Estático + diff de schema | Planejado |
| FR-009 | TST-004 — regressão de autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação | Manual local + DEV remoto | Planejado; T-017 pendente |
| AC-001 | TST-001 — organização final | Estático + manual | Planejado |
| AC-002 | TST-004 — comportamento preservado | Manual | Planejado |
| AC-003 | TST-002 e TST-006 — limites proibidos | Estático + negativo em cópia | Planejado |
| AC-004 | TST-003 e TST-006 — imports antigos | Estático + negativo em cópia | Planejado |

## 3. Roteiros de teste manual

### TST-001 — Estrutura, bootstrap e extração da interface

**Objetivo:** confirmar FR-001, FR-005 e AC-001.

Pré-condições:

- working tree preservado;
- Spec de Arquitetura e plano disponíveis;
- dependências instaladas.

Passos:

1. Conferir a existência de `src/app/`, `src/pages/`, `src/core/`,
   `src/systems/assimilacao/` e `src/shared/`.
2. Confirmar que `src/app/main.jsx` concentra bootstrap, provider e roteamento.
3. Inspecionar as entradas de `Login`, `Campaigns`, `CampaignCreate`, `CampaignJoin` e
   `CharacterSheet`.
4. Confirmar que cada tela está efetivamente organizada no módulo de `pages/`, e não é
   apenas um reexport do monólito `src/pages/legacyApp.jsx`.
5. Confirmar que componentes colocados em `shared/` são reutilizados e não contêm regra
   específica de Assimilação.
6. Confirmar que o ponto de entrada configurado pelo `index.html` corresponde ao ponto
   de bootstrap aprovado ou que a compatibilidade está documentada e não mantém uma
   segunda composição da aplicação.
7. Executar `pnpm build`.
8. Abrir a aplicação localmente e navegar pelas rotas de login, campanhas, ficha e
   progressão para confirmar que a extração não quebrou a inicialização.

Resultado esperado:

- a árvore e o ponto de entrada correspondem à arquitetura;
- as páginas não dependem do monólito como implementação principal;
- o build e a inicialização passam sem erro.

Evidência mínima: árvore de arquivos, resultado do build, lista dos imports de páginas e
captura ou registro das rotas abertas.

### TST-002 — Limites entre `core`, `systems` e interface

**Objetivo:** confirmar FR-002, FR-006, FR-007 e AC-003.

Passos:

1. Buscar imports de `systems` ou `assimilacao` dentro de `src/core/`.
2. Buscar `createClient`, `supabase` e imports do cliente Supabase dentro de
   `src/app/`, `src/pages/` e `src/shared/`.
3. Confirmar que o cliente está centralizado em `src/core/lib/supabase.js`.
4. Confirmar que as regras e catálogos específicos permanecem em
   `src/systems/assimilacao/`.
5. Executar `pnpm validate:assimilations`.

Resultado esperado:

- nenhuma dependência parte de `core` para `systems`;
- a UI acessa dados por serviços e contratos, não pelo cliente Supabase;
- a validação do catálogo passa sem aptidões sem custo de aquisição.

Evidência mínima: saída das buscas, lista dos módulos do sistema e saída do comando de
validação.

### TST-003 — Separação dos serviços e imports atualizados

**Objetivo:** confirmar FR-003, FR-004 e AC-004.

Passos:

1. Confirmar a existência de `src/core/campaigns/campaignRemoteService.js`.
2. Confirmar a existência de `src/core/campaigns/campaignLocalDraftService.js`.
3. Confirmar que o serviço remoto usa o cliente Supabase e que o serviço local usa
   persistência local, sem fusão entre os dois.
4. Buscar referências ativas a `src/campaignService.js`,
   `src/services/campaignService.js` e aos caminhos antigos dos módulos movidos.
5. Confirmar que não há sincronização nova entre `localStorage` e Supabase.
6. Executar `pnpm build`.
7. No ambiente local, abrir uma operação remota e uma operação de rascunho local e
   verificar que cada uma usa seu serviço previsto.

Resultado esperado:

- os serviços permanecem distintos;
- nenhum consumidor usa os caminhos antigos;
- o build resolve todos os imports;
- não existe sincronização não prevista.

Evidência mínima: buscas sem referências antigas, arquivos dos dois serviços, resultado
do build e registro das operações executadas.

### TST-004 — Regressão funcional completa

**Objetivo:** confirmar FR-009 e AC-002, além de reconciliar T-017 e FB-001.

#### Ambiente local

1. Iniciar o Supabase local e a aplicação com as variáveis locais.
2. Autenticar como mestre e jogador.
3. Criar ou abrir uma campanha e confirmar os participantes.
4. Criar ou abrir uma ficha de personagem.
5. Confirmar o acesso às regras e catálogos de Assimilação.
6. Abrir uma sessão, conceder XP ao personagem e encerrá-la.
7. Entrar como jogador e abrir a progressão.
8. Confirmar saldo e histórico de XP, comprar uma melhoria permitida e confirmar o novo
   saldo/nível.
9. Registrar qualquer divergência de identidade exibida na ficha relacionada ao FB-002.

#### DEV remoto autorizado

1. Repetir o fluxo usando apenas o projeto Supabase DEV autorizado.
2. Usar os perfis de mestre e jogador já autorizados.
3. Preferir uma campanha de teste existente; criar dados somente se o cenário não for
   suficiente.
4. Confirmar que o jogador vê o mesmo lançamento de XP e histórico após o encerramento
   da sessão.

Resultado esperado:

- os fluxos observáveis permanecem equivalentes ao baseline;
- o jogador visualiza o XP concedido e o histórico;
- nenhuma alteração de produto surge apenas pela reorganização de arquivos;
- nenhum erro ou aviso do navegador aparece durante o fluxo.

Evidência mínima: ambiente, perfis usados, campanha/ficha/sessão, resultado do XP para
mestre e jogador, registros do navegador e, quando necessário, consulta somente leitura
ao banco DEV/local.

Se o jogador voltar a visualizar XP incorreto, manter FB-001 aberto e reprovar a
confirmação de FR-009; não alterar a implementação durante este teste.

### TST-005 — Escopo, migrations e ausência de funcionalidades futuras

**Objetivo:** confirmar FR-008 e verificar que a feature não introduziu mudanças fora do
escopo.

Passos:

1. Comparar o diff com a Spec de Feature e a arquitetura.
2. Confirmar que não foram criados `systems/registry.js`, seleção de sistema, segundo
   sistema, `systemId` em campanhas ou sincronização local/remota.
3. Listar as migrations locais e executar:

   ```text
   pnpm exec supabase migration list --local
   pnpm exec supabase db diff --local --schema public
   ```

4. Confirmar que não há migration nova nem diferença inesperada no schema.
5. Confirmar que o plano e as tarefas registram a ordem das fases executadas.

Resultado esperado:

- somente a reorganização prevista está presente;
- o schema não foi alterado;
- itens explicitamente fora do escopo permanecem fora da implementação.

### TST-006 — Caminhos negativos dos critérios de aceite

**Objetivo:** verificar AC-003 e AC-004 sem modificar o working tree atual.

Passos:

1. Copiar o repositório para uma pasta temporária.
2. Na cópia, inserir temporariamente um import de `systems` em um módulo de `core` e
   executar a busca/validação arquitetural.
3. Na mesma cópia, inserir temporariamente um import para o caminho antigo de
   `campaignService.js` e executar a busca de referências.
4. Confirmar que os validadores/inspeções identificam os dois casos como falhas.
5. Apagar a cópia temporária e confirmar que o working tree original não foi alterado.

Resultado esperado:

- cada violação é detectável antes da entrega;
- nenhuma alteração temporária chega ao código do projeto.

### TST-007 — Reversibilidade da entrega

**Objetivo:** confirmar que o rollback documentado é executável, sem tocar no estado atual.

Passos:

1. Preservar o diff atual e identificar o ponto de retorno registrado em
   `T-021-rollback-entrega.md`.
2. Extrair esse ponto para uma pasta descartável.
3. Executar build e validação do catálogo na cópia.
4. Confirmar que o ponto anterior pode iniciar sem depender dos arquivos novos da
   reestruturação.
5. Registrar o resultado e remover somente a cópia descartável.

Resultado esperado:

- o ponto de retorno é identificável;
- build e validações passam na cópia;
- o working tree atual permanece intacto.

### TST-008 — Outro navegador ou perfil

**Objetivo:** aumentar a confiança na regressão de FR-009.

Passos:

1. Abrir um perfil limpo ou outro navegador disponível.
2. Repetir login e abertura da campanha/ficha/progressão.
3. Confirmar a visualização do XP do jogador.

Se outro navegador ou perfil não estiver disponível, registrar a limitação sem bloquear os
demais testes, mas manter o item correspondente da checklist não confirmado.

### TST-009 — Reconciliação documental

**Objetivo:** fechar as divergências documentais antes da decisão de deploy.

Passos:

1. Atualizar o status das tarefas somente após a evidência correspondente existir.
2. Reconciliar FB-001 com o resultado atual de TST-004.
3. Manter FB-002 aberto até haver decisão de produto sobre o perfil exibido.
4. Atualizar o status do plano e dos registros T-019–T-021 para refletir a situação real.
5. Registrar na checklist toda limitação que permanecer.

Resultado esperado:

- nenhuma tarefa aparece como concluída sem evidência;
- o backlog não contradiz o resultado atual sem explicação;
- as pendências restantes ficam claramente separadas de falhas confirmadas.

## 4. Testes automatizados e validações técnicas

Executar no working tree atual, sem tocar em produção:

```text
pnpm build
pnpm validate:assimilations
git diff --check
pnpm exec supabase migration list --local
pnpm exec supabase db diff --local --schema public
```

Executar buscas estáticas para confirmar:

- nenhum import de `systems` parte de `src/core/`;
- nenhum `createClient` ou acesso direto a `supabase` parte de `src/app/`, `src/pages/`
  ou `src/shared/`;
- não existem imports ativos dos caminhos antigos dos serviços ou módulos movidos;
- somente o cliente central usa `createClient`;
- nenhum `service_role`, `sb_secret` ou chave administrativa está versionado.

Não há cálculo novo nesta feature que justifique criar uma suíte automatizada específica.
Os checks automatizados cobrem compilação, catálogo, imports, limites e schema; os fluxos
de regressão e a separação efetiva das telas exigem inspeção e execução manual.

## 5. Critério de saída

- [ ] TST-001 confirma AC-001 e FR-005 sem depender de reexports do monólito, ou a
      divergência é formalmente aprovada e documentada.
- [ ] TST-002 e TST-003 confirmam FR-001 a FR-004 e FR-006/FR-007.
- [ ] TST-004 confirma FR-009 e reconcilia FB-001; se falhar, a checklist permanece não
      convergente.
- [ ] TST-005 confirma que não houve mudança de schema nem inclusão de funcionalidades fora
      do escopo.
- [ ] TST-006 confirma que os caminhos de erro de limite e imports antigos são detectáveis.
- [ ] TST-007 confirma rollback em cópia descartável sem alterar o working tree atual.
- [ ] TST-008 é executado ou sua ausência é aceita explicitamente.
- [ ] TST-009 reconcilia as tarefas, o plano e o backlog com as evidências reais.
- [ ] Nenhum defeito crítico permanece sem decisão.
- [ ] O deploy continua sem aprovação automática deste plano.
