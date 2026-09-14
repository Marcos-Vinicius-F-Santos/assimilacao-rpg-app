# Spec da Feature — Correção do acesso à criação de personagem

Status: Rascunho  
Projeto: RPG Manager  
Onde vive no código: `src/app/main.jsx` e `src/pages/CharacterSheet/`, conforme a arquitetura definida em `specs/02-arquitetura/`

## 1. Objetivo

Corrigir o fluxo do menu de personagens em que o usuário clica em **Novo personagem** e chega a uma tela vazia.

Ao selecionar essa opção, o sistema deve apontar para a tela de criação de personagem que já existia e renderizá-la corretamente, preservando o fluxo existente de criação.

## 2. Como funciona hoje

Na tela de **Personagens**, dentro da biblioteca pessoal, existe o botão **Novo personagem**.

Atualmente, ao clicar nesse botão, o navegador é direcionado para a URL `/characters/new`, mas a tela permanece vazia, sem exibir a tela de criação de personagem.

O comportamento esperado é que esse mesmo acionamento leve à tela de criação de personagem que já existia antes do problema.

## 3. Requisitos funcionais

### FR-001

QUANDO o usuário estiver na tela de **Personagens** e clicar em **Novo personagem**  
O SISTEMA DEVE direcioná-lo para a tela de criação de personagem já existente.

### FR-002

QUANDO a tela de criação de personagem for aberta pelo botão **Novo personagem**  
O SISTEMA DEVE renderizar a interface existente de criação, em vez de exibir uma tela vazia.

### FR-003

QUANDO o usuário acessar diretamente a URL `/characters/new`  
O SISTEMA DEVE resolver essa rota e renderizar a tela de criação de personagem já existente.

### FR-004

QUANDO o destino da criação de personagem não puder ser resolvido ou renderizado  
O SISTEMA DEVE exibir a mensagem padrão “Não foi possível carregar a tela. Consulte o administrador.”, em vez de deixar a tela vazia sem explicação.

## 4. Regras de negócio

### BR-001

O botão **Novo personagem** deve abrir o fluxo de criação de personagem já existente; esta feature não deve criar um fluxo paralelo.

### BR-002

A correção deve preservar as regras, campos e comportamento da tela de criação de personagem existente, alterando apenas o necessário para que ela seja alcançada e renderizada corretamente.

### BR-003

Esta feature não deve criar ou alterar regras de personagens, características, assimilações, itens ou progressão.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que o usuário esteja na tela de **Personagens** da biblioteca pessoal  
Quando clicar em **Novo personagem**  
Então o sistema deve abrir a tela de criação de personagem que já existia, com sua interface visível e utilizável, sem tela vazia.

### AC-002 — caminho de erro: destino não resolvido

Dado que o usuário clique em **Novo personagem**, mas o destino da tela de criação não possa ser resolvido ou renderizado  
Quando o sistema tentar abrir a tela de criação  
Então o sistema deve apresentar a mensagem “Não foi possível carregar a tela. Consulte o administrador.”, sem deixar a página completamente vazia.

### AC-003 — acesso direto à rota

Dado que o usuário acesse diretamente a URL `/characters/new`  
Quando a aplicação resolver a rota  
Então o sistema deve abrir a mesma tela de criação de personagem existente e aplicar o mesmo tratamento de erro caso ela não possa ser carregada.

## 6. Casos de erro / edge cases

- **Destino apontando para uma rota ou componente incorreto** → corrigir a resolução para a tela de criação de personagem existente.
- **Falha durante a renderização da tela de criação** → apresentar a mensagem “Não foi possível carregar a tela. Consulte o administrador.”, em vez de uma tela vazia.
- **A tela de criação existente depender de dados ou catálogos indisponíveis** → preservar o comportamento existente e identificar a falha; não criar dados substitutos nesta feature.
- **Acesso direto à URL `/characters/new`** → deve abrir a mesma tela de criação de personagem existente, com o mesmo tratamento de erro do fluxo iniciado pelo botão.

## 7. Fora de escopo desta feature

- Criar uma nova tela de criação de personagem.
- Redesenhar a interface ou alterar a experiência da tela de criação existente.
- Alterar campos, validações, regras, custos ou conteúdo da criação de personagem.
- Alterar a criação de personagens a partir de uma campanha, caso seja um fluxo separado.
- Alterar a biblioteca pessoal de personagens além do destino do botão **Novo personagem**.
- Alterar persistência, banco de dados, migrations ou sincronização entre `localStorage` e Supabase.
- Alterar características, assimilações, itens, inventário, XP ou progressão.

## 8. Suposições e perguntas abertas

- [x] **Comportamento atual confirmado:** o botão **Novo personagem** na tela de Personagens direciona para `/characters/new`, mas a tela fica vazia.
- [x] **Comportamento esperado confirmado:** o botão deve abrir a tela de criação de personagem que já existia.
- [x] **Rota confirmada:** `/characters/new` é a rota correta e deve permanecer.
- [x] **Escopo confirmado:** a correção deve atender tanto o fluxo iniciado pelo botão **Novo personagem** quanto o acesso direto à URL `/characters/new`.
- [x] **Mensagem de erro confirmada:** quando a tela não puder ser carregada, exibir “Não foi possível carregar a tela. Consulte o administrador.”.
- [ ] **Suposição:** “tela que já existia” significa restaurar a interface e o comportamento funcionais anteriores, sem redesign ou mudança nas regras de criação.
- [ ] **Suposição:** a correção não exige alteração de persistência ou de banco, pois o objetivo descrito é revalidar o apontamento e restaurar a renderização da tela existente.
- [ ] **Causa técnica não confirmada:** esta Spec não presume se o problema está na rota, no resolvedor, no export/import ou na renderização; a implementação deverá investigar a causa sem ampliar o escopo funcional.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] O clique em **Novo personagem** abre a tela de criação de personagem existente.
- [ ] O acesso direto à URL `/characters/new` abre a tela de criação de personagem existente.
- [ ] A tela de criação não fica vazia no caminho feliz.
- [ ] A mensagem padrão de erro é exibida quando a tela não puder ser carregada.
- [ ] As regras, campos e o comportamento existentes da criação de personagem foram preservados.
- [ ] As funcionalidades existentes continuam funcionando, com regressão mínima verificada.
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.
