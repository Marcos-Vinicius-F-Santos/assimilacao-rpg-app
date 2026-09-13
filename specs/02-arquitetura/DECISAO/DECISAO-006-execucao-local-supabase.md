# Registro de Decisão — Execução local do Supabase

Data: 13/09/2026  
Status: Aceita  
Feature relacionada: Modo DEV com Supabase local em Docker

## Contexto

O RPG Manager precisa executar localmente os fluxos que dependem de autenticação e
persistência sem enviar dados de desenvolvimento ao Supabase remoto. O projeto já possui
o diretório `supabase/` e migrations versionadas, enquanto os consumidores da aplicação
devem continuar usando um único cliente Supabase centralizado.

## Decisão

Usar o Supabase CLI, instalado como dependência de desenvolvimento com versão fixada, para
orquestrar o stack oficial do Supabase em Docker dentro do diretório `supabase/` existente.

O destino do cliente será definido somente pelas variáveis de ambiente carregadas pelo Vite:

- DEV local: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` apontam para o stack local,
  normalmente `http://127.0.0.1:54321`;
- produção ou teste remoto autorizado: as mesmas variáveis apontam para o projeto Supabase
  remoto configurado no ambiente de deploy;
- nenhum consumidor de serviço escolhe o destino por conta própria;
- não existe fallback entre os ambientes.

O banco local será recriado a partir das migrations versionadas com comandos explicitamente
locais. Dados locais podem ser removidos por reset do banco DEV; nenhum comando desta
estratégia deve operar sobre o banco remoto sem uma solicitação e um comando explícito
apropriado.

Seed de dados não faz parte desta decisão: permanece desabilitado até que os dados iniciais
permitidos para o ambiente DEV sejam definidos e aprovados separadamente.

Esta decisão foi aprovada junto com o plano e as tarefas da feature de modo DEV.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter um `docker-compose.yml` próprio | Duplicaria a topologia do Supabase e aumentaria o custo de manter serviços, portas e versões alinhados. |
| Usar uma instalação global não versionada da CLI | Tornaria a reprodução do ambiente dependente da máquina e da versão instalada globalmente. |
| Criar um segundo cliente ou ramificações nos serviços consumidores | Espalharia a decisão de ambiente e violaria o contrato centralizado previsto na feature. |
| Usar fallback automático entre local e remoto | Poderia enviar dados DEV ao ambiente remoto sem intenção explícita. |

## Consequências

- Docker Desktop passa a ser pré-requisito para o ambiente DEV completo.
- `supabase/config.toml` e `supabase/migrations/` permanecem versionados no projeto.
- A troca entre DEV e remoto acontece por configuração, sem editar serviços ou páginas.
- O projeto precisa documentar claramente quais variáveis pertencem a cada ambiente.
- O banco local pode ser resetado com segurança operacional, desde que o comando use o alvo local.
