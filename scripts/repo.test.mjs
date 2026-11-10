import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  classifyRef,
  collectBuildIssues,
  collectInvariantIssues,
  collectLintIssues,
  parseHtml,
  secretHits,
} from "./lib.mjs";

test("Telefon und Maps-Parameter sind keine Secrets", () => {
  assert.deepEqual(secretHits("tel:+499836441"), []);
  assert.deepEqual(secretHits("https://www.google.com/maps/dir/?api=1&destination=Gasthaus"), []);
});

test("erkennbare Tokens schlagen an", () => {
  const aws = ["AKIA", "IOSFODNN7EXAMPLE"].join("");
  assert.ok(secretHits(aws).includes("AWS-Access-Key"));
  const assigned = ["api", "_key"].join("") + ": \"" + "abcdefghij" + "\"";
  assert.ok(secretHits(assigned).includes("zugewiesenes Geheimnis"));
  const header = "-----BEGIN " + "PRIVATE KEY-----";
  assert.ok(secretHits(header).includes("privater Schlüssel"));
});

test("Testdatei selbst enthält keine Secret-Literale", () => {
  const src = fs.readFileSync(new URL("./repo.test.mjs", import.meta.url), "utf8");
  assert.deepEqual(secretHits(src), []);
});

test("relative Verweise bleiben im Projekt", () => {
  assert.deepEqual(classifyRef("index.html", "kontakt.html#reservierung"), {
    external: false,
    file: "kontakt.html",
    hash: "reservierung",
  });
  assert.equal(classifyRef("index.html", "#angebote").file, "index.html");
  assert.equal(classifyRef("index.html", "tel:+499836441").external, true);
  assert.equal(classifyRef("style.css", "assets/fonts/source-sans-3-400.woff2").file, "assets/fonts/source-sans-3-400.woff2");
  assert.ok(classifyRef("index.html", "javascript:alert(1)").error);
  assert.ok(classifyRef("index.html", "../geheim.html").error);
});

test("HTML meldet unpassende Endetags", () => {
  const doc = parseHtml("<p>Hallo</div>");
  assert.ok(doc.issues.length > 0);
});

test("Lint, Invarianten und Build des Repos sind grün", () => {
  assert.deepEqual(collectLintIssues(), []);
  assert.deepEqual(collectInvariantIssues(), []);
  assert.deepEqual(collectBuildIssues(), []);
});
