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
- Öffnungszeiten: Platzhalter über `data-inhalt="oeffnungszeiten"`.
- Karte: iframe auf Google Maps, dazu „Route planen“ als externer Link. Hinweis auf `datenschutz.html`.
- JSON-LD `@type` Restaurant, inklusive der GitHub-Pages-URL, Logo, Adresse und Telefon.
- Gästestimmen und Fotos sind Platzhalter, keine eingebetteten Bewertungen.

Prüfen: `index.html` öffnen, jede Kachel und „Tisch reservieren“ anklicken, die Karte sehen, den Datenschutz-Hinweis lesen.

## Gasthaus `gasthaus.html`

Text zur Gaststube, Werteliste, Foto-Platzhalter, Links auf Speisekarte, Reservierung, Herstellung, Familienfeiern und Kontakt.

Prüfen: Seite öffnen, die vier Textlinks und den Kontakt-Knopf folgen.

## Speisekarte `speisekarte.html`

Platzhalter für Gerichte (`data-inhalt="speisekarte"`) und Getränke (`data-inhalt="getraenke"`), dazu Foto-Platzhalter. Keine Preise im HTML.

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

Text: die Bahn liegt im Haus. Ein touristischer Eintrag wird als „vollautomatisch“ zitiert und mit „bitte bestätigen“ markiert. Bahnen, Dauer, Preise und Reservierungsart stehen nicht in der Datei. Formular `#anfrage` nur für die Bahn.

Prüfen: Seite öffnen, Formular deaktiviert lassen, den Link auf `familienfeiern.html#anfrage` folgen.

## Kontakt `kontakt.html`

`#reservierung` sagt, dass es keine Online-Reservierung gibt und ein Anruf genügt. Dieselbe Adresse und dasselbe Telefon wie auf den anderen Seiten, erneut als unbestätigt markiert. `#anfahrt` mit derselben Google-Maps-Einbindung wie auf der Startseite. `#zeiten` mit Platzhalter für Öffnungszeiten. Platzhalter für E-Mail, Ansprechperson, Parken, Bus und Social-Profile. JSON-LD wie auf der Startseite.

Prüfen: `kontakt.html#reservierung` und `#anfahrt` öffnen. Es gibt kein Reservierungsformular.

## Impressum `impressum.html`

Platzhalter. Der Text sagt, dass Name, Anschrift und Rechtsform des Betreibers noch fehlen und die Kontaktdaten auf den anderen Seiten kein Impressum ersetzen.

Prüfen: Seite öffnen. Sie ist über den Fuß erreichbar, nicht über die Hauptnavigation.

## Datenschutz `datenschutz.html`

Platzhalter plus diese Aussagen aus der Datei:

- statische Demo, keine Analyse- und keine Tracking-Werkzeuge
- Schriften vom selben Server, kein Schriftanbieter
- Formulare senden nichts, der Knopf ist deaktiviert
- Google Maps auf Start- und Kontaktseite kann die IP-Adresse an Google übertragen
- ein Telefonlink öffnet die Anruf-Funktion des Geräts

Rechtsgrundlagen, Speicherdauern, Betroffenenrechte, Hosting und Auftragsverarbeitung sind im Text als noch zu ergänzen markiert.

Prüfen: Seite öffnen und die vier Abschnitte lesen. Im Quelltext der anderen Seiten kein Analyse-Skript suchen: eingebunden sind nur `inhalte.js` und `site.js`.

## Gestaltung und Dateien

`style.css` lädt sechs Schriftdateien aus `assets/fonts/` per `@font-face`. Ein `@import` kommt nicht vor. Farben stehen als Kommentar am Dateianfang: Waldgrün `#185C0A`, Weinrot `#64150F`, Gold `#C69A48`, Creme `#F5F0E6`, Dunkelbraun `#29251F`.

Logo: `assets/logo-gasthaus-gebert.jpg`. Icons: `assets/favicon.ico`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`.

`robots.txt` enthält `User-agent: *` und `Disallow: /`.

Prüfen: Netzwerk-Tab beim Laden. Schriften kommen aus `assets/fonts/`, nicht von einem fremden Host. `npm run verify` prüft, dass die `url()`-Pfade existieren.

## Offen

- Betreiber, Rechtsform und eine bestätigte E-Mail-Adresse für Impressum und Datenschutz.
- Ob Adresse und Telefon `+499836441` / 09836 441 stimmen. Die Seiten markieren beides als unbestätigt.
- Öffnungszeiten, Speisen, Getränke, Catering-Angebote und alle Preise.
- Ob die Kegelbahn vollautomatisch ist, wie viele Bahnen es gibt und was sie kostet.
- Fotos, Gästestimmen, Parkplätze, Bus, Instagram, Facebook.
- Ob Google Maps vor einem echten Livegang so eingebunden bleiben darf. Der Datenschutztext lässt das offen.
- Ob neben GitHub Pages ein weiterer Hoster hängt. Im Repo steht dazu nichts.
