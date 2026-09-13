import { summarizeSymbols } from "./assimilationDice.js";

export const MAX_ROLL_HISTORY = 5;

export function addRollToHistory(history = [], entry) {
  return [entry, ...history].slice(0, MAX_ROLL_HISTORY);
}

export function getDiscardedDice(rolledDice = [], keptDice = []) {
  const keptIds = new Set(keptDice.map((die) => die.id));
  return rolledDice.filter((die) => !keptIds.has(die.id));
}

export function summarizeDicePool(dice = []) {
  const counts = dice.reduce((result, die) => {
    result[die.dieType] = (result[die.dieType] || 0) + 1;
    return result;
  }, {});

  return ["d12", "d10", "d6"]
    .filter((dieType) => counts[dieType])
    .map((dieType) => `${counts[dieType]}${dieType}`)
    .join(" + ");
}

export function formatSuccessMessage(successes = 0) {
  if (successes === 0) return "Sem sucessos";
  return `${successes} ${successes === 1 ? "sucesso" : "sucessos"}`;
}

export function createRollHistoryEntry(result, characterName = "", timestamp = Date.now()) {
  const summary = summarizeSymbols(result.keptDice);
  return {
    id: `history-${result.id}-${timestamp}`,
    timestamp,
    characterName,
    rollType: result.rollType,
    effort: result.effort,
    skills: result.names,
    keepCount: result.keepCount,
    rolledDice: result.rolledDice,
    keptDice: result.keptDice,
    summary: {
      successes: summary.success,
      failures: summary.failure,
      adaptations: summary.adaptation,
    },
  };
}
