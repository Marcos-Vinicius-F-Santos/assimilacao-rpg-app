export const itemCategoryLabels = {
  utilidade: "Utilidade",
  arma: "Arma",
  equipamento: "Equipamento",
  consumivel: "Consumível",
  ferramenta: "Ferramenta",
};

export const artifactTraits = [
  { id: "fragil", name: "Frágil", category: -1, scarcityModifier: -1, description: "O item é mais fácil de danificar ou degradar." },
  { id: "improvisado", name: "Improvisado", category: -1, scarcityModifier: -1, description: "Item criado com peças originalmente feitas para outros objetos, com fabricação improvisada." },
  { id: "pesado", name: "Pesado", category: -1, scarcityModifier: -1, description: "Item grande ou pesado que prejudica mobilidade e ocupa mais espaço de inventário." },
  { id: "uso-unico", name: "Uso Único", category: -1, scarcityModifier: -1, description: "Um único uso faz o item desaparecer ou inutilizar completamente." },
  { id: "agil", name: "Ágil", category: 1, scarcityModifier: 1, description: "O artefato é leve e rápido de manejar." },
  { id: "discreto", name: "Discreto", category: 1, scarcityModifier: 1, description: "O artefato pode ser transportado ou utilizado sem chamar atenção." },
  { id: "espacoso", name: "Espaçoso", category: 1, scarcityModifier: 1, allowMultiple: true, description: "O artefato oferece espaço adicional para transportar itens." },
  { id: "iluminador", name: "Iluminador", category: 1, scarcityModifier: 1, description: "O artefato produz ou direciona luz." },
  { id: "letal", name: "Letal", category: 1, scarcityModifier: 1, description: "O artefato é especialmente perigoso quando usado para atacar." },
  { id: "protetivo", name: "Protetivo", category: 1, scarcityModifier: 1, description: "O artefato oferece proteção contra ameaças." },
  { id: "restaurador", name: "Restaurador", category: 1, scarcityModifier: 1, description: "O artefato restaura recursos ou auxilia na recuperação." },
  { id: "eficiente", name: "Eficiente", category: 2, scarcityModifier: 2, description: "O artefato realiza sua função com eficiência superior." },
  { id: "duravel", name: "Durável", category: 2, scarcityModifier: 2, description: "O artefato resiste melhor ao desgaste." },
  { id: "adrenalina", name: "Adrenalina", category: 3, scarcityModifier: 3, description: "O artefato favorece ações que exigem uma resposta intensa e imediata." },
  { id: "armadura", name: "Armadura", category: 3, scarcityModifier: 3, description: "O artefato foi construído para absorver ou reduzir dano." },
  { id: "explosivo", name: "Explosivo", category: 4, scarcityModifier: 4, description: "O artefato produz uma explosão quando ativado." },
  { id: "inflamavel", name: "Inflamável", category: 4, scarcityModifier: 4, description: "O artefato espalha ou utiliza fogo com facilidade." },
  { id: "medicinal", name: "Medicinal", category: 4, scarcityModifier: 4, description: "O artefato foi preparado para cuidados médicos." },
];

export const artifactTraitsById = Object.fromEntries(artifactTraits.map((trait) => [trait.id, trait]));

export function getArtifactTrait(traitId) {
  return artifactTraitsById[traitId] || null;
}

export function calculateArtifactScarcity(traitIds = []) {
  const total = traitIds.reduce((sum, traitId) => sum + (getArtifactTrait(traitId)?.scarcityModifier || 0), 0);
  return Math.max(0, total);
}

export function formatArtifactTraits(traitIds = []) {
  return traitIds.map(getArtifactTrait).filter(Boolean).map((trait) => trait.name).join(" • ");
}

export function createCustomArtifact({ id, name, artifactTraits: traitIds = [], quality = 3, location = "backpack" }) {
  return {
    id,
    type: "artifact",
    name,
    artifactTraits: [...traitIds],
    scarcity: calculateArtifactScarcity(traitIds),
    quality,
    image: null,
    custom: true,
    location,
    kind: location === "body" ? "Corpo" : "Mochila",
    iconKey: "package",
  };
}

const equipment = (id, name, categories, iconKey = "package", detail = null) => ({
  id,
  type: "equipment",
  name,
  categories,
  size: 1,
  quality: 3,
  image: null,
  iconKey,
  custom: false,
  detail,
});

const artifact = (id, name, scarcity, traitIds, iconKey = "package", description = "Artefato oficial do catálogo.") => ({
  id,
  type: "artifact",
  name,
  scarcity,
  artifactTraits: traitIds,
  quality: 3,
  image: null,
  iconKey,
  custom: false,
  description,
});

export const itemCatalog = [
  equipment("corda-15-metros", "Corda (15 metros)", ["utilidade"]),
  equipment("rede-de-dormir", "Rede de dormir", ["utilidade"]),
  equipment("rede-de-pesca", "Rede de pesca", ["utilidade"]),
  equipment("pintura-ritualistica", "Pintura ritualística", ["utilidade"]),
  equipment("caderno-de-notas", "Caderno de notas", ["utilidade"]),
  equipment("saco-de-dormir", "Saco de dormir", ["utilidade"]),
  equipment("pederneira", "Pederneira", ["utilidade"], "zap"),
  equipment("curativos", "Curativos", ["utilidade"], "heart-pulse"),
  equipment("balanca", "Balança", ["utilidade"]),
  equipment("caixa-de-velas", "Caixa de velas", ["utilidade"]),
  equipment("kit-de-escrita", "Kit de escrita", ["utilidade"]),
  equipment("kit-de-costura", "Kit de costura", ["utilidade"]),
  equipment("bussola", "Bússola", ["utilidade"]),
  equipment("mapas-uteis", "Mapas úteis", ["utilidade"]),
  equipment("tenda-desmontavel", "Tenda desmontável", ["utilidade"]),
  equipment("tres-livros", "Três livros", ["utilidade"]),
  equipment("abaco", "Ábaco", ["utilidade"]),
  equipment("sinalizador", "Sinalizador", ["utilidade"], "zap"),
  equipment("lanca", "Lança", ["arma"], "sword"),
  equipment("faca-de-osso", "Faca de osso", ["arma"], "sword"),
  equipment("arco", "Arco", ["arma"], "sword"),
  equipment("faca", "Faca", ["equipamento"], "sword"),
  equipment("facao", "Facão", ["equipamento"], "sword"),
  equipment("aljava-10-flechas", "Aljava com 10 flechas", ["equipamento"]),
  equipment("manto-camuflado", "Manto camuflado", ["equipamento"]),
  equipment("bebida", "Bebida", ["consumivel"], "heart-pulse"),
  equipment("alcool", "Álcool", ["consumivel"], "heart-pulse"),
  equipment("serrote", "Serrote", ["ferramenta"]),
  equipment("canivete", "Canivete", ["ferramenta"], "sword"),
  equipment("gazuas", "Gazuás", ["ferramenta"]),
  equipment("pe-de-cabra", "Pé de Cabra", ["ferramenta"]),
  equipment("machado", "Machado", ["ferramenta", "arma"], "sword"),
  artifact("taco-baseball-com-pregos", "Taco de Baseball com Pregos", 0, ["improvisado"], "sword", "Artefato improvisado baseado em um taco de baseball com pregos."),
  artifact("escudo-tampa-barril", "Escudo de Tampa de Barril", 0, ["fragil"]),
  artifact("barras-nutrientes-especiais", "Barras de Nutrientes Especiais", 1, ["restaurador"], "heart-pulse"),
  artifact("escudo-anti-tumulto", "Escudo Anti-Tumulto", 1, ["protetivo"]),
  artifact("faca-combate", "Faca de Combate", 1, ["agil"], "sword"),
  artifact("machado-guerra", "Machado de Guerra", 1, ["letal"], "sword"),
  artifact("cota-malha-longa", "Cota de Malha Longa", 2, ["armadura"]),
  artifact("lanterna-artefato", "Lanterna", 2, ["iluminador"], "zap"),
  artifact("mochila-acampamento", "Mochila de Acampamento", 2, ["espacoso", "espacoso"], "backpack"),
  artifact("caneta-adrenalina", "Caneta de Adrenalina", 3, ["adrenalina"], "zap"),
  artifact("colete-tatico", "Colete Tático", 3, ["armadura"]),
  artifact("escudo-tatico", "Escudo Tático", 3, ["protetivo"]),
  artifact("katana", "Katana", 3, ["agil", "eficiente"], "sword"),
  artifact("kit-primeiros-socorros-artefato", "Kit de Primeiros Socorros", 3, ["uso-unico", "medicinal"], "heart-pulse"),
  artifact("revolver", "Revólver", 3, ["letal"], "sword"),
  artifact("granada", "Granada", 4, ["explosivo"], "zap"),
  artifact("lanca-chamas", "Lança-Chamas", 4, ["inflamavel"], "zap"),
  artifact("mala-medico-combate", "Mala de Médico de Combate", 4, ["medicinal"], "heart-pulse"),
];

export const itemCatalogById = Object.fromEntries(itemCatalog.map((item) => [item.id, item]));
