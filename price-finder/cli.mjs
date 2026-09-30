import { findBestPrice, formatMoney } from "./pipeline.js";
import { demoIdentify, demoStores } from "./demo-adapters.js";
import { makeAmazon } from "./amazon.js";
import { makeMercadoLibre } from "./mercadolibre.js";
import { makeClaudeIdentify } from "./claude-identify.js";

// Con ANTHROPIC_API_KEY identifica la imagen con Claude; sin ella usa el identificador demo.
const identify = process.env.ANTHROPIC_API_KEY ? makeClaudeIdentify() : demoIdentify;

const r = await findBestPrice(process.argv[2] ?? "foto.jpg", { identify, stores: process.env.LIVE_STORES ? [makeAmazon(), makeMercadoLibre()] : demoStores });
console.log(`Producto: ${r.product}\nBúsqueda: ${r.query}\n`);
r.ranked.forEach((o, i) => console.log(`${i + 1}. ${o.store.padEnd(14)} ${formatMoney(o.total).padStart(9)}  ${o.url}`));
r.errors.forEach((e) => console.log(`! ${e.store}: ${e.error}`));
console.log(r.best ? `\nMEJOR PRECIO: ${r.best.store} ${formatMoney(r.best.total)}  [Ver producto] ${r.best.url}` : "\nSin ofertas.");
