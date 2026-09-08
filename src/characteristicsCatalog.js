const aptitude = (name, min) => ({ type: "aptitude", aptitude: name, min });
const and = (...options) => ({ type: "AND", options });
const or = (...options) => ({ type: "OR", options });

export const characteristicCatalog = [
  {
    id: "agricultor",
    name: "Agricultor",
    cost: 1,
    requirements: aptitude("Geografia", 1),
    description: "Em todas as Jogadas do(a) Infectado(a) oriundas de questões agrárias ou biológicas acerca da vida vegetal comumente cultivadas pelo ser humano, como identificação de grãos, frutos, vegetais, mudas ou pragas agrícolas, o(a) Infectado(a) ganha um símbolo de sucesso adicional.",
  },
  {
    id: "cavaleiro",
    name: "Cavaleiro",
    cost: 1,
    requirements: null,
    description: "Todos os testes para conduzir animais de montaria podem transformar uma adaptação em um sucesso em seu resultado.",
  },
  {
    id: "estagio-avancado",
    name: "Estágio Avançado",
    cost: 1,
    requirements: null,
    initialCreationOnly: true,
    requiresMasterApproval: true,
    description: "Esta Característica só pode ser selecionada na criação da Ficha inicial do(a) Infectado(a). Aumenta em 1 o Nível de Assimilação inicial, reduzindo consequentemente em 1 o de Determinação. O(a) Assimilador(a) deve aprovar o uso desta Característica e, se o fizer, conduzir a rolagem de dados e a escolha de Assimilações adicionais.",
  },
  {
    id: "investigador-da-assimilacao",
    name: "Investigador da Assimilação",
    cost: 1,
    requirements: aptitude("Biologia", 1),
    description: "Em todo teste relacionado ao entendimento sobre o funcionamento da Assimilação, o(a) Infectado(a) pode transformar uma adaptação em um sucesso.",
  },
  {
    id: "pegada-forte",
    name: "Pegada Forte",
    cost: 1,
    requirements: aptitude("Potência", 2),
    description: "Todos os testes do(a) Infectado(a) envolvendo firmeza para se segurar em algo ou não deixar que uma pessoa ou objeto escape de suas mãos permitem transformar uma adaptação em um sucesso em seu resultado.",
  },
  {
    id: "piloto",
    name: "Piloto",
    cost: 1,
    requirements: null,
    description: "Todos os testes para condução de veículos permitem transformar uma adaptação em um sucesso em seu resultado.",
  },
  {
    id: "punhos-de-ferro",
    name: "Punhos de Ferro",
    cost: 1,
    requirements: and(aptitude("Potência", 2), aptitude("Resolução", 2)),
    description: "Quando usar um Ponto de Determinação para manter um dado adicional realizando ações relacionadas a combate desarmado, o(a) Infectado(a) adicionalmente pode transformar uma adaptação em um sucesso.",
  },
  {
    id: "saque-rapido",
    name: "Saque Rápido",
    cost: 1,
    requirements: aptitude("Reação", 2),
    description: "O(a) Infectado(a) não gasta adaptação para sacar ou guardar um Equipamento, mesmo quando em Conflito.",
  },
  {
    id: "sono-leve",
    name: "Sono Leve",
    cost: 1,
    requirements: null,
    description: "Esta Característica permite ao(à) Infectado(a) fazer um teste de Percepção para não ser surpreendido(a) quando está dormindo.",
  },
  {
    id: "trato-com-animais",
    name: "Trato com Animais",
    cost: 1,
    requirements: aptitude("Influência", 2),
    description: "Sempre que o(a) Infectado(a) fizer alguma jogada para influenciar amistosamente o comportamento de um ou mais animais pode transformar uma adaptação em um sucesso em seu resultado.",
  },
  {
    id: "viajado",
    name: "Viajado",
    cost: 1,
    requirements: null,
    description: "Todas as jogadas do(a) Infectado(a) que envolvem o contato com outras culturas e outros povos permitem anular uma falha no resultado.",
  },
  {
    id: "antecedente-marcante",
    name: "Antecedente Marcante",
    cost: 2,
    requirements: null,
    description: "Quando o(a) Infectado(a) ativar o seu Evento Marcante adicione um dado à rolagem, sem alterar a quantidade de dados mantidos.",
  },
  {
    id: "aparencia-inofensiva",
    name: "Aparência Inofensiva",
    cost: 2,
    requirements: aptitude("Influência", 2),
    description: "Em seu teste em Conflito, o(a) Infectado(a) pode gastar uma adaptação ou um sucesso para aumentar o custo das ativações de Ameaças do(a) Assimilador(a) que o(a) tenham como alvo durante o próximo turno. Cada adaptação e sucesso usados aumentam em uma adaptação e uma falha os custos das Ativações respectivamente.",
  },
  {
    id: "artes-marciais",
    name: "Artes Marciais",
    cost: 2,
    requirements: and(aptitude("Atletismo", 2), aptitude("Reação", 2)),
    description: "Todo teste do(a) Infectado(a) que envolva diretamente práticas de artes marciais, seja aplicando golpes ou se defendendo deles, permite remover uma falha no resultado das jogadas do(a) Infectado(a).",
  },
  {
    id: "atencao-redobrada",
    name: "Atenção Redobrada",
    cost: 2,
    requirements: aptitude("Percepção", 2),
    description: "Sempre que um(a) Infectado(a) precisa reagir a um perigo súbito, como uma pedra caindo sobre si, uma armadilha, um ataque surpresa ou outro tipo de emboscada, pode transformar um número de adaptações em sucessos equivalente até o seu valor em Reação.",
  },
  {
    id: "atirador-astuto",
    name: "Atirador Astuto",
    cost: 2,
    requirements: aptitude("Furtividade", 2),
    description: "Em ações que testem sua pontaria para fazer um ataque, desde que esteja protegido(a) por uma cobertura onde consiga se esconder, o(a) Infectado(a) pode transformar uma adaptação em um sucesso.",
  },
  {
    id: "batedor",
    name: "Batedor",
    cost: 2,
    requirements: aptitude("Geografia", 2),
    description: "O(a) Infectado(a) é capaz de explorar a Região na metade do tempo e consegue encontrar um marco geográfico arbitrado pelo(a) Assimilador(a) caso tenha êxito em teste de Geografia ou Sobrevivência.",
  },
  {
    id: "disciplinado",
    name: "Disciplinado",
    cost: 2,
    requirements: null,
    description: "Desde que não seja atacado(a) ou perturbado(a) por um elemento externo em uma ação fora de Conflito, pode ignorar uma falha no resultado do teste contanto que a faça com calma e leve o dobro do tempo para realizá-lo.",
  },
  {
    id: "dissimulado",
    name: "Dissimulado",
    cost: 2,
    requirements: and(aptitude("Influência", 2), or(aptitude("Expressão", 1), aptitude("Furtividade", 1))),
    description: "O(a) Infectado(a) tem facilidade para se passar por um(a) residente de um outro Refúgio, desde que tenha acesso ao vestuário local, se obtiver êxito em um teste de Influência e Expressão ou Influência e Furtividade, a depender da situação. Quanto menor o Refúgio infiltrado, mais sucessos serão necessários no teste.",
  },
  {
    id: "escaldado",
    name: "Escaldado",
    cost: 2,
    requirements: aptitude("Sagacidade", 2),
    description: "Quando o(a) Infectado(a) realiza testes de Percepção para perceber segundas intenções, pode transformar uma adaptação em um sucesso por teste. Vale lembrar que quem pede esse tipo de teste é o(a) Assimilador(a) e não o(a) jogador(a).",
  },
  {
    id: "frugal",
    name: "Frugal",
    cost: 2,
    requirements: null,
    description: "A não ser que possua uma Assimilação que diga o contrário, o(a) Infectado(a) necessita de menos água e alimento que o normal, podendo ficar o dobro do tempo sem os mesmos até sofrer alguma penalidade pela falta. Caso adquira alguma Assimilação que exija o dobro de consumo de recursos, o(a) Infectado(a) passa a necessitar do regular, equilibre esta Característica com outras desvantagens.",
  },
  {
    id: "intimidador",
    name: "Intimidador",
    cost: 2,
    requirements: null,
    description: "Em todos os testes para intimidar alguém, o(a) Infectado(a) pode gastar um Ponto de Determinação para substituir a quantidade de dados de Expressão pelo valor de um Instinto que deve ser aprovado pelo(a) Assimilador(a) para a ação. Esta característica não muda o tipo de dado rolado, somente a quantidade.",
  },
  {
    id: "maos-leves",
    name: "Mãos-Leves",
    cost: 2,
    requirements: and(aptitude("Reação", 2), aptitude("Furtividade", 2)),
    description: "Sempre que o(a) Infectado(a) fizer alguma jogada para roubar ou ocultar objetos à vista das pessoas, pode adicionar uma adaptação ao resultado.",
  },
  {
    id: "memoria-afiada",
    name: "Memória Afiada",
    cost: 2,
    requirements: aptitude("Sagacidade", 2),
    description: "Todos os testes do(a) Infectado(a) que tenham relação com a lembrança de alguma informação garantem a ele um sucesso em seus resultados.",
  },
  {
    id: "presenca-encantadora",
    name: "Presença Encantadora",
    cost: 2,
    requirements: aptitude("Influência", 3),
    description: "O(a) Infectado(a) pode gastar um Ponto de Determinação antes de rolar os dados para anular todas as falhas do resultado do teste em interações sociais.",
  },
  {
    id: "reliquia",
    name: "Relíquia",
    cost: 2,
    requirements: null,
    description: "O Artefato inicial do(a) Infectado(a) é um item valioso que ele sempre carrega consigo. Ele não é limitado pelo nível de Escassez arbitrado pelo(a) Assimilador(a) na construção do(a) Infectado(a) e pode ser consertado mesmo quando chega ao nível de qualidade Quebrado, porém guarda vínculo emocional com o(a) Infectado(a) e sua perda causaria perda de um Ponto de Determinação.",
  },
  {
    id: "sacrificio-heroico",
    name: "Sacrifício Heroico",
    cost: 2,
    requirements: null,
    description: "Ao(à) Infectado(a) é permitido sofrer todo o dano no lugar de um aliado próximo, uma vez por sessão de jogo.",
  },
  {
    id: "sentido-agucado",
    name: "[Sentido] Aguçado",
    cost: 2,
    requirements: aptitude("Percepção", 2),
    requiresChoice: { key: "sense", options: ["Visão", "Audição", "Tato", "Paladar", "Olfato"] },
    description: "O(a) jogador(a) deve escolher um dos sentidos — visão, audição, tato, paladar ou olfato — e todo teste de Percepção para identificar algo com o sentido escolhido permite adicionar um sucesso ao resultado.",
  },
  {
    id: "companheiro-animal",
    name: "Companheiro Animal",
    cost: 3,
    requirements: aptitude("Sobrevivência", 1),
    description: "O(a) Infectado(a) é acompanhado por um animal de pequeno ou médio porte, como um cão, rato ou pássaro, que pode o(a) auxiliá-lo quando possível. Quando seu animal o ajuda a realizar uma ação, ele adiciona uma adaptação ao resultado do teste.",
  },
  {
    id: "construtor",
    name: "Construtor",
    cost: 3,
    requirements: aptitude("Engenharia", 3),
    description: "O(a) Infectado(a) tem conhecimento para realizar Construções de forma mais eficiente, sem necessidade de testes de Engenharia semanais para obter pontos de obra.",
  },
  {
    id: "contra-ataque",
    name: "Contra-Ataque",
    cost: 3,
    requirements: aptitude("Reação", 2),
    description: "Após sofrer um ataque em Conflito, o próximo teste do(a) Infectado(a) para Neutralizar aquela Ameaça adiciona um sucesso ao resultado.",
  },
  {
    id: "corpo-grande",
    name: "Corpo Grande",
    cost: 3,
    requirements: aptitude("Atletismo", 2),
    description: "Todos os testes de Resolução do(a) Infectado(a) que estejam relacionados com resistência física podem ser realizados com Potência. Não afeta os testes mentais ou emocionais de Resolução.",
  },
  {
    id: "determinacao-inabalavel",
    name: "Determinação Inabalável",
    cost: 3,
    requirements: aptitude("Resolução", 3),
    description: "Todos os testes relacionados ao Propósito do(a) Infectado(a) permitem transformar uma adaptação em um sucesso no resultado.",
  },
  {
    id: "esquiva-precisa",
    name: "Esquiva Precisa",
    cost: 3,
    requirements: aptitude("Reação", 2),
    description: "O(a) Infectado(a) pode investir um ou mais sucessos do resultado de sua Ação para que ataques contra si sofram a mesma quantidade de penalidades até seja paga ou que se encerre o Conflito.",
  },
  {
    id: "gambiarra",
    name: "Gambiarra",
    cost: 3,
    requirements: aptitude("Sagacidade", 2),
    description: "O(a) Infectado(a) pode mudar Características de Artefatos, o que não é possível fazer sem essa Característica.",
  },
  {
    id: "inabalavel",
    name: "Inabalável",
    cost: 3,
    requirements: aptitude("Resolução", 3),
    description: "Todos os testes do(a) Infectado(a) de resistência mental e emocional que poderiam abalá-lo garantem que as adaptações em seu resultado possam ser transformadas em sucessos em uma quantidade de vezes até o seu valor de Resolução por sessão de jogo.",
  },
  {
    id: "olhar-minucioso",
    name: "Olhar Minucioso",
    cost: 3,
    requirements: aptitude("Percepção", 2),
    description: "Todas as jogadas de Percepção ou Sagacidade para encontrar algo novo que esteja escondido ou oculto podem adicionar um sucesso em seus resultados para investigar.",
  },
  {
    id: "orientacao",
    name: "Orientação",
    cost: 3,
    requirements: or(aptitude("Geografia", 2), aptitude("Sobrevivência", 2)),
    description: "O(a) Infectado(a) dificilmente se perde, portanto todo teste de Geografia ou Sobrevivência para recuperar um rastro ou ter ciência da sua localização permite adicionar uma adaptação no seu resultado.",
  },
  {
    id: "parkour",
    name: "Parkour",
    cost: 3,
    requirements: aptitude("Reação", 2),
    description: "Sempre que o(a) Infectado(a) realizar testes de escalada, equilíbrio, saltos, corridas curtas, acrobacias ou passar por lugares apertados, permite adicionar uma adaptação ao resultado.",
  },
  {
    id: "primeiros-socorros",
    name: "Primeiros Socorros",
    cost: 3,
    requirements: aptitude("Medicina", 2),
    description: "Sempre que o(a) Infectado(a) realizar jogadas que tenham como objetivo auxiliar nos cuidados de ferimentos e doenças, adiciona um sucesso em seu resultado.",
  },
  {
    id: "racional",
    name: "Racional",
    cost: 3,
    requirements: aptitude("Erudição", 2),
    description: "Todos os testes de Resolução do(a) Infectado(a) que estejam relacionados com resistência mental podem ser realizados com Sagacidade. Não afeta os testes físicos de Resolução.",
  },
  {
    id: "recuperacao-rapida",
    name: "Recuperação Rápida",
    cost: 3,
    requirements: aptitude("Resolução", 2),
    description: "Toda vez que o(a) Infectado(a) ativa a Recuperação, sua Saúde aumenta em dois pontos adicionais.",
  },
  {
    id: "resiliente",
    name: "Resiliente",
    cost: 3,
    requirements: { type: "resourceLevel", resource: "assimilation", min: 2 },
    description: "Uma vez por Conflito, ao sofrer dano, o(a) Infectado(a) pode gastar Pontos de Assimilação para reduzir o dano sofrido proporcionalmente ao número de Pontos gastos.",
  },
  {
    id: "vaso-ruim",
    name: "Vaso Ruim",
    cost: 3,
    requirements: aptitude("Resolução", 2),
    description: "O(a) Infectado(a) anula uma primeira ativação que levaria à sua morte. Esta característica só poderá ser usada novamente depois que o(a) Infectado(a) cumprir uma Clareza de Propósito.",
  },
  {
    id: "heroi-local",
    name: "Herói Local",
    cost: 4,
    requirements: aptitude("Influência", 3),
    description: "O(a) Infectado(a) é conhecido por um ato heroico que mudou sua história e contribuiu com a comunidade. Uma vez por arco de história, pode gastar seu uso de Evento Marcante para evitar que o Refúgio sofra perda de um nível de Moral.",
  },
  {
    id: "macgyver",
    name: "MacGyver",
    cost: 4,
    requirements: and(aptitude("Sagacidade", 2), aptitude("Manufaturas", 2)),
    description: "Uma vez por sessão de jogo, o(a) Infectado(a) pode construir um Artefato com a característica Improvisado e outra característica de equipamento de categoria 1 à sua escolha, usando apenas uma coleção de componentes e materiais tirados de onde menos se espera. Este Artefato perdura até o final da cena.",
  },
  {
    id: "suporte",
    name: "Suporte",
    cost: 4,
    requirements: and(aptitude("Influência", 2), aptitude("Reação", 2)),
    description: "Sempre que usar a ação Ajudar Aliado para transferir sucessos a outros Infectados, adicione um sucesso a mais.",
  },
  {
    id: "mira-fatal",
    name: "Mira Fatal",
    cost: 5,
    requirements: and(aptitude("Armas", 3), or(aptitude("Percepção", 3), aptitude("Reação", 3))),
    description: "Em testes de ataque que dependem de pontaria, o(a) Infectado(a) pode gastar 2 Pontos de Determinação para dobrar o número de sucessos investidos em Neutralização de Ameaça.",
  },
  {
    id: "motivar-aliado",
    name: "Motivar Aliado",
    cost: 5,
    requirements: aptitude("Expressão", 3),
    description: "Sempre que usar a ação Apoiar Aliado, cada adaptação anula duas falhas do mesmo aliado alvo. Esta Característica pode ser ativada uma quantidade de vezes igual ao seu total de Influência por sessão de jogo.",
  },
];

export const characteristicCatalogById = Object.fromEntries(
  characteristicCatalog.map((characteristic) => [characteristic.id, characteristic]),
);

export function formatCharacteristicRequirement(requirements) {
  if (!requirements) return "Nenhum";
  if (Array.isArray(requirements)) return requirements.map(formatCharacteristicRequirement).join(" e ");
  if (requirements.type === "aptitude") return `${requirements.aptitude} ${requirements.min}+`;
  if (requirements.type === "resourceLevel") return `Assimilação ${requirements.min}+`;
  const separator = requirements.type === "OR" ? " ou " : " e ";
  const formatted = requirements.options.map((option) => formatCharacteristicRequirement(option));
  return requirements.type === "AND" && requirements.options.some((option) => option.type === "OR")
    ? formatted.map((value, index) => requirements.options[index].type === "OR" ? `(${value})` : value).join(separator)
    : formatted.join(separator);
}

export function evaluateCharacteristicRequirement(requirements, values = {}, assimilationLevel = 0) {
  if (!requirements) return true;
  if (Array.isArray(requirements)) return requirements.every((requirement) => evaluateCharacteristicRequirement(requirement, values, assimilationLevel));
  if (requirements.type === "aptitude") return Number(values[requirements.aptitude] || 0) >= requirements.min;
  if (requirements.type === "resourceLevel") return assimilationLevel >= requirements.min;
  if (requirements.type === "AND") return requirements.options.every((option) => evaluateCharacteristicRequirement(option, values, assimilationLevel));
  if (requirements.type === "OR") return requirements.options.some((option) => evaluateCharacteristicRequirement(option, values, assimilationLevel));
  return false;
}

export function getCharacteristicRefId(reference) {
  if (typeof reference === "string") return reference;
  if (!reference || typeof reference !== "object") return null;
  return reference.characteristicId || reference.id || null;
}

export function getCharacterCharacteristicRefs(character) {
  const canonical = Array.isArray(character?.characterCharacteristics) ? character.characterCharacteristics : [];
  const legacy = Array.isArray(character?.characteristics) ? character.characteristics : [];
  return [...canonical, ...legacy].map((reference) => typeof reference === "string" ? { characteristicId: reference } : reference).filter(Boolean);
}
