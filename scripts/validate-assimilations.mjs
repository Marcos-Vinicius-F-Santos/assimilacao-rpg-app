import {
  officialAssimilations,
  validateAssimilationCatalog,
} from "../src/assimilationsCatalog.js";

const report = validateAssimilationCatalog();

if (!report.valid) {
  console.error(report.issues.join("\n"));
  process.exit(1);
}

const abilities = officialAssimilations.flatMap((assimilation) => assimilation.abilities);
const byFamily = Object.fromEntries(
  ["evolutive", "adaptive", "inopportune", "singular"].map((family) => [
    family,
    officialAssimilations
      .filter((assimilation) => assimilation.family === family)
      .reduce((total, assimilation) => total + assimilation.abilities.length, 0),
  ]),
);

console.log(JSON.stringify({
  assimilations: officialAssimilations.length,
  abilities: abilities.length,
  abilitiesWithoutAcquisitionCost: abilities.filter((ability) => !ability.acquisitionCost).length,
  byFamily,
}, null, 2));
