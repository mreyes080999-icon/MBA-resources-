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
console.log("OK");
