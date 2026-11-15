# Gestaltung, vor der Überarbeitung

Gesehen am lokalen Stand, vor den Änderungen: Start, Speisekarte, Feiern und Kontakt, jeweils 390 px und 1280 px, dazu der Kopf. `docs/` und `*.md` stehen in `_config.yml` unter `exclude` und gehen nicht in den GitHub-Pages-Build.

## Schwächen

1. **Logo.** Im Kopf und in der Fußzeile sitzt das JPG in einem weißen Kasten. Auf Creme wirkt der Kasten wie ein Aufkleber, auf dem dunklen Fuß wie ein Fremdkörper. Das Zeichen füllt die Datei nicht, der Weißrand macht den Kopf höher als das eigentliche Logo. Dieselben weißen Flächen haben Favicon, `favicon-32.png` und das Apple-Touch-Icon.

2. **Abstände.** Auf 390 px liegen Demo-Leiste, hoher Kopf, Text, Kästen und die feste Anrufleiste übereinander. Die Startseite ist eine lange Folge gleich hoher Blöcke. Zwischen Überschrift und nächstem Kasten ist wenig Luft, die Seitenränder sind knapp. Der Claim mit `white-space: nowrap` wird auf dem Handy sehr klein.

3. **Textmenge.** Der Satz „handgemacht · unverfälscht · ehrlich“ steht im Logo, unter der Begrüßung, im grünen Band und im Fuß. Adresse, Telefon und „bitte bestätigen“ wiederholen sich auf der Startseite, auf Kontakt und im Fuß. Die Speisekarte erklärt in einem Absatz, dass noch keine Karte da ist, und sagt es in den leeren Kästen noch einmal. Feiern hat zwei Einleitungen, bevor das Formular kommt.

4. **Kacheln.** Fünf Angebotskarten stehen auf dem Handy untereinander. Jede trägt ein gestricheltes Foto, ein rotes Schild „Platzhalter – Inhalt folgt“, Titel, Satz und „Mehr dazu“. Darunter drei weitere leere Fotokästen, auf der Speisekarte noch einmal drei. Das wird eine Wand aus gleichen Flächen.

5. **Menü.** Acht Punkte. Auf dem Handy ein Vollflächen-Menü, die aktuelle Seite nur mit einem schmalen Goldstrich. Auf 1280 px teilen sich das breite Logo, acht Links und die Pillen-Schaltfläche eine Zeile. Der weiße Kasten macht den Kopf unruhig.

6. **Anrufleiste.** Unten eine feste grüne Fläche über die ganze Breite: „Anrufen · 09836 441“ und darin winzig „BITTE BESTÄTIGEN“. Sie verdeckt Inhalt und wiederholt die Nummer aus der Seite. Die Leiste ist eine eigene Schaltflächenform, ohne den Radius der anderen Knöpfe.

7. **Schaltflächen.** Volle Pillen (Radius 999 px) neben Karten mit 12 px Ecken. Auf Grün und Wein werden dieselben Knöpfe cremeweiß, der Ghost wird zur hellen Kontur. Der deaktivierte Senden-Knopf ist grau-braun. Der Anruf im Kopf ist eine zweite Pille mit zwei Zeilen. „Unsere Angebote entdecken“ ist lang und wirkt sperrig.

8. **Kontrast und Hierarchie.** Viele gleich laute grüne Überschriften, rote Platzhalter-Schilder und gestrichelte Kästen. Das kleine „bitte bestätigen“ (0,68 rem) ist schwer zu lesen. Die Fläche ist flaches Creme ohne Material, die Schrift eine allgemeine Serife ohne eigenes Gesicht.

9. **Doppelte Handlungen.** „Tisch reservieren“ steht im Hero und noch einmal im weinroten Band, dazu Anrufleiste und Telefonlink. Jede Unterseite endet mit dem grünen Band „Wir freuen uns auf Sie / Kontakt und Anfahrt“, obwohl Fuß und Anrufleiste dasselbe anbieten. Auf Kontakt steht die Adresse im Text, bei der Anfahrt und im Fuß.

10. **Bildflächen.** Die Platzhalter sind kleine gestrichelte Rechtecke. Kein festes Seitenverhältnis für spätere Fotos, kein `object-fit`. Hero und Feiern bekommen so keine ruhige, große Bildfläche.
