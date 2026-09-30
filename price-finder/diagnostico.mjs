// Prueba cada integración real por separado y dice cuál falla y por qué. No imprime llaves.
// Uso: ANTHROPIC_API_KEY=... [AMAZON_*=...] [MELI_ACCESS_TOKEN=...] node diagnostico.mjs [foto.jpg] ["búsqueda"]
import { makeClaudeIdentify } from "./claude-identify.js";
import { makeAmazon } from "./amazon.js";
import { makeMercadoLibre } from "./mercadolibre.js";
import { normalizeQuery, matchScore } from "./pipeline.js";

const [photo, queryArg] = process.argv.slice(2);
const results = [];
const step = async (name, needs, fn) => {
  const missing = needs.filter((k) => !process.env[k]);
  if (missing.length) return results.push([name, "OMITIDO", `faltan ${missing.join(", ")}`]);
  try { results.push([name, "OK", await fn()]); } catch (e) { results.push([name, "FALLÓ", String(e.message ?? e).slice(0, 300)]); }
};

let query = queryArg ?? "sony wh-1000xm5 black";
await step("Claude (identificar imagen)", ["ANTHROPIC_API_KEY"], async () => {
  if (!photo) throw new Error("pasa una foto: node diagnostico.mjs foto.jpg");
  const name = await makeClaudeIdentify()(photo);
  if (!queryArg) query = normalizeQuery(name);
  return `identificó: "${name}"`;
});

const shop = (name, needs, store) => step(name, needs, async () => {
  const offers = await store.search(query);
  const good = offers.filter((o) => matchScore(query, o.title) >= 0.75);
  if (!offers.length) throw new Error(`la API respondió pero sin resultados para "${query}"`);
  const o = good[0] ?? offers[0];
  return `${offers.length} resultados (${good.length} coinciden); ej.: "${o.title}" $${o.price} ${o.url}`;
});
await shop("Mercado Libre", [], makeMercadoLibre()); // token opcional
await shop("Amazon", ["AMAZON_ACCESS_KEY", "AMAZON_SECRET_KEY", "AMAZON_PARTNER_TAG"], makeAmazon());

console.log(`Búsqueda usada: "${query}"\n`);
for (const [n, s, d] of results) console.log(`${s === "OK" ? "✔" : s === "OMITIDO" ? "–" : "✘"} ${n}: ${s}\n    ${d}`);
const hint = results.find(([n, s, d]) => s === "FALLÓ" && /403|401/.test(d));
if (hint) console.log(`\nPista: ${hint[0]} devolvió 401/403 → revisa llaves/token (en Amazon, además la firma SigV4 y que PA-API siga activa para tu cuenta).`);
process.exit(results.some(([, s]) => s === "FALLÓ") ? 1 : 0);
