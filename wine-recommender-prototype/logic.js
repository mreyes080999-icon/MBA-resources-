// Motor de recomendación de vinos — determinista y explicable.
// Se ejecuta tanto en Node (tests) como en el navegador (import type="module").

export const FLAVOR_LABELS = {
  frutal: "frutal",
  citrico: "cítrico",
  floral: "floral",
  especiado: "especiado",
  terroso: "terroso",
  ahumado_roble: "ahumado / roble",
  herbal: "herbal",
  bayas_rojas: "bayas rojas",
};

export const SWEETNESS_LABELS = { 1: "seco", 2: "semi-seco", 3: "dulce" };
export const INTENSITY_LABELS = { 1: "ligero", 2: "medio", 3: "intenso" };
export const OCCASION_LABELS = {
  casual: "una ocasión casual",
  celebracion: "una celebración",
  regalo: "un regalo",
  cena_maridaje: "una cena con maridaje",
};

// Catálogo de demostración: NO son datos reales de ningún retailer.
export const CATALOG = [
  { id: "malbec-cosecha-roja", name: "Cosecha Roja Malbec", type: "tinto", sweetness: 1, intensity: 3, flavors: ["bayas_rojas", "especiado", "ahumado_roble"], priceBottle: 28, region: "Mendoza (demo)" },
  { id: "cabernet-vega-alta", name: "Vega Alta Cabernet Sauvignon", type: "tinto", sweetness: 1, intensity: 3, flavors: ["terroso", "ahumado_roble", "especiado"], priceBottle: 45, region: "Valle Central (demo)" },
  { id: "pinot-piedra-suave", name: "Piedra Suave Pinot Noir", type: "tinto", sweetness: 1, intensity: 2, flavors: ["bayas_rojas", "floral", "frutal"], priceBottle: 32, region: "Casablanca (demo)" },
  { id: "tinto-sencillo", name: "Sencillo Tinto de Mesa", type: "tinto", sweetness: 2, intensity: 2, flavors: ["frutal", "bayas_rojas"], priceBottle: 12, region: "Valle Central (demo)" },
  { id: "chardonnay-brisa-dorada", name: "Brisa Dorada Chardonnay", type: "blanco", sweetness: 2, intensity: 2, flavors: ["frutal", "ahumado_roble", "citrico"], priceBottle: 22, region: "Valle de Uco (demo)" },
  { id: "sauvignon-jardin-blanco", name: "Jardín Blanco Sauvignon Blanc", type: "blanco", sweetness: 1, intensity: 1, flavors: ["citrico", "herbal", "floral"], priceBottle: 16, region: "Casablanca (demo)" },
  { id: "riesling-flor-de-niebla", name: "Flor de Niebla Riesling", type: "blanco", sweetness: 3, intensity: 1, flavors: ["frutal", "floral", "citrico"], priceBottle: 19, region: "Andes (demo)" },
  { id: "blanco-roble-reserva", name: "Roble Blanco Reserva", type: "blanco", sweetness: 1, intensity: 2, flavors: ["ahumado_roble", "frutal", "herbal"], priceBottle: 38, region: "Casablanca (demo)" },
  { id: "rosado-petalo", name: "Pétalo Rosado", type: "rosado", sweetness: 2, intensity: 1, flavors: ["floral", "bayas_rojas", "frutal"], priceBottle: 14, region: "Colchagua (demo)" },
  { id: "rosado-verano-syrah", name: "Verano Rosado Syrah", type: "rosado", sweetness: 2, intensity: 2, flavors: ["bayas_rojas", "especiado", "frutal"], priceBottle: 18, region: "Colchagua (demo)" },
  { id: "espumante-burbuja-clasica", name: "Burbuja Clásica Extra Brut", type: "espumante", sweetness: 1, intensity: 1, flavors: ["citrico", "floral", "herbal"], priceBottle: 24, region: "Valle del Sol (demo)" },
  { id: "espumante-celebra-rose", name: "Celebra Rosé Espumante", type: "espumante", sweetness: 2, intensity: 1, flavors: ["bayas_rojas", "frutal", "floral"], priceBottle: 29, region: "Valle del Sol (demo)" },
];

export const BUDGET_TIERS = [
  { id: "lt15", label: "Menos de $15", tope: 15 },
  { id: "15-30", label: "$15 – $30", tope: 30 },
  { id: "30-50", label: "$30 – $50", tope: 50 },
  { id: "50+", label: "$50 o más", tope: Infinity },
];

// Afinidad ocasión → tipo de vino, escala 0-10.
const OCCASION_AFFINITY = {
  casual: { tinto: 4, blanco: 6, rosado: 10, espumante: 6 },
  celebracion: { tinto: 4, blanco: 4, rosado: 6, espumante: 10 },
  regalo: { tinto: 8, blanco: 6, rosado: 4, espumante: 8 },
  cena_maridaje: { tinto: 10, blanco: 8, rosado: 4, espumante: 2 },
};

const WEIGHTS = { flavor: 40, sweetness: 25, intensity: 25, occasion: 10 };

export function samplePrice(bottlePrice) {
  return Math.max(6, Math.round(bottlePrice * 0.2));
}

function scoreWine(wine, answers) {
  const hasFlavors = Array.isArray(answers.flavors) && answers.flavors.length > 0;
  const activeWeights = { ...WEIGHTS };
  if (!hasFlavors) delete activeWeights.flavor;
  const totalWeight = Object.values(activeWeights).reduce((a, b) => a + b, 0);

  const components = {};

  if (hasFlavors) {
    const overlap = answers.flavors.filter((f) => wine.flavors.includes(f));
    components.flavor = overlap.length / answers.flavors.length;
    components._flavorOverlap = overlap;
  }

  components.sweetness = 1 - Math.abs(answers.sweetness - wine.sweetness) / 2;
  components.intensity = 1 - Math.abs(answers.intensity - wine.intensity) / 2;

  const affinity = OCCASION_AFFINITY[answers.occasion]?.[wine.type] ?? 5;
  components.occasion = affinity / 10;

  let weighted = 0;
  for (const key of Object.keys(activeWeights)) {
    weighted += components[key] * activeWeights[key];
  }
  const score = Math.round((weighted / totalWeight) * 100);

  return { wine, score, components };
}

function buildReason(candidate, answers) {
  const { wine, components } = candidate;
  const parts = [];

  if (components.flavor !== undefined && components._flavorOverlap.length > 0) {
    const names = components._flavorOverlap.map((f) => FLAVOR_LABELS[f]).join(" y ");
    parts.push(`coincide con tu preferencia por sabores ${names}`);
  }
  if (components.sweetness >= 0.5) {
    parts.push(`es ${SWEETNESS_LABELS[wine.sweetness]} como pediste`);
  }
  if (components.intensity >= 0.5) {
    parts.push(`tiene un cuerpo ${INTENSITY_LABELS[wine.intensity]} acorde a lo que buscabas`);
  }
  if (components.occasion >= 0.6) {
    parts.push(`su estilo (${wine.type}) combina bien con ${OCCASION_LABELS[answers.occasion] ?? "tu ocasión"}`);
  }

  if (parts.length === 0) {
    return `Ninguna coincidencia es exacta con tus respuestas, pero es la opción con mejor equilibrio general del catálogo disponible dentro de tu presupuesto.`;
  }
  const joined = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " y " + parts[parts.length - 1];
  return `Te la recomendamos porque ${joined}.`;
}

function pickAlternative(sorted, primary) {
  const rest = sorted.filter((c) => c.wine.id !== primary.wine.id);
  if (rest.length === 0) return null;
  const trueSecond = rest[0];
  const diverseType = rest.find((c) => c.wine.type !== primary.wine.type);
  if (diverseType && diverseType.score >= trueSecond.score - 15) return diverseType;
  return trueSecond;
}

export function recommend(answers) {
  const requestedBudget = answers.budgetMax ?? Infinity;
  let budgetMax = requestedBudget;
  let pool = CATALOG.filter((w) => w.priceBottle <= budgetMax);
  let budgetRelaxed = false;

  if (pool.length === 0) {
    const prices = [...new Set(CATALOG.map((w) => w.priceBottle))].sort((a, b) => a - b);
    const nextTope = prices.find((p) => p > budgetMax) ?? prices[prices.length - 1];
    budgetMax = nextTope;
    pool = CATALOG.filter((w) => w.priceBottle <= budgetMax);
    budgetRelaxed = true;
  }

  // La PRINCIPAL siempre sale del pool más cercano al presupuesto pedido (no se
  // ensancha más de lo necesario). Solo si ese pool no alcanza para una alternativa
  // real se busca una segunda opción en el resto del catálogo, sin desplazar a la principal.
  const scored = pool.map((w) => scoreWine(w, answers)).sort((a, b) => b.score - a.score);
  const primary = scored[0];
  let alternative = pickAlternative(scored, primary);
  if (!alternative) {
    const widerPool = CATALOG.filter((w) => w.id !== primary.wine.id);
    const widerScored = widerPool.map((w) => scoreWine(w, answers)).sort((a, b) => b.score - a.score);
    alternative = pickAlternative(widerScored, primary);
    if (alternative) budgetRelaxed = true;
  }

  const finish = (candidate) => {
    if (!candidate) return null;
    return {
      wine: candidate.wine,
      score: candidate.score,
      reason: buildReason(candidate, answers),
      bottlePrice: candidate.wine.priceBottle,
      samplePrice: samplePrice(candidate.wine.priceBottle),
      overBudget: budgetRelaxed && candidate.wine.priceBottle > requestedBudget,
    };
  };

  return {
    primary: finish(primary),
    alternative: finish(alternative),
    meta: {
      requestedBudget,
      budgetRelaxed,
      candidateCount: scored.length,
    },
  };
}

// Perfiles de demostración cargables sin escribir datos (ver interfaz).
export const DEMO_PROFILES = [
  {
    id: "cena-especial",
    label: "Cena especial en pareja",
    answers: { occasion: "celebracion", flavors: ["bayas_rojas", "especiado"], sweetness: 1, intensity: 3, budgetMax: 50 },
  },
  {
    id: "tarde-casual",
    label: "Tarde casual con amigos",
    answers: { occasion: "casual", flavors: ["citrico", "floral"], sweetness: 2, intensity: 1, budgetMax: 15 },
  },
  {
    id: "regalo-cuidado",
    label: "Regalo para alguien que no conozco bien",
    answers: { occasion: "regalo", flavors: ["ahumado_roble", "terroso"], sweetness: 1, intensity: 2, budgetMax: 30 },
  },
];
