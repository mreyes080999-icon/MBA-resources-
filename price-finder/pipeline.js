// Imagen -> identificar producto -> normalizar -> tiendas en paralelo -> ranking -> mejor precio.
// Cada etapa es una función inyectable: identify(image) y stores[].search(query).

export function normalizeQuery(name) {
  return name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokens = (s) => normalizeQuery(s).split(" ").filter(Boolean);

// Fracción de tokens de la búsqueda presentes en el título; 0 si falta un token de modelo (con dígitos).
export function matchScore(query, title) {
  const q = tokens(query), t = new Set(tokens(title));
  if (!q.length || q.some((w) => /\d/.test(w) && !t.has(w))) return 0;
  return q.filter((w) => t.has(w)).length / q.length;
}

// Ordena por precio total (precio + envío) entre ofertas con coincidencia suficiente y en stock.
export function rankOffers(offers, query, { minMatch = 0.75 } = {}) {
  return offers
    .filter((o) => o.inStock !== false && matchScore(query, o.title) >= minMatch)
    .map((o) => ({ ...o, total: o.price + (o.shipping ?? 0) }))
    .sort((a, b) => a.total - b.total || b.matchScore - a.matchScore);
}

export async function findBestPrice(image, { identify, stores, minMatch }) {
  const product = await identify(image);
  const query = normalizeQuery(product);
  const settled = await Promise.allSettled(stores.map(async (s) =>
    (await s.search(query)).map((o) => ({ ...o, store: s.name, matchScore: matchScore(query, o.title) }))));
  const errors = settled.flatMap((r, i) => r.status === "rejected" ? [{ store: stores[i].name, error: String(r.reason) }] : []);
  const offers = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const ranked = rankOffers(offers, query, { minMatch });
  return { product, query, ranked, best: ranked[0] ?? null, errors };
}

export const formatMoney = (n, cur = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
