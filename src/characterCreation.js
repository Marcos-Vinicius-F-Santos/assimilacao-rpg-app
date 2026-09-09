import { createInitialAssimilationDraft, groupAssimilationAcquisitions, validateInitialAssimilation } from "./initialAssimilation.js";

export const creationSteps = [
  { id: "identity", label: "Nome" },
  { id: "origins", label: "Origens" },
  { id: "generation", label: "Geração" },
  { id: "purposes", label: "Propósitos" },
  { id: "aptitudes", label: "Aptidões" },
  { id: "tug", label: "Cabo de Guerra" },
  { id: "health", label: "Saúde" },
  { id: "characteristics", label: "Características" },
  { id: "equipment", label: "Equipamentos iniciais" },
];

export const creationInstinctNames = ["Influência", "Percepção", "Potência", "Reação", "Resolução", "Sagacidade"];
export const creationKnowledgeNames = ["Biologia", "Erudição", "Engenharia", "Geografia", "Medicina", "Segurança"];
export const creationPracticeNames = ["Armas", "Atletismo", "Expressão", "Furtividade", "Manufaturas", "Sobrevivência"];

export const generationOptions = [
  { id: "pre-collapse", label: "Pré-Colapso", description: "Nascido e criado antes do Colapso." },
  { id: "collapse", label: "Colapso", description: "Passou pelo Colapso aproximadamente entre 5 e 12 anos." },
  { id: "post-collapse", label: "Pós-Colapso", description: "Nasceu depois ou tinha menos de 5 anos quando ocorreu." },
];

export const startingEquipmentPackages = [
  { id: "combatente", name: "Combatente", itemIds: ["bebida", "corda-15-metros", "faca"], choice: { count: 2, options: ["lanca", "faca-de-osso", "arco", "facao", "machado"] } },
  { id: "curandeiro", name: "Curandeiro", itemIds: ["alcool", "curativos", "faca", "kit-de-costura", "serrote"] },
  { id: "desbravador", name: "Desbravador", itemIds: ["bussola", "facao", "mapas-uteis", "saco-de-dormir", "tenda-desmontavel"] },
  { id: "estudioso", name: "Estudioso", itemIds: ["caderno-de-notas", "caixa-de-velas", "canivete", "kit-de-escrita", "tres-livros"] },
  { id: "mercador", name: "Mercador", itemIds: ["abaco", "balanca", "caderno-de-notas", "kit-de-escrita", "mapas-uteis"] },
  { id: "nomade", name: "Nômade", itemIds: ["aljava-10-flechas", "arco", "facao", "manto-camuflado", "sinalizador"] },
  { id: "infiltrador", name: "Infiltrador", itemIds: ["corda-15-metros", "faca", "gazuas", "manto-camuflado", "pe-de-cabra"] },
  { id: "selvagem", name: "Selvagem", itemIds: ["faca-de-osso", "lanca", "pintura-ritualistica", "rede-de-dormir", "rede-de-pesca"] },
  { id: "sobrevivente", name: "Sobrevivente", itemIds: ["corda-15-metros", "faca", "machado", "pederneira", "saco-de-dormir"] },
];

const valuesFor = (names, value) => Object.fromEntries(names.map((name) => [name, value]));

export function createCharacterCreationDraft({ campaignId = null, startingDeterminationLevel = 9 } = {}) {
  const determinationLevel = Math.min(9, Math.max(1, Number(startingDeterminationLevel) || 9));
  return {
    campaignId,
    identity: { name: "", concept: "" },
    origins: { event: "", occupation: "" },
    generation: { id: "", age: "" },
    purposes: { personal: ["", ""], collective: ["", ""] },
    baseAptitudes: { instincts: valuesFor(creationInstinctNames, 1), knowledge: valuesFor(creationKnowledgeNames, 0), practices: valuesFor(creationPracticeNames, 0) },
    xpUpgrades: { knowledge: valuesFor(creationKnowledgeNames, 0), practices: valuesFor(creationPracticeNames, 0) },
    tug: { determinationLevel, assimilationLevel: 10 - determinationLevel },
    initialAssimilation: createInitialAssimilationDraft(10 - determinationLevel),
    characteristics: { selected: [], choices: {} },
    equipment: { packageId: "", choiceIds: [], extraIds: [] },
    xp: { initial: 7, spentOnCharacteristics: 0, spentOnAptitudes: 0 },
  };
}

export function getDraftAptitudes(draft) {
  const base = draft?.baseAptitudes || {};
  const upgrades = draft?.xpUpgrades || {};
  const merge = (names, key) => Object.fromEntries(names.map((name) => [name, Number(base[key]?.[name] || 0) + Number(upgrades[key]?.[name] || 0)]));
  return { ...merge(creationInstinctNames, "instincts"), ...merge(creationKnowledgeNames, "knowledge"), ...merge(creationPracticeNames, "practices") };
}

export function getCreationHealth(draft) {
  const aptitudes = getDraftAptitudes(draft);
  return Math.max(1, Math.min(11, 1 + Number(aptitudes.Potência || 0) + Number(aptitudes.Resolução || 0)));
}

export function getStartingTug(draft, campaignSettings = {}) {
  const configured = Number(draft?.tug?.determinationLevel || campaignSettings.startingDeterminationLevel || 9);
  const baseDetermination = Math.max(1, Math.min(9, configured));
  const advanced = (draft?.characteristics?.selected || []).includes("estagio-avancado");
  const determinationLevel = Math.max(1, baseDetermination - (advanced ? 1 : 0));
  return { determinationLevel, assimilationLevel: 10 - determinationLevel };
}

function sumValues(values) {
  return Object.values(values || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function validateCreationInstincts(draft) {
  const values = draft?.baseAptitudes?.instincts || {};
  const errors = [];
  if (creationInstinctNames.some((name) => Number(values[name]) < 1 || Number(values[name]) > 3)) errors.push("Cada Instinto deve ficar entre 1 e 3 durante a criação.");
  if (sumValues(values) !== 9) errors.push("Os Instintos precisam totalizar exatamente 9 pontos.");
  return errors;
}

export function validateCreationLearnedAptitudes(draft) {
  const values = { ...(draft?.baseAptitudes?.knowledge || {}), ...(draft?.baseAptitudes?.practices || {}) };
  const errors = [];
  if (sumValues(values) !== 7) errors.push("Conhecimentos e Práticas precisam totalizar exatamente 7 pontos base.");
  if (Object.values(values).some((value) => Number(value) < 0 || Number(value) > 2)) errors.push("Nenhum Conhecimento ou Prática pode ultrapassar 2 pontos na distribuição base.");
  return errors;
}

export function getXpSpent(draft) {
  return Number(draft?.xp?.spentOnCharacteristics || 0) + Number(draft?.xp?.spentOnAptitudes || 0);
}

export function validateCreationCharacteristics(draft, catalog = []) {
  const selected = draft?.characteristics?.selected || [];
  const errors = [];
  if (new Set(selected).size !== selected.length) errors.push("Uma Característica não pode ser selecionada duas vezes.");
  const spent = selected.reduce((sum, id) => sum + Number(catalog.find((item) => item.id === id)?.cost || 0), 0);
  if (spent + Number(draft?.xp?.spentOnAptitudes || 0) > 7) errors.push("O gasto de XP não pode ultrapassar 7 pontos.");
  selected.forEach((id) => { const item = catalog.find((entry) => entry.id === id); if (!item) errors.push(`Característica desconhecida: ${id}.`); });
  if (selected.includes("sentido-agucado") && !draft?.characteristics?.choices?.sense) errors.push("Escolha um sentido para Sentido Aguçado.");
  return errors;
}

export function validateCreationEquipment(draft) {
  const errors = [];
  if (!draft?.equipment?.packageId) errors.push("Escolha um pacote de equipamentos iniciais.");
  const pack = startingEquipmentPackages.find((item) => item.id === draft?.equipment?.packageId);
  if (pack?.choice && (draft.equipment.choiceIds || []).length !== pack.choice.count) errors.push("Complete as escolhas de armas do pacote Combatente.");
  return errors;
}

export function validateCreationDraft(draft, catalog = []) {
  const errors = [];
  if (!draft?.identity?.name?.trim()) errors.push("Informe o nome do Infectado.");
  if (!draft?.origins?.event?.trim() || !draft?.origins?.occupation?.trim()) errors.push("Preencha Evento Marcante e Ocupação.");
  if (!draft?.generation?.id) errors.push("Escolha uma Geração.");
  if ((draft?.purposes?.personal || []).some((purpose) => !purpose.trim())) errors.push("Preencha os dois Propósitos Pessoais.");
  if ((draft?.purposes?.collective || []).some((purpose) => !purpose.trim())) errors.push("Preencha os dois Propósitos Coletivos.");
  errors.push(...validateCreationInstincts(draft), ...validateCreationLearnedAptitudes(draft), ...validateCreationCharacteristics(draft, catalog), ...validateCreationEquipment(draft));
  errors.push(...validateInitialAssimilation(draft?.initialAssimilation, getStartingTug(draft).assimilationLevel));
  if (getXpSpent(draft) > 7) errors.push("O XP restante não pode ficar negativo.");
  return [...new Set(errors)];
}

export function getSelectedEquipmentIds(draft) {
  const pack = startingEquipmentPackages.find((item) => item.id === draft?.equipment?.packageId);
  return [...(pack?.itemIds || []), ...(draft?.equipment?.choiceIds || []), ...(draft?.equipment?.extraIds || [])];
}

export function buildCharacterDataFromDraft(draft) {
  const aptitudes = getDraftAptitudes(draft);
  const tug = getStartingTug(draft);
  const health = getCreationHealth(draft);
  const selected = draft?.characteristics?.selected || [];
  const initialAssimilation = draft?.initialAssimilation || createInitialAssimilationDraft(tug.assimilationLevel);
  const initialTest = initialAssimilation.test?.result ? { ...initialAssimilation.test, result: { ...initialAssimilation.test.result } } : null;
  return {
    name: draft.identity.name.trim(),
    concept: draft.identity.concept.trim(),
    origin: draft.origins.event.trim(),
    event: draft.origins.event.trim(),
    occupation: draft.origins.occupation.trim(),
    origins: { ...draft.origins },
    generation: generationOptions.find((option) => option.id === draft.generation.id)?.label || draft.generation.id,
    generationId: draft.generation.id,
    age: draft.generation.age,
    purposes: [...draft.purposes.personal],
    collectivePurposes: [...draft.purposes.collective],
    aptitudes,
    baseAptitudes: draft.baseAptitudes,
    xpUpgrades: draft.xpUpgrades,
    determination: { level: tug.determinationLevel, points: tug.determinationLevel },
    assimilation: { level: tug.assimilationLevel, points: tug.assimilationLevel },
    health,
    maxHealth: health,
    healthByLevel: { healthy: health, wounded: health, laceration: health, injuries: health, debilitated: health, incapacitated: health },
    characterCharacteristics: selected.map((characteristicId) => ({ characteristicId, choices: draft.characteristics.choices[characteristicId] || {} })),
    characterAssimilations: groupAssimilationAcquisitions(initialAssimilation.acquisitions || []),
    initialAssimilationTest: initialTest,
    initialEquipmentIds: getSelectedEquipmentIds(draft),
    startingEquipmentPackage: draft.equipment.packageId,
    creationCompleted: true,
    pendingInitialAssimilation: false,
    initialXp: 7,
    spentXp: getXpSpent(draft),
  };
}
