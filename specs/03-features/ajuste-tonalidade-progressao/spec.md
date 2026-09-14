# Spec da Feature — Ajuste de tonalidade na aba de progressão

Status: Aprovada  
Projeto: RPG Manager  
Onde vive no código: interface da aba de progressão do módulo `systems/assimilacao/`, conforme a estrutura de páginas/componentes definida na arquitetura

## 1. Objetivo

Ajustar a tonalidade das cores dos blocos de características e de histórico de XP na aba de progressão para que seja igual à tonalidade usada nos três blocos de aptidões. A mudança tem como objetivo melhorar a visualização e a legibilidade da aba.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

Na aba de progressão, os três blocos superiores — Instintos, Conhecimentos e Práticas — apresentam as aptidões e funcionam como referência visual de tonalidade.

O bloco inferior, que apresenta as características, usa uma tonalidade diferente, mais escura e menos legível em comparação com os blocos de aptidões. No estilo atual, o bloco de aptidões usa `#f8efdb` como fundo, enquanto o bloco de características usa `#ead9bd80`. Essa diferença prejudica a visualização da seção de características.

O bloco de histórico de XP também deve seguir a mesma referência visual das aptidões. No estilo atual, ele compartilha a tonalidade diferenciada usada pelas características, em vez do fundo de referência `#f8efdb`.

## 3. Requisitos funcionais

### FR-001

QUANDO o usuário visualizar a aba de progressão  
O SISTEMA DEVE aplicar ao bloco de características a mesma tonalidade de cores usada nos três blocos de aptidões — Instintos, Conhecimentos e Práticas — que são a referência visual da tela, incluindo fundo, textos, bordas, botões, estados e demais elementos internos.

### FR-002

QUANDO o ajuste visual for aplicado  
O SISTEMA DEVE usar nos elementos correspondentes das características os mesmos valores de estilo já definidos para as aptidões, preservando o conteúdo, os estados funcionais e as ações existentes.

### FR-003

QUANDO o usuário visualizar o histórico de XP na aba de progressão  
O SISTEMA DEVE aplicar ao bloco de histórico de XP os mesmos valores de estilo usados nos três blocos de aptidões, incluindo fundo, textos, bordas, separadores, estados e demais elementos internos.

## 4. Regras de negócio

### BR-001

Os três blocos de aptidões exibidos na parte superior da aba de progressão são a referência para a tonalidade das características.

### BR-002

A tonalidade do bloco de características deve ser igual à tonalidade de referência das aptidões, sem criar uma paleta visual própria para essa seção.

### BR-003

Os valores de estilo atualmente definidos para os blocos de aptidões são a fonte dos valores a serem reutilizados nas características:

| Elemento visual | Valor de referência nas aptidões |
|---|---|
| Fundo do bloco | `#f8efdb` |
| Bordas e separadores | `#c7ab84` |
| Títulos | `#713b35` |
| Textos principais | `#4c392c` |
| Textos auxiliares | `#866e59` |
| Botões: borda | `#9b725e` |
| Botões: fundo | `transparent` |
| Botões: texto | `#713b35` |
| Estado desabilitado | opacidade `.45` |

### BR-004

O bloco de histórico de XP deve usar a mesma referência de tonalidade e os mesmos valores de estilo definidos na BR-003 para os blocos de aptidões.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que o usuário está na aba de progressão e os blocos de aptidões e características estão visíveis  
Quando a tela é renderizada com o novo estilo  
Então o bloco de características apresenta a mesma tonalidade visual dos três blocos de aptidões e sua visualização fica mais legível.

### AC-002 — caminho de erro

Dado que qualquer elemento visual do bloco de características ou do histórico de XP continua com valor diferente do correspondente usado nos blocos de aptidões  
Quando a implementação for comparada com os valores de estilo de referência da tela  
Então o critério de aceite deve ser considerado não atendido e a feature não deve ser marcada como concluída.

### AC-003 — histórico de XP

Dado que o usuário está na aba de progressão e o bloco de histórico de XP está visível  
Quando a tela é renderizada com o novo estilo  
Então o bloco de histórico de XP e seus elementos internos apresentam os mesmos valores de estilo dos três blocos de aptidões, mantendo seu conteúdo e sua legibilidade.

## 6. Casos de erro / edge cases

- Diferença de tonalidade em qualquer elemento interno — fundo, texto, borda, botão, separador ou estado — entre características/histórico de XP e os três blocos de aptidões → considerar a validação visual como não atendida.
- A aba de progressão não estar disponível para inspeção visual → não é possível validar esta feature até que a tela esteja acessível.
- Não foi definido um comportamento adicional para falhas de carregamento, ausência de dados ou indisponibilidade de estilos; esses casos permanecem fora do escopo desta feature.

## 7. Fora de escopo desta feature

- Alterar regras de progressão, custos em XP, níveis ou requisitos.
- Alterar o conteúdo, a ordem ou a quantidade de aptidões e características.
- Alterar estados ou ações dos blocos, como aumentar, bloquear, possuir ou solicitar ao Mestre.
- Alterar o conteúdo, a ordem ou o comportamento do histórico de XP.
- Criar uma nova paleta de cores ou redesenhar a aba de progressão.
- Alterar outras abas ou funcionalidades da ficha.
- Alterar dados persistidos, banco de dados ou contratos de serviços.

## 8. Suposições e perguntas abertas

- [x] Confirmado: “aptidores” foi interpretado como “aptidões”, e os três blocos superiores da imagem fornecida são a referência visual oficial para esta feature.
- [x] Confirmado: a igualdade de tonalidade abrange também textos, bordas, botões, estados e demais elementos internos dos blocos.
- [x] Confirmado: devem ser reutilizados os valores exatos já definidos para os blocos de aptidões, registrados na regra BR-003.

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito
- [ ] Casos de erro de prioridade alta tratados
- [ ] Features existentes continuam funcionando (regressão checada)
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`
- [ ] Eu revisei e aprovei antes do deploy

## 10. Decisão tardia

### DT-001 — Padronizar também o histórico de XP

Decisão registrada após a aprovação inicial da Spec: o mesmo ajuste de tonalidade aplicado às características também será aplicado ao bloco de histórico de XP.

Escopo da decisão:

- o histórico de XP passa a fazer parte do FR-003 e do critério AC-003;
- a padronização abrange fundo, textos, bordas, separadores, estados e demais elementos internos;
- os valores exatos devem ser reutilizados da referência das aptidões, conforme BR-003;
- o conteúdo, a ordem e o comportamento do histórico de XP permanecem inalterados;
- o plano e as tarefas desta feature devem ser atualizados para incluir FR-003 antes da continuação da implementação;
- nenhuma alteração de banco, persistência, serviço ou arquitetura é necessária.
