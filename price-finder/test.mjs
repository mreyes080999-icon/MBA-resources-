import assert from "node:assert/strict";
import { normalizeQuery, matchScore, rankOffers, findBestPrice } from "./pipeline.js";
import { demoIdentify, demoStores } from "./demo-adapters.js";

assert.equal(normalizeQuery("  Audífonos SONY, WH-1000XM5!  "), "audifonos sony wh-1000xm5");
assert.ok(matchScore("sony wh-1000xm5 black", "Sony WH-1000XM4 Black") === 0); // modelo distinto se descarta
assert.deepEqual(rankOffers([{ title: "x", price: 1, inStock: false }], "x"), []);

const r = await findBestPrice("img", { identify: demoIdentify, stores: demoStores });
assert.equal(r.best.store, "Amazon"); 
assert.equal(r.ranked.length, 2); // XM4 y Walmart (sin stock) descartados

import { makeClaudeIdentify } from "./claude-identify.js";
import { writeFileSync } from "node:fs";
writeFileSync("/tmp/_t.png", "x");
let sent;
const fake = (text, ok = true) => async (_u, o) => { sent = JSON.parse(o.body); return { ok, status: ok ? 200 : 401, text: async () => "err", json: async () => ({ content: [{ type: "text", text }] }) }; };
assert.equal(await makeClaudeIdentify({ apiKey: "k", fetchImpl: fake(" Sony WH-1000XM5 Black ") })("/tmp/_t.png"), "Sony WH-1000XM5 Black");
assert.equal(sent.messages[0].content[0].source.media_type, "image/png");
await assert.rejects(makeClaudeIdentify({ apiKey: "k", fetchImpl: fake("UNKNOWN") })("/tmp/_t.png"), /No se pudo/);
await assert.rejects(makeClaudeIdentify({ apiKey: "k", fetchImpl: fake("x", false) })("/tmp/_t.png"), /401/);
await assert.rejects(makeClaudeIdentify({ apiKey: "" })("/tmp/_t.png"), /ANTHROPIC_API_KEY/);

import { makeMercadoLibre } from "./mercadolibre.js";
let url, hdr;
const meli = (body, ok = true) => async (u, o) => { url = u; hdr = o.headers; return { ok, status: ok ? 200 : 403, json: async () => body }; };
const rows = [{ title: "Sony WH-1000XM5 Black", price: 6199, permalink: "https://ml/x", available_quantity: 3 }, { title: "Sony WH-1000XM5 Black", price: 5000, permalink: "https://ml/y", available_quantity: 0 }];
const ml = makeMercadoLibre({ token: "T", fetchImpl: meli({ results: rows }) });
const got = await ml.search("sony wh-1000xm5 black");
assert.ok(url.includes("/sites/MLM/search?q=sony%20wh-1000xm5%20black") && hdr.authorization === "Bearer T");
assert.deepEqual(got.map((o) => [o.price, o.inStock, o.url]), [[6199, true, "https://ml/x"], [5000, false, "https://ml/y"]]);
const rr = await findBestPrice("i", { identify: demoIdentify, stores: [ml] });
assert.equal(rr.best.price, 6199); // el más barato está sin stock
const bad = await findBestPrice("i", { identify: demoIdentify, stores: [makeMercadoLibre({ fetchImpl: meli({}, false) })] });
assert.equal(bad.errors[0].store, "Mercado Libre");
console.log("OK");
