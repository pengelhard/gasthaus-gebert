# Gasthaus Gebert

## Zweck

Statische Demo-Website für das Gasthaus Gebert in Obermögersheim, Wassertrüdingen. Sie stellt Gastronomie, Speisekarte, eigene Herstellung, Familienfeiern, Catering, Kegelbahn und Kontakt vor. Vieles ist noch Platzhalter und in den Seiten so gekennzeichnet. Die Seiten setzen `noindex, nofollow`, `robots.txt` sperrt die Indexierung.

## Aufbau

- `index.html`, `gasthaus.html`, `speisekarte.html`, `herstellung.html`, `familienfeiern.html`, `catering.html`, `kegelbahn.html`, `kontakt.html`, `impressum.html`, `datenschutz.html`: je eine Seite. Kopf, Demo-Leiste, Fuß und Anrufleiste sind auf jeder Seite wiederholt.
- `style.css`: Gestaltung und die lokal geladenen Schriften.
- `site.js`: Menü, Demo-Formulare, Einsetzen freigegebener Inhalte.
- `inhalte.js`: Pflegequelle für Öffnungszeiten, Speisekarte, Getränke und Catering. Sichtbar nur, wenn `freigegeben` true ist und die Liste nicht leer ist. Adresse und Telefon stehen im HTML, nicht hier.
- `assets/`: Logo, Favicons, Schriftdateien, Lizenzen der Schriften.
- `robots.txt`: `Disallow: /`.
- `.nojekyll`: GitHub Pages soll die Dateien nicht mit Jekyll bauen.
- Prüfkette: `package.json` (`npm run verify`), `scripts/`, `.github/workflows/verify.yml`. Die Dateien kommen mit dem PR, der die Prüfkette ergänzt.

## Hosting

Aus dem Repo erkennbar:

- `.nojekyll` liegt im Wurzelverzeichnis. Die Seite ist für GitHub Pages ohne Jekyll ausgelegt.
- `index.html` und `kontakt.html` nennen in den strukturierten Daten die URL `https://pengelhard.github.io/gasthaus-gebert/`.
- Kein `vercel.json`, kein `netlify.toml`, kein `CNAME`, kein Deploy-Workflow.

An der Repo-Einstellung geprüft, nicht im Git gespeichert: GitHub Pages nimmt den Branch `main`, Pfad `/`, Build-Typ `legacy`, und liefert `https://pengelhard.github.io/gasthaus-gebert/` aus. Ein Merge auf `main` startet diesen Build. Das ist der Live-Stand. Eine Vorschau-Umgebung gibt es im Repo nicht.

Offen: Ob außer GitHub Pages ein weiterer Hoster hängt, steht nicht im Repo.

## Regeln

- Vorschau zuerst. Die geänderten HTML-Seiten lokal im Browser öffnen, direkt als Datei oder über einen einfachen Static-Server. `main` nicht als Vorschau benutzen.
- Live nur mit Peters OK. Ein Merge auf `main` veröffentlicht die Seite. Nicht mergen und nicht deployen, ohne dass Peter zustimmt.
- Keine Secrets. Keine Zugangsdaten, Token oder privaten Schlüssel ins Repo, in die Seiten, in CI oder in Commit-Nachrichten.
- Kleine atomare PRs. Eine Sache pro PR.
- Code lesen statt raten. Was die Dateien nicht hergeben, als offen markieren und nicht erfinden.
- Regressionsbefehl: `npm run verify`. Lokal und in CI derselbe Befehl: Lint, Typecheck (entfällt, kein TypeScript), Tests, statischer Build ohne Zugangsdaten, Invarianten.
- Pflicht-Selbstprüfung im PR. Den Abschnitt „Selbstprüfung“ aus der PR-Vorlage ausfüllen, einschließlich des Ergebnisses von `npm run verify`.

Die Demo-Sperre (`noindex, nofollow` und `Disallow: /`) ist eine Invariante der Prüfkette. Wer sie für einen echten Livegang aufhebt, ändert Seiten und Prüfung im selben PR und nur mit Peters OK.

## Offen

- Impressum und Datenschutz nennen den Betreiber noch nicht.
- Adresse und Telefon sind in den Seiten als unbestätigt markiert.
- Ob `npm run verify` ein Pflicht-Check vor dem Merge wird, ist eine Einstellung am Repo. Heute hält ein roter Lauf den Pages-Deploy nicht auf.
