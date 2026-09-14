# Procedimento de Deploy — Correção da criação de personagem

Ambiente: Produção na Vercel, projeto `assimilacao-rpg-app`, repositório GitHub `Marcos-Vinicius-F-Santos/assimilacao-rpg-app`, branch de produção `main`  
URL de produção: `https://assimilacao-rpg-app.vercel.app`  
Data: 14/09/2026  
Escopo: garantir que o botão **Novo personagem** e o acesso direto a `/characters/new` carreguem a tela de criação existente, com estado de erro controlado quando ela não puder ser carregada.

## Pré-condições

- [ ] O roteiro de teste manual autenticado da checklist foi executado para o caminho pelo botão e para o acesso direto a `/characters/new`.
- [x] A checklist de convergência foi preenchida em `specs/05-verificacao/correcao-criacao-personagem/checklist-convergencia.md`; eventuais itens ainda não confirmados devem ser resolvidos antes do push.
- [x] Não há variável nova, segredo hardcoded ou arquivo `.env*` incluído nesta feature.
- [ ] Eu (aprovador) revisei o diff final e autorizei o push para `main`.

## Variáveis de ambiente e segredos

Esta feature não exige variável nova nem alteração de segredo. Antes do deploy, confirmar no Vercel, em **Settings → Environment Variables → Production**, que continuam configuradas:

- `VITE_SUPABASE_URL`: URL remota do Supabase de produção.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave pública do Supabase de produção.

Não copiar `.env.local`, `.env.development.local` ou `.env.test.local` para o Vercel. Não usar `127.0.0.1`, `localhost`, o projeto Supabase DEV, `service_role`, `sb_secret`, senha ou credencial administrativa em variáveis `VITE_*`. Se uma variável de Production for alterada, uma nova build de produção deverá ser gerada antes da validação.

## Passos do deploy

1. Na raiz `E:\Projects\assimilacao-rpg-app`, confirme a branch, o remoto e o diff aprovado:

   ```powershell
   git branch --show-current
   git remote -v
   git status --short
   git diff -- src/app/main.jsx src/pages/CampaignCreate/index.jsx src/pages/CampaignCreate/pages.jsx src/styles.css
   git diff --check
   ```

   A branch deve ser `main`, o remoto deve ser `Marcos-Vinicius-F-Santos/assimilacao-rpg-app` e o estado deve conter somente as alterações aprovadas da feature e sua documentação. Não adicionar `AGENTS.md`, arquivos `.env*` ou alterações não relacionadas.

2. Instale as dependências do lockfile e execute as verificações locais:

   ```powershell
   pnpm install --frozen-lockfile
   pnpm build
   pnpm validate:assimilations
   git diff --check
   ```

   O build e a validação devem terminar com sucesso. O aviso conhecido de tamanho de bundle não bloqueia sozinho o deploy; qualquer erro de build, validação ou `git diff --check` interrompe o procedimento.

3. No painel da Vercel, confirme as variáveis do ambiente **Production** descritas acima. Não altere variáveis para esta feature. Se precisar corrigir uma variável por motivo independente, registre a mudança e repita a build antes de prosseguir.

4. Depois da aprovação explícita do diff, crie o commit contendo somente os arquivos desta entrega:

   ```powershell
   git add src/app/main.jsx src/pages/CampaignCreate/index.jsx src/pages/CampaignCreate/pages.jsx src/styles.css specs/03-features/correcao-criacao-personagem specs/04-plano/correcao-criacao-personagem specs/05-verificacao/correcao-criacao-personagem specs/06-deploy/correcao-criacao-personagem
   git commit -m "fix: corrigir criacao de personagem"
   git push origin main
   ```

   O push para `main` aciona a integração existente GitHub → Vercel e cria o deployment de produção. Não executar `vercel --prod` em paralelo nem fazer um segundo deploy manual.

5. No projeto `assimilacao-rpg-app` da Vercel, aguarde o deployment de `main` chegar a **Ready** e confirmar o ambiente **Production**. Registre antes da validação:

   ```text
   Nova deployment: <URL ou ID>
   Commit: <SHA enviado para main>
   Deployment anterior READY: <URL ou ID>
   ```

## Ordem de migration de banco (se houver)

Não há migration nesta feature. Ela não altera schema, dados, autenticação ou contratos do Supabase. Não execute `supabase db push`, `supabase db reset` nem qualquer alteração remota de banco como parte deste deploy.

Se aparecer qualquer migration no diff, interrompa o procedimento e trate-a como uma entrega separada, com revisão de SQL e rollback de dados próprio.

## Validação depois do deploy

1. Confirme no painel da Vercel que o deployment de `main` está **Ready** e marcado como **Production**.
2. Confirme que a aplicação responde HTTP 200:

   ```powershell
   (Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
   ```

   O resultado esperado é `200`.

3. Com uma conta de produção autorizada, faça login, abra **Personagens** e confirme o caminho iniciado pelo botão **Novo personagem**:
   - a URL final é `https://assimilacao-rpg-app.vercel.app/characters/new`;
   - a tela existente de criação é renderizada, incluindo o título **Criação de personagem**, o indicador **1/9** e os campos iniciais;
   - não há tela em branco nem erro `ReferenceError` no console.
4. Recarregue diretamente `https://assimilacao-rpg-app.vercel.app/characters/new` e confirme o mesmo resultado, sem depender da navegação pela lista de personagens.
5. Valide o estado de erro com uma falha controlada no ambiente autorizado disponível. Confirme a mensagem `Não foi possível carregar a tela. Consulte o administrador.` e que a aplicação não fica em branco. Se não for possível provocar a falha com segurança, registre esse item como não confirmado e não o marque como validado.
6. Faça uma verificação rápida de regressão: login, abertura de uma campanha, abertura de uma ficha existente e navegação pelas telas de personagens que não fazem parte da criação. Não crie, edite ou exclua dados reais apenas para testar esta entrega.
7. Consulte os logs da deployment e o console do navegador. Se houver erro de carregamento, autenticação ou rota, interrompa a divulgação e execute o rollback abaixo.

## Procedimento de rollback

Execute exatamente nesta ordem, usando o painel da Vercel como caminho principal:

1. Pare a validação e registre horário, URL, deployment, commit e sintoma. Não faça novo commit e não altere o Supabase.
2. Abra o projeto Vercel `assimilacao-rpg-app` → **Deployments**.
3. Identifique o deployment atual marcado como **Production** e anote seu ID, URL, commit e horário.
4. Localize o deployment imediatamente anterior com status **Ready**. Confirme que ele é anterior ao deployment problemático e que pertence ao projeto correto. Não escolha um deployment `Building`, `Error` ou de outro projeto.
5. No menu `...` do deployment anterior, escolha **Promote to Production** ou **Rollback**, conforme a opção exibida, e confirme.
6. Aguarde o painel mostrar o deployment anterior como **Production** ativo. Confirme a resposta HTTP:

   ```powershell
   (Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
   ```

   O resultado esperado é `200`.

7. Faça o smoke test mínimo: tela de login, login com conta autorizada, abertura de campanha, abertura de ficha e acesso a uma tela de personagem. Não crie dados novos.
8. Consulte os logs do deployment restaurado. Se o erro continuar, mantenha o rollback ativo e não faça novo deploy.
9. Registre o incidente com deployment problemático, deployment restaurado, commits, horário, erro observado e resultado do smoke test.

### Rollback pelo CLI, se o painel estiver indisponível

Use apenas se o CLI da Vercel já estiver instalado e `VERCEL_TOKEN` já estiver disponível de forma segura no ambiente. Não cole, exiba ou grave o token.

1. Confirme o ID ou URL do deployment anterior **Ready** no histórico da Vercel.
2. No PowerShell, substitua apenas o marcador pelo deployment anterior confirmado:

   ```powershell
   vercel rollback <ID-OU-URL-DO-DEPLOYMENT-ANTERIOR> --scope "marcos-vinicius-f-santos-projects" --token $env:VERCEL_TOKEN
   ```

3. Repita os passos 6 a 9 do caminho principal.

Não use `git reset --hard`, `git checkout --`, `supabase db reset` ou `supabase db push` para corrigir este incidente. O rollback troca somente o deployment servido, preservando o histórico do Git e os dados do usuário.

## Notas de recuperação de dados (se aplicável)

Não se aplica rollback de dados: esta feature não tem migration, não altera schema e não grava dados novos. Reverter o deployment não desfaz ações de usuários realizadas enquanto a versão problemática esteve ativa; se houver impacto desse tipo, registre-o como incidente separado antes de qualquer correção de dados.

Este procedimento prepara o deploy, mas não o executa nem o aprova automaticamente.

**Aprovado pra deploy?**
