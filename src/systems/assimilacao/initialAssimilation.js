import { rollAssimilationDie, summarizeSymbols } from "./assimilationDice.js";
import { officialAssimilations } from "./assimilationsCatalog.js";

export const initialAssimilationFamilies = ["evolutive", "adaptive", "inopportune"];

const emptyResult = () => ({ success: 0, adaptation: 0, failure: 0 });

export function createInitialAssimilationDraft(level = 0) {
  return {
    level: Math.max(0, Number(level) || 0),
    existingInopportuneFailures: 0,
    test: { source: null, dice: [], result: null, confirmed: false },
    cardDraw: { source: null, evolutive: [], adaptive: [], inopportune: [], singular: [] },
    acquisitions: [],
  };
}

export function getInitialAssimilationDice(level = 0) {
  const normalizedLevel = Math.max(0, Number(level) || 0);
  return normalizedLevel === 0 ? [] : ["d6", ...Array.from({ length: normalizedLevel }, () => "d12")];
}

export function rollAssimilationTest(level = 0, { rng = Math.random } = {}) {
  const dice = getInitialAssimilationDice(level).map((dieType, index) => rollAssimilationDie({
    dieType,
    source: "Teste de Assimilação",
    id: `initial-assimilation-${Date.now()}-${index}`,
    rng,
  }));
  return { source: "digital", level: Math.max(0, Number(level) || 0), dice, result: summarizeSymbols(dice), confirmed: false };
}

export function normalizeAssimilationTestResult(result) {
  return {
    success: Math.max(0, Number(result?.success) || 0),
    adaptation: Math.max(0, Number(result?.adaptation) || 0),
    failure: Math.max(0, Number(result?.failure) || 0),
  };
}

function shuffle(values, rng = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function getRequiredAssimilationCardCounts(result) {
  const normalized = normalizeAssimilationTestResult(result);
  return { evolutive: normalized.success, adaptive: normalized.adaptation, inopportune: normalized.failure };
}

export function drawAssimilationCards(result, { rng = Math.random } = {}) {
  const counts = getRequiredAssimilationCardCounts(result);
  return {
    source: "digital",
    evolutive: shuffle(officialAssimilations.filter((item) => item.family === "evolutive"), rng).slice(0, counts.evolutive),
    adaptive: shuffle(officialAssimilations.filter((item) => item.family === "adaptive"), rng).slice(0, counts.adaptive),
    inopportune: shuffle(officialAssimilations.filter((item) => item.family === "inopportune"), rng).slice(0, counts.inopportune),
    singular: [],
  };
}

export function getMutationId(assimilation, ability) {
  return `${assimilation.id}:${ability.id}`;
}

export function getAvailableMutations(cardDraw) {
  return [...initialAssimilationFamilies, "singular"].flatMap((family) => (cardDraw?.[family] || []).flatMap((assimilation) => (assimilation.abilities || []).map((ability) => ({
    ...ability,
    mutationId: getMutationId(assimilation, ability),
    assimilationId: assimilation.id,
    assimilationName: assimilation.name,
    family: assimilation.family,
  }))));
}

export function getAssimilationBudget(result, acquisitions = []) {
  const source = normalizeAssimilationTestResult(result);
  return acquisitions.reduce((budget, acquisition) => ({
    success: budget.success - Number(acquisition.cost?.success || 0),
    adaptation: budget.adaptation - Number(acquisition.cost?.adaptation || 0),
    failure: budget.failure - Number(acquisition.cost?.failure || 0),
  }), { ...source });
}

export function canAcquireMutation(mutation, budget, assimilationLevel, acquisitions = []) {
  if (!mutation) return { ok: false, reason: "Mutação inválida." };
  if (acquisitions.some((item) => item.mutationId === mutation.mutationId)) return { ok: false, reason: "Mutação já adquirida." };
  if (mutation.assimilationLevelRequirement && assimilationLevel < mutation.assimilationLevelRequirement) return { ok: false, reason: `Requer Assimilação ${mutation.assimilationLevelRequirement}+.` };
  const cost = mutation.acquisitionCost || {};
  if (["success", "adaptation", "failure"].some((key) => Number(cost[key] || 0) > Number(budget?.[key] || 0))) return { ok: false, reason: "Símbolos insuficientes." };
  return { ok: true };
}

export function applyMutationPurchase(acquisitions, mutation) {
  return [...acquisitions, { mutationId: mutation.mutationId, assimilationId: mutation.assimilationId, cost: { ...mutation.acquisitionCost } }];
}

export function removeMutationPurchase(acquisitions, mutationId) {
  return acquisitions.filter((item) => item.mutationId !== mutationId);
}

export function validateAssimilationCards(cardDraw, result) {
  const counts = getRequiredAssimilationCardCounts(result);
  const errors = [];
  initialAssimilationFamilies.forEach((family) => {
    const cards = cardDraw?.[family] || [];
    if (cards.length !== counts[family]) errors.push(`Selecione exatamente ${counts[family]} carta(s) ${family}.`);
    if (new Set(cards.map((card) => card.id)).size !== cards.length) errors.push(`Há cartas ${family} duplicadas.`);
  });
  return errors;
}

export function validateInitialAssimilation(state, assimilationLevel) {
  if (Number(assimilationLevel) === 0) return [];
  const errors = [];
  const test = state?.test;
  const result = normalizeAssimilationTestResult(test?.result);
  if (!test?.confirmed) errors.push("Confirme o Teste de Assimilação inicial.");
  if (Number(test?.level) !== Number(assimilationLevel)) errors.push("O nível mudou; refaça o Teste de Assimilação inicial.");
  if (Number(state?.existingInopportuneFailures || 0) + result.failure >= 10) errors.push("As Falhas acumuladas atingiram 10: a criação não pode continuar normalmente.");
  if (result.success + result.adaptation + result.failure > 0) errors.push(...validateAssimilationCards(state?.cardDraw, result));
  const available = getAvailableMutations(state?.cardDraw);
  const acquisitions = state?.acquisitions || [];
  if (new Set(acquisitions.map((item) => item.mutationId)).size !== acquisitions.length) errors.push("Uma mutação não pode ser adquirida duas vezes.");
  acquisitions.forEach((acquisition) => {
    const mutation = available.find((item) => item.mutationId === acquisition.mutationId);
    if (!mutation) errors.push("Existe uma mutação adquirida que não pertence às cartas disponíveis.");
    else if (!canAcquireMutation(mutation, getAssimilationBudget(result, acquisitions.filter((item) => item.mutationId !== acquisition.mutationId)), assimilationLevel, acquisitions.filter((item) => item.mutationId !== acquisition.mutationId)).ok) errors.push(`A mutação ${mutation.name} não pode ser adquirida.`);
  });
  const remaining = getAssimilationBudget(result, acquisitions);
  if (remaining.success < 0 || remaining.adaptation < 0 || remaining.failure < 0) errors.push("O custo das mutações excede o resultado do teste.");
  if (result.success + result.adaptation + result.failure > 0 && (remaining.success !== 0 || remaining.adaptation !== 0 || remaining.failure !== 0)) errors.push("Todos os símbolos do teste precisam ser gastos.");
  return [...new Set(errors)];
}

export function groupAssimilationAcquisitions(acquisitions = []) {
  const grouped = new Map();
  acquisitions.forEach((acquisition) => {
    const current = grouped.get(acquisition.assimilationId) || { assimilationId: acquisition.assimilationId, mutationIds: [] };
    if (!current.mutationIds.includes(acquisition.mutationId)) current.mutationIds.push(acquisition.mutationId);
    grouped.set(acquisition.assimilationId, current);
  });
  return [...grouped.values()];
}

export function createManualAssimilationTest(level, result) {
  return { source: "manual", level: Math.max(0, Number(level) || 0), dice: [], result: normalizeAssimilationTestResult(result), confirmed: false };
}

export function zeroAssimilationResult(result) {
  const normalized = normalizeAssimilationTestResult(result);
  return normalized.success === 0 && normalized.adaptation === 0 && normalized.failure === 0;
}

export { emptyResult };
