# Baseline — T-001

Feature: Modo DEV com Supabase local em Docker  
Requisitos relacionados: FR-001, FR-002, FR-003, FR-004, FR-005 e FR-006  
Data: 12/09/2026  
Status: Concluída no escopo local aprovado — baseline, fluxo Docker/Admin Mock e caminho de erro local validados; a regressão remota não foi executada por decisão de manter o desenvolvimento no ambiente local

## Estado atual da conexão

- O cliente Supabase está em `src/lib/supabase.js`.
- A URL é lida de `VITE_SUPABASE_URL` ou das variáveis alternativas atualmente aceitas.
- A chave pública é lida de `VITE_SUPABASE_PUBLISHABLE_KEY` ou das variáveis alternativas
  atualmente aceitas.
- O cliente é criado somente quando URL e chave estão disponíveis.
- Os serviços de autenticação, campanhas e sessões importam o cliente central; não há
  seleção DEV/prod espalhada nesses consumidores.
- O modo DEV local é identificado centralmente em `src/lib/supabase.js` e habilita o login
  `Admin Mock` somente quando a aplicação está em desenvolvimento local apontando para o
  Supabase Docker.
- O serviço local separado continua usando `localStorage`; não existe sincronização com o
  Supabase.
- A configuração local do Supabase está em `supabase/config.toml`, com autenticação anônima
  habilitada para o login de desenvolvimento.

## Scripts disponíveis

Conforme `package.json`:

```text
pnpm dev
pnpm build
pnpm validate:assimilations
pnpm preview
pnpm supabase:start
pnpm supabase:stop
pnpm supabase:status
pnpm supabase:reset
```

## Verificações executadas

### `pnpm build`

Resultado: aprovado.

O build de produção foi concluído com Vite 8.3.0. Foram transformados 1.922 módulos e a
saída foi gerada em `dist/`.

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

### Servidor local

Resultado: resposta HTTP inicial aprovada.

O servidor Vite temporário respondeu com status `200` e entregou o documento raiz com o
elemento de montagem da aplicação. A porta `5173` já estava ocupada, então o servidor
temporário utilizou outra porta disponível. O servidor temporário foi encerrado ao final da
verificação.

## Comportamento validado com a configuração local

Verificado por inspeção do código e pela configuração do ambiente:

- `.env.local` aponta para a API local em `http://127.0.0.1:54321` e usa a chave pública do
  ambiente Docker.
- `supabaseConfigured` fica verdadeiro e o cliente central é criado.
- O login `Admin Mock` cria uma sessão anônima no Supabase local, sem criar um fluxo de
  autorização separado.
- A aplicação local consegue criar e persistir campanhas e sessões usando os serviços
  existentes.

Esse comportamento confirma FR-001, FR-002, FR-004 e FR-005 no ambiente local.

## Smoke test funcional

### Supabase remoto

Status: bloqueado.

Não foi possível executar contra o Supabase remoto os fluxos de autenticação, campanhas,
convites, fichas, sessões, XP e progressão porque não há configuração de URL/chave neste
ambiente. Portanto, não foi feita nenhuma tentativa de conexão com produção e nenhum dado
remoto foi alterado.

### Supabase local em Docker

Status: aprovado para o ambiente local.

- A CLI do Supabase foi adicionada como dependência de desenvolvimento fixada em `2.117.0`.
- `supabase/config.toml` foi criado no diretório Supabase existente, sem composição Docker
  paralela.
- O stack local iniciou com Docker e aplicou as 10 migrations versionadas.
- A API local respondeu em `http://127.0.0.1:54321`; Studio e Mailpit ficaram disponíveis
  nas portas `54323` e `54324`.
- O smoke test local criou dois usuários, criou uma campanha, validou entrada pelo código,
  criou uma ficha, abriu/fechou uma sessão e persistiu 25 XP para a ficha.
- Os dados temporários do smoke test foram removidos com `supabase db reset --local --yes`.
- Nenhuma chamada ao projeto remoto foi feita durante esse teste.

### Revalidação com Admin Mock

Executada em 12/09/2026 com o Vite em modo DEV na porta `5178` e o Supabase Docker ativo:

- **AC-001 — aprovado:** o login `Entrar como Admin Mock` abriu a aplicação autenticada;
  uma campanha foi criada e persistida com o participante `Admin Mock` como mestre.
- **FR-002 — aprovado parcialmente:** a área de sessões foi acessada e uma sessão local foi
  aberta com sucesso. O fluxo completo de ficha, entrada por código e XP continua coberto
  pelo smoke test local anterior registrado acima.
- **AC-002 — não executado:** esta revalidação não acessou o Supabase remoto, conforme a
  orientação de manter o desenvolvimento local no Docker.
- **AC-003 — aprovado após correção:** após parar o Docker, a aplicação exibiu “Backend local
  indisponível”, orientou iniciar o Supabase Docker e declarou que não faria fallback para
  produção. Após reiniciar o Docker e tentar novamente, a aplicação voltou à área autenticada.
- **AC-004 — não executado:** depende de validar um deploy sem configuração remota.
- O navegador não registrou erros da aplicação durante o caminho feliz local.

## Estado do repositório

Além da infraestrutura local descrita acima, o ambiente agora possui o login Admin Mock
restrito ao DEV local. Os consumidores existentes continuam usando o cliente Supabase
centralizado; não foi criada uma conexão paralela nem acessado o projeto remoto.

## Limitações registradas para a feature

- A regressão contra o Supabase remoto não foi executada, conforme a decisão de manter este
  ciclo exclusivamente no ambiente Docker local. Isso mantém AC-002 e AC-004 pendentes no
  nível da feature, mas não impede o fechamento aprovado da T-001 como baseline local.
- A correção do caminho de indisponibilidade foi validada com build, Docker parado e Docker
  reiniciado; a T-001 foi marcada como concluída após a aprovação explícita do responsável.
