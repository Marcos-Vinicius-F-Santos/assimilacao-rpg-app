# Tarefas — Modo DEV com Supabase local em Docker

Plano relacionado: `specs/04-plano/modo-dev-docker-supabase/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia os requisitos
da Feature e possui uma verificação objetiva de conclusão.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Registrar o baseline de conexão e dos fluxos atuais
  - Arquivos/módulos: `src/lib/supabase.js`, `src/auth/AuthProvider.jsx`, `src/main.jsx`, `src/services/`, `package.json`
  - Verificação: registrar o resultado do build e dos fluxos atuais com Supabase remoto; confirmar o comportamento atual sem variáveis; não alterar código nesta tarefa.

- [x] T-002 [FR-001, FR-004, FR-005] Aprovar a estratégia de execução local e registrar decisão arquitetural se necessário
  - Arquivos/módulos: `specs/02-arquitetura/DECISAO/DECISAO-006-execucao-local-supabase.md`; `specs/04-plano/modo-dev-docker-supabase/plano.md`
  - Verificação: a decisão entre Supabase CLI e Docker Compose próprio, o contrato de ambiente e o isolamento DEV/prod estão explícitos e aprovados; se não houver nova decisão, registrar a justificativa de uso das decisões existentes.

- [x] T-003 [FR-001] Adicionar a configuração do stack Supabase local no diretório existente
  - Arquivos/módulos: `supabase/config.toml`; `package.json`; `pnpm-lock.yaml` se houver dependência de desenvolvimento
  - Verificação: o stack local inicia com o comando aprovado, expõe os serviços necessários e não cria uma pasta paralela de Docker.

- [x] T-004 [FR-001, FR-002] Aplicar as migrations existentes ao banco local
  - Arquivos/módulos: `supabase/migrations/`; configuração local do Supabase
  - Verificação: o banco local é criado a partir das migrations versionadas, as tabelas/RPCs/policies usadas pela aplicação estão disponíveis e nenhuma alteração é feita no banco remoto.

- [x] T-005 [FR-001, FR-003, FR-004] Documentar o contrato de variáveis por ambiente
  - Arquivos/módulos: `.env.example`; documentação de setup; referência read-only da configuração existente do deploy
  - Verificação: existe uma instrução inequívoca para URL/chave local e URL/chave remota; exemplos não contêm segredos; os consumidores não precisam ser editados ao trocar de ambiente; a documentação não exige alteração no deploy de produção durante esta fase.

## Fase 2 — Lógica principal

- [x] T-006 [FR-001, FR-003, FR-004, FR-005] Centralizar a resolução do cliente Supabase por ambiente
  - Arquivos/módulos: `src/lib/supabase.js`
  - Verificação: com configuração DEV o cliente aponta para o Supabase local; com configuração de produção aponta para o remoto; autenticação persistente, renovação de token e detecção de callback continuam habilitadas.

- [x] T-007 [FR-004, FR-005] Preservar os consumidores existentes do cliente central
  - Arquivos/módulos: `src/services/authService.js`, `src/services/campaignService.js`, `src/services/sessionService.js`
  - Verificação: os serviços continuam importando o ponto central, não contêm ramificações DEV/prod e não acessam diretamente variáveis de ambiente.

- [x] T-008 [FR-006] Impedir fallback entre os ambientes
  - Arquivos/módulos: `src/lib/supabase.js`; configuração de ambiente local e de produção
  - Verificação: com backend DEV parado, nenhuma requisição é enviada ao remoto; com configuração de produção ausente, o código não tenta montar cliente local; o erro permanece identificável.

- [x] T-009 [FR-006] Propagar indisponibilidade do backend para o estado de autenticação
  - Arquivos/módulos: `src/auth/AuthProvider.jsx`; `src/services/authService.js`
  - Verificação: falha de `getSession`/conexão é distinguida de “não configurado”, não deixa a aplicação em carregamento infinito e disponibiliza informação suficiente para a interface apresentar a causa.

- [x] T-010 [FR-002, FR-003, FR-005] Validar os serviços de dados no local e no Supabase remoto DEV autorizado
  - Arquivos/módulos: `src/services/`; banco local; Supabase remoto DEV autorizado
  - Verificação: os mesmos serviços executam suas operações existentes contra o local e contra o Supabase remoto DEV autorizado, sem utilizar o Vercel de produção, sem fundir o fluxo de `localStorage` e sem criar sincronização.

## Fase 3 — Interface

- [x] T-011 [FR-006] Adaptar o estado visual para backend DEV indisponível
  - Arquivos/módulos: `src/main.jsx`, especialmente `SupabaseSetupPage`/`RemoteSetupPage`, e estilos existentes se necessário
  - Verificação: com Docker parado, a aplicação exibe mensagem específica e acionável sobre o backend local; não exibe instrução que sugira conectar ao Supabase de produção.

- [x] T-012 [FR-004, FR-005] Preservar o fluxo visual quando o backend está disponível
  - Arquivos/módulos: `src/main.jsx`; telas atuais de login e aplicação autenticada
  - Verificação: com o Supabase local disponível, a tela de configuração não aparece e o usuário chega à aplicação após autenticar; em produção, o fluxo visual permanece equivalente ao baseline.

- [x] T-013 [FR-003, FR-006] Apresentar erro identificável para configuração de produção ausente
  - Arquivos/módulos: `src/main.jsx`; `src/auth/AuthProvider.jsx`
  - Verificação: um build de produção sem configuração remota não usa Docker local e apresenta erro de configuração distinguível do erro de backend DEV indisponível.

## Fase 4 — Testes

- [x] T-014 [FR-001, FR-003, FR-004, FR-005] Executar build e validações técnicas
  - Arquivos/módulos: projeto inteiro; scripts de `package.json`
  - Verificação: `pnpm build` e as validações existentes concluem sem erro; uma busca confirma que páginas/serviços não passaram a escolher o destino por conta própria.

- [x] T-015 [FR-001, FR-002] Executar o caminho feliz completo no ambiente DEV
  - Arquivos/módulos: aplicação local; Supabase Docker; migrations
  - Verificação: executar autenticação, criação/listagem/entrada em campanha, ficha, sessão, XP e progressão; confirmar no painel/log local que as operações foram feitas no backend local.

- [x] T-016 [FR-003, FR-005] Executar regressão no Supabase remoto DEV autorizado
  - Arquivos/módulos: aplicação local configurada para remoto DEV; Supabase remoto DEV autorizado
  - Verificação: repetir os fluxos cobertos pelo baseline, confirmar que as requisições chegam ao Supabase remoto DEV correto e que não houve mudança funcional nas features existentes; não executar operações de escrita no Vercel ou no Supabase remoto de produção.

- [x] T-017 [FR-006] Testar indisponibilidade, configuração ausente e isolamento
  - Arquivos/módulos: configuração DEV/prod; stack Docker; interface de erro
  - Verificação: testar Docker parado, porta ocupada, URL/chave ausente, migrations ausentes ou incompatíveis e troca de ambientes no mesmo navegador; em todos os casos, o erro é identificável e não há fallback cruzado.

- [x] T-018 [FR-001, FR-003, FR-004] Verificar ausência de segredos e de conexões indevidas
  - Arquivos/módulos: `.env.example`, `.gitignore`, diff do repositório, logs do navegador e do backend local
  - Verificação: nenhum segredo é versionado; o build DEV não contém configuração remota de produção; os testes locais não registram chamadas ao projeto remoto.

## Fase 5 — Entrega

- [x] T-019 [FR-001, FR-002, FR-003, FR-004] Atualizar o procedimento de setup e operação
  - Arquivos/módulos: documentação do projeto; `package.json`; `supabase/config.toml`
  - Verificação: uma pessoa consegue seguir o procedimento para instalar pré-requisitos, iniciar/parar o stack local, iniciar a aplicação e identificar falhas sem editar serviços consumidores.

- [x] T-020 [FR-003, FR-004, FR-005] Inspecionar o build de produção e a configuração existente do deploy
  - Arquivos/módulos: configuração existente do provedor de deploy; build de produção; cliente central
  - Verificação: inspecionar em modo somente leitura se o deploy existente está configurado para usar apenas URL/chave remotas de produção, se a aplicação publicada inicia sem Docker local e se nenhum arquivo de conexão precisa ser alterado para um novo deploy; não publicar, promover, reverter, adicionar, remover ou alterar variáveis.

- [x] T-021 [FR-001, FR-003, FR-006] Preparar rollback e revisar a entrega sem alterar produção
  - Arquivos/módulos: histórico da implementação; configuração local; referências read-only do deploy; plano e Spec
  - Verificação: existe um ponto de retorno do código/configuração, o procedimento de rollback limita-se ao código e ao ambiente local, não toca no Vercel nem no banco remoto de produção, e a revisão confirma todos os ACs e os limites arquiteturais.

## Adiado (fora do escopo desta rodada)

- [ ] Criar sincronização entre `localStorage`, Supabase local e Supabase remoto.
- [ ] Migrar dados remotos para o ambiente DEV ou promover dados DEV para produção.
- [ ] Criar um segundo sistema de RPG, alterar o registry ou mudar a reestruturação arquitetural.
- [ ] Criar seed de dados, caso a decisão sobre dados iniciais não seja aprovada antes da Fase 4.
- [ ] Configurar CI/CD ou hospedar o Supabase local fora da máquina de desenvolvimento.
- [ ] Alterar migrations de produção sem uma nova tarefa e revisão específica.
