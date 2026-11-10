import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function run(label, script) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [path.join(here, script)], {
    cwd: root,
    stdio: "inherit",
  });
  return result.status === 0;
}

function runTests() {
  console.log("\n== Tests ==");
  const result = spawnSync(process.execPath, ["--test", path.join(here, "repo.test.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("Tests: fehlgeschlagen");
    return false;
  }
  console.log("Tests: ok");
  return true;
}

const lintOk = run("Lint", "lint.mjs");
console.log("\n== Typecheck ==");
console.log("Typecheck: entfällt (kein TypeScript im Repo)");
const testsOk = runTests();
const buildOk = run("Build", "build.mjs");
const invariantsOk = run("Invarianten", "check-invariants.mjs");

console.log("\n---");
console.log(`Lint: ${lintOk ? "ok" : "fehlgeschlagen"}`);
console.log("Typecheck: entfällt (kein TypeScript im Repo)");
console.log(`Tests: ${testsOk ? "ok" : "fehlgeschlagen"}`);
console.log(`Build: ${buildOk ? "ok" : "fehlgeschlagen"}`);
console.log(`Invarianten: ${invariantsOk ? "ok" : "fehlgeschlagen"}`);

if (!lintOk || !testsOk || !buildOk || !invariantsOk) {
  console.error("Ergebnis: rot");
  process.exit(1);
}
console.log("Ergebnis: grün");
