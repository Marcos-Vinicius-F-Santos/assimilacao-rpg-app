# Baseline — T-001

Feature: Reestruturação Arquitetural Inicial  
Requisito relacionado: FR-009  
Data: 12/09/2026  
Status: Concluída com exceção documentada — build e validação técnica concluídos; smoke test autenticado não executado

## Estado estrutural antes da migração

O projeto ainda está na estrutura anterior às Fases 0–3:

- a interface está concentrada em `src/main.jsx`;
- as regras específicas de Assimilação estão diretamente na raiz de `src/`;
- o serviço remoto está em `src/services/campaignService.js`;
- o serviço de rascunho local está em `src/campaignService.js`;
- autenticação e cliente Supabase estão em `src/auth/` e `src/lib/`;
- os serviços de autenticação e sessão estão em `src/services/`;
- não existem ainda `src/app/`, `src/pages/`, `src/core/`, `src/systems/` ou `src/shared/` como estrutura de destino implementada.

## Scripts disponíveis

Conforme `package.json`:

```text
pnpm dev
pnpm build
pnpm validate:assimilations
pnpm preview
```

## Verificações executadas

### `pnpm build`

Resultado: aprovado.

O build de produção foi concluído com sucesso usando Vite 8.3.0. Foram transformados 1.922 módulos e a saída foi gerada em `dist/`.

### `pnpm validate:assimilations`

Resultado: aprovado.

O catálogo foi validado com:

```json
{
  "assimilations": 52,
  "abilities": 266,
  "abilitiesWithoutAcquisitionCost": 0,
  "byFamily": {
    "evolutive": 77,
    "adaptive": 76,
    "inopportune": 76,
    "singular": 37
  }
}
```

## Estado do repositório

Não foram alterados arquivos de aplicação, banco ou configuração nesta tarefa. O `git status` apresenta apenas `specs/` como diretório não rastreado, correspondente às Specs já criadas no projeto.

## Fluxos funcionais

### Smoke test da aplicação

- Servidor local: carregou em `http://localhost:5173/`.
- Conteúdo renderizado: sim; a página exibiu a tela de configuração necessária.
- Overlay de erro do framework: não detectado.
- Erros e warnings de console: nenhum registrado.
- Fluxos de autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação: não acessíveis neste ambiente.

### Bloqueio encontrado

A aplicação exibiu a mensagem solicitando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local`. Sem essas variáveis, o acesso ao Supabase não é ativado e os fluxos autenticados não podem ser exercitados.

## Exceção aceita no encerramento

O ambiente remoto de desenvolvimento foi configurado em `.env.remote.local` e a aplicação foi executada nesse modo com sucesso. A tela de login carregou sem página em branco, overlay de erro ou erros de console, e o build remoto foi concluído com sucesso.

O smoke test autenticado dos fluxos funcionais não foi executado por falta de uma conta válida no novo projeto Supabase. O responsável aprovou o encerramento da T-001 mantendo essa exceção registrada.

## Revalidação antes de T-002–T-005

Antes da implementação de T-002 a T-005, o build e a validação do catálogo foram executados novamente e passaram. A checagem também confirmou que os imports antigos dos serviços de campanha não permanecem no código.
