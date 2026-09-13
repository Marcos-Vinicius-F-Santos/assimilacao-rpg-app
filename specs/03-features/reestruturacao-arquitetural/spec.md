# Spec da Feature — Reestruturação Arquitetural Inicial

Status: Aprovada  
Projeto: RPG Manager  
Onde vive no código: `src/app/`, `src/pages/`, `src/core/`, `src/systems/` e `src/shared/`, conforme a Spec de Arquitetura

## 1. Objetivo

Reorganizar a estrutura interna do RPG Manager para separar o núcleo genérico da plataforma das regras específicas de Assimilação, sem alterar o comportamento observado pelos usuários.

Esta feature implementa as Fases 0–3 da migração incremental: separar os serviços remoto e local de campanha, isolar Assimilação, organizar o `core` e dividir a interface concentrada em `main.jsx`. A seleção explícita de sistema ao criar campanha ficará para uma feature posterior.

## 2. Como funciona hoje

O comportamento funcional atual deve ser preservado. Tecnicamente, antes da migração:

- a maior parte da interface está concentrada em `src/main.jsx`;
- as regras específicas de Assimilação estão espalhadas diretamente na raiz de `src/`;
- existe um `campaignService.js` remoto em `src/services/`, que conversa com o Supabase;
- existe outro `campaignService.js` na raiz de `src/`, que mantém dados locais em `localStorage`;
- autenticação, cliente Supabase e serviços remotos estão apenas parcialmente organizados;
- não existe sincronização entre o armazenamento local e o Supabase.

As funcionalidades existentes que devem continuar funcionando incluem autenticação, listagem, criação e entrada em campanhas, fichas, sessões, XP, progressão e regras de Assimilação.

## 3. Requisitos funcionais

### FR-001

QUANDO a reorganização da estrutura for iniciada  
O SISTEMA DEVE adotar as áreas `app/`, `pages/`, `core/`, `systems/` e `shared/` dentro de `src/`, conforme a arquitetura aprovada.

### FR-002

QUANDO os módulos específicos de Assimilação forem reorganizados  
O SISTEMA DEVE mantê-los dentro de `systems/assimilacao/`, sem adicionar suas regras ao `core/`.

### FR-003

QUANDO os serviços de campanha forem reorganizados  
O SISTEMA DEVE manter separados o serviço remoto e o serviço de rascunho local, usando os nomes e destinos aprovados:

```text
src/services/campaignService.js
→ core/campaigns/campaignRemoteService.js

src/campaignService.js
→ core/campaigns/campaignLocalDraftService.js
```

### FR-004

QUANDO arquivos ou módulos forem movidos  
O SISTEMA DEVE atualizar os imports necessários para que as funcionalidades existentes continuem acessíveis sem alteração de comportamento.

### FR-005

QUANDO a interface for dividida  
O SISTEMA DEVE deixar `app/main.jsx` responsável pelo bootstrap, providers e rotas, enquanto as telas forem organizadas em `pages/` e os componentes reutilizados em `shared/`.

### FR-006

QUANDO o `core/` for organizado  
O SISTEMA DEVE concentrar nele os serviços genéricos de autenticação, campanhas, sessões e acesso ao Supabase, sem dependência de regras de um sistema específico.

### FR-007

QUANDO uma página ou componente precisar acessar dados persistidos  
O SISTEMA DEVE fazê-lo por meio de serviços do `core/` ou do módulo do sistema, sem acesso direto ao cliente Supabase.

### FR-008

QUANDO a migração for executada  
O SISTEMA DEVE seguir esta ordem: separar os serviços de campanha, isolar Assimilação, organizar o `core` e separar a interface em páginas.

### FR-009

QUANDO as Fases 0–3 forem concluídas  
O SISTEMA DEVE continuar permitindo o uso das funcionalidades existentes de autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação.

## 4. Regras de negócio

### BR-001

O `core/` não pode importar regras de `systems/assimilacao/` nem de qualquer outro sistema de RPG.

### BR-002

O módulo `systems/assimilacao/` pode usar contratos e serviços genéricos de campanha e sessão, mas não deve decidir como campanhas ou sessões genéricas funcionam.

### BR-003

Os serviços remoto e local de campanha são responsabilidades distintas e não devem ser fundidos nesta feature.

### BR-004

Esta feature não deve criar sincronização entre `localStorage` e Supabase.

### BR-005

As Fases 0–3 devem preservar o comportamento funcional existente; mudanças de produto não fazem parte desta feature.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que o projeto esteja na estrutura anterior à migração  
Quando as Fases 0–3 forem concluídas na ordem definida  
Então os módulos estarão organizados em `app/`, `pages/`, `core/`, `systems/assimilacao/` e `shared/`, os dois serviços de campanha estarão separados pelos novos nomes e a interface estará dividida sem mudança funcional planejada.

### AC-002 — preservação do comportamento

Dado que as funcionalidades existentes estejam disponíveis antes da migração  
Quando o projeto reorganizado for executado e seus fluxos existentes forem verificados  
Então autenticação, campanhas, fichas, sessões, XP, progressão e Assimilação continuarão funcionando como antes.

### AC-003 — caminho de erro: importação indevida

Dado que um arquivo em `core/` importe regras de `systems/assimilacao/` ou que uma página acesse diretamente o cliente Supabase  
Quando a estrutura for revisada  
Então a implementação não será considerada aceita até que a dependência seja movida para o limite arquitetural correto.

### AC-004 — caminho de erro: referência antiga

Dado que um import ainda aponte para um dos caminhos antigos de `campaignService.js` após a renomeação  
Quando o projeto for executado ou verificado  
Então a migração deverá ser considerada incompleta e o import deverá ser atualizado antes da conclusão da feature.

## 6. Casos de erro / edge cases

- **Migração parcial de imports** → a feature não pode ser concluída enquanto existirem referências antigas que impeçam o projeto de funcionar.
- **Uso incorreto de um serviço de campanha** → o fluxo remoto deve continuar usando o serviço remoto, e o fluxo local deve continuar usando o serviço de rascunho local.
- **Dados locais não sincronizados** → manter o comportamento atual; não tentar combinar ou migrar automaticamente dados locais e remotos.
- **Regra de Assimilação adicionada ao `core/` durante a migração** → rejeitar a alteração e movê-la para `systems/assimilacao/`.
- **Mudança funcional identificada durante a reorganização** → registrar como nova necessidade e não incluí-la silenciosamente nesta feature.

## 7. Fora de escopo desta feature

- seleção explícita de sistema ao criar campanha;
- criação do `systems/registry.js` como funcionalidade de seleção;
- persistência do sistema escolhido em campanhas novas;
- implementação de um segundo sistema de RPG;
- migração de campanhas antigas para um identificador de sistema;
- sincronização entre `localStorage` e Supabase;
- mudanças de comportamento ou novas regras de produto;
- criação de funcionalidades de chat, voz, vídeo, monetização ou versões nativas.

## 8. Suposições e perguntas abertas

- [x] **Escopo aprovado:** esta feature cobre somente as Fases 0–3. A Fase 4, de seleção de sistema, será especificada separadamente.
- [x] **Preservação de comportamento:** as funcionalidades existentes devem continuar funcionando sem mudança de comportamento observável.
- [x] **Serviços de campanha:** os dois serviços atuais estão em uso e possuem responsabilidades diferentes; nenhum será apagado nesta feature.
- [x] **Sincronização:** a ausência de sincronização entre `localStorage` e Supabase permanece uma limitação intencional e fora de escopo.
- [ ] **Pergunta aberta:** os cenários e comandos exatos de verificação serão detalhados no plano de testes da etapa de verificação.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos
- [ ] Casos de erro de prioridade alta tratados
- [ ] Funcionalidades existentes continuam funcionando e a regressão foi checada
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`
- [ ] Spec revisada e aprovada antes do início da implementação
- [ ] Nenhuma mudança de comportamento foi incluída sem nova Spec ou decisão aprovada
