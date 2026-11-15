(function () {
  var toggle = document.querySelector(".menue-knopf");
  var nav = document.getElementById("hauptnav");

  function zu(offen) {
    if (!toggle || !nav) return;
    nav.classList.toggle("offen", offen);
    toggle.setAttribute("aria-expanded", offen ? "true" : "false");
    toggle.setAttribute("aria-label", offen ? "Menü schließen" : "Menü öffnen");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      zu(!nav.classList.contains("offen"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { zu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") zu(false);
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("offen")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      zu(false);
    });
  }

  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  });

  window.gasthausInhalteZeichnen = function () {
  var inhalte = window.GASTHAUS_INHALTE;
  if (!inhalte) return;

  document.querySelectorAll("[data-inhalt='oeffnungszeiten']").forEach(function (el) {
    var daten = inhalte.oeffnungszeiten;
    if (!daten || daten.freigegeben !== true || !Array.isArray(daten.zeilen) || daten.zeilen.length === 0) return;
    var table = document.createElement("table");
    table.className = "zeiten";
    var caption = document.createElement("caption");
    caption.className = "sr-only";
    caption.textContent = "Öffnungszeiten";
    table.appendChild(caption);
    daten.zeilen.forEach(function (zeile) {
      var tr = document.createElement("tr");
      var tag = document.createElement("td");
      var zeit = document.createElement("td");
      tag.textContent = zeile.tag || "";
      zeit.textContent = zeile.zeit || "";
      tr.append(tag, zeit);
      table.appendChild(tr);
    });
    el.replaceChildren(table);
    if (daten.hinweis) {
      var hinweis = document.createElement("p");
      hinweis.className = "nebenhinweis";
      hinweis.textContent = daten.hinweis;
      el.appendChild(hinweis);
    }
  });

  function kategorienZeichnen(el, daten) {
    if (!daten || daten.freigegeben !== true || !Array.isArray(daten.kategorien)) return;
    var brauchbar = daten.kategorien.filter(function (kategorie) {
      return kategorie && Array.isArray(kategorie.gerichte) && kategorie.gerichte.length > 0;
    });
    if (brauchbar.length === 0) return;
    el.replaceChildren();
    brauchbar.forEach(function (kategorie) {
      var block = document.createElement("section");
      block.className = "karte-kategorie";
      var titel = document.createElement("h2");
      titel.textContent = kategorie.titel || "Kategorie";
      block.appendChild(titel);
      kategorie.gerichte.forEach(function (gericht) {
        var zeile = document.createElement("article");
        zeile.className = "gericht";
        var text = document.createElement("div");
        var name = document.createElement("strong");
        name.textContent = gericht.name || "";
        text.appendChild(name);
        if (gericht.beschreibung) {
          var beschreibung = document.createElement("p");
          beschreibung.textContent = gericht.beschreibung;
          text.appendChild(beschreibung);
        }
        zeile.appendChild(text);
        if (gericht.preis) {
          var preis = document.createElement("span");
          preis.className = "preis";
          preis.textContent = gericht.preis;
          zeile.appendChild(preis);
        }
        block.appendChild(zeile);
      });
      el.appendChild(block);
    });
  }

  document.querySelectorAll("[data-inhalt='speisekarte']").forEach(function (el) {
    kategorienZeichnen(el, inhalte.speisekarte);
  });
  document.querySelectorAll("[data-inhalt='getraenke']").forEach(function (el) {
    kategorienZeichnen(el, inhalte.getraenke);
  });

  document.querySelectorAll("[data-inhalt='catering']").forEach(function (el) {
    var daten = inhalte.catering;
    if (!daten || daten.freigegeben !== true || !Array.isArray(daten.angebote) || daten.angebote.length === 0) return;
    el.replaceChildren();
    daten.angebote.forEach(function (angebot) {
      var block = document.createElement("article");
      block.className = "gericht";
      var text = document.createElement("div");
      var name = document.createElement("strong");
      name.textContent = angebot.titel || "";
      text.appendChild(name);
      if (angebot.text) {
        var beschreibung = document.createElement("p");
        beschreibung.textContent = angebot.text;
        text.appendChild(beschreibung);
      }
      block.appendChild(text);
      if (angebot.preis) {
        var preis = document.createElement("span");
        preis.className = "preis";
        preis.textContent = angebot.preis;
        block.appendChild(preis);
      }
      el.appendChild(block);
    });
  });
  };
  window.gasthausInhalteZeichnen();

  var SPEICHER = "gasthaus-karte";
  var ORT = [49.0566588, 10.6558886];
  var merk = null;
  var plan = null;
  var leiste = null;

  function lesen() {
    try { return localStorage.getItem(SPEICHER); }
    catch (e) { return merk; }
  }

  function schreiben(wert) {
    merk = wert;
    try { localStorage.setItem(SPEICHER, wert); }
    catch (e) {}
  }

  function banner() {
    if (leiste) return leiste;
    leiste = document.createElement("div");
    leiste.className = "einwilligung";
    leiste.setAttribute("role", "region");
    leiste.setAttribute("aria-label", "Einwilligung für die Karte");
    var text = document.createElement("p");
    text.textContent = "Die Karte lädt Kacheln von OpenStreetMap. Dafür brauchen wir Ihre Einwilligung.";
    var aktionen = document.createElement("div");
    aktionen.className = "einwilligung-aktionen";
    var ja = document.createElement("button");
    ja.type = "button";
    ja.className = "btn btn-gleich";
    ja.textContent = "Akzeptieren";
    var nein = document.createElement("button");
    nein.type = "button";
    nein.className = "btn btn-gleich";
    nein.textContent = "Ablehnen";
    aktionen.append(ja, nein);
    leiste.append(text, aktionen);
    document.body.appendChild(leiste);
    ja.addEventListener("click", function () { entscheiden("ja"); });
    nein.addEventListener("click", function () { entscheiden("nein"); });
    return leiste;
  }

  function bannerZeigen(an) {
    var el = banner();
    el.hidden = !an;
    document.body.classList.toggle("hat-einwilligung", an);
  }

  function karteZeichnen() {
    var feld = document.getElementById("karte-feld");
    var ruhe = document.getElementById("karte-ruhe");
    if (!feld || !window.L) return;
    if (ruhe) ruhe.hidden = true;
    feld.hidden = false;
    if (!plan) {
      plan = L.map(feld, {
        scrollWheelZoom: true,
        touchZoom: true,
        dragging: true
      }).setView(ORT, 16);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      }).addTo(plan);
      L.marker(ORT, {
        icon: L.divIcon({
          className: "karte-pin",
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(plan).bindTooltip("Gasthaus Gebert", { direction: "top" });
    }
    plan.invalidateSize();
  }

  function ruheZeigen(hinweis) {
    var feld = document.getElementById("karte-feld");
    var ruhe = document.getElementById("karte-ruhe");
    var laden = document.getElementById("karte-laden");
    if (ruhe) ruhe.hidden = false;
    if (feld) feld.hidden = true;
    if (laden) laden.hidden = !hinweis;
  }

  function entscheiden(wert) {
    schreiben(wert);
    bannerZeigen(false);
    if (!document.getElementById("anfahrt")) return;
    if (wert === "ja") karteZeichnen();
    else ruheZeigen(true);
  }

  var stand = lesen();
  if (document.getElementById("anfahrt")) {
    if (stand === "ja") karteZeichnen();
    else if (stand === "nein") ruheZeigen(true);
    else {
      ruheZeigen(false);
      bannerZeigen(true);
    }
  }

  document.querySelectorAll(".cookie-einstellungen").forEach(function (knopf) {
    knopf.addEventListener("click", function () { bannerZeigen(true); });
  });

  var ladenKnopf = document.getElementById("karte-laden");
  if (ladenKnopf) {
    ladenKnopf.addEventListener("click", function () { entscheiden("ja"); });
  }
})();
