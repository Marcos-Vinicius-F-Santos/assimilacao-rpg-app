# Evidência de inspeção — T-020

Tarefa: T-020 [FR-003, FR-004, FR-005] Inspecionar o build de produção e a configuração existente do deploy  
Feature: Modo DEV com Supabase local em Docker  
Data: 13/09/2026  
Status da evidência: Inspeção executada em modo somente leitura; aguardando aprovação da tarefa

## Escopo

Foi inspecionado o deploy público existente em:

```text
https://assimilacao-rpg-app.vercel.app
```

Nenhum login, formulário, publicação, promoção, rollback ou alteração de variável foi
executado.

## Resultado da inspeção

| Verificação | Resultado |
|---|---|
| Resposta HTTP do deploy | Aprovada; o endereço público respondeu HTTP 200. |
| Bundle publicado | Contém o cliente Supabase e um destino remoto `*.supabase.co`. |
| URL literal do Supabase local no bundle | Não encontrada; não há `http://127.0.0.1:54321` nem `http://localhost:54321`. |
| Cliente central no código | Confirmado em `src/core/lib/supabase.js`. |
| Seleção de ambiente nos consumidores | Não encontrada em páginas ou serviços; eles usam o contrato central. |
| Dependência de Docker no deploy publicado | Não encontrada; o deploy é uma SPA e não depende do Docker local para carregar. |
| Alteração no Vercel ou no Supabase de produção | Nenhuma. |

## Conclusão

O deploy publicado consome um Supabase remoto compilado pela configuração de produção,
sem exigir alteração nos consumidores quando o destino do cliente muda. O ambiente local
continua isolado pelas variáveis do Vite e não é embutido como destino de produção.

Esta inspeção não altera nem substitui a revisão manual das variáveis no painel do provedor;
ela confirma somente o comportamento observável do deploy e do bundle publicado.
