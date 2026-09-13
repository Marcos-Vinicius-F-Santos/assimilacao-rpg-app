# Registro de Decisão — Entrypoint final em `app/main.jsx`

Data: 13/09/2026  
Status: Aceita

## Contexto

`src/app/main.jsx` já concentra o bootstrap, providers e rotas, mas `index.html` ainda aponta para `src/main.jsx`, que funciona apenas como uma ponte para `app/main.jsx`. A extração de `legacyApp.jsx` precisa concluir a fronteira arquitetural da aplicação sem manter uma entrada paralela desnecessária.

## Decisão

Alterar `index.html` para iniciar diretamente por `/src/app/main.jsx` e remover a ponte `src/main.jsx` após o build e a verificação de inicialização passarem.

`src/app/main.jsx` permanecerá restrito a bootstrap, providers, composição de rotas e chamadas de composição necessárias para iniciar os fluxos. As implementações de tela continuarão em `pages/` e os componentes compartilhados em `shared/`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter `src/main.jsx` como entrypoint final | Mantém uma camada de compatibilidade sem responsabilidade própria e deixa a estrutura alvo incompleta. |
| Mover o bootstrap de volta para `src/main.jsx` | Contraria a arquitetura aprovada para `app/main.jsx`. |
| Fazer a alteração antes da extração das páginas | Aumenta o risco de diagnosticar simultaneamente problemas de entrypoint e de dependências do legado. |

## Consequências

O entrypoint da aplicação ficará alinhado à estrutura aprovada. A ponte será removida somente como último passo estrutural, após confirmar que não há imports ativos, que o build passa e que a inicialização e os fluxos de regressão continuam funcionando.

