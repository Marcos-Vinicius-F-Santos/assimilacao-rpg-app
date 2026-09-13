# Evidência de verificação — T-019

Tarefa: T-019 [FR-003] Verificar a separação dos serviços remoto e local  
Feature: Reestruturação Arquitetural Inicial  
Data da verificação: 13/09/2026  
Status da evidência: Verificação executada; tarefa aprovada pelo responsável

## Escopo verificado

Os dois serviços de campanha permanecem identificáveis e separados:

| Responsabilidade | Arquivo verificado | Evidência |
|---|---|---|
| Persistência remota | `src/core/campaigns/campaignRemoteService.js` | importa o cliente Supabase e concentra consultas/RPCs remotos |
| Rascunho local | `src/core/campaigns/campaignLocalDraftService.js` | usa `localStorage` para o armazenamento local |

## Resultado

- O serviço remoto possui referências ao Supabase.
- O serviço remoto não possui referências a `localStorage`.
- O serviço local possui referências a `localStorage`.
- O serviço local não possui referências ao Supabase.
- Não existem arquivos `campaignService.js` restantes dentro de `src/`.
- Os consumidores verificados em `src/app/main.jsx` e `src/pages/legacyApp.jsx` importam os dois serviços pelos novos caminhos.
- Não foi criada sincronização entre os serviços.

## Conclusão técnica

A separação definida pela DECISÃO-002 permanece preservada. A inconsistência de leitura de XP identificada na regressão funcional está registrada em `fix-backlog.md` e não foi tratada nesta tarefa.
