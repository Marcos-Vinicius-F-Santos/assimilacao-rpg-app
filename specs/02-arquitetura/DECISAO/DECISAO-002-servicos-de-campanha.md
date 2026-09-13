# Registro de Decisão — Separação dos serviços remoto e local de campanha

Data: 12/09/2026  
Status: Aceita

## Contexto

Existem dois arquivos chamados `campaignService.js`, mas eles possuem responsabilidades diferentes. Um conversa com o Supabase e o outro mantém o rascunho local em `localStorage`.

## Decisão

Os serviços serão mantidos, renomeados e organizados no núcleo de campanhas:

```text
src/services/campaignService.js
→ core/campaigns/campaignRemoteService.js

src/campaignService.js
→ core/campaigns/campaignLocalDraftService.js
```

Não haverá sincronização entre os dois nesta fase.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Apagar um dos arquivos | Ambos estão em uso e possuem responsabilidades diferentes. |
| Fundir os dois serviços em um único serviço | Misturaria persistência remota e rascunho local antes de existir uma decisão sobre sincronização. |
| Manter os nomes atuais | Preserva a ambiguidade e aumenta o risco de imports incorretos. |

## Consequências

Os nomes passarão a comunicar a responsabilidade de cada serviço e os imports ficarão mais claros. A aplicação continuará com dois fluxos de persistência e a limitação de sincronização permanecerá documentada como backlog.
