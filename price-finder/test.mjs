import assert from "node:assert/strict";
import { normalizeQuery, matchScore, rankOffers, findBestPrice } from "./pipeline.js";
import { demoIdentify, demoStores } from "./demo-adapters.js";

assert.equal(normalizeQuery("  Audífonos SONY, WH-1000XM5!  "), "audifonos sony wh-1000xm5");
assert.ok(matchScore("sony wh-1000xm5 black", "Sony WH-1000XM4 Black") === 0); // modelo distinto se descarta
assert.deepEqual(rankOffers([{ title: "x", price: 1, inStock: false }], "x"), []);

const r = await findBestPrice("img", { identify: demoIdentify, stores: demoStores });
assert.equal(r.best.store, "Amazon"); 
assert.equal(r.ranked.length, 2); // XM4 y Walmart (sin stock) descartados
console.log("OK");
