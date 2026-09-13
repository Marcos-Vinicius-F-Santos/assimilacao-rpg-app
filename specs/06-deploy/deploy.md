# Procedimento de Deploy — RPG Manager

Ambiente: Produção na Vercel, projeto `assimilacao-rpg-app`, repositório GitHub `Marcos-Vinicius-F-Santos/assimilacao-rpg-app`, branch de produção `main`  
URL pública: `https://assimilacao-rpg-app.vercel.app`  
Data: 13/09/2026  
Escopo: entrega das features `modo-dev-docker-supabase` e `reestruturacao-arquitetural`

## Pré-condições

- [x] Os testes e checklists de convergência foram aprovados pelo responsável, com as ressalvas registradas aceitas para esta fase.
- [x] O build local passa com `pnpm build`.
- [x] A validação do catálogo passa com `pnpm validate:assimilations`.
- [x] Não há referência ativa a `src/pages/legacyApp.jsx` ou ao entrypoint antigo `src/main.jsx`.
- [x] Não há migration nova nesta entrega.
- [ ] O responsável revisou o diff final e confirmou o commit que será enviado para `main`.
- [ ] Os arquivos `.env.local` e `.env.remote.local` não estão no commit.
- [ ] O Vercel possui, no ambiente **Production**, as duas variáveis abaixo:
  - `VITE_SUPABASE_URL` = URL do Supabase remoto de produção.
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = chave pública do Supabase remoto de produção.
- [ ] As variáveis de Production não apontam para `127.0.0.1`, `localhost` nem para o projeto Supabase remoto DEV usado em `.env.remote.local`.
- [ ] O valor de `VITE_SUPABASE_PUBLISHABLE_KEY` é uma chave pública; nunca configurar `service_role`, `sb_secret` ou credencial administrativa no frontend.

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

Confirme que a lista não contém `.env.local`, `.env.remote.local` ou qualquer segredo. Confirme também que o diff contém apenas as alterações aprovadas das duas features.

### 2. Validar as variáveis do Vercel

No projeto Vercel `assimilacao-rpg-app`, abra **Settings → Environment Variables** e selecione **Production**.

Confirme as duas variáveis:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Se alguma estiver ausente ou apontar para o ambiente errado, atualize somente o valor do ambiente **Production** e salve. Não copie `.env.local` nem `.env.remote.local` para o Vercel. Não altere as variáveis de Preview/Development durante esta entrega.

Depois de qualquer alteração de variável, uma nova build é obrigatória; variáveis Vite são incorporadas no bundle durante o build.

### 3. Criar uma prévia pela integração GitHub/Vercel

1. Crie uma branch de entrega a partir do estado aprovado.
2. Envie a branch para o repositório GitHub e abra um Pull Request para `main`.
3. Aguarde o Vercel gerar a Preview Deployment.
4. Abra a URL da prévia e confirme:
   - a aplicação carrega sem tela de configuração;
   - o login aparece;
   - `/characters`, `/homebrew` e `/reset-password` carregam;
   - o bundle da prévia não contém `http://127.0.0.1:54321` nem `http://localhost:54321`;
   - não há erro no console ou no log da deployment.

Não promova a prévia ainda.

### 4. Revisar e integrar em `main`

Após a revisão do Pull Request, faça o merge aprovado em `main`. A integração GitHub/Vercel criará a deployment de produção do projeto `assimilacao-rpg-app`.

Não execute `vercel --prod` a partir deste working tree sem uma decisão explícita para fazer deploy manual. O projeto existente está ligado ao GitHub e não possui `.vercel/project.json` local.

### 5. Registrar o ponto de rollback antes da validação

Assim que a deployment de produção for criada, registre:

```text
Nova deployment: <URL ou ID exibido pelo Vercel>
Deployment anterior READY: <URL ou ID exibido pelo Vercel>
Commit: <SHA do merge em main>
```

No momento desta documentação, o último ponto de produção observado era o commit `ae923b6` (`Show progression characteristic details`) e a deployment `dpl_EwkjyqVwu8oyGFxm2EB9gHKs2Ar8`. Esses valores devem ser reconfirmados no Vercel imediatamente antes do release; não use um ID antigo se existir uma deployment READY mais recente.

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
   - `/characters`, `/homebrew` e `/reset-password` não retornam tela em branco;
   - não há erro no console.
4. Confirme no bundle/inspeção da deployment que não existem URLs locais (`127.0.0.1:54321` ou `localhost:54321`) e que o destino Supabase é remoto.
5. No Vercel, consulte os logs da deployment e dos primeiros minutos de execução. Se houver erro de autenticação ou carregamento de campanhas, interrompa a validação e execute o rollback abaixo.
6. Não crie dados de teste no Supabase de produção durante esta validação. Use apenas uma conta e dados de produção previamente autorizados.

## Procedimento de rollback

Execute exatamente nesta ordem:

1. Abra o projeto Vercel `assimilacao-rpg-app` → **Deployments**.
2. Localize a deployment de produção imediatamente anterior à deployment problemática. Confirme que ela está `Ready` e que o commit é o commit anotado no passo 5.
3. Copie o ID ou a URL dessa deployment anterior.
4. No terminal, com um token Vercel já disponível em `$env:VERCEL_TOKEN`, execute:

```powershell
vercel rollback <ID-OU-URL-DA-DEPLOYMENT-ANTERIOR> --scope "marcos-vinicius-f-santos-projects" --token $env:VERCEL_TOKEN
```

5. Aguarde o Vercel confirmar o rollback e verifique no painel que a deployment anterior voltou a ser a `Production` ativa.
6. Confirme a resposta HTTP:

```powershell
(Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
```

O resultado esperado é `200`.

7. Abra a aplicação e faça somente um smoke test: tela de login, autenticação autorizada e abertura de uma tela já existente. Não crie dados novos.
8. Consulte os logs da deployment revertida. Se o erro continuar, mantenha o rollback ativo e não faça novo deploy.
9. Registre o incidente com: deployment problemática, deployment restaurada, commit, horário, erro observado e resultado do smoke test.
10. Não execute `git reset --hard`, `git checkout --`, `supabase db reset` ou alteração de dados remotos como parte deste rollback. O rollback desta entrega é somente da deployment da aplicação; não há rollback de migration porque não há migration nova.

Se o CLI não estiver disponível, execute o mesmo rollback pelo painel: **Deployments → deployment anterior READY → menu `...` → Promote to Production/Rollback**, confirme a deployment exibida e repita os passos 5–9.

## Notas de recuperação de dados (se aplicável)

- Esta entrega não altera schema nem dados do Supabase.
- O rollback da aplicação não desfaz dados criados por usuários durante a janela da deployment.
- Dados locais de desenvolvimento são independentes e podem ser recriados com `pnpm supabase:reset`, mas esse comando nunca deve ser executado contra o Supabase remoto.
- Se uma futura entrega incluir migration, ela deverá ter procedimento próprio de reversão de dados antes de ser aprovada para produção.

## Decisão de deploy

Este documento prepara o deploy, mas não o executa nem o aprova automaticamente.
