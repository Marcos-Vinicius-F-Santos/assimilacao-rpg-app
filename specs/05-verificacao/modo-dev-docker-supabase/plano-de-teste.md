# Plano de Verificação — Modo DEV com Supabase local em Docker

Spec relacionada: `specs/03-features/modo-dev-docker-supabase/spec.md`  
Checklist relacionada: `specs/05-verificacao/modo-dev-docker-supabase/checklist-convergencia.md`  
Plano de implementação: `specs/04-plano/modo-dev-docker-supabase/plano.md`

Status: Execução de TST-001 a TST-008 concluída; TST-006 parcialmente confirmado; nenhum teste deste plano aprova o deploy automaticamente.

## Resultados da execução — 13/09/2026

- [x] **TST-001:** caminho local validado visualmente e no banco; sessão fechada, +3 XP,
      progressão e saldo final 1 confirmados.
- [x] **TST-002:** DEV remoto validado com os perfis de mestre e jogador; mesma campanha,
      ficha, sessão encerrada, XP 3 e histórico visíveis ao jogador.
- [x] **TST-003:** deploy público respondeu HTTP 200; SPA carregou e o bundle não contém
      URL do Supabase local. Nenhuma escrita ou alteração de produção foi feita.
- [x] **TST-004:** alternância local/remoto na mesma origem temporária invalidou a sessão
      do ambiente anterior; o modo local foi restaurado ao final.
- [x] **TST-005:** Docker parado, configuração ausente, porta da aplicação ocupada, porta
      do stack ocupada, migration divergente e ausência de fallback foram exercitados.
- [ ] **TST-006:** uma nova aba do navegador interno carregou a aplicação, mas não havia
      outro navegador ou perfil disponível para confirmar a cobertura adicional.
- [x] **TST-007:** regressão local e DEV remoto cobriu autenticação, campanhas, participantes,
      ficha, sessão, XP e progressão.
- [x] **TST-008:** o ponto `ae923b6` foi confirmado em cópia descartável; build e validação
      do catálogo passaram. O worktree descartável não pôde ser criado por permissão, então
      o ensaio usou um arquivo de commit extraído para diretório temporário. O working tree
      atual não foi revertido nem alterado pelo rollback.

## 1. Estratégia

Teste por prioridade e impacto, preservando a regra de não alterar o Vercel ou o Supabase
remoto de produção.

| Prioridade | Escopo | Como testar |
|---|---|---|
| Alta | FR-001 a FR-006, AC-001 a AC-004 e isolamento de destino | Caminho manual completo no DEV local, regressão no DEV remoto autorizado, inspeção somente leitura do deploy publicado e validações estáticas. |
| Média | Docker parado, configuração ausente, porta ocupada, migrations divergentes e troca de ambiente | Roteiros manuais locais e em ambiente DEV descartável, sem fallback e sem escrita em produção. |
| Média | Regressão da aplicação existente | Repetir autenticação, campanhas, ficha, sessão, XP e progressão; confirmar XP do jogador em nova sessão de leitura. |
| Baixa | Navegador ou dispositivo adicional | Repetir o acesso em outro navegador/perfil ou dispositivo; registrar como pendência se o ambiente não estiver disponível. |

### Regras de segurança dos testes

- O Supabase remoto de produção e o Vercel de produção serão somente leitura.
- Escritas remotas, se necessárias, ocorrerão apenas no Supabase DEV autorizado.
- O teste de migration incompatível usará um ambiente local descartável ou banco sombra;
  não usará o banco local com dados de teste sem preservar sua recuperação.
- Nenhum teste deve cadastrar credencial administrativa, alterar variável do provedor,
  publicar, promover ou reverter deploy.

## 2. Rastreio

| Requisito | Teste/evidência | Nível | Status |
|---|---|---|---|
| FR-001 | TST-001: aplicação local configurada com `.env.local`, Docker ativo e operações confirmadas no banco local | Manual + consulta | Confirmado |
| FR-002 | TST-001: autenticação, campanhas, ficha, sessão, XP e progressão locais | Manual | Confirmado |
| FR-003 | TST-002: regressão no DEV remoto; TST-003: bundle e acesso somente leitura no deploy publicado | Manual + inspeção | Parcial: fluxo autenticado de produção não autorizado |
| FR-004 | TST-004: troca de arquivos/modos de ambiente sem alterar consumidores | Manual + estático | Confirmado |
| FR-005 | TST-001/TST-002: mesmos serviços e contrato no local e DEV remoto | Manual + estático | Confirmado |
| FR-006 | TST-005: Docker parado, configuração ausente, porta ocupada e ausência de fallback | Manual | Confirmado |

## 3. Roteiro de teste manual

### TST-001 — Caminho feliz completo no DEV local

Pré-condições:

- Docker ativo;
- `pnpm supabase:start` concluído;
- `.env.local` apontando para `http://127.0.0.1:54321`;
- migrations aplicadas;
- aplicação iniciada com `pnpm dev`.

Passos:

1. Autenticar um mestre e um jogador no ambiente local.
2. Criar uma campanha, confirmar o mestre e adicionar o jogador.
3. Criar ou vincular uma ficha de personagem.
4. Abrir uma sessão, conceder XP ao personagem e encerrá-la.
5. Como jogador, abrir a progressão e confirmar o saldo e o histórico de XP.
6. Comprar uma melhoria permitida e confirmar o novo saldo e nível.
7. Consultar o banco local para confirmar sessão fechada, lançamento de XP e melhoria.

Evidência mínima: URL local, nome do ambiente, resultado visual e consulta somente leitura
dos registros locais. Não usar dados de produção.

### TST-002 — Regressão no Supabase remoto DEV autorizado

Usar `.env.remote.local` e uma origem local separada do teste local. Usar somente o projeto
Supabase DEV autorizado.

1. Autenticar como mestre e abrir a campanha de regressão existente.
2. Confirmar participantes, ficha e sessão encerrada.
3. Como mestre, confirmar o XP concedido e o histórico.
4. Encerrar a sessão do mestre e entrar novamente como jogador proprietário, sem criar nova
   escrita se o cenário existente já for suficiente.
5. Abrir a progressão do jogador e confirmar que o mesmo saldo e histórico de XP estão
   visíveis.
6. Se o resultado divergir, registrar captura, horário, usuário, URL do projeto DEV e
   estado da sessão; não concluir a checklist nem fechar FB-001.

Evidência mínima: ambos os perfis visualizam o mesmo lançamento de XP, sem acessar o
Vercel ou o Supabase de produção.

### TST-003 — Deploy publicado em produção, somente leitura

1. Acessar o endereço público do deploy sem Docker local ativo.
2. Confirmar resposta HTTP e carregamento da SPA.
3. Inspecionar o bundle publicado para confirmar destino Supabase remoto e ausência de
   `http://127.0.0.1:54321` ou `http://localhost:54321`.
4. Se houver uma conta de produção explicitamente autorizada para leitura, autenticar e
   apenas navegar por campanhas, ficha e progressão.
5. Não criar campanha, entrar em campanha, abrir/encerrar sessão, conceder XP, comprar
   melhoria, alterar ficha, editar variáveis ou enviar formulário de escrita.

Se não houver conta de leitura autorizada, o resultado deve permanecer “produção
parcialmente confirmada”, e não ser apresentado como AC-002 completo.

### TST-004 — Troca de ambiente e contrato central

1. Executar o app local com `.env.local` e confirmar dados locais.
2. Parar o servidor, iniciar o modo `remote` com `.env.remote.local` e confirmar dados do
   DEV remoto em uma origem isolada.
3. Verificar que páginas e serviços não foram editados para a troca.
4. Repetir a troca na mesma origem do navegador e confirmar que uma sessão de um ambiente
   não é aceita como sessão do outro.
5. Restaurar o modo local e confirmar que o app volta a apontar para o banco local.

### TST-005 — Erros e isolamento

Executar cada cenário separadamente e registrar mensagem e destino observado:

| Cenário | Resultado esperado |
|---|---|
| Docker parado | Tela “Backend local indisponível”, ação para tentar novamente e nenhuma tentativa de fallback remoto. |
| URL/chave ausente em DEV | Tela de configuração necessária; nenhum cliente local ou remoto criado por fallback. |
| URL/chave ausente em build de produção | Mensagem de configuração de produção ausente; não usar Docker local. |
| Porta da aplicação ocupada | Inicialização falha de forma identificável, sem escolher outro backend silenciosamente. |
| Porta/serviço do stack local ocupado | Supabase CLI informa a falha; restaurar a porta e confirmar que o app não mudou de destino. |
| Migrations incompatíveis | Ambiente descartável/sombra falha ou mostra diferença identificável; nenhum dado remoto é alterado. |
| Troca de ambiente no mesmo navegador | Sessão/dados não são tratados como pertencentes ao outro ambiente. |

### TST-006 — Outro navegador ou dispositivo

Repetir pelo menos o login e a abertura da progressão no segundo navegador/perfil. Se um
dispositivo real não estiver disponível, usar um perfil limpo de navegador e registrar a
limitação.

### TST-007 — Regressão das features existentes

Repetir, no DEV local e no DEV remoto autorizado, as operações já existentes cobertas pelo
baseline: autenticação, campanhas, participantes, ficha, sessão, XP e progressão. Comparar
com o comportamento anterior e confirmar ausência de sincronização indevida com
`localStorage`.

### TST-008 — Reversibilidade da entrega

Em uma cópia descartável do working tree ou em uma revisão sem alterações do usuário:

1. Preservar diff e lista de arquivos.
2. Confirmar o ponto de retorno `ae923b6`.
3. Simular a restauração apenas do código/configuração, sem executar contra produção.
4. Reiniciar o ambiente local e executar build/validações.
5. Registrar que nenhum reset local é necessário para rollback de código e que qualquer
   reset de banco remove somente dados locais.

Não executar `git reset --hard` no working tree atual.

## 4. Testes automatizados e validações técnicas

Executar sem alterar produção:

```text
pnpm build
pnpm validate:assimilations
git diff --check
pnpm exec supabase migration list --local
pnpm exec supabase db diff --local --schema public
```

Também executar buscas estáticas para confirmar:

- somente `src/core/lib/supabase.js` usa `createClient`;
- páginas, componentes e serviços não escolhem o destino por conta própria;
- nenhum serviço usa diretamente as variáveis de ambiente;
- nenhum `service_role`, `sb_secret` ou chave administrativa aparece em arquivo versionado;
- nenhum bundle DEV contém o destino Supabase de produção;
- o bundle de produção não contém URL do Supabase local.

Não há regra de negócio nova nesta feature que justifique criar uma suíte automatizada
adicional. Os comandos existentes cobrem build e catálogo; os critérios de ambiente e
isolamento continuam exigindo validação manual.

## 5. Reconciliação documental após os testes

Antes de marcar a checklist como totalmente convergente:

1. Atualizar na Spec e no plano as referências antigas de `src/lib/supabase.js` para
   `src/core/lib/supabase.js`, ou registrar formalmente a referência como histórico.
2. Reconciliar FB-001 com o resultado confirmado do TST-002; não deixar o backlog afirmar
   que o XP está quebrado se a reprodução atual não confirmar isso.
3. Decidir se a garantia de BR-002 continuará sendo responsabilidade das variáveis do
   provedor ou se será necessária uma regra explícita para validar o projeto de produção.
4. Registrar quais testes foram executados e seus resultados na checklist.

## 6. Critério de saída

- [ ] Todos os FR-001 a FR-006 têm evidência concluída; FR-003 não pode ficar apenas com
      inspeção de bundle se o aceite exigir uso autenticado.
- [ ] AC-001, AC-002, AC-003 e AC-004 estão confirmados ou têm limitação explicitamente
      aprovada pelo responsável.
- [ ] A confirmação manual do XP foi reconciliada com o `fix-backlog.md` e FB-001 não está
      incorretamente aberta como bloqueador.
- [ ] Cenários de Docker parado, configuração ausente, porta ocupada, migration divergente
      e troca de ambiente foram registrados.
- [ ] Regressão das features existentes foi concluída no local e no DEV remoto autorizado.
- [ ] Teste em navegador/perfil adicional foi executado ou sua ausência foi aceita
      explicitamente.
- [ ] O procedimento de rollback foi revisado e, se necessário, ensaiado em cópia
      descartável sem tocar no working tree do usuário.
- [ ] Nenhum defeito crítico permanece sem decisão.
- [ ] O deploy continua sem aprovação automática deste plano.
