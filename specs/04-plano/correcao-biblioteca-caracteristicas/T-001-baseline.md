# T-001 — Baseline e reprodução da página em branco

Tarefa: `T-001`  
Feature: `correcao-biblioteca-caracteristicas`  
Data: 13/09/2026  
Commit observado: `e402d41`

## Resultado do baseline técnico

- `pnpm build`: passou.
- Vite iniciou a aplicação local em `http://localhost:5173/`.
- A página inicial carregou com o título `Assimilação | Horto da Nascente`.
- A aplicação apresentou a tela de login, sem erro visual.
- Console do navegador: nenhum erro ou warning registrado na abertura inicial.

## Resultado da reprodução funcional

Não foi possível chegar ao menu de uma campanha nesta execução. O ambiente local está configurado para um Supabase não-local e não havia uma sessão autenticada ou credenciais autorizadas disponíveis para acessar uma campanha.

Não foram criados usuários, alteradas variáveis de ambiente, modificadas configurações do Supabase ou transmitidas credenciais para contornar o bloqueio.

Portanto, a página em branco ao clicar em **Características** ainda não foi reproduzida nesta execução. A URL observada na última tela foi `http://localhost:5173/`.

## Estado após a primeira execução

Na primeira execução, T-001 permanecia incompleta porque ainda faltava uma sessão autenticada para repetir o fluxo em uma campanha.

## Segunda execução — configuração DEV remota

- O arquivo `.env.remote.local` foi separado como `.env.development.local`.
- A URL configurada nesse arquivo corresponde ao projeto Supabase DEV informado.
- O Vite iniciou em `http://localhost:5174/` porque a porta `5173` estava ocupada.
- A aplicação carregou a tela de login normalmente e não exibiu erro ou warning no console.
- O navegador não possuía uma sessão autenticada para abrir uma campanha.
- Como o Supabase DEV é remoto, o login Admin Mock não é disponibilizado pelo código atual; ele é reservado para URLs locais (`localhost`/`127.0.0.1`).

Na segunda execução, o clique em **Características** continuava pendente de uma sessão autenticada. Nenhum usuário foi criado e nenhuma variável foi alterada durante essa execução.

## Terceira execução — reprodução autenticada concluída

- A autenticação com o usuário Mestre de teste do Supabase DEV funcionou.
- A campanha `Teste Regressao T001-T010` foi aberta normalmente.
- O clique em **Características** levou à URL `/campaigns/4eb73077-7d82-4c77-8fb0-bf562858fcf0/characteristics`.
- A página apresentou DOM vazio.
- O console registrou `ReferenceError: ExpandableCharacteristicDescription is not defined` em `CampaignCharacteristicsPage`, em `src/pages/Campaigns/pages.jsx`.
- O console também registrou o warning do React sobre erro no componente, sem outro erro de aplicação observado.

O defeito descrito na Spec foi reproduzido. A correção do `ReferenceError` pertence às tarefas seguintes e não foi feita nesta T-001.

## Situação para aprovação

As evidências previstas para T-001 estão registradas. A tarefa continua com o checkbox aberto em `tarefas.md` e aguarda a aprovação de Marcos para ser considerada concluída.
