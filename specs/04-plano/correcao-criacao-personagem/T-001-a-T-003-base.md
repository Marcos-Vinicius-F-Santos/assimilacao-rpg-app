# T-001 a T-003 — Baseline, rastreamento e contrato da criação de personagem

Feature: `correcao-criacao-personagem`  
Data: 13/09/2026  
Status: Aprovadas; tarefas concluídas

## T-001 — Baseline e reprodução

### Evidência fornecida

As imagens fornecidas pelo responsável confirmam o caminho funcional observado no deploy:

- origem: tela **Personagens** da biblioteca pessoal;
- ação: clicar em **Novo personagem**;
- URL resultante: `/characters/new`;
- resultado: tela vazia, sem a interface de criação de personagem.

Essa evidência atende ao registro do problema descrito na Spec e confirma os FR-001, FR-002 e FR-003 como comportamento a ser corrigido.

### Verificação local

Foi iniciado um servidor Vite local em `http://127.0.0.1:5176/` porque as portas 5173, 5174 e 5175 já estavam ocupadas.

O acesso direto a `http://127.0.0.1:5176/characters/new` foi executado. O ambiente local apresentou a tela de autenticação, sem sessão autenticada disponível para a reprodução da biblioteca pessoal. Portanto, não foi possível repetir o clique dentro da aplicação local nem capturar o erro de runtime da tela autenticada nesta tarefa.

### Build baseline

`pnpm build` foi executado com sucesso:

- 1933 módulos transformados;
- build concluído sem erro;
- aviso não bloqueante sobre chunks maiores que 500 kB após minificação.

Nenhum arquivo de código foi alterado.

## T-002 — Cadeia de rota, export e renderização

O rastreamento estático encontrou a seguinte cadeia:

1. `src/pages/CharacterSheet/pages.jsx:181` renderiza o botão **Novo personagem** e chama a propriedade `onCreate`.
2. `src/app/main.jsx:101` fornece `onCreate={() => navigate("/characters/new")}` para `PersonalCharactersPage`.
3. `src/app/main.jsx:42` reconhece `/characters/new` como `{ type: "personal-create" }`.
4. `src/app/main.jsx:102` resolve `personal-create` para `CharacterCreationPage` com `mode="personal"`.
5. `src/app/main.jsx:34` importa `CharacterCreationPage` de `../pages/CampaignCreate`.
6. `src/pages/CampaignCreate/index.jsx:1` exporta `CharacterCreationPage` de `./pages`.
7. `src/pages/CampaignCreate/pages.jsx:257` define `CharacterCreationPage`.

### Resultado do rastreamento

- O callback do botão aponta para a rota aprovada `/characters/new`.
- O parser possui uma regra específica para essa rota.
- A composição do tipo `personal-create` instancia a tela existente no modo pessoal.
- O export/import da tela está presente no código atual.
- Não foi identificada, por inspeção estática, uma ausência de rota ou de export que explique sozinha a tela vazia.

### Causa técnica

A causa de runtime permanece não confirmada porque a reprodução autenticada não pôde ser executada no ambiente local. O próximo diagnóstico deverá capturar o erro de console/runtime no ambiente autenticado e comparar o bundle/deploy executado com estes arquivos.

Nenhum código foi alterado.

## T-003 — Contrato observável da tela existente

A tela que deve ser restaurada é `CharacterCreationPage`, reutilizada atualmente nos modos pessoal e de campanha. O contrato funcional existente, observado no código, é:

- contêiner visual da tela: `creation-page`;
- título: **Criação de personagem**;
- no modo pessoal, identificação: **BIBLIOTECA PESSOAL**;
- descrição no modo pessoal: **Monte uma base pessoal reutilizável em campanhas.**;
- progresso inicial: **1 / 9**;
- primeira etapa: **Nome**;
- primeiro campo obrigatório: **Nome do Infectado**;
- campo opcional inicial: **Conceito (opcional)**;
- ações iniciais: **Cancelar**, **Voltar** e **Continuar**;
- etapas definidas em `src/systems/assimilacao/characterCreation.js`:
  1. Nome;
  2. Origens;
  3. Geração;
  4. Propósitos;
  5. Aptidões;
  6. Cabo de Guerra;
  7. Saúde;
  8. Características;
  9. Equipamentos iniciais.

O contrato não inclui redesign, criação de uma segunda tela ou alteração das regras, campos, validações, catálogos ou persistência existentes.

## Convergência das tarefas

| Tarefa | Resultado | Código alterado? | Aprovação do responsável |
|---|---|---:|---|
| T-001 | Baseline registrado; reprodução autenticada local bloqueada por ausência de sessão; imagens do responsável confirmam a tela vazia no deploy; build aprovado | Não | Aprovada |
| T-002 | Cadeia de botão → rota → parser → composição → export → componente registrada; causa de runtime ainda não confirmada | Não | Aprovada |
| T-003 | Contrato observável da `CharacterCreationPage` existente registrado | Não | Aprovada |

## Pendências antes da fase de lógica

- Obter uma sessão autenticada no ambiente local ou outra execução autorizada para capturar o erro de runtime que produz a tela vazia.
- Comparar o bundle/deploy que apresentou a tela vazia com o código atual, caso sejam versões diferentes.
- Não iniciar T-004 ou tarefas posteriores antes da aprovação desta base e da definição da causa técnica.
