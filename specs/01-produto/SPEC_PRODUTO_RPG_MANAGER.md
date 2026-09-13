# Spec do Produto — RPG Manager

Status: Aprovada  
Tipo de projeto: Pessoal, não comercial, com possibilidade de uso em portfólio  
Criado em: 12/09/2026  
Última atualização: 12/09/2026

## 1. Objetivo

O RPG Manager é uma plataforma web para gerenciamento de campanhas de RPG que deverá suportar múltiplos sistemas de jogo.

O sistema Assimilação será o primeiro sistema suportado. A plataforma deve permitir que o núcleo comum — autenticação, campanhas, participantes, convites e sessões — seja reutilizado por diferentes sistemas, mantendo as regras específicas de cada sistema isoladas em seus próprios módulos.

O produto foi criado inicialmente para uso do autor e de seus amigos, com os seguintes objetivos:

- substituir fichas de papel por fichas digitais;
- centralizar campanhas, personagens, fichas e sessões;
- facilitar mecânicas complexas por meio de automações;
- facilitar a participação em campanhas online;
- criar uma base que permita adicionar novos sistemas de RPG no futuro.

## 2. Sistema existente (brownfield)

Já estão implementados:

- login e autenticação de usuários;
- listagem das campanhas disponíveis para o usuário como Mestre ou jogador;
- criação de campanhas;
- entrada em campanhas existentes por convite ou código;
- fichas digitais de personagens;
- campanhas multiusuário, com uma ficha própria para cada jogador;
- controle de permissões entre Mestre e participantes;
- criação de personagens sem campanha, com possibilidade de vínculo posterior;
- catálogo padrão de assimilações e itens;
- criação de itens personalizados;
- aprovação de itens criados por participantes que não sejam o Mestre;
- sessões de campanha;
- distribuição de XP pelo Mestre durante uma sessão aberta;
- uso do XP após o fechamento da sessão;
- progressão de aptidões e características;
- sistema próprio de progressão das assimilações.

A limitação atual é que toda campanha é criada automaticamente vinculada ao sistema Assimilação. Não existe ainda uma etapa explícita para escolher o sistema de RPG da campanha, e as regras de Assimilação ainda estão acopladas ao restante da aplicação.

## 3. Visão da nova fase

Ao criar uma campanha, o usuário deverá escolher qual sistema de RPG será utilizado.

Nesta fase, Assimilação será a única opção disponível. A seleção explícita deve existir mesmo com uma única opção, para que o modelo da plataforma já suporte a inclusão de novos sistemas posteriormente.

A reestruturação também deverá separar:

- o núcleo genérico da plataforma;
- as regras específicas do sistema Assimilação.

O núcleo genérico deve conter funcionalidades como autenticação, campanhas, participantes, convites e sessões. O módulo de Assimilação deve conter catálogos, dados, criação de personagens, progressão e demais regras próprias desse sistema.

## 4. Funcionalidades

### Já existentes

Estas funcionalidades devem continuar disponíveis e não serão refeitas como produto:

1. Autenticação de usuários.
2. Listagem de campanhas do usuário.
3. Criação de campanhas.
4. Entrada em campanhas por convite ou código.
5. Fichas de personagens.
6. Controle de acesso entre Mestre e jogadores.
7. Personagens independentes de campanhas.
8. Catálogo e criação de itens personalizados.
9. Sessões de campanha.
10. XP e progressão de personagens.
11. Progressão específica de assimilações.

### Novas funcionalidades desta fase

12. **Seleção de sistema ao criar campanha** — a criação de uma campanha deve exigir a escolha explícita do sistema de RPG, inicialmente com Assimilação como única opção.

13. **Núcleo genérico da plataforma** — separar as funcionalidades comuns de autenticação, campanhas, participantes, convites e sessões das regras específicas de cada sistema.

14. **Módulo próprio para Assimilação** — concentrar em um módulo isolado os catálogos, dados, criação de personagens, progressão, assimilações e demais regras específicas do sistema.

15. **Base para novos sistemas** — estruturar a aplicação para que um novo sistema possa ser adicionado sem alterar o núcleo de autenticação, listagem de campanhas, convites e funcionalidades comuns.

## 5. Fora de escopo

Não fazem parte desta fase:

- implementar um segundo sistema de RPG de fato;
- criar regras ou catálogos para sistemas além de Assimilação;
- migrar automaticamente campanhas já existentes para um novo campo de sistema, caso essa necessidade ainda não seja definida na arquitetura do banco;
- sincronizar completamente o rascunho local armazenado em `localStorage` com o Supabase;
- resolver nesta fase o compartilhamento entre dispositivos de fichas, Homebrew, inventário e permissões que ainda dependam de armazenamento local;
- monetização, cobrança ou assinaturas;
- versões nativas para Android, iOS ou desktop;
- funcionalidades de comunicação em tempo real, como chat, voz ou vídeo.

## 6. Stack técnico e por quê

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend | React + Vite | Praticidade, facilidade de controle e possibilidade de construir uma experiência responsiva para uso em vários dispositivos. |
| Backend, banco e autenticação | Supabase | Alternativa gratuita e conhecida para os serviços de backend, autenticação e persistência. |
| Banco de dados | PostgreSQL via Supabase | Permite ampliar a experiência prática com PostgreSQL. |
| Deploy/Hospedagem | Vercel | Ferramenta de deploy conhecida e já utilizada pelo autor. |

## 7. Arquitetura de pastas

A arquitetura detalhada será registrada na Spec de Arquitetura. A organização alvo é:

```text
src/
  app/
    main.jsx                  # bootstrap, providers e rotas
  pages/
    Login/
    Campaigns/
    CampaignCreate/           # inclui a seleção de sistema
    CampaignJoin/
    CharacterSheet/
  core/                       # genérico, não conhece sistemas de RPG
    auth/
    campaigns/
    sessions/
    lib/
  systems/
    registry.js               # sistemas disponíveis
    assimilacao/              # regras específicas de Assimilação
  shared/                     # componentes genéricos reutilizados
```

Limites principais:

- `core/` não pode importar regras de `systems/`;
- `systems/assimilacao/` pode usar campanhas e sessões genéricas, mas não decide como elas funcionam;
- páginas e componentes não acessam o Supabase diretamente;
- o acesso a dados passa por serviços do `core` ou do módulo do sistema;
- a criação de campanha consulta `systems/registry.js` para listar sistemas disponíveis.

## 8. Critérios de sucesso

A reestruturação será considerada bem-sucedida quando:

- uma campanha nova só puder ser criada após o usuário escolher explicitamente um sistema de RPG;
- Assimilação seja a opção disponível inicialmente;
- as funcionalidades atuais de autenticação, campanhas, convites, fichas, sessões e progressão continuem funcionando;
- as regras específicas de Assimilação estejam isoladas em um módulo próprio;
- catálogos, dados e criação de personagens de Assimilação não fiquem misturados ao código genérico da plataforma;
- o núcleo de autenticação, campanhas, sessões e convites não precise ser alterado para adicionar um novo sistema no futuro;
- a limitação conhecida de sincronização entre `localStorage` e Supabase permaneça documentada e não seja tratada como parte desta fase.

## 9. Quem usa IA e como

- [ ] Eu escrevo todo o código
- [x] IA implementa a partir da minha Spec e arquitetura, e eu reviso e aprovo
