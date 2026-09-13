# Arquitetura — RPG Manager

Status: Rascunho  
Última atualização: 12/09/2026

## 1. Visão geral do sistema

O RPG Manager é uma SPA React/Vite hospedada na Vercel. O Supabase fornece autenticação e banco de dados. O núcleo genérico da plataforma não conhece regras específicas de sistemas de RPG; essas regras ficam em módulos próprios.

```text
[Navegador / SPA React + Vite]
             ↓
       [app + pages]
             ↓
  ┌─────────────────────────────┐
  │ core/                       │
  │ auth, campaigns, sessions   │
  │ serviços remoto e local     │
  └──────────────┬──────────────┘
                 │ contratos genéricos
  ┌──────────────▼──────────────┐
  │ systems/                    │
  │ registry + Assimilação      │
  └──────────────┬──────────────┘
                 ↓
       [Supabase Auth + PostgreSQL]
                 ↓
          [supabase/migrations]
```

O frontend é publicado na Vercel. A aplicação não possui fila ou eventos externos nesta fase.

## 2. Princípio de organização: por domínio/feature, não por tipo de arquivo

### Situação atual

Hoje a maior parte da interface está concentrada em `src/main.jsx`. As regras específicas de Assimilação estão espalhadas diretamente na raiz de `src/`, enquanto autenticação, serviços remotos e o cliente Supabase estão parcialmente separados.

Existem dois serviços chamados `campaignService.js`, com papéis diferentes:

- o serviço remoto conversa com o Supabase via RPC e consultas remotas;
- o serviço local mantém rascunho, personagens, Homebrew, itens, inventário e permissões em `localStorage`.

Não existe sincronização entre os dois fluxos nesta fase.

### Estrutura alvo

```text
src/
  app/
    main.jsx                         # bootstrap, providers e rotas
  pages/
    Login/
    Campaigns/
    CampaignCreate/                  # inclui a seleção de sistema
    CampaignJoin/
    CharacterSheet/
  core/                              # núcleo genérico da plataforma
    auth/
      AuthProvider.jsx
    campaigns/
      campaignRemoteService.js
      campaignLocalDraftService.js
    sessions/
      sessionService.js
    lib/
      supabase.js
  systems/
    registry.js                      # sistemas disponíveis e metadados
    assimilacao/                     # regras específicas de Assimilação
      assimilationDice.js
      assimilationsCatalog.js
      characteristicsCatalog.js
      characterCreation.js
      initialAssimilation.js
      inventoryCatalog.js
      rollHistory.js
  shared/                            # componentes genéricos reutilizados
```

`supabase/migrations/` permanece fora de `src/` e continua concentrando a evolução do banco, políticas e funções persistidas.

## 3. Decisões grandes já tomadas

- [Decisão 001 — Separação entre núcleo da plataforma e sistemas de RPG](../DECISAO/DECISAO-001-estrutura-de-modulos.md)
- [Decisão 002 — Separação dos serviços remoto e local de campanha](../DECISAO/DECISAO-002-servicos-de-campanha.md)
- [Decisão 003 — Identificação do sistema em campanhas](../DECISAO/DECISAO-003-sistema-de-campanha.md)
- [Decisão 004 — Registry de sistemas de RPG](../DECISAO/DECISAO-004-registry-de-sistemas.md)
- [Decisão 005 — Migração incremental da arquitetura](../DECISAO/DECISAO-005-migracao-incremental.md)
- [Decisão 007 — Localização da persistência de equipamento inicial](../DECISAO/DECISAO-007-persistencia-equipamento-inicial.md)
- [Decisão 008 — Entrypoint final em `app/main.jsx`](../DECISAO/DECISAO-008-entrypoint-final-app-main.md)

## 4. Limites que não devem ser cruzados

- Nada em `core/` pode importar regras de `systems/assimilacao/` ou de qualquer outro sistema.
- `systems/assimilacao/` pode usar contratos e serviços genéricos de campanha e sessão, mas não decide como campanhas ou sessões funcionam.
- A UI não acessa `supabase.js` nem o banco diretamente.
- Páginas e componentes acessam dados por serviços do `core` ou do módulo do sistema.
- Regras específicas de Assimilação não devem ser adicionadas ao `core/`.
- `systems/registry.js` lista sistemas e metadados básicos; não contém regras de negócio.
- Os serviços remoto e local de campanha devem permanecer identificáveis e não devem ser fundidos sem uma nova decisão arquitetural.

## 5. O que fica de fora (por agora)

- implementação de um segundo sistema de RPG;
- catálogo ou regras de sistemas além de Assimilação;
- migração automática de campanhas antigas para um identificador de sistema;
- sincronização entre `localStorage` e Supabase;
- compartilhamento entre dispositivos dos dados que permanecem apenas no armazenamento local;
- fila de mensagens, eventos distribuídos ou cache distribuído;
- mudanças de comportamento nas funcionalidades existentes durante as etapas de reorganização.

## 6. Plano de migração

### Fase 0 — Tornar explícitos os dois serviços de campanha

Renomear os dois arquivos de campanha para comunicar suas responsabilidades, mover os serviços para `core/campaigns/`, ajustar imports e verificar que o comportamento existente permanece intacto.

### Fase 1 — Isolar Assimilação

Mover os módulos específicos de Assimilação para `systems/assimilacao/`, ajustar imports e verificar ficha, dados, inventário, assimilações, XP e progressão sem mudança de comportamento.

### Fase 2 — Isolar o core

Organizar autenticação, cliente Supabase e serviços genéricos restantes dentro de `core/`.

### Fase 3 — Separar a interface em páginas

Extrair a interface de `main.jsx` para `app/`, `pages/` e `shared/`, começando pelas telas necessárias para criação, listagem e entrada em campanhas.

### Fase 4 — Implementar seleção de sistema

Criar `systems/registry.js`, registrar Assimilação como primeira opção e adicionar a seleção explícita na criação de campanhas. Campanhas novas deverão persistir o sistema escolhido; campanhas antigas continuarão com compatibilidade para Assimilação.
