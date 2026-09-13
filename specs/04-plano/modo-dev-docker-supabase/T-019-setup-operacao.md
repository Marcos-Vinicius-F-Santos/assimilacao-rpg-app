# Evidência de entrega — T-019

Tarefa: T-019 [FR-001, FR-002, FR-003, FR-004] Atualizar o procedimento de setup e operação  
Feature: Modo DEV com Supabase local em Docker  
Data: 13/09/2026  
Status da evidência: Implementação executada; aguardando aprovação da tarefa

## Alteração realizada

O procedimento foi consolidado em [`docs/local-supabase.md`](../../../docs/local-supabase.md).
O documento agora cobre:

- pré-requisitos e primeiro uso;
- instalação e inicialização do Supabase CLI em Docker;
- criação do `.env.local` com URL e chave pública local;
- execução diária e comandos de parada/reinício;
- uso separado do `.env.remote.local` para regressão no DEV remoto autorizado;
- limites para produção e ausência de fallback entre ambientes;
- conferência de migrations e reset exclusivamente local;
- validações de build e catálogo;
- diagnóstico de backend indisponível, configuração ausente, porta ocupada e divergência
  de migrations;
- regras para não versionar segredos nem usar credenciais administrativas no frontend.

## Verificação

Os comandos documentados correspondem aos scripts existentes em `package.json` e à
configuração em `supabase/config.toml`. O procedimento não exige alteração em páginas,
serviços consumidores ou no deploy de produção.

## Limites preservados

- Não foi criado `docker-compose.yml` paralelo.
- Não foi criado seed nem sincronização entre `localStorage` e Supabase.
- O Supabase remoto de produção não é usado para testes funcionais com escrita.
