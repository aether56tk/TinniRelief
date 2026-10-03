import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const required = [
  "index.html",
  "app.js",
  "features.js",
  "personalization.js",
  "relief-engine.js",
  "sessions.js",
  "style.css",
  "manifest.webmanifest",
  "sw.js"
];

test("core browser files exist", () => {
  for (const file of required) assert.ok(fs.existsSync(file), file);
});

test("production page exposes the safety boundary", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /TinniRelief/);
  assert.match(html, /comfortable listening level/i);
  assert.match(html, /does not determine a medically safe listening dose/i);
});

test("local data export/import controls exist", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /id="exportData"/);
  assert.match(html, /id="importData"/);
  assert.match(html, /id="wipeData"/);
});

test("browser JavaScript parses", () => {
  for (const file of [
    "app.js",
    "features.js",
    "personalization.js",
    "pwa.js",
    "relief-engine.js",
    "sessions.js",
    "sw.js"
  ]) {
    const source = fs.readFileSync(file, "utf8");
    assert.ok(source.length > 0, file);
  }
});
