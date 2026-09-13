# Fix Backlog — Reestruturação Arquitetural

Feature de origem: `specs/03-features/reestruturacao-arquitetural/spec.md`  
Última atualização: 13/09/2026  
Objetivo: registrar inconsistências encontradas durante a regressão sem alterar o comportamento nesta etapa.

## FB-001 — XP concedido não aparece para o jogador

- **Origem:** regressão funcional da T-017.
- **Status:** Aberto — bloqueador para aprovação funcional.
- **Severidade:** Alta.
- **Data da detecção:** 13/09/2026.
- **Contexto:** campanha `Teste Regressao T001-T010`, sessão encerrada nº 1, personagem `Personagem Teste`.

### Reprodução

1. Como mestre, abrir a sessão de regressão e registrar 3 XP para o personagem do jogador.
2. Encerrar a sessão.
3. Como mestre, abrir a progressão do personagem.
4. Como jogador proprietário, abrir a mesma progressão.

### Resultado observado

- Mestre: `XP 3`, histórico `+3`, `XP da Sessão 1`.
- Jogador proprietário: `XP 0`, mensagem `Nenhuma transação registrada.`

### Resultado esperado

Após o encerramento da sessão, o jogador proprietário deve visualizar os mesmos 3 XP disponíveis e o respectivo histórico para poder usar a progressão quando não houver sessão aberta.

### Impacto

A progressão do personagem não pode ser exercida pelo jogador, embora o lançamento do mestre esteja visível para o mestre. Isso impede considerar atendida a preservação funcional de XP e progressão prevista no FR-009.

### Critério para encerramento

Dado que o mestre tenha concedido XP e encerrado a sessão  
Quando o jogador proprietário abrir a progressão do personagem  
Então o saldo e o histórico de XP exibidos para o jogador devem corresponder ao lançamento confirmado pelo mestre.

### Observação técnica

Este registro descreve somente o comportamento observado. A causa exata — consulta, policy, serviço ou estado local da tela — ainda não foi determinada e deve ser investigada antes da correção.

### Atualização da execução de TST-004 — 13/09/2026

A repetição desta etapa não conseguiu confirmar nem refutar o resultado: o fluxo local
foi iniciado com o modo de desenvolvimento, mas não chegou ao jogador proprietário; no
DEV remoto, o login do mestre falhou com as credenciais de teste disponíveis. Não houve
escrita remota. O FB-001 permanece aberto e bloqueador até que o fluxo autenticado de
mestre e jogador seja repetido com credenciais válidas.

## FB-002 — Identificação de perfil exibida na ficha precisa de confirmação

- **Origem:** regressão funcional da T-017.
- **Status:** Aberto — requer confirmação antes de corrigir.
- **Severidade:** Média, sujeita à confirmação do comportamento esperado.
- **Data da detecção:** 13/09/2026.

### Resultado observado

Ao abrir `Personagem Teste` com a conta `marcosvfsantos317@gmail.com`, a ficha exibiu o controle `Perfil de Luana Ferreira`, embora a campanha identificasse o proprietário como `Player Teste`.

### Pergunta em aberto

Confirmar se esse controle deve exibir o perfil do usuário autenticado (`Player Teste`), o perfil do personagem, ou se `Luana Ferreira` é um dado intencional de outra parte da ficha.

Nenhuma correção deve ser implementada até essa expectativa ser confirmada.

## FB-003 — Indisponibilidade transitória do backend durante teste anterior

- **Origem:** execução anterior da regressão funcional.
- **Status:** Monitorar — não reproduzido nesta execução.
- **Severidade:** Baixa enquanto não houver nova reprodução.

### Resultado observado

Uma abertura anterior do app exibiu `BACKEND INDISPONÍVEL / Não foi possível conectar ao Supabase`. O botão `TENTAR NOVAMENTE` recuperou o carregamento da sessão. Na execução de 13/09/2026, esse comportamento não se repetiu.

### Próximo passo

Se voltar a ocorrer, registrar horário, ambiente, mensagem completa e se a tentativa seguinte recupera o fluxo, antes de decidir se é falha do app ou instabilidade do ambiente remoto de testes.

## Relação com as tarefas

- T-017: reprovada pela FB-001.
- T-019: separação dos serviços verificada; não corrige FB-001.
- T-020: revisão de escopo concluída sem incluir correções de produto.
- T-021: rollback e condição de entrega documentados; a falha funcional permanece impeditiva para aprovação final.
