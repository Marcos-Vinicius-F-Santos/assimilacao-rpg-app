# Evidência de rollback e entrega — T-021

Tarefa: T-021 [FR-009] Preparar ponto de rollback e entrega  
Feature: Reestruturação Arquitetural Inicial  
Data da verificação: 13/09/2026  
Status da evidência: Preparação executada; tarefa aprovada pelo responsável; entrega funcional ainda não aprovada

## Verificações de entrega

| Verificação | Resultado |
|---|---|
| `pnpm build` | Aprovado; build Vite concluído com 1.929 módulos transformados |
| `pnpm validate:assimilations` | Aprovado; 52 assimilações, 266 habilidades e 0 habilidades sem custo de aquisição |
| `git diff --check` | Aprovado; apenas avisos de conversão de final de linha foram exibidos |
| Regressão funcional T-017 | Reprovada; leitura de XP pelo jogador está registrada no backlog |

O build exibiu apenas o aviso não bloqueante de chunk JavaScript acima de 500 kB.

## Ponto de rollback

O ponto versionado anterior às alterações não commitadas da reestruturação é:

```text
ae923b6 — Show progression characteristic details
```

O estado atual da reestruturação permanece no working tree e não foi criado commit novo por T-019–T-021.

## Procedimento conhecido de retorno

Antes de qualquer rollback, deve-se preservar o working tree atual em um checkpoint revisável. Depois disso, o retorno pode ser feito restaurando os arquivos rastreados ao commit `ae923b6` e removendo somente os novos arquivos de migração após conferência explícita da lista. Ao final, deve-se executar novamente o build.

Nenhum rollback foi executado, pois ele descartaria alterações não commitadas e não foi solicitado pelo usuário.

## Condição para entrega

O ponto de retorno e as verificações técnicas estão documentados. A entrega funcional não deve ser considerada aprovada enquanto a falha registrada em `fix-backlog.md` não for corrigida ou formalmente aceita como exceção.
