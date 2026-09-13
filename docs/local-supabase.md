# Desenvolvimento local com Supabase

Este projeto usa o Supabase CLI para orquestrar o Supabase local em Docker. A configuração
fica em `supabase/config.toml` e as migrations versionadas ficam em
`supabase/migrations/`.

O cliente da aplicação é único e centralizado. Os serviços não precisam ser editados quando
o destino muda: somente as variáveis do ambiente atual mudam.

## Pré-requisitos

- Docker Desktop em execução, com o backend Linux habilitado.
- Node.js e pnpm instalados.
- Dependências instaladas com `pnpm install`.

## Primeiro uso: DEV local

Na raiz do projeto, inicie o stack local:

```text
pnpm install
pnpm supabase:start
pnpm supabase:status
```

O `supabase:start` inicia os serviços Docker locais e aplica as migrations versionadas.
O `supabase:status` exibe a API local e a chave pública do ambiente. Crie ou atualize
`.env.local` com a chave pública exibida:

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<chave pública exibida pelo supabase status>
```

Inicie a aplicação:

```text
pnpm dev
```

A aplicação DEV local usa o Supabase Docker em `http://127.0.0.1:54321`. Se o Docker
estiver parado, a aplicação informa que o backend local está indisponível e não faz
fallback para produção.

## DEV remoto autorizado

Para uma regressão contra um projeto Supabase remoto autorizado, use um arquivo local
específico do modo, por exemplo `.env.remote.local`:

```dotenv
VITE_SUPABASE_URL=<URL do projeto remoto DEV autorizado>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave pública do projeto remoto DEV autorizado>
```

Execute o Vite nesse modo:

```text
pnpm exec vite --mode remote --host 127.0.0.1 --port 5181
```

Esse arquivo não deve ser versionado. O modo remoto DEV é destinado a testes autorizados;
ele não é o deploy de produção e não deve receber dados de produção.

## Produção

O deploy deve receber `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` como variáveis
do ambiente remoto de produção já configurado no provedor. Não copie `.env.local` ou
`.env.remote.local` para o deploy e não altere os consumidores do cliente para trocar o
ambiente.

Um build de produção sem essas variáveis exibe um erro de configuração. Ele não tenta usar
o Supabase Docker local automaticamente.

## Operação diária

```text
pnpm supabase:start
pnpm supabase:status
pnpm dev
```

Serviços locais principais:

- API: `http://127.0.0.1:54321`
- Banco PostgreSQL: porta `54322`
- Studio: `http://127.0.0.1:54323`
- Caixa de e-mails local: `http://127.0.0.1:54324`

Para parar ou reiniciar o backend:

```text
pnpm supabase:stop
pnpm supabase:start
```

Para conferir migrations aplicadas sem alterar o banco:

```text
pnpm exec supabase migration list --local
pnpm exec supabase db diff --local --schema public
```

O segundo comando deve terminar sem diferenças quando o schema local corresponde às
migrations versionadas.

## Login Admin Mock

Em desenvolvimento local, com o Supabase Docker ativo, a tela de login exibe o botão
`Entrar como Admin Mock`. Esse botão cria uma sessão anônima no Supabase local usando o
nome de exibição `Admin Mock`. Ele só aparece em DEV local e não existe em builds de
produção ou quando a aplicação aponta para um projeto remoto.

## Reset local

Para recriar somente o banco DEV local a partir das migrations:

```text
pnpm supabase:reset
```

Esse comando remove os dados do banco local e não executa comandos no Supabase remoto.
Não há seed versionado nesta fase; usuários, campanhas e outros dados de teste precisam ser
criados manualmente no ambiente local ou no Supabase remoto DEV autorizado.

## Validações úteis

```text
pnpm build
pnpm validate:assimilations
```

Os consumidores da aplicação devem continuar usando o cliente central. Não adicione
variáveis de ambiente, `createClient` ou seleção de destino em páginas e serviços.

## Diagnóstico

| Situação | Verificação | Ação segura |
|---|---|---|
| Backend local indisponível | `pnpm supabase:status` | Iniciar Docker e executar `pnpm supabase:start`. |
| URL ou chave ausente | Conferir `.env.local` | Preencher somente com os valores do DEV local e reiniciar o Vite. |
| Porta ocupada | Verificar o processo que usa a porta | Liberar a porta ou iniciar a aplicação em outra porta; não trocar o destino para produção. |
| Migrations divergentes | `migration list` e `db diff` | Corrigir a configuração/migration em revisão separada; não alterar produção para compensar. |
| Ambiente aparentemente misturado | Conferir a URL do modo e a origem do navegador | Usar origens/arquivos de ambiente separados; não criar sincronização ou fallback. |

## Regras de segurança

- Versione somente `.env.example`; arquivos `.env.local` e `.env.*.local` são ignorados.
- Use apenas a chave pública no frontend. Nunca coloque `service_role`, `sb_secret` ou outra
  credencial administrativa em arquivos públicos ou no bundle.
- Testes com escrita remota devem usar exclusivamente o Supabase DEV autorizado.
- O Vercel e o Supabase remoto de produção ficam fora dos testes funcionais com escrita.
