# SELECT * FROM Me

**SELECT * FROM Me** is een interactieve browsergame waarmee beginners SQL leren begrijpen door de juiste rijen en kolommen in virtuele databasetabellen te selecteren.

## Wat doet de applicatie?

De applicatie begeleidt spelers door drie onderdelen:

1. **Startpagina** - een korte introductie en keuze om direct te spelen of eerst de uitleg te bekijken.
2. **Tutorial** - vier stappen waarin de speler leert hoe SQL-statements werken en welke mogelijkheden er zijn om cellen, rijen, kolommen en complete tabellen te selecteren.
3. **Game** - zeven levels waarin een SQL-query wordt getoond. De speler selecteert het verwachte resultaat in een of meer tabellen en voert de query uit.

Na een verkeerd antwoord krijgt de speler een duidelijke foutmelding over ontbrekende of te veel geselecteerde rijen en kolommen. Na het laatste level volgt een felicitatiespagina met een confetti-animatie.

## Gebruikte technologieën

- **HTML5** voor de start-, tutorial-, game- en victorypagina
- **CSS** voor het ontwerp, responsieve lay-out, donkere interface en animaties
- **JavaScript ES-modules** voor de levels, selectiefunctionaliteit, pagina-logica en confetti
- **Browser APIs** zoals DOM-manipulatie en `matchMedia()` voor reduced-motion

## Projectstructuur

```text
├──index.html           Startpagina
├──tutorial.html        Uitleg en interactieve tutorial
├──game.html            SQL-spel met zeven levels
├──victory.html         Felicitatiespagina na afloop
├──styles/
│   └──style.css        Styling voor alle pagina's
└──js/
    ├──script.js        Hoofd-module die de applicatie initialiseert
    ├──data.js          Tabellen en levelgegevens
    ├──selection.js     Selectie-, controle- en evaluatielogica
    ├──dom.js           Kleine DOM-hulpfuncties
    ├──table.js         Herbruikbare tabelweergave
    ├──game.js          Game-flow en levelbeheer
    ├──tutorial.js      Tutorialnavigatie en oefentabel
    └──victory.js       Confetti-animatie
```

## Applicatie starten

ES-modules worden het betrouwbaarst gestart via een lokale webserver.

### Optie 1: Visual Studio Code Live Server

1. Open deze map in Visual Studio Code.
2. Installeer of activeer de extensie **Live Server**.
3. Klik met de rechtermuisknop op `index.html`.
4. Kies **Open with Live Server**.

### Optie 2: Lokale server via Python

Controleer eerst of Python is geïnstalleerd:

```bash
python --version
```

Start daarna een server vanuit de projectmap:

```bash
python -m http.server 4173
```

Open vervolgens in de browser:

```text
http://localhost:4173/index.html
```

### Optie 3: Lokale server via Node.js

Als Node.js is geïnstalleerd, kun je bijvoorbeeld `npx serve` gebruiken:

```bash
npx serve .
```

Open daarna het door de server getoonde adres, meestal:

```text
http://localhost:3000
```

## Hoe speel je?

1. Open `index.html` via een lokale server.
2. Kies voor de tutorial of ga direct naar het spel.
3. Lees de SQL-query bovenaan het scherm.
4. Selecteer in de tabel:
   - één of meer losse cellen;
   - een complete rij;
   - een complete kolom;
   - of de volledige tabel.
5. Klik op **Execute Query**.
6. Bij een verkeerde selectie verschijnt uitleg in een foutmelding.
7. Bij een juiste selectie kun je naar het volgende level.
8. Na alle zeven levels verschijnt de felicitatiespagina.