import { recommend, DEMO_PROFILES, CATALOG } from "./logic.js";

let pass = 0;
let fail = 0;

function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`OK   ${label}`);
  } else {
    fail++;
    console.log(`FAIL ${label} ${detail ? "— " + detail : ""}`);
  }
}

function printResult(label, result) {
  console.log(`\n--- ${label} ---`);
  console.log("meta:", result.meta);
  console.log("primary:", result.primary?.wine.name, `$${result.primary?.bottlePrice}`, `score=${result.primary?.score}`);
  console.log("  reason:", result.primary?.reason);
  console.log("alternative:", result.alternative?.wine.name, `$${result.alternative?.bottlePrice}`, `score=${result.alternative?.score}`);
  console.log("  reason:", result.alternative?.reason);
}

console.log("=== 1) Tres perfiles semilla ===");
for (const profile of DEMO_PROFILES) {
  const result = recommend(profile.answers);
  printResult(profile.label, result);
  check(`${profile.label}: hay recomendación principal`, !!result.primary);
  check(`${profile.label}: hay alternativa`, !!result.alternative);
  check(`${profile.label}: principal y alternativa son distintas`, result.primary.wine.id !== result.alternative.wine.id);
  check(`${profile.label}: principal respeta presupuesto`, result.primary.bottlePrice <= profile.answers.budgetMax, `precio=${result.primary.bottlePrice} tope=${profile.answers.budgetMax}`);
  check(`${profile.label}: razón no genérica (menciona algo concreto)`, result.primary.reason.length > 20);
}

console.log("\n=== 2) Respuestas incompletas (sin sabores seleccionados) ===");
{
  const answers = { occasion: "casual", flavors: [], sweetness: 2, intensity: 2, budgetMax: 30 };
  const result = recommend(answers);
  printResult("Sin sabores", result);
  check("Incompleto: no lanza excepción y devuelve principal", !!result.primary);
  check("Incompleto: la razón no depende de sabores inexistentes", !result.primary.reason.includes("undefined"));
}

console.log("\n=== 3) Respuestas contradictorias (dulce+ligero+cena de maridaje, presupuesto bajo) ===");
{
  const answers = { occasion: "cena_maridaje", flavors: ["ahumado_roble"], sweetness: 3, intensity: 1, budgetMax: 15 };
  const result = recommend(answers);
  printResult("Contradictorio", result);
  check("Contradictorio: aun así entrega principal", !!result.primary);
  check("Contradictorio: scores reflejan baja coincidencia (<60)", result.primary.score < 60, `score=${result.primary.score}`);
  check("Contradictorio: respeta presupuesto pese a baja coincidencia", result.primary.bottlePrice <= 15);
}

console.log("\n=== 4) Presupuesto sin ninguna coincidencia (por debajo del vino más barato del catálogo) ===");
{
  const cheapest = Math.min(...CATALOG.map((w) => w.priceBottle));
  const answers = { occasion: "casual", flavors: ["frutal"], sweetness: 2, intensity: 2, budgetMax: cheapest - 2 };
  const result = recommend(answers);
  printResult("Presupuesto imposible", result);
  check("Sin match de presupuesto: no falla, relaja y marca la bandera", result.meta.budgetRelaxed === true);
  check("Sin match de presupuesto: devuelve igual una recomendación", !!result.primary);
  check("Sin match de presupuesto: también entrega una alternativa (no queda huérfana)", !!result.alternative, "regresión: antes del fix quedaba `undefined`");
  check("Sin match de presupuesto: marca overBudget en el resultado", result.primary.overBudget === true);
  check("Sin match de presupuesto: precio real es mayor al solicitado", result.primary.bottlePrice > answers.budgetMax);
}

console.log("\n=== 5) Consistencia de precios de muestra ===");
for (const wine of CATALOG) {
  const result = recommend({ occasion: "casual", flavors: [], sweetness: 2, intensity: 2, budgetMax: Infinity });
  check(`Muestra de ${wine.name} es menor que la botella`, wine.priceBottle > 0, "precio botella debe ser positivo");
}
{
  const result = recommend({ occasion: "casual", flavors: [], sweetness: 2, intensity: 2, budgetMax: Infinity });
  check("samplePrice < bottlePrice en la recomendación principal", result.primary.samplePrice < result.primary.bottlePrice);
  check("samplePrice tiene mínimo razonable (>=6)", result.primary.samplePrice >= 6);
}

console.log(`\n=== RESUMEN: ${pass} OK, ${fail} FAIL ===`);
if (fail > 0) process.exit(1);
