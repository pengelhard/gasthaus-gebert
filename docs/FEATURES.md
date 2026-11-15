# Funktionen

Abgeleitet aus dem Stand der HTML-, CSS- und JavaScript-Dateien. Was die Dateien nicht festlegen, steht unter Offen.

## Gemeinsam auf jeder Seite

Jede `*.html` im Wurzelverzeichnis hat dieselbe Hülle.

- Demo-Leiste (`.demo-leiste`): kennzeichnet den Entwurf und dass Telefon und Adresse zu bestätigen sind.
- Sprunglink auf `#inhalt`.
- Kopf: Logo nach `index.html`, Hauptnavigation `#hauptnav`, Anruf-Link `tel:+499836441` (angezeigt als 09836 441, Klasse `.bestaetigen`), Menü-Knopf `.menue-knopf`.
- Fuß: Logo, Claim, Adresse Obermögersheim 182, 91717 Wassertrüdingen, Telefon, Links auf `impressum.html` und `datenschutz.html`, Platzhalter für Instagram und Facebook.
- Anrufleiste `.rufleiste` mit demselben Telefonlink.
- Eingebunden: `style.css`, `inhalte.js`, `site.js`. Favicons unter `assets/`.
- Meta `robots` ist `noindex, nofollow`. `theme-color` ist `#185C0A`.

`aria-current="page"` steht nur in der Hauptnavigation und nur auf der Seite, die gerade offen ist. Impressum und Datenschutz haben keinen aktuellen Eintrag, sie liegen nicht in der Hauptnavigation.

Prüfen: eine Seite lokal öffnen. Navigation, Fuß und Anrufleiste sind sichtbar. In den DevTools oder im Seitenquelltext steht `noindex`. `npm run verify` prüft Navigation, Anker, Assets und die Demo-Sperre für alle Seiten.

## Menü

`site.js` sucht `.menue-knopf` und `#hauptnav`. Ein Klick setzt die Klasse `offen` und `aria-expanded`. Escape, ein Klick auf einen Navigationslink und ein Klick außerhalb schließen das Menü.

Prüfen: Fenster schmal ziehen, Menü öffnen, einen Link wählen, erneut öffnen und Escape drücken.

## Pflegequelle für wechselnde Inhalte

`inhalte.js` setzt `window.GASTHAUS_INHALTE`. `site.js` zeichnet sie in Elemente mit `data-inhalt`, aber nur wenn `freigegeben` true ist und die Liste Einträge hat. Sonst bleibt der Platzhalter im HTML.

| Schlüssel | Ziel | Form, aus dem Kommentar in `inhalte.js` |
| --- | --- | --- |
| `oeffnungszeiten` | `[data-inhalt="oeffnungszeiten"]` | `zeilen` aus `{ tag, zeit }`, optional `hinweis` |
| `speisekarte` | `[data-inhalt="speisekarte"]` | `kategorien` mit `titel` und `gerichte` (`name`, `beschreibung`, `preis`) |
| `getraenke` | `[data-inhalt="getraenke"]` | gleiche Form wie die Speisekarte |
| `catering` | `[data-inhalt="catering"]` | `angebote` aus `{ titel, text, preis }` |

Heute ist überall `freigegeben: false` und die Listen sind leer. Texte werden per `textContent` gesetzt.

Adresse und Telefon stehen zusätzlich im HTML. Der Kommentar in `inhalte.js` sagt, dass eine Änderung dort mitgezogen werden muss.

Prüfen: in einer lokalen Kopie `freigegeben` auf true setzen, einen Eintrag ergänzen, die passende Seite neu laden. Die Tabelle oder die Gerichte ersetzen den Platzhalter. Danach die Datei wieder auf den Demo-Stand bringen und nicht mit erfundenen Preisen committen.

## Demo-Formulare

Drei Formulare, alle `data-demo-form`, `method="post"`, `action="#"`, Absenden-Knopf `disabled`. `site.js` ruft bei `submit` `preventDefault` auf. Es ist kein Formulardienst angebunden.

| Seite | `id` | Zweck |
| --- | --- | --- |
| `familienfeiern.html` | `anfrage` | Feiern und Catering, Anlass ohne Vorauswahl |
| `catering.html` | `anfrage` | dasselbe Formular, Anlass „Catering außer Haus“ vorausgewählt |
| `kegelbahn.html` | `anfrage` | nur die Bahn, ohne Anlass-Auswahl |

Prüfen: Formular ausfüllen. Der Knopf lässt sich nicht drücken. In den DevTools bleibt `disabled` gesetzt.

## Startseite `index.html`

Abschnitte: `#top`, `#ueber`, `#angebote`, `#kueche`, `#herstellung`, `#feiern`, `#bewertungen`, `#kontakt` (darin `#zeiten` und `#anfahrt`), `#einladung`.

- Kacheln unter `#angebote` führen auf Gasthaus, Familienfeiern, Herstellung, Catering, Kegelbahn.
- Die Herstellungskachel hat die ID `schlachtung`. Darauf zeigt kein Link.
- „Tisch reservieren“ führt auf `kontakt.html#reservierung`.
- „Feier anfragen“ auf `familienfeiern.html#anfrage`, „Catering anfragen“ auf `catering.html#anfrage`.
- Öffnungszeiten stehen in `#zeiten` und kommen aus `inhalte.js` (`freigegeben: true`): Mo–Mi geschlossen, Do 11:00–20:00, Fr und Sa 11:00–21:00, So 10:00–20:00.
- Eine Karte gibt es auf der Startseite nicht. Der Link „Alle Bewertungen auf Google“ ist ein normaler Link, die Stimmen stehen als Text in der Seite.
- JSON-LD `@type` Restaurant, inklusive der GitHub-Pages-URL, Logo, Adresse, Telefon und `openingHoursSpecification` für die geöffneten Tage.
- Unter `#kueche` liegen vier Speisenfotos. Außenansicht, Gastraum, Saal, Kegelbahn, Biergarten, Catering und Herstellung bleiben Platzhalter.

Prüfen: `index.html` öffnen, jede Kachel und „Tisch reservieren“ anklicken, die Karte sehen, den Datenschutz-Hinweis lesen.

## Gasthaus `gasthaus.html`

Text zur Gaststube, Werteliste, Foto-Platzhalter, Links auf Speisekarte, Reservierung, Herstellung, Familienfeiern und Kontakt.

Prüfen: Seite öffnen, die vier Textlinks und den Kontakt-Knopf folgen.

## Speisekarte `speisekarte.html`

Platzhalter für Gerichte (`data-inhalt="speisekarte"`) und Getränke (`data-inhalt="getraenke"`). Darunter vier Speisenfotos, dieselben wie auf der Startseite. Keine Preise im HTML.

Prüfen: Seite öffnen, beide Platzhalter lesen. Mit einem lokalen Eintrag in `inhalte.js` erscheinen Kategorien, sonst nicht.

## Herstellung `herstellung.html`

Text zu Wurstwaren aus eigener Herstellung, Telefonlink, Foto-Platzhalter. Sortiment, Termine und Vorbestellung stehen nicht in der Datei.

Prüfen: Seite öffnen. Es gibt kein Formular und keine Produktliste.

## Familienfeiern `familienfeiern.html`

Text zu Feiern im Haus, Foto-Platzhalter, Formular `#anfrage`. Der Satz zur Kegelbahn verlinkt `kegelbahn.html` ohne `#anfrage`. Die Zielseite hat das Formular unter dieser ID.

Prüfen: `#anfrage` direkt öffnen. Das Formular ist deaktiviert. Der Kegelbahn-Link landet oben auf der Kegelseite.

## Catering `catering.html`

Text, Platzhalter `data-inhalt="catering"`, Formular `#anfrage` mit vorausgewähltem Catering. Link zurück auf `familienfeiern.html#anfrage`.

Prüfen: Seite öffnen, Vorauswahl im Feld Anlass ansehen, Link zur Feier-Seite folgen.

## Kegelbahn `kegelbahn.html`

Text: die Bahn liegt im Haus. Ein touristischer Eintrag wird als „vollautomatisch“ zitiert und mit „bitte bestätigen“ markiert. Bahnen, Dauer, Preise und Reservierungsart stehen nicht in der Datei. Es gibt kein Formular, die Reservierung läuft über das Telefon.

Prüfen: Seite öffnen und den Link auf `familienfeiern.html#anfrage` folgen.

## Kontakt `kontakt.html`

`#reservierung` sagt, dass es keine Online-Reservierung gibt und ein Anruf genügt. Dieselbe Adresse und dasselbe Telefon wie auf den anderen Seiten. `#anfahrt` mit der Google-Maps-Karte, nur auf dieser Seite. `#zeiten` mit denselben Öffnungszeiten wie auf der Startseite. Die E-Mail-Adresse fehlt noch, der Inhaber ist im Impressum genannt. Platzhalter für Parken, Bus und Social-Profile. JSON-LD wie auf der Startseite, einschließlich der Öffnungszeiten.

Prüfen: `kontakt.html#reservierung` und `#anfahrt` öffnen. Es gibt kein Reservierungsformular.

## Impressum `impressum.html`

Entwurf nach § 5 DDG: Gasthaus Gebert, Inhaber Michael Gebert, Adresse und Telefon wie auf den anderen Seiten. E-Mail, USt-IdNr., Handelsregister sowie Aufsichtsbehörde und Gaststättenerlaubnis stehen als `[bitte ergänzen]`. Verantwortlich nach § 18 Abs. 2 MStV ist Michael Gebert. Hinweis nach § 36 VSBG: keine Teilnahme an einer Verbraucherschlichtung. Kein Verweis auf die eingestellte OS-Plattform. Bildnachweis für die Speisenfotos. Der Entwurf ist vor einer echten Veröffentlichung rechtlich zu prüfen.

Prüfen: Seite öffnen. Sie ist über den Fuß erreichbar, nicht über die Hauptnavigation.

## Datenschutz `datenschutz.html`

Entwurf, Stand November 2026, vor einer echten Veröffentlichung rechtlich zu prüfen. Er beschreibt nur, was der Code tut:

- Verantwortlicher Michael Gebert, Adresse und Telefon wie auf den Seiten, E-Mail `[bitte ergänzen]`
- Hosting bei GitHub Pages, Server-Logs und IP-Adresse, Server können in den USA stehen, EU-US Data Privacy Framework
- Telefonlink öffnet die Anruffunktion, die Website speichert den Anruf nicht
- keine E-Mail-Adresse und kein `mailto`
- Formular auf Familienfeiern und Catering sendet nichts: `action="#"`, Knopf deaktiviert, kein Formulardienst
- Google-Maps-iframe nur auf der Kontaktseite; Bewertungen sind statischer Text plus Link
- Schriften vom selben Server
- keine Cookies und kein Analysewerkzeug im Code der Seiten
- Auslieferung über HTTPS
- Betroffenenrechte und Beschwerde an das BayLDA in Ansbach

Prüfen: Seite öffnen und die vier Abschnitte lesen. Im Quelltext der anderen Seiten kein Analyse-Skript suchen: eingebunden sind nur `inhalte.js` und `site.js`.

## Gestaltung und Dateien

`style.css` lädt sechs Schriftdateien aus `assets/fonts/` per `@font-face`. Ein `@import` kommt nicht vor. Farben stehen als Kommentar am Dateianfang: Waldgrün `#185C0A`, Weinrot `#64150F`, Gold `#C69A48`, Creme `#F5F0E6`, Dunkelbraun `#29251F`.

Logo: `assets/logo-gasthaus-gebert.jpg`. Icons: `assets/favicon.ico`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`.

`robots.txt` enthält `User-agent: *` und `Disallow: /`.

Prüfen: Netzwerk-Tab beim Laden. Schriften kommen aus `assets/fonts/`, nicht von einem fremden Host. `npm run verify` prüft, dass die `url()`-Pfade existieren.

## Offen

- E-Mail, USt-IdNr., Handelsregister, Aufsichtsbehörde und Gaststättenerlaubnis. Impressum und Datenschutz vor einer echten Veröffentlichung rechtlich prüfen.
- Speisen, Getränke, Catering-Angebote und alle Preise.
- Ob die Kegelbahn vollautomatisch ist, wie viele Bahnen es gibt und was sie kostet.
- Fotos von Außenansicht, Gastraum, Saal, Kegelbahn, Biergarten, Catering und Herstellung. Rechte an den Speisenfotos aus den Google-Maps-Inhaberfotos.
- Parkplätze, Bus, Instagram, Facebook.
- Ob Google Maps vor einem echten Livegang so eingebunden bleiben darf.
- Ob neben GitHub Pages ein weiterer Hoster hängt. Im Repo steht dazu nichts.
