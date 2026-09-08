export const ASSIMILATION_DICE_FACES = {
  d6: {
    1: { success: 0, failure: 0, adaptation: 0 },
    2: { success: 0, failure: 0, adaptation: 0 },
    3: { success: 0, failure: 1, adaptation: 0 },
    4: { success: 0, failure: 1, adaptation: 1 },
    5: { success: 0, failure: 1, adaptation: 1 },
    6: { success: 1, failure: 0, adaptation: 0 },
  },
  d10: {
    1: { success: 0, failure: 0, adaptation: 0 },
    2: { success: 0, failure: 0, adaptation: 0 },
    3: { success: 0, failure: 1, adaptation: 0 },
    4: { success: 0, failure: 1, adaptation: 1 },
    5: { success: 0, failure: 1, adaptation: 1 },
    6: { success: 1, failure: 0, adaptation: 0 },
    7: { success: 2, failure: 0, adaptation: 0 },
    8: { success: 1, failure: 0, adaptation: 1 },
    9: { success: 1, failure: 1, adaptation: 1 },
    10: { success: 2, failure: 1, adaptation: 0 },
  },
  d12: {
    1: { success: 0, failure: 0, adaptation: 0 },
    2: { success: 0, failure: 0, adaptation: 0 },
    3: { success: 0, failure: 1, adaptation: 0 },
    4: { success: 0, failure: 1, adaptation: 1 },
    5: { success: 0, failure: 1, adaptation: 1 },
    6: { success: 1, failure: 0, adaptation: 0 },
    7: { success: 2, failure: 0, adaptation: 0 },
    8: { success: 1, failure: 0, adaptation: 1 },
    9: { success: 1, failure: 1, adaptation: 1 },
    10: { success: 2, failure: 1, adaptation: 0 },
    11: { success: 1, failure: 1, adaptation: 2 },
    12: { success: 0, failure: 2, adaptation: 0 },
  },
};

export function getDieSides(dieType) {
  return Number.parseInt(dieType.slice(1), 10);
}

export function rollNumericFace(dieType, rng = Math.random) {
  const sides = getDieSides(dieType);
  return Math.floor(rng() * sides) + 1;
}

export function resolveAssimilationFace(dieType, numericFace) {
  const face = ASSIMILATION_DICE_FACES[dieType]?.[numericFace];
  if (!face) throw new Error(`Face inválida para ${dieType}: ${numericFace}`);
  return { ...face };
}

export function rollAssimilationDie({ dieType, source, id, rng = Math.random }) {
  const numericFace = rollNumericFace(dieType, rng);
  return {
    id,
    dieType,
    numericFace,
    symbols: resolveAssimilationFace(dieType, numericFace),
    source,
    selected: false,
    kept: false,
  };
}

export function summarizeSymbols(dice = []) {
  return dice.reduce(
    (summary, die) => ({
      success: summary.success + die.symbols.success,
      failure: summary.failure + die.symbols.failure,
      adaptation: summary.adaptation + die.symbols.adaptation,
    }),
    { success: 0, failure: 0, adaptation: 0 },
  );
}
