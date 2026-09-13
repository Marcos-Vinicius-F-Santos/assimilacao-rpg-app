# Spec da Feature — Modo DEV com Supabase local em Docker

Status: Rascunho  
Projeto: RPG Manager  
Onde vive no código: infraestrutura local Docker e configuração central do cliente Supabase; consumidores existentes dos serviços de dados não devem precisar conhecer ou alterar a conexão por ambiente.

## 1. Objetivo

Configurar um ambiente DEV local com uma instância do Supabase executando em Docker,
permitindo testar a aplicação completa localmente como se estivesse conectada ao Supabase.
Em deploy, a aplicação deve continuar usando o Supabase remoto de produção, com a troca
de ambiente resolvida pela configuração central e sem alterações nas conexões já utilizadas
pelos módulos da aplicação.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

- O cliente Supabase é criado em `src/lib/supabase.js` a partir de variáveis de ambiente.
- Quando essas variáveis não estão disponíveis, a aplicação considera o Supabase não
  configurado e exibe a tela “Conecte o Supabase”, impedindo o uso normal dos fluxos que
  dependem do serviço remoto.
- Os serviços de autenticação, campanhas e sessões usam o cliente Supabase centralizado.
  Sem cliente configurado, eles retornam ou lançam erro de “Supabase não configurado”.
- Existe um fluxo separado de armazenamento local em `localStorage`, usado para rascunhos
  e alguns dados locais. Esse fluxo não é uma substituição completa do Supabase e não há
  sincronização entre os dois fluxos nesta fase.
- Em deploy, conforme a configuração atual do produto, a aplicação deve usar o Supabase
  remoto.

## 3. Requisitos funcionais

### FR-001
QUANDO a aplicação for executada no ambiente DEV local
O SISTEMA DEVE utilizar uma instância local do Supabase executada por Docker como destino
de autenticação e persistência da aplicação.

### FR-002
QUANDO o ambiente DEV local estiver com a instância Docker disponível
O SISTEMA DEVE permitir executar localmente os fluxos da aplicação que dependem do
Supabase como se estivesse conectado ao serviço Supabase.

### FR-003
QUANDO a aplicação for publicada em um deploy de produção
O SISTEMA DEVE utilizar o Supabase remoto configurado para produção.

### FR-004
QUANDO houver uma mudança entre a execução local DEV e um deploy de produção
O SISTEMA DEVE selecionar o destino de conexão por meio de configuração de ambiente
centralizada, sem exigir alterações nas conexões ou nos consumidores existentes dos
serviços da aplicação.

### FR-005
QUANDO o ambiente de execução for identificado como DEV ou produção
O SISTEMA DEVE manter o mesmo contrato de acesso usado pelos módulos da aplicação,
alterando apenas o destino configurado para o cliente Supabase correspondente ao ambiente.

### FR-006
QUANDO a aplicação estiver sendo executada localmente sem a instância Docker necessária
O SISTEMA DEVE informar que o backend local não está disponível e não deve direcionar a
execução DEV automaticamente para o Supabase de produção.

## 4. Regras de negócio

### BR-001
O ambiente DEV local deve apontar exclusivamente para a instância Supabase executada em
Docker.

### BR-002
Um deploy de produção deve apontar exclusivamente para o Supabase remoto de produção.

### BR-003
A seleção do destino por ambiente deve ocorrer em um ponto central de configuração; páginas
e serviços consumidores não devem conter lógica própria para escolher entre DEV e produção.

### BR-004
A introdução do modo DEV não deve alterar o comportamento funcional da aplicação quando
ela estiver conectada ao Supabase remoto em produção.

## 5. Critério de aceite

### AC-001 — caminho feliz: execução local
Dado que a instância local do Supabase esteja iniciada em Docker e o ambiente esteja
configurado como DEV
Quando o usuário executar a aplicação localmente e utilizar os fluxos que dependem de
autenticação e persistência
Então a aplicação deve usar o Supabase local, permitir o uso desses fluxos e não exibir a
tela de configuração que exige conexão com o Supabase remoto.

### AC-002 — caminho feliz: deploy de produção
Dado que a aplicação esteja publicada com a configuração de produção do Supabase remoto
Quando um usuário acessar e utilizar a aplicação publicada
Então a aplicação deve usar o Supabase remoto de produção, sem exigir alterações nos
serviços ou nas páginas para cada deploy.

### AC-003 — caminho de erro: backend local indisponível
Dado que a aplicação esteja configurada como DEV e a instância Supabase do Docker esteja
parada ou indisponível
Quando o usuário iniciar ou tentar utilizar a aplicação localmente
Então a aplicação deve informar que o backend local não está disponível e não deve fazer
fallback silencioso para o Supabase remoto de produção.

### AC-004 — caminho de erro: configuração de produção ausente
Dado que a aplicação esteja em um deploy de produção sem as configurações necessárias do
Supabase remoto
Quando a aplicação for iniciada ou tentar acessar um fluxo que dependa do Supabase
Então deve apresentar um erro de configuração identificável e não deve tentar usar a
instância Docker local.

## 6. Casos de erro / edge cases

- Docker não está instalado, não está em execução ou não consegue iniciar a instância local
  → a aplicação deve comunicar que o backend DEV não está disponível.
- A porta necessária para a instância local já está ocupada → a inicialização do ambiente
  DEV deve falhar de forma identificável, sem alterar o destino para produção.
- A instância local está disponível, mas suas migrações ou configurações divergem das
  esperadas pela aplicação → o erro deve permanecer visível e identificável; não deve haver
  fallback automático para produção.
- O usuário alterna entre a aplicação local e a publicada no mesmo navegador → sessões,
  credenciais e dados de cada ambiente não devem ser tratados como se fossem do outro
  ambiente.
- Dados que continuam definidos pela arquitetura como `localStorage` permanecem locais e
  não passam a ser sincronizados automaticamente com o Supabase Docker nesta feature.

## 7. Fora de escopo desta feature

- Alterar ou reestruturar as funcionalidades de autenticação, campanhas, sessões, fichas,
  progressão ou demais regras de negócio.
- Criar sincronização entre `localStorage`, Supabase local e Supabase remoto.
- Migrar dados existentes do Supabase remoto para o ambiente DEV local ou vice-versa.
- Definir um fluxo de promoção de dados DEV para produção.
- Configurar CI/CD, deploy automático do Docker ou hospedagem do Supabase local.
- Adicionar um segundo sistema de RPG ou alterar a separação entre `core/` e
  `systems/assimilacao/`.
- Alterar o comportamento funcional do ambiente de produção.

## 8. Suposições e perguntas abertas

- [ ] **Suposição:** o ambiente DEV será distinguido do ambiente de produção por uma
  configuração de ambiente centralizada, mas ainda não foi definido se isso será feito
  exclusivamente pelo modo do Vite, por uma variável explícita ou por ambos.
- [ ] **Suposição:** o Docker local deverá disponibilizar os serviços do Supabase necessários
  para a aplicação, incluindo autenticação e banco de dados; ainda não foi definido se a
  solução será um único container ou uma composição de serviços.
- [ ] **Pergunta:** a instância local deve persistir seus dados entre reinicializações do
  Docker ou pode começar vazia a cada execução DEV?
- [ ] **Pergunta:** as migrações existentes do diretório `supabase/migrations/` devem ser
  aplicadas automaticamente ao iniciar o ambiente local?
- [ ] **Pergunta:** o ambiente DEV precisa de dados iniciais (seed), como usuário, campanha,
  catálogos ou personagens de teste?
- [ ] **Suposição:** “testar toda a aplicação” significa cobrir localmente todos os fluxos
  atuais que dependem do Supabase, sem incluir integrações externas não documentadas.
- [ ] **Suposição:** quando o backend local estiver indisponível, a aplicação deve falhar de
  forma explícita e segura, sem fallback para produção.
- [ ] **Pergunta:** o comportamento de e-mails de autenticação no DEV deve ser simulado,
  capturado localmente ou enviado por algum provedor real?

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito
- [ ] Casos de erro de prioridade alta tratados
- [ ] Execução DEV local validada com o Supabase em Docker
- [ ] Deploy de produção existente inspecionado em modo somente leitura, sem alteração no Vercel
- [ ] Regressão funcional remota validada exclusivamente no Supabase remoto DEV autorizado
- [ ] A seleção de ambiente está centralizada e não exige alteração nos consumidores
- [ ] Features existentes continuam funcionando (regressão checada)
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`
- [ ] Eu revisei e aprovei antes do deploy
