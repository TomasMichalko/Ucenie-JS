# Portfolio – Tomáš Michalko

Jednoduchá viacstránková prezentácia v čistom HTML, CSS a JavaScripte.

## Štruktúra
- `index.html` – O mne (hero, zručnosti, kontakt)
- `todo.html` – To‑Do aplikácia (localStorage CRUD, filtre, triedenie)
- `snake.html` – Hra Had (canvas, rAF, highscore v localStorage)
- `assets/css/styles.css` – reset, téma (svetlý/tmavý), layout, navigácia, komponenty, utilitky
- `assets/js/theme.js` – prepínač témy + back‑to‑top + aktívna navigácia
- `assets/js/todo.js` – logika To‑Do
- `assets/js/snake.js` – logika hry Had

## Spustenie
1. Otvor súbor `index.html` v prehliadači (Chrome/Firefox).
2. Navigácia hore prepína medzi stránkami.

## Poznámky
- Téma (svetlý/tmavý) sa ukladá do `localStorage` a prežije refresh.
- To‑Do úlohy sa ukladajú do `localStorage`. K dispozícii je export/import JSON.
- Hra Had ukladá „Najvyššie skóre“ do `localStorage`.
- Dizajn je responzívny (cca 360px → 1440px+), ovládateľné klávesnicou, s viditeľným focusom.

