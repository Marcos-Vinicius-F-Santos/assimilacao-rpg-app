# Procedimento de Deploy — Ajuste de tonalidade na aba de progressão

Ambiente: Produção — Vercel, projeto `assimilacao-rpg-app`, repositório GitHub `Marcos-Vinicius-F-Santos/assimilacao-rpg-app`, branch `main`.
Data: 13/09/2026
URL de produção: `https://assimilacao-rpg-app.vercel.app`

Escopo: publicar o ajuste visual dos blocos de características e do histórico de XP para usar a mesma paleta dos blocos de aptidões. A alteração de código desta feature está em `src/styles.css`.

## Pré-condições

- [ ] Passou pelo roteiro de teste manual descrito na checklist de convergência (`specs/05-verificacao/ajuste-tonalidade-progressao/checklist-convergencia.md`), incluindo a aba de progressão autenticada.
- [x] Checklist de convergência concluído e aprovado, conforme informado pelo aprovador.
- [ ] O diff final contém somente as alterações aprovadas da feature — código visual e a documentação correspondente — sem arquivos não relacionados.
- [ ] As variáveis de ambiente/segredos não estão hardcoded nem commitados.
- [x] Não há migration de banco para esta feature.
- [ ] Eu (aprovador) revisei o diff final e autorizei o push para `main`.

## Variáveis de ambiente e segredos

Não é necessária nenhuma variável de ambiente nova nem alteração de segredo para esta feature CSS-only.

Antes do deploy, apenas confirmar no ambiente **Production** da Vercel que as variáveis já existentes continuam configuradas:

- `VITE_SUPABASE_URL`: URL remota do Supabase de produção.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave pública do Supabase de produção.

Não copiar `.env.local`, `.env.development.local` ou `.env.test.local` para o deploy e não incluir arquivos `.env*` no commit. Nunca configurar `service_role`, `sb_secret` ou credenciais administrativas em variáveis `VITE_*`.

## Passos do deploy

1. Na raiz `E:\Projects\assimilacao-rpg-app`, confirmar o estado do repositório e o conteúdo aprovado:

   ```powershell
   git status --short
   git diff -- src/styles.css
   git diff --check
   git branch --show-current
   git remote -v
   ```

   A branch deve ser `main`, o remoto deve apontar para `Marcos-Vinicius-F-Santos/assimilacao-rpg-app` e não pode haver segredo ou alteração não aprovada. Confirmar que o commit incluirá `src/styles.css` e somente os documentos da feature que foram aprovados.

2. Instalar exatamente as dependências do lockfile:

   ```powershell
   pnpm install --frozen-lockfile
   ```

3. Executar as verificações locais antes de publicar:

   ```powershell
   pnpm build
   pnpm validate:assimilations
   git diff --check
   ```

   O build e a validação devem terminar com sucesso. Um aviso de tamanho de bundle, se repetir o aviso já conhecido e não impedir o build, deve ser registrado como não bloqueante; qualquer erro deve interromper o procedimento.

4. No painel da Vercel, abrir o projeto `assimilacao-rpg-app` e conferir as variáveis do ambiente **Production** descritas acima. Não alterar nenhuma variável para esta feature. Se uma variável precisar ser corrigida por motivo independente, registrar a alteração e fazer novo build de produção antes de continuar.

5. Após a aprovação explícita do diff, criar o commit com as alterações aprovadas e publicar na branch de produção:

   ```powershell
   git add src/styles.css specs/03-features/ajuste-tonalidade-progressao specs/04-plano/ajuste-tonalidade-progressao specs/05-verificacao/ajuste-tonalidade-progressao specs/06-deploy/ajuste-tonalidade-progressao
   git commit -m "style: alinhar tonalidade da progressao"
   git push origin main
   ```

   O push para `main` aciona a integração GitHub → Vercel e cria o deployment de produção. Não executar `vercel --prod` em paralelo nem fazer um segundo deploy manual, salvo decisão operacional explícita.

6. No painel da Vercel, aguardar o deployment da branch `main` chegar a **Ready** e confirmar que ele está associado ao ambiente **Production**. Registrar a URL, o ID do deployment, o commit publicado e o ID/URL do deployment anterior que estava **Ready**; esses dados são necessários para o rollback.

## Ordem de migration de banco (se houver)

Não se aplica. A feature altera somente estilos de interface em `src/styles.css`; não altera schema, dados, autenticação, serviços ou contratos do Supabase.

Não executar `supabase db push`, `supabase db reset` ou qualquer alteração remota de banco como parte deste deploy.

## Validação depois do deploy

1. Confirmar no painel da Vercel que o deployment de `main` está **Ready** em **Production**.
2. Confirmar resposta HTTP da aplicação:

   ```powershell
   (Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
   ```

   O resultado esperado é `200`.

3. Entrar com uma conta autorizada de produção, abrir uma campanha e uma ficha, e navegar até a aba **Progressão**.
4. Comparar visualmente os três blocos de aptidões (**Instintos**, **Conhecimentos** e **Práticas**) com o bloco de **Características**. Confirmar que fundo, títulos, textos, textos auxiliares, bordas, separadores, botões e estados usam a mesma tonalidade definida para as aptidões.
5. Confirmar que o bloco de **Histórico de XP** usa a mesma referência visual, tanto com registros quanto no estado vazio, sem perder valores, datas, descrições ou estados existentes.
6. Confirmar que ações e estados dos blocos continuam funcionando, que a tela permanece utilizável em viewport desktop e mobile e que não há erro no console do navegador.
7. Fazer uma verificação rápida das rotas já existentes de login, campanha, ficha e sessões para detectar regressão óbvia. Não criar, editar ou excluir dados reais apenas para testar esta mudança.
8. Se houver erro visual ou funcional, interromper a divulgação da versão e seguir o rollback abaixo. Registrar URL/ID do deployment, horário, sintoma e evidência.

## Procedimento de rollback

### Caminho principal — painel da Vercel

1. Pare a validação e avise que a versão está sendo revertida. Não faça novo commit e não altere o banco.
2. Abra o painel da Vercel e selecione o projeto `assimilacao-rpg-app`.
3. Entre em **Deployments** e identifique o deployment atualmente marcado como **Production**. Anote ID, URL, commit e horário.
4. Na lista, encontre o deployment imediatamente anterior que esteja com status **Ready** e confirme que ele é anterior ao deployment problemático. Não escolha um deployment **Building**, **Error** ou de outro projeto.
5. Abra o menu `...` desse deployment anterior e escolha **Promote to Production** (ou **Rollback**, se essa for a ação exibida). Confirme a operação.
6. Aguarde o painel confirmar que o deployment anterior voltou a ser **Production**. Atualize a página da aplicação e confirme o status HTTP:

   ```powershell
   (Invoke-WebRequest -Uri "https://assimilacao-rpg-app.vercel.app" -UseBasicParsing).StatusCode
   ```

   O resultado esperado é `200`.

7. Faça o smoke test mínimo: login com conta autorizada, abrir campanha e ficha, entrar em **Progressão** e confirmar que a aplicação voltou a funcionar. Verifique também os logs do deployment revertido para registrar o erro.
8. Registre o incidente com: deployment problemático, deployment promovido, commit de cada um, horário, sintoma, evidência e resultado do smoke test. Só depois comunique que o rollback terminou.

### Caminho alternativo — terminal, se o painel estiver indisponível

Use somente se o CLI da Vercel já estiver instalado e `VERCEL_TOKEN` já estiver disponível de forma segura no ambiente. Não cole nem imprima o valor do token.

1. Obtenha ou confirme o ID/URL do deployment anterior **Ready** no painel, histórico da Vercel ou registro do passo 6.
2. No PowerShell, execute o rollback específico, substituindo apenas o marcador pelo deployment anterior confirmado:

   ```powershell
   vercel rollback <ID-OU-URL-DO-DEPLOYMENT-ANTERIOR> --scope "marcos-vinicius-f-santos-projects" --token $env:VERCEL_TOKEN
   ```

3. Confirme o status HTTP `200` com o comando do passo 6 do caminho principal.
4. Repita o smoke test e o registro do incidente dos passos 7 e 8 do caminho principal.

Nunca use `git reset --hard`, `git checkout --`, `supabase db reset` ou `supabase db push` para tentar corrigir este incidente. O rollback deve trocar o deployment servido, preservando o histórico do Git e os dados do usuário.

## Notas de recuperação de dados (se aplicável)

Não se aplica. Esta feature não executa migration nem altera dados, schema, autenticação ou variáveis de ambiente. O rollback é reversível no nível do deployment e não exige restauração de dados.

**Aprovado pra deploy?**
