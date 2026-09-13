# Plano de Implementação — Modo DEV com Supabase local em Docker

Spec relacionada: `specs/03-features/modo-dev-docker-supabase/spec.md`  
Status: Aprovado

## 1. Resumo técnico

A implementação usará o diretório `supabase/` já existente para armazenar a configuração
do ambiente local e continuar aproveitando as migrations versionadas. O Supabase local será
orquestrado por Docker através do fluxo oficial do Supabase CLI, evitando criar uma
topologia Docker paralela ao diretório que já representa o banco do projeto.

Durante a reestruturação ainda não iniciada, o cliente permanecerá no módulo central atual
`src/lib/supabase.js`. Esse módulo receberá a responsabilidade de resolver a configuração
do ambiente, mantendo os serviços de autenticação, campanhas e sessões consumidores do
mesmo contrato. Quando a Fase 2 da reestruturação mover o cliente para
`src/core/lib/supabase.js`, a lógica deverá ser movida sem criar uma segunda implementação.

O DEV usará URL e chave da instância local; o deploy usará URL e chave do Supabase remoto
configuradas no ambiente de produção. A interface reutilizará as telas/estados existentes
de configuração e erro, apenas distinguindo configuração ausente de backend local
indisponível. Não haverá migration nova de produto nem alteração de dados remotos.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/lib/supabase.js` | Centralizar a seleção e validação da configuração por ambiente, preservando as opções atuais de sessão do cliente | Alto: erro de configuração pode apontar DEV para produção ou impedir autenticação existente |
| `src/auth/AuthProvider.jsx` | Expor estado de falha de conexão quando a configuração existe, mas o backend não responde | Alto: altera o caminho de inicialização da autenticação e pode afetar todas as rotas |
| `src/main.jsx` | Reutilizar `SupabaseSetupPage`/`RemoteSetupPage` ou seus estados para apresentar erro local identificável | Médio/alto: mudança no bootstrap e na experiência de entrada |
| `src/services/authService.js` | Manter chamadas no cliente central; ajustar somente o tratamento necessário para propagar indisponibilidade | Médio: autenticação é dependência de toda a aplicação |
| `src/services/campaignService.js` | Nenhuma mudança de contrato; validar criação, listagem, convites e RPCs contra o banco local | Alto: contém operações remotas e regras de campanha existentes |
| `src/services/sessionService.js` | Nenhuma mudança de contrato; validar sessões e progressão contra o banco local | Alto: contém fluxos de sessão, XP e progressão |
| `supabase/migrations/` | Nenhuma migration nova; as migrations atuais serão aplicadas no banco local | Médio: divergência entre schema local e remoto pode mascarar falhas |
| `supabase/config.toml` | Novo arquivo de configuração do stack local no diretório Supabase já existente | Médio: configuração incorreta de portas, Auth ou redirects impede o DEV |
| `package.json` e `pnpm-lock.yaml` | Adicionar a ferramenta/scripts de desenvolvimento local, se essa for a opção aprovada | Baixo/médio: versões da CLI e comandos precisam ser reproduzíveis |
| `.env.example` e documentação de execução | Documentar o contrato de variáveis DEV/prod sem incluir segredos | Médio: documentação ambígua pode causar conexão com o ambiente errado |

## 3. Componentes novos

Serão criados somente os componentes necessários dentro das estruturas já existentes:

- `supabase/config.toml` para a configuração do stack Supabase local.
- Scripts de projeto para iniciar/parar/verificar o ambiente local, definidos em
  `package.json`, caso a ferramenta aprovada seja instalada no projeto.
- Configuração documentada das variáveis de ambiente local e de produção, sem valores
  secretos versionados.
- Estado de conectividade no fluxo de autenticação, se o estado atual de configuração não
  for suficiente para distinguir “não configurado” de “backend indisponível”.

Não será criada uma pasta `docker/`, um segundo cliente Supabase ou uma nova camada de
acesso a dados. Essa escolha preserva `supabase/` como a fronteira existente para banco,
migrations e configuração local, e preserva `src/lib/supabase.js` como o ponto único do
cliente durante a transição arquitetural.

## 4. Mudança de dados/banco (se houver)

Não haverá migration de banco nesta feature e nenhuma alteração será aplicada diretamente
ao Supabase remoto de produção.

O banco local deverá ser criado a partir das migrations já existentes em
`supabase/migrations/`. A criação de `supabase/seed.sql` fica condicionada à decisão sobre
dados iniciais; não deve ser inventado seed para compensar a ausência dessa decisão.

O rollback da parte de dados consiste em parar/remover o stack local ou recriar apenas o
banco local conforme o procedimento aprovado. Não será usado nenhum comando destrutivo
contra o projeto remoto. Se houver necessidade de alterar o schema para compatibilidade
local, a alteração deverá ser uma migration versionada e passar por revisão separada.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar o baseline dos fluxos atuais com o Supabase remoto, incluindo build,
   autenticação, campanhas, sessões e progressão.
2. Confirmar a estratégia operacional: Supabase CLI gerenciando o stack Docker local,
   usando o diretório `supabase/` já existente, e definir o contrato de variáveis por
   ambiente.
3. Se a escolha da ferramenta ou a regra de isolamento DEV/prod for considerada uma
   decisão arquitetural duradoura, criar o Registro de Decisão antes dos arquivos de
   configuração.
4. Adicionar a configuração local, os scripts de inicialização/parada/verificação e os
   exemplos de variáveis, sem commitar segredos.
5. Iniciar o stack local e aplicar as migrations existentes; registrar portas, URLs e
   limitações de Auth necessárias para os testes.

### Fase 2 — Lógica principal

1. Atualizar o módulo central do cliente para consumir a configuração do ambiente atual e
   manter o mesmo contrato para todos os serviços existentes.
2. Garantir que DEV não tenha fallback para o Supabase remoto e que produção não tente
   usar o stack Docker local.
3. Propagar falhas de indisponibilidade do backend para o estado de autenticação sem
   alterar o contrato de autenticação usado pelas páginas.
4. Verificar os serviços remotos existentes contra o Supabase local, sem fundi-los com o
   serviço de `localStorage` e sem introduzir sincronização.
5. Manter a configuração existente do provedor de deploy fora do escopo de alterações e
   validar posteriormente, em modo somente leitura, que os valores remotos de produção
   já configurados são consumidos sem exigir mudanças no código a cada deploy.

### Fase 3 — Interface

1. Reutilizar os componentes e estados de erro existentes para diferenciar configuração
   ausente, backend DEV indisponível e backend de produção mal configurado.
2. Exibir uma mensagem acionável para o caso de Docker parado, sem sugerir ou executar
   fallback para produção.
3. Confirmar que a tela de login, restauração de sessão e entrada na aplicação continuam
   com o mesmo comportamento quando o backend está disponível.

### Fase 4 — Testes

1. Executar verificações estáticas/build e confirmar que os consumidores continuam usando o
   cliente central.
2. Executar os fluxos existentes contra o Supabase local, cobrindo autenticação,
   campanhas, convites, fichas, sessões, XP e progressão.
3. Executar o mesmo conjunto de regressão exclusivamente contra o Supabase remoto DEV
   autorizado para teste. O Vercel e o Supabase remoto de produção não serão usados para
   testes funcionais que escrevam dados.
4. Testar Docker parado, porta ocupada, configuração ausente, migrations não aplicadas e
   troca entre DEV e produção.
5. Confirmar que nenhuma credencial ou URL sensível foi versionada e que nenhum teste
   local fez chamadas ao projeto de produção.

### Fase 5 — Entrega (deploy/rollback)

1. Atualizar a documentação de setup local, comandos de start/stop e configuração de
   ambiente.
2. Revisar o diff contra a Spec da Feature, a arquitetura e o eventual Registro de
   Decisão.
3. Inspecionar o deploy de produção existente em modo somente leitura, usando apenas as
   informações já disponíveis, sem fazer deploy, promover, reverter ou alterar variáveis.
4. Registrar o ponto de rollback do código/configuração e o procedimento para interromper
   o stack local sem afetar produção.
5. Entregar somente após a aprovação deste plano, das tarefas e dos testes de aceite.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Registro de Decisão? |
|---|---|---|---|---|
| Ambiente DEV apontar acidentalmente para o Supabase remoto | Média | Alto | Separar variáveis por ambiente, validar a configuração no cliente central, proibir fallback e testar o destino efetivo | Sim. Recomenda-se registrar a regra de isolamento DEV/prod antes da implementação |
| Um teste funcional alterar dados ou configuração do ambiente de produção | Baixa | Alto | Usar somente o Supabase remoto DEV autorizado para testes com escrita; restringir o Vercel e o Supabase de produção a inspeções somente leitura | Sim. A restrição operacional deve permanecer explícita no plano e na execução |
| A decisão entre Supabase CLI e Docker Compose mantido manualmente criar dependência difícil de reverter | Média | Médio/alto | Preferir o fluxo oficial e manter a configuração no `supabase/` existente; fixar versão e documentar comandos | Sim. Recomenda-se um Registro de Decisão para a estratégia de execução local |
| Migrations existentes não reproduzirem o schema esperado localmente | Média | Alto | Aplicar todas as migrations em ordem, testar RPCs/policies e registrar qualquer divergência como migration versionada | Não, salvo se for necessário mudar a estratégia de schema aprovada |
| Alteração no bootstrap de autenticação quebrar login ou restauração de sessão | Média | Alto | Fazer baseline, manter o cliente único, tratar erros sem mudar o contrato público e testar Auth antes dos demais fluxos | Não, enquanto a solução permanecer dentro dos módulos existentes |
| A mudança de ambiente misturar sessões/dados do navegador entre DEV e produção | Média | Alto | Usar origens/configurações separadas, validar chaves/URL por ambiente e testar a troca no mesmo navegador | Sim, se for necessário alterar a política de isolamento de sessão |
| Falta de decisão sobre seed, persistência local ou e-mail bloquear testes completos | Média | Médio | Resolver as perguntas abertas antes da Fase 4; manter seed e simulação de e-mail fora até haver aprovação | Não, a menos que a decisão altere persistência ou arquitetura |
| Configuração Docker incompatível com a máquina do desenvolvedor | Média | Médio | Documentar pré-requisitos, testar inicialização limpa e informar falhas de forma acionável | Não |

## 7. Perguntas abertas antes de começar

- Aprovar o uso do Supabase CLI para gerenciar o stack Docker local, em vez de manter um
  `docker-compose.yml` próprio.
- Definir se o ambiente será identificado pelos modos do Vite e arquivos `.env.*`, por uma
  variável explícita adicional, ou por ambos.
- Definir se o banco local persistirá dados entre reinicializações do Docker.
- Definir se as migrations existentes devem ser aplicadas automaticamente no início do
  ambiente local.
- Definir se haverá `supabase/seed.sql` e quais dados iniciais serão permitidos.
- Definir como e-mails de autenticação serão tratados localmente.
- O Supabase remoto DEV autorizado será o único ambiente remoto usado para regressões
  funcionais com escrita; o Vercel e o Supabase remoto de produção serão apenas
  inspecionados em modo somente leitura.
