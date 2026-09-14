# Procedimento de Deploy — Correção da Biblioteca de Características

Ambiente: Produção na Vercel, projeto `assimilacao-rpg-app`, repositório GitHub `Marcos-Vinicius-F-Santos/assimilacao-rpg-app`, branch de produção `main`  
URL pública: `https://assimilacao-rpg-app.vercel.app`  
Data: 13/09/2026  
Escopo: `correcao-biblioteca-caracteristicas`

## Pré-condições

- [x] A Spec, o plano, as tarefas e o checklist de convergência da feature foram revisados.
- [x] O build local passa com `pnpm build`.
- [x] A validação do catálogo passa com `pnpm validate:assimilations`.
- [x] O caminho feliz foi testado localmente com Mestre e jogador participante no Supabase DEV.
- [x] Não há migration nova nesta entrega.
- [ ] O responsável revisou o diff final e confirmou o commit que será enviado para `main`.
- [ ] Os arquivos `.env.local`, `.env.development.local` e `.env.test.local` não estão no commit.
- [ ] O Vercel possui, no ambiente **Production**, as duas variáveis abaixo:
  - `VITE_SUPABASE_URL` = URL do Supabase remoto de produção.
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = chave pública do Supabase remoto de produção.
- [ ] As variáveis de Production não apontam para `127.0.0.1`, `localhost` nem para o projeto Supabase remoto DEV usado em `.env.development.local`.
- [ ] O valor de `VITE_SUPABASE_PUBLISHABLE_KEY` é uma chave pública; nunca configurar `service_role`, `sb_secret` ou credencial administrativa no frontend.

## Configuração de ambiente e segredos

Não há variável nova exigida por esta feature. O mesmo par de nomes é usado nos dois
ambientes, com valores diferentes:

| Ambiente | Onde configurar | Valores |
|---|---|---|
| Teste local | `.env.development.local` (ignorado pelo Git) | URL e chave pública do Supabase DEV autorizado |
| Teste de credenciais local | `.env.test.local` (ignorado pelo Git) | Credenciais DEV autorizadas para teste; não participa do build e não vai para o Vercel |
| Produção Vercel | Settings → Environment Variables → **Production** | URL e chave pública do Supabase remoto de produção |

Não existe ambiente “Vercel DEV” neste fluxo. Não copie `.env.development.local`,
`.env.test.local` ou `.env.local` para o Vercel. Não coloque senha, `service_role`,
`sb_secret` ou token administrativo em variáveis `VITE_*`.

## Passos do deploy

### 1. Preparar e revisar o commit

Na raiz do projeto:

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm validate:assimilations
git diff --check
git status --short
```

Confirme que a lista não contém `.env.local`, `.env.development.local`, `.env.test.local` ou qualquer segredo. Confirme também que o diff contém apenas as alterações aprovadas da feature `correcao-biblioteca-caracteristicas`.

### 2. Validar as variáveis do Vercel

No projeto Vercel `assimilacao-rpg-app`, abra **Settings → Environment Variables** e selecione **Production**.

Confirme as duas variáveis:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Se alguma estiver ausente ou apontar para o ambiente errado, atualize somente o valor do ambiente **Production** e salve. Não copie nenhum arquivo `.env*` local para o Vercel. Como não existe Vercel DEV neste fluxo, não use o Supabase DEV nas variáveis de Production.

Depois de qualquer alteração de variável, uma nova build é obrigatória; variáveis Vite são incorporadas no bundle durante o build.

### 3. Enviar o estado aprovado para produção

Este projeto não usa Vercel DEV para homologação. Depois da aprovação explícita do
responsável:

1. Confirme que está no repositório `Marcos-Vinicius-F-Santos/assimilacao-rpg-app` e na
   branch `main`.
2. Confirme novamente o diff, o commit e os checks do passo 1.
3. Envie para `main` o commit aprovado:

   ```powershell
   git push origin main
   ```

4. A integração GitHub/Vercel criará a deployment de produção do projeto
   `assimilacao-rpg-app`. Aguarde o status `Ready` antes de validar.

Não execute `vercel --prod` a partir deste working tree sem uma decisão explícita para
deploy manual. O projeto existente está ligado ao GitHub e não possui `.vercel/project.json`
local.

### 4. Registrar o ponto de rollback antes da validação

Assim que a deployment de produção for criada, registre:

```text
Nova deployment: <URL ou ID exibido pelo Vercel>
Deployment anterior READY: <URL ou ID exibido pelo Vercel>
Commit: <SHA do merge em main>
```

Não reutilize um ID antigo: reconfirme no Vercel a deployment `READY` imediatamente
anterior antes de liberar a nova.

## Ordem de migration de banco (se houver)

Não há migration nesta entrega. Não execute `supabase db reset`, `supabase db push` ou qualquer comando destrutivo contra o Supabase remoto de produção.

Se uma migration aparecer no diff antes do merge, interrompa o deploy e trate-a como uma entrega separada: revisar SQL, aplicar primeiro no Supabase DEV autorizado, validar, planejar rollback de dados e somente então atualizar este procedimento.

## Validação depois do deploy

1. No painel do Vercel, confirme que a deployment de `main` está `Ready` e marcada como `Production`.
2. Abra `https://assimilacao-rpg-app.vercel.app` e confirme HTTP 200:

```powershell
(Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
```

3. No navegador, confirme:
   - a tela de login é exibida;
   - não aparece “Configuração de produção ausente”;
   - o login com uma conta de produção autorizada funciona;
   - campanhas, fichas, sessões, XP, progressão e Assimilação continuam acessíveis;
   - dentro de uma campanha, clicar em **Características** abre a biblioteca;
   - a página de Características exibe os cards do catálogo e não fica em branco;
   - o estado de erro identificável pode ser validado conforme a condição de produção
     disponível, sem criar dados novos;
   - `/characters`, `/homebrew` e `/reset-password` não retornam tela em branco;
   - não há erro no console.
4. Confirme no bundle/inspeção da deployment que não existem URLs locais (`127.0.0.1:54321` ou `localhost:54321`) e que o destino Supabase é remoto.
5. No Vercel, consulte os logs da deployment e dos primeiros minutos de execução. Se houver erro de autenticação ou carregamento de campanhas, interrompa a validação e execute o rollback abaixo.
6. Não crie dados de teste no Supabase de produção durante esta validação. Use apenas uma conta e dados de produção previamente autorizados.

## Procedimento de rollback

Execute exatamente nesta ordem, usando o painel como caminho principal:

1. Abra o projeto Vercel `assimilacao-rpg-app` → **Deployments**.
2. Identifique a deployment problemática que está marcada como `Production` e anote sua
   URL/ID, commit e horário.
3. Localize a deployment imediatamente anterior que esteja `Ready`. Confirme que ela é
   anterior à problemática e copie sua URL/ID.
4. No menu `...` da deployment anterior, escolha **Promote to Production** ou
   **Rollback**, conforme o texto exibido pelo painel.
5. Confirme que o painel mostra a deployment anterior como `Production` ativa.
6. Confirme a resposta HTTP:

```powershell
(Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
```

O resultado esperado é `200`.

7. Abra a aplicação e faça somente um smoke test: tela de login, autenticação autorizada
   e abertura da campanha/tela de Características. Não crie dados novos.
8. Consulte os logs da deployment restaurada. Se o erro continuar, mantenha o rollback
   ativo e não faça novo deploy.
9. Registre o incidente com: deployment problemática, deployment restaurada, commit,
   horário, erro observado e resultado do smoke test.
10. Não execute `git reset --hard`, `git checkout --`, `supabase db reset` ou alteração de
    dados remotos como parte deste rollback. O rollback desta entrega é somente da
    deployment da aplicação; não há rollback de migration porque não há migration nova.

### Rollback pelo CLI (alternativa)

Se o painel não estiver disponível, com o token Vercel já configurado em
`$env:VERCEL_TOKEN`, execute:

```powershell
vercel rollback <ID-OU-URL-DA-DEPLOYMENT-ANTERIOR> --scope "marcos-vinicius-f-santos-projects" --token $env:VERCEL_TOKEN
```

Depois, repita os passos 5 a 10. Nunca coloque o token no arquivo de procedimento, no
repositório ou em uma variável `VITE_*`.

## Notas de recuperação de dados (se aplicável)

- Esta entrega não altera schema nem dados do Supabase.
- O rollback da aplicação não desfaz dados criados por usuários durante a janela da deployment.
- Dados locais de desenvolvimento são independentes e podem ser recriados com `pnpm supabase:reset`, mas esse comando nunca deve ser executado contra o Supabase remoto.
- Se uma futura entrega incluir migration, ela deverá ter procedimento próprio de reversão de dados antes de ser aprovada para produção.

## Decisão de deploy

Este documento prepara o deploy, mas não o executa nem o aprova automaticamente.

**Aprovado pra deploy?**
