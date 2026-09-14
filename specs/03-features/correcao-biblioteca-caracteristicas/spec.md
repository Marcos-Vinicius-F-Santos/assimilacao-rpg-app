# Spec da Feature — Correção da Biblioteca de Características

Status: Aprovada  
Projeto: RPG Manager  
Onde vive no código: `src/app/main.jsx`, `src/pages/Campaigns/` e `src/systems/assimilacao/characteristicsCatalog.js`

## 1. Objetivo

Corrigir o fluxo do menu de campanha em que o usuário clica em **Características** e é levado a uma página em branco.

Ao acessar essa opção, o sistema deve abrir a página contendo a biblioteca de características, recuperando o comportamento existente na build antiga.

## 2. Como funciona hoje

No menu de uma campanha existe a opção **Características**. Atualmente, ao clicar nessa opção, o usuário é direcionado para uma página em branco, sem a biblioteca de características.

Na build antiga, esse mesmo fluxo abria uma página contendo a biblioteca de características. Esse é o comportamento que deve ser restaurado.

## 3. Requisitos funcionais

### FR-001

QUANDO o usuário estiver no menu de uma campanha e clicar em **Características**  
O SISTEMA DEVE abrir a página da biblioteca de características da campanha.

### FR-002

QUANDO a página da biblioteca de características for aberta  
O SISTEMA DEVE exibir a biblioteca de características como ela era disponibilizada na build antiga, em vez de exibir uma página em branco.

## 4. Regras de negócio

### BR-001

A opção **Características** no menu da campanha deve levar à biblioteca de características, e não a uma página em branco.

### BR-002

Esta feature deve restaurar o comportamento da biblioteca existente na build antiga; não deve criar novas características nem alterar as regras das características.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que o usuário esteja no menu de uma campanha  
Quando clicar em **Características**  
Então o sistema deve abrir a página contendo a biblioteca de características, com o conteúdo disponibilizado na build antiga, e a página não deve ficar em branco.

### AC-002 — caminho de erro: falha ao carregar a biblioteca

Dado que o usuário clique em **Características**, mas a biblioteca não possa ser carregada  
Quando a página de características for exibida  
Então o sistema deve apresentar um estado ou mensagem de erro identificável, em vez de exibir uma página em branco sem explicação.

## 6. Casos de erro / edge cases

- **Falha no carregamento da biblioteca** → informar o problema de forma identificável; não deixar a página completamente em branco.
- **Navegação ainda direcionando para uma página em branco** → considerar a feature incompleta até que o clique abra a biblioteca ou apresente o estado de erro definido.
- **Biblioteca sem características disponíveis** → comportamento ainda não confirmado; registrar como pergunta aberta antes da implementação caso esse cenário seja possível.
- **Acesso por usuário Mestre ou jogador participante** → a regra existente deve ser preservada; usuário não participante não é uma vertente válida desta feature.

## 7. Fora de escopo desta feature

- Criar, remover ou editar características.
- Alterar o conteúdo, os custos ou as regras da biblioteca de características.
- Alterar a tela de criação ou progressão de personagens.
- Alterar o menu geral da campanha além do destino da opção **Características**.
- Criar uma nova biblioteca ou um segundo catálogo de características.
- Alterar permissões de Mestre e jogadores sem uma decisão específica.

## 8. Suposições e perguntas abertas

- [x] **Comportamento esperado confirmado:** clicar em **Características** no menu da campanha deve abrir uma página com a biblioteca de características.
- [x] **Referência funcional confirmada:** a biblioteca deve se comportar como na build antiga.
- [ ] **Suposição:** “como na build antiga” significa restaurar o conteúdo e a organização funcional da biblioteca antiga, sem exigir um redesign visual ou novas características.
- [ ] **Suposição:** se a biblioteca não puder ser carregada, um estado ou mensagem de erro identificável é preferível a uma página em branco. A mensagem exata e a possibilidade de tentar novamente ainda não foram definidas.
- [x] **Decisão:** a biblioteca deve permanecer disponível para o Mestre e para jogadores participantes da campanha; usuário não participante não é uma vertente válida desta feature.
- [ ] **Pergunta aberta:** o comportamento esperado para uma biblioteca sem características disponíveis precisa ser definido, caso esse cenário exista.
- [ ] **Pergunta aberta:** o acesso direto à rota da biblioteca, sem clicar no menu da campanha, também precisa ser corrigido ou apenas o fluxo iniciado pelo menu?
- [ ] **Causa técnica não confirmada:** esta Spec não presume se o problema está na rota, na renderização da página, no carregamento do catálogo ou em outra integração; a implementação deverá identificar a causa sem alterar o escopo funcional.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] O clique em **Características** abre a biblioteca da campanha.
- [ ] A página não fica em branco no caminho feliz.
- [ ] Existe um estado identificável para falha no carregamento, conforme a suposição registrada.
- [ ] O conteúdo e as regras existentes da biblioteca não foram alterados sem nova Spec ou decisão aprovada.
- [ ] A regra de acesso para Mestre e jogadores foi confirmada ou explicitamente mantida como está.
- [ ] A Spec foi revisada e aprovada antes do início da implementação.
