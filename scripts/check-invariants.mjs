import { collectInvariantIssues } from "./lib.mjs";

const issues = collectInvariantIssues();
if (issues.length > 0) {
  for (const issue of issues) console.error(issue);
  console.error(`Invarianten: ${issues.length} Problem(e)`);
  process.exit(1);
}
console.log("Invarianten: ok");
