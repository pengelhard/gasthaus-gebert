/* Pflegequelle für wechselnde Inhalte.
   Öffnungszeiten, Speisekarte, Getränkekarte und Catering hier eintragen.
   Die Seiten zeigen den Platzhalter, solange "freigegeben" nicht true ist
   oder die jeweilige Liste leer bleibt.
   Adresse und Telefon stehen zusätzlich im HTML (Recherche, bitte bestätigen)
   und müssen bei einer Änderung dort mit geändert werden.

   Form der Einträge, ohne Beispielgerichte:

   oeffnungszeiten.zeilen = [{ tag: "Wochentag", zeit: "von–bis" }]
   speisekarte.kategorien = [{
     titel: "Name der Kategorie",
     gerichte: [{ name: "Name des Gerichts", beschreibung: "", preis: "" }]
   }]
   getraenke.kategorien = gleiche Form wie speisekarte
   catering.angebote = [{ titel: "Name", text: "", preis: "" }]
*/
window.GASTHAUS_INHALTE = {
  oeffnungszeiten: {
    freigegeben: false,
    zeilen: [],
    hinweis: ""
  },
  speisekarte: {
    freigegeben: false,
    kategorien: []
  },
  getraenke: {
    freigegeben: false,
    kategorien: []
  },
  catering: {
    freigegeben: false,
    angebote: []
  }
};
