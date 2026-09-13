# Evidência de rollback e revisão — T-021

Tarefa: T-021 [FR-001, FR-003, FR-006] Preparar rollback e revisar a entrega  
Feature: Modo DEV com Supabase local em Docker  
Data: 13/09/2026  
Status da evidência: Preparação executada; aguardando aprovação da tarefa

## Ponto de retorno

O ponto versionado anterior às alterações não commitadas do projeto é:

```text
ae923b6 — Show progression characteristic details
```

O working tree já possuía alterações da reestruturação e do modo DEV antes desta tarefa.
Nenhum reset, checkout destrutivo ou novo commit foi executado.

## Procedimento de rollback

O rollback só deve ser executado após aprovação explícita e depois de preservar o estado
atual do working tree para revisão. O procedimento previsto é:

1. registrar o diff e a lista de arquivos atuais;
2. restaurar somente o código/configuração ao ponto versionado aprovado;
3. se necessário, parar o Supabase local;
4. recriar o banco local somente com `pnpm supabase:reset`, entendendo que esse comando
   remove dados exclusivamente locais;
5. executar `pnpm build` e `pnpm validate:assimilations`;
6. confirmar que nenhum comando foi executado contra o Vercel ou o Supabase remoto de
   produção.

Não se deve usar rollback automático, `git reset --hard` ou operação equivalente enquanto
existirem alterações do usuário sem uma aprovação específica para descartá-las.

## Revisão da entrega

- O cliente Supabase permanece em um único ponto central.
- A separação entre `core/` e `systems/assimilacao/` não foi ampliada nesta feature.
- O diretório `supabase/` continua sendo a fronteira de configuração e migrations locais.
- Não foi criada migration de produto nesta etapa.
- Não foi criado fallback entre Supabase local, DEV remoto e produção.
- O procedimento de setup foi atualizado sem alterar consumidores.
- O deploy de produção foi apenas inspecionado, sem mutação.

## Resultado

O ponto de retorno e os limites operacionais estão documentados. O rollback não foi
executado porque não foi solicitado e poderia descartar alterações existentes no working
tree.
