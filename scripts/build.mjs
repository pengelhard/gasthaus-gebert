import { collectBuildIssues } from "./lib.mjs";

const issues = collectBuildIssues();
if (issues.length > 0) {
  for (const issue of issues) console.error(issue);
  console.error("Build: fehlgeschlagen");
  process.exit(1);
}
console.log("Build: ok (statische Seiten, temporär geprüft, ohne Umgebungsvariablen und ohne Secrets)");
