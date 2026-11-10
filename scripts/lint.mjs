import { collectLintIssues } from "./lib.mjs";

const issues = collectLintIssues();
if (issues.length > 0) {
  for (const issue of issues) console.error(issue);
  console.error(`Lint: ${issues.length} Problem(e)`);
  process.exit(1);
}
console.log("Lint: ok");
