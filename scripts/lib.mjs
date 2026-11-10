import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const NAV_HREFS = [
  "index.html",
  "gasthaus.html",
  "speisekarte.html",
  "herstellung.html",
  "familienfeiern.html",
  "catering.html",
  "kegelbahn.html",
  "kontakt.html",
];

export const PAGE_ASSETS = ["style.css", "inhalte.js", "site.js"];

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const RAW = new Set(["script", "style", "textarea", "title"]);

const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".woff", ".woff2", ".ttf", ".eot", ".otf", ".pdf", ".zip",
]);

const SECRET_PATTERNS = [
  { name: "privater Schlüssel", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS-Access-Key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub-Token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  { name: "GitHub-PAT", re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "Slack-Token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: "Stripe-Live-Key", re: /\bsk_live_[A-Za-z0-9]{10,}\b/ },
  { name: "Google-API-Key", re: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { name: "OpenAI-Key", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: "npm-Token", re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: "Bearer-Token", re: /\bBearer\s+[A-Za-z0-9\-._~+/]{20,}/ },
  {
    name: "zugewiesenes Geheimnis",
    re: /\b(?:api[_-]?key|apikey|secret|token|password|passwd)\b\s*[:=]\s*['"][^'"]{6,}['"]/i,
  },
];

const ALLOWED_SCHEMES = new Set(["http:", "https:", "tel:", "mailto:"]);

export function listHtmlFiles() {
  return fs.readdirSync(root).filter((name) => name.endsWith(".html")).sort();
}

export function walkFiles(start = root) {
  const out = [];
  function walk(abs, rel) {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (ent.name === ".git" || ent.name === "node_modules") continue;
      const childRel = rel ? `${rel}/${ent.name}` : ent.name;
      const childAbs = path.join(abs, ent.name);
      if (ent.isDirectory()) walk(childAbs, childRel);
      else out.push({ abs: childAbs, rel: childRel, name: ent.name });
    }
  }
  walk(start, "");
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function scriptSources() {
  return walkFiles()
    .map((file) => file.rel)
    .filter((rel) => rel.endsWith(".js") || rel.endsWith(".mjs"))
    .sort();
}

export function secretHits(text) {
  return SECRET_PATTERNS.filter((pattern) => pattern.re.test(text)).map((pattern) => pattern.name);
}

export function forbiddenFilename(name) {
  if (name === ".env" || name.startsWith(".env.")) return true;
  if (/^(id_rsa|id_dsa|id_ecdsa|id_ed25519)/.test(name)) return true;
  if (name === "credentials.json") return true;
  return /\.(pem|p12|pfx|key)$/i.test(name);
}

export function classifyRef(fromFile, raw) {
  const value = String(raw).trim();
  if (!value) return { error: "leer" };
  if (value.startsWith("//")) return { error: "protokollrelativ" };
  const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(value);
  if (scheme) {
    const name = scheme[1].toLowerCase();
    if (!ALLOWED_SCHEMES.has(name)) return { error: `Schema ${name} nicht erlaubt` };
    return { external: true, scheme: name };
  }
  let pathPart = value;
  let hash = "";
  const hashAt = pathPart.indexOf("#");
  if (hashAt >= 0) {
    hash = pathPart.slice(hashAt + 1);
    pathPart = pathPart.slice(0, hashAt);
  }
  pathPart = pathPart.split("?")[0];
  if (!pathPart) return { external: false, file: fromFile, hash };
  let decoded;
  try {
    decoded = decodeURIComponent(pathPart);
  } catch {
    return { error: "kaputte Prozentkodierung" };
  }
  if (decoded.startsWith("/") || decoded.includes("\\")) {
    return { error: "Pfad ist nicht relativ" };
  }
  const file = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decoded));
  if (!file || file.startsWith("..") || path.posix.isAbsolute(file)) {
    return { error: "Pfad verlässt das Projekt" };
  }
  return { external: false, file, hash };
}

function bump(counter, text) {
  for (const ch of text) if (ch === "\n") counter.line += 1;
}

export function parseHtml(html) {
  const issues = [];
  const ids = new Map();
  const refs = [];
  const forms = [];
  const robots = [];
  const ariaCurrents = [];
  const navHrefs = [];
  const counter = { line: 1 };
  const stack = [];
  let i = 0;
  let lang = "";
  let charset = false;
  let viewport = "";
  let title = "";
  let titleCount = 0;
  let mainInhalt = 0;

  function addId(value) {
    if (!value) return;
    const next = (ids.get(value) || 0) + 1;
    ids.set(value, next);
    if (next > 1) issues.push(`Zeile ${counter.line}: id "${value}" mehrfach`);
  }

  while (i < html.length) {
    if (html[i] !== "<") {
      if (html[i] === "\n") counter.line += 1;
      i += 1;
      continue;
    }

    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      if (end < 0) {
        issues.push(`Zeile ${counter.line}: Kommentar nicht geschlossen`);
        break;
      }
      bump(counter, html.slice(i, end + 3));
      i = end + 3;
      continue;
    }

    if (html.startsWith("<!", i) || html.startsWith("<?", i)) {
      const end = html.indexOf(">", i + 2);
      if (end < 0) {
        issues.push(`Zeile ${counter.line}: Deklaration nicht geschlossen`);
        break;
      }
      bump(counter, html.slice(i, end + 1));
      i = end + 1;
      continue;
    }

    if (html.startsWith("</", i)) {
      const match = /^<\/([A-Za-z][A-Za-z0-9:-]*)\s*>/.exec(html.slice(i));
      if (!match) {
        issues.push(`Zeile ${counter.line}: ungültiges Endetag`);
        i += 1;
        continue;
      }
      const name = match[1].toLowerCase();
      bump(counter, match[0]);
      const top = stack.pop();
      if (!top) issues.push(`Zeile ${counter.line}: </${name}> ohne öffnendes Tag`);
      else if (top.name !== name) {
        issues.push(`Zeile ${counter.line}: </${name}> schließt <${top.name}> von Zeile ${top.line}`);
      }
      i += match[0].length;
      continue;
    }

    const nameMatch = /^<([A-Za-z][A-Za-z0-9:-]*)/.exec(html.slice(i));
    if (!nameMatch) {
      if (html[i] === "\n") counter.line += 1;
      i += 1;
      continue;
    }

    const name = nameMatch[1].toLowerCase();
    const tagLine = counter.line;
    let j = i + nameMatch[0].length;
    const attrs = new Map();
    let selfClosing = false;
    let broken = false;

    while (j < html.length) {
      while (j < html.length && /[\t\n\f\r ]/.test(html[j])) {
        if (html[j] === "\n") counter.line += 1;
        j += 1;
      }
      if (j >= html.length) {
        issues.push(`Zeile ${tagLine}: <${name}> nicht geschlossen`);
        broken = true;
        break;
      }
      if (html[j] === "/" && html[j + 1] === ">") {
        selfClosing = true;
        j += 2;
        break;
      }
      if (html[j] === ">") {
        j += 1;
        break;
      }
      const attrMatch = /^[^\s=/>]+/.exec(html.slice(j));
      if (!attrMatch) {
        issues.push(`Zeile ${counter.line}: Attribut an <${name}> nicht lesbar`);
        broken = true;
        break;
      }
      const attrName = attrMatch[0].toLowerCase();
      j += attrMatch[0].length;
      while (j < html.length && /[\t\n\f\r ]/.test(html[j])) {
        if (html[j] === "\n") counter.line += 1;
        j += 1;
      }
      if (html[j] !== "=") {
        attrs.set(attrName, "");
        continue;
      }
      j += 1;
      while (j < html.length && /[\t\n\f\r ]/.test(html[j])) {
        if (html[j] === "\n") counter.line += 1;
        j += 1;
      }
      let value = "";
      const quote = html[j];
      if (quote === '"' || quote === "'") {
        j += 1;
        const start = j;
        while (j < html.length && html[j] !== quote) {
          if (html[j] === "\n") counter.line += 1;
          j += 1;
        }
        value = html.slice(start, j);
        if (html[j] === quote) j += 1;
        else {
          issues.push(`Zeile ${tagLine}: Attribut ${attrName} nicht geschlossen`);
          broken = true;
          break;
        }
      } else {
        const start = j;
        while (j < html.length && !/[\t\n\f\r >]/.test(html[j])) j += 1;
        value = html.slice(start, j);
      }
      attrs.set(attrName, value);
    }

    if (broken) break;
    i = j;

    if (attrs.has("id")) addId(attrs.get("id"));
    for (const attr of ["href", "src"]) {
      if (attrs.has(attr)) refs.push({ attr, value: attrs.get(attr), line: tagLine });
    }
    if (attrs.has("aria-current")) {
      ariaCurrents.push({
        value: attrs.get("aria-current"),
        href: attrs.get("href") || "",
        inNav: stack.some((frame) => frame.hauptnav),
        line: tagLine,
      });
    }
    if (name === "html") lang = attrs.get("lang") || "";
    if (name === "img" && !attrs.has("alt")) issues.push(`Zeile ${tagLine}: img ohne alt`);
    if (name === "meta") {
      if ((attrs.get("charset") || "").toLowerCase() === "utf-8") charset = true;
      if ((attrs.get("name") || "").toLowerCase() === "viewport") viewport = attrs.get("content") || "";
      if ((attrs.get("name") || "").toLowerCase() === "robots") robots.push(attrs.get("content") || "");
    }
    if (name === "main" && attrs.get("id") === "inhalt") mainInhalt += 1;
    if (name === "a" && stack.some((frame) => frame.hauptnav)) {
      navHrefs.push({
        href: attrs.get("href") || "",
        current: attrs.get("aria-current") || "",
        line: tagLine,
      });
    }

    let formIndex = null;
    if (name === "form") {
      forms.push({
        line: tagLine,
        action: attrs.has("action") ? attrs.get("action") : null,
        method: (attrs.get("method") || "").toLowerCase(),
        demo: attrs.has("data-demo-form"),
        submits: [],
      });
      formIndex = forms.length - 1;
    }
    const openForm = [...stack].reverse().find((frame) => frame.formIndex != null);
    if (openForm && name === "button") {
      const type = (attrs.get("type") || "submit").toLowerCase();
      if (type === "submit") {
        forms[openForm.formIndex].submits.push({
          disabled: attrs.has("disabled"),
          line: tagLine,
        });
      }
    }

    if (RAW.has(name)) {
      const close = new RegExp(`</${name}\\s*>`, "i");
      const rest = html.slice(i);
      const found = close.exec(rest);
      if (!found) {
        issues.push(`Zeile ${tagLine}: <${name}> nicht geschlossen`);
        break;
      }
      const inner = rest.slice(0, found.index);
      if (name === "title") {
        title += inner;
        titleCount += 1;
      }
      bump(counter, rest.slice(0, found.index + found[0].length));
      i += found.index + found[0].length;
      continue;
    }

    if (!selfClosing && !VOID.has(name)) {
      stack.push({
        name,
        line: tagLine,
        hauptnav: name === "nav" && attrs.get("id") === "hauptnav",
        formIndex,
      });
    }
  }

  for (const frame of stack) {
    issues.push(`Zeile ${frame.line}: <${frame.name}> nicht geschlossen`);
  }

  return {
    issues,
    ids,
    refs,
    forms,
    robots,
    ariaCurrents,
    navHrefs,
    lang,
    charset,
    viewport,
    title: title.trim(),
    titleCount,
    mainInhalt,
  };
}

export function cssReport(css) {
  const issues = [];
  const urls = [];
  let i = 0;
  let line = 1;
  let quote = null;
  const braces = [];
  const parens = [];
  const brackets = [];

  while (i < css.length) {
    const ch = css[i];
    if (quote) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === "\n") line += 1;
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end < 0) {
        issues.push(`Zeile ${line}: CSS-Kommentar nicht geschlossen`);
        return { issues, urls };
      }
      const chunk = css.slice(i, end + 2);
      line += chunk.split("\n").length - 1;
      i = end + 2;
      continue;
    }
    if (ch === "\n") line += 1;
    if (ch === "'" || ch === '"') {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === "{") braces.push(line);
    else if (ch === "}") {
      if (braces.length === 0) issues.push(`Zeile ${line}: überschüssige }`);
      else braces.pop();
    } else if (ch === "(") parens.push(line);
    else if (ch === ")") {
      if (parens.length === 0) issues.push(`Zeile ${line}: überschüssige )`);
      else parens.pop();
    } else if (ch === "[") brackets.push(line);
    else if (ch === "]") {
      if (brackets.length === 0) issues.push(`Zeile ${line}: überschüssige ]`);
      else brackets.pop();
    }
    if (css.slice(i, i + 4).toLowerCase() === "url(") {
      urls.push({ value: readCssUrl(css, i), line });
    }
    i += 1;
  }

  if (quote) issues.push("CSS-Zeichenkette nicht geschlossen");
  for (const open of braces) issues.push(`Zeile ${open}: { nicht geschlossen`);
  for (const open of parens) issues.push(`Zeile ${open}: ( nicht geschlossen`);
  for (const open of brackets) issues.push(`Zeile ${open}: [ nicht geschlossen`);
  if (/@import\b/i.test(css)) issues.push("CSS enthält @import");
  return { issues, urls };
}

function readCssUrl(css, i) {
  let j = i + 4;
  while (j < css.length && /[\t\n\f\r ]/.test(css[j])) j += 1;
  if (css[j] === '"' || css[j] === "'") {
    const quote = css[j];
    const start = j + 1;
    const end = css.indexOf(quote, start);
    return end < 0 ? "" : css.slice(start, end);
  }
  const start = j;
  while (j < css.length && css[j] !== ")") j += 1;
  return css.slice(start, j).trim();
}

function readText(abs) {
  const buf = fs.readFileSync(abs);
  if (buf.includes(0)) return null;
  return buf.toString("utf8");
}

export function collectLintIssues() {
  const issues = [];
  for (const rel of scriptSources()) {
    const result = spawnSync(process.execPath, ["--check", path.join(root, rel)], { encoding: "utf8" });
    if (result.status !== 0) {
      const detail = (result.stderr || result.stdout || "Syntaxfehler").trim();
      issues.push(`${rel}: ${detail}`);
    }
  }

  for (const rel of listHtmlFiles()) {
    const html = fs.readFileSync(path.join(root, rel), "utf8");
    if (!/^\s*<!doctype html\s*>/i.test(html)) issues.push(`${rel}: Doctype fehlt`);
    const doc = parseHtml(html);
    if (doc.lang !== "de") issues.push(`${rel}: html lang ist "${doc.lang || "leer"}"`);
    if (!doc.charset) issues.push(`${rel}: charset utf-8 fehlt`);
    if (!doc.viewport.includes("width=device-width")) issues.push(`${rel}: Viewport fehlt`);
    if (doc.titleCount !== 1 || !doc.title) issues.push(`${rel}: genau ein Titel erwartet`);
    if (doc.mainInhalt !== 1) issues.push(`${rel}: genau ein main#inhalt erwartet`);
    for (const issue of doc.issues) issues.push(`${rel}: ${issue}`);
  }

  const cssPath = path.join(root, "style.css");
  if (!fs.existsSync(cssPath)) issues.push("style.css fehlt");
  else {
    for (const issue of cssReport(fs.readFileSync(cssPath, "utf8")).issues) {
      issues.push(`style.css: ${issue}`);
    }
  }
  return issues;
}

function parsedPages() {
  const pages = new Map();
  for (const rel of listHtmlFiles()) {
    pages.set(rel, parseHtml(fs.readFileSync(path.join(root, rel), "utf8")));
  }
  return pages;
}

function localTargetIssues(fromFile, raw, pages) {
  const ref = classifyRef(fromFile, raw);
  if (ref.external) return [];
  if (ref.error) return [`${fromFile}: Verweis "${raw}" (${ref.error})`];
  if (!fs.existsSync(path.join(root, ref.file))) {
    return [`${fromFile}: Ziel fehlt für "${raw}" (${ref.file})`];
  }
  if (!ref.hash) return [];
  if (!ref.file.endsWith(".html")) {
    return [`${fromFile}: Fragment #${ref.hash} zeigt nicht auf HTML (${raw})`];
  }
  const target = pages.get(ref.file);
  if (!target || !target.ids.has(ref.hash)) {
    return [`${fromFile}: Anker #${ref.hash} fehlt in ${ref.file}`];
  }
  return [];
}

export const JEKYLL_EXCLUDES = [
  "AGENTS.md",
  "README*",
  "*.md",
  "docs/",
  "scripts/",
  "package.json",
  "package-lock.json",
  "node_modules/",
  ".github/",
  ".gitignore",
  "Gemfile",
  "Gemfile.lock",
  "vendor/",
];

export const JEKYLL_SWITCHES = [
  "optional_front_matter.enabled",
  "readme_index.enabled",
  "titles_from_headings.enabled",
  "relative_links.enabled",
];

function unquoteYaml(raw) {
  if (
    (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) ||
    (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2)
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function parseJekyllConfig(text) {
  const exclude = [];
  const switches = {};
  let themeNull = false;
  let inExclude = false;
  let section = null;

  for (const line of String(text).split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;

    if (!/^\s/.test(line)) {
      const top = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
      inExclude = false;
      section = null;
      if (!top) continue;
      const key = top[1];
      const raw = top[2].trim();
      if (key === "exclude" && raw === "") {
        inExclude = true;
        continue;
      }
      if (key === "theme") {
        themeNull = raw === "null" || raw === "~";
        continue;
      }
      if (raw === "") section = key;
      continue;
    }

    if (inExclude) {
      const item = /^\s+-\s+(\S+)\s*$/.exec(line);
      if (!item) {
        inExclude = false;
      } else {
        exclude.push(unquoteYaml(item[1]));
        continue;
      }
    }

    if (section) {
      const nested = /^\s+([A-Za-z0-9_]+):\s*(\S+)\s*$/.exec(line);
      if (!nested) continue;
      const value = nested[2];
      let parsed = unquoteYaml(value);
      if (value === "true") parsed = true;
      if (value === "false") parsed = false;
      switches[`${section}.${nested[1]}`] = parsed;
    }
  }

  return { exclude, switches, themeNull };
}

function hasYamlHeader(abs) {
  const buf = Buffer.alloc(16);
  const fd = fs.openSync(abs, "r");
  let n = 0;
  try {
    n = fs.readSync(fd, buf, 0, buf.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  return /^---[ \t]*\r?\n/.test(buf.subarray(0, n).toString("latin1"));
}

export function publishedSiteRels() {
  return walkFiles()
    .map((file) => file.rel)
    .filter((rel) => {
      if (rel.startsWith("assets/")) return true;
      if (rel === "style.css" || rel === "inhalte.js" || rel === "site.js" || rel === "robots.txt") {
        return true;
      }
      return rel.endsWith(".html") && !rel.includes("/");
    });
}

export function collectJekyllPublishIssues() {
  const issues = [];
  if (fs.existsSync(path.join(root, ".nojekyll"))) {
    issues.push(".nojekyll darf nicht existieren: GitHub Pages würde Jekyll überspringen und den Branch veröffentlichen");
  }

  const configPath = path.join(root, "_config.yml");
  if (!fs.existsSync(configPath)) {
    issues.push("_config.yml fehlt");
    return issues;
  }

  const parsed = parseJekyllConfig(fs.readFileSync(configPath, "utf8"));
  if (!parsed.themeNull) {
    issues.push("_config.yml: theme muss null sein, sonst setzt GitHub Pages jekyll-theme-primer");
  }
  for (const key of JEKYLL_SWITCHES) {
    if (parsed.switches[key] !== false) issues.push(`_config.yml: ${key} muss false sein`);
  }
  for (const entry of JEKYLL_EXCLUDES) {
    if (!parsed.exclude.includes(entry)) issues.push(`_config.yml: exclude enthält "${entry}" nicht`);
  }
  for (const entry of parsed.exclude) {
    if (!JEKYLL_EXCLUDES.includes(entry)) issues.push(`_config.yml: exclude "${entry}" ist nicht vorgesehen`);
  }
  const seen = new Set();
  for (const entry of parsed.exclude) {
    if (seen.has(entry)) issues.push(`_config.yml: exclude "${entry}" doppelt`);
    seen.add(entry);
  }

  for (const rel of publishedSiteRels()) {
    for (const segment of rel.split("/")) {
      if (/^[._#~]/.test(segment) || segment.endsWith("~")) {
        issues.push(`${rel}: Jekyll übernimmt Namen mit . _ # ~ am Anfang oder ~ am Ende nicht`);
      }
    }
    if (hasYamlHeader(path.join(root, rel))) {
      issues.push(`${rel}: beginnt mit Front Matter und würde von Jekyll verarbeitet`);
    }
  }

  return issues;
}

export function collectInvariantIssues() {
  const issues = [];
  issues.push(...collectJekyllPublishIssues());
  const pages = parsedPages();

  for (const [file, doc] of pages) {
    for (const ref of doc.refs) issues.push(...localTargetIssues(file, ref.value, pages));

    const values = new Set(doc.refs.map((ref) => ref.value));
    for (const asset of PAGE_ASSETS) {
      if (!values.has(asset)) issues.push(`${file}: ${asset} ist nicht eingebunden`);
    }

    if (doc.robots.length !== 1 || doc.robots[0] !== "noindex, nofollow") {
      issues.push(`${file}: robots soll "noindex, nofollow" sein`);
    }

    const hrefs = doc.navHrefs.map((link) => link.href);
    if (hrefs.join("|") !== NAV_HREFS.join("|")) {
      issues.push(`${file}: Hauptnavigation weicht ab`);
    }
    const inNav = NAV_HREFS.includes(file);
    const currents = doc.ariaCurrents;
    if (inNav) {
      if (
        currents.length !== 1 ||
        currents[0].value !== "page" ||
        currents[0].href !== file ||
        !currents[0].inNav
      ) {
        issues.push(`${file}: aria-current soll genau auf ${file} stehen`);
      }
    } else if (currents.length !== 0) {
      issues.push(`${file}: aria-current ist nur auf Navigationsseiten erwartet`);
    }

    for (const form of doc.forms) {
      if (!form.demo || form.action !== "#" || form.method !== "post") {
        issues.push(`${file}: Formular in Zeile ${form.line} muss Demo bleiben (data-demo-form, action="#", method="post")`);
      }
      if (form.submits.length === 0 || form.submits.some((button) => !button.disabled)) {
        issues.push(`${file}: Absenden-Knopf in Zeile ${form.line} muss disabled bleiben`);
      }
    }
  }

  const robotsPath = path.join(root, "robots.txt");
  const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8") : "";
  if (!/^User-agent:\s*\*/m.test(robots) || !/^Disallow:\s*\/\s*$/m.test(robots)) {
    issues.push("robots.txt soll die Demo mit Disallow: / sperren");
  }

  const cssPath = path.join(root, "style.css");
  if (fs.existsSync(cssPath)) {
    for (const url of cssReport(fs.readFileSync(cssPath, "utf8")).urls) {
      issues.push(...localTargetIssues("style.css", url.value, pages));
    }
  }

  for (const file of walkFiles()) {
    if (forbiddenFilename(file.name)) {
      issues.push(`${file.rel}: Dateiname sieht nach Zugangsdaten aus`);
      continue;
    }
    const ext = path.extname(file.name).toLowerCase();
    if (BINARY_EXT.has(ext)) continue;
    const text = readText(file.abs);
    if (text == null) continue;
    for (const hit of secretHits(text)) issues.push(`${file.rel}: mögliches Geheimnis (${hit})`);
    if (file.rel.startsWith(".github/") && /\$\{\{\s*secrets\./.test(text)) {
      issues.push(`${file.rel}: Workflow liest GitHub-Secrets`);
    }
    const envRead = ["process", "env"].join(".");
    if (file.rel.startsWith("scripts/") && file.rel.endsWith(".mjs") && !file.rel.endsWith(".test.mjs")) {
      if (text.includes(envRead)) issues.push(`${file.rel}: Prüfkette liest Umgebungsvariablen`);
    }
  }

  return issues;
}

export function collectBuildIssues() {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), "gasthaus-gebert-build-"));
  const issues = [];
  try {
    const files = [...listHtmlFiles(), "style.css", "inhalte.js", "site.js", "robots.txt"];
    for (const rel of files) {
      const source = path.join(root, rel);
      if (!fs.existsSync(source)) {
        issues.push(`Build: ${rel} fehlt`);
        continue;
      }
      fs.copyFileSync(source, path.join(dest, rel));
    }
    const assets = path.join(root, "assets");
    if (!fs.existsSync(assets)) issues.push("Build: assets/ fehlt");
    else fs.cpSync(assets, path.join(dest, "assets"), { recursive: true });

    if (!fs.existsSync(path.join(dest, "index.html"))) issues.push("Build: index.html fehlt in der Ausgabe");

    for (const file of walkFiles(dest)) {
      if (forbiddenFilename(file.name)) issues.push(`Build: ${file.rel} sieht nach Zugangsdaten aus`);
      const ext = path.extname(file.name).toLowerCase();
      if (BINARY_EXT.has(ext)) continue;
      const text = readText(file.abs);
      if (text == null) continue;
      for (const hit of secretHits(text)) issues.push(`Build: ${file.rel} mögliches Geheimnis (${hit})`);
    }
  } finally {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  return issues;
}
