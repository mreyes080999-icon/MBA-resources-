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

import { makeAmazon, signRequest } from "./amazon.js";
const fixed = new Date("2026-09-30T12:00:00Z");
const sig = () => signRequest({ host: "h", path: "/p", body: "{}", accessKey: "AK", secretKey: "SK", region: "us-east-1", target: "t", now: fixed });
const s1 = sig();
assert.equal(s1["x-amz-date"], "20260930T120000Z");
assert.match(s1.authorization, /^AWS4-HMAC-SHA256 Credential=AK\/20260930\/us-east-1\/ProductAdvertisingAPI\/aws4_request, SignedHeaders=content-encoding;content-type;host;x-amz-date;x-amz-target, Signature=[0-9a-f]{64}$/);
assert.equal(sig().authorization, s1.authorization); // determinista
assert.notEqual(signRequest({ host: "h", path: "/p", body: "{}", accessKey: "AK", secretKey: "OTRA", region: "us-east-1", target: "t", now: fixed }).authorization, s1.authorization);
let areq;
const azItems = [
  { DetailPageURL: "https://amzn/x", ItemInfo: { Title: { DisplayValue: "Sony WH-1000XM5 Black" } }, Offers: { Listings: [{ Price: { Amount: 6499 }, Availability: { Type: "Now" } }] } },
  { DetailPageURL: "https://amzn/z", ItemInfo: { Title: { DisplayValue: "Sony WH-1000XM5 Black" } } },
];
const az = makeAmazon({ accessKey: "AK", secretKey: "SK", partnerTag: "tag-20", now: fixed, fetchImpl: async (u, o) => { areq = { u, o }; return { ok: true, json: async () => ({ SearchResult: { Items: azItems } }) }; } });
const ag = await az.search("sony wh-1000xm5 black");
assert.equal(areq.u, "https://webservices.amazon.com.mx/paapi5/searchitems");
assert.equal(JSON.parse(areq.o.body).PartnerTag, "tag-20");
assert.deepEqual(ag.map((o) => [o.price, o.inStock, o.url]), [[6499, true, "https://amzn/x"]]); // sin oferta se omite
await assert.rejects(makeAmazon({ accessKey: "", secretKey: "", partnerTag: "" }).search("x"), /Faltan/);

import { makeServer } from "./server.mjs";
const srv = makeServer(() => ({ identify: demoIdentify, stores: demoStores, demo: true })).listen(0);
await new Promise((ok) => srv.once("listening", ok));
const base = `http://127.0.0.1:${srv.address().port}`;
assert.match(await (await fetch(base + "/")).text(), /^<!doctype html>/); // sirve HTML, no un Buffer serializado
const post = (image) => fetch(base + "/api/search", { method: "POST", body: JSON.stringify({ image }) });
const ok = await (await post("data:image/png;base64,eA==")).json();
assert.equal(ok.best.store, "Amazon");
assert.equal((await post("no-es-imagen")).status, 400);
srv.close();
console.log("OK");
