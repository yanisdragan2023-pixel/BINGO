# Bingo în predicare — Milwaukee 2026

Joc Bingo 5×5 pentru serviciul de teren, inspirat de fișa oficială a
congresului Milwaukee 2026. Aplicație web progresivă (PWA), scrisă în
HTML5 + CSS3 + JavaScript ES6 vanilla — fără framework-uri sau
dependențe de build.

## Funcționalități

- Card de bingo 5×5 generat aleatoriu din cele 24 de activități + spațiul liber
- Bifare/debifare căsuțe, cu efect de „ștampilă"
- Detecție automată a liniilor, coloanelor și diagonalelor complete
- Sărbătorire (sunet + banner) la fiecare linie nouă completată
- Progres salvat automat pe dispozitiv, cu `localStorage` (nimic nu pleacă pe internet)
- Ecran separat pentru **Experiențe** — notează-ți experiențele din teren, cu buton de trimitere (Web Share API / copiere în clipboard)
- Temă luminoasă / întunecată / automată (după sistem)
- Sunete activabile/dezactivabile din Setări
- Anunțuri pentru screen reader la fiecare bifare (poate fi dezactivat)
- Fonturi autogăzduite (Fraunces, Work Sans) — funcționează 100% offline chiar și la prima deschidere
- Buton de instalare pe ecranul principal (Android/Chrome) + instrucțiuni pentru iOS, plus o secțiune „Cum se folosește" completă în Setări
- Ștergere separată a datelor: cardul/bifele sau experiențele, independent
- Meta tag-uri Open Graph pentru o previzualizare corectă la distribuirea link-ului
- Funcționează complet **offline**, ca aplicație instalabilă (PWA)
- Accesibil: navigare cu tastatura, focus vizibil, `aria-*` complet, respectă „reduced motion"

## Structură fișiere

```
bingo-predicare/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── fonts/
│   └── (fișiere .woff2 — Fraunces și Work Sans, autogăzduite)
├── scripts/
│   └── generate_icons.py   (opțional — regenerează iconițele/imaginea OG)
└── icons/
    ├── favicon.ico
    ├── apple-touch-icon.png
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-512-maskable.png
    └── og-image.png
```

## Cum publici pe GitHub Pages

1. Creează un repository nou pe GitHub (public), de exemplu `bingo-predicare`.
2. Urcă tot conținutul acestui folder în repository (păstrează structura de foldere).
   ```bash
   git init
   git add .
   git commit -m "Prima versiune: Bingo în predicare"
   git branch -M main
   git remote add origin https://github.com/NUME-UTILIZATOR/bingo-predicare.git
   git push -u origin main
   ```
3. În repository, mergi la **Settings → Pages**.
4. La **Source**, alege branch-ul `main` și folderul `/ (root)`, apoi **Save**.
5. După 1-2 minute, aplicația va fi disponibilă la:
   `https://NUME-UTILIZATOR.github.io/bingo-predicare/`
6. Deschide linkul pe telefon și alege „Adaugă pe ecranul principal" /
   „Instalează aplicația" pentru a o folosi ca PWA, offline.

Nu este nevoie de niciun server, build step sau cont suplimentar —
toate căile din cod sunt relative, deci funcționează direct din
subfolderul pe care GitHub Pages îl generează.

⚠️ **După publicare**, deschide `index.html` și înlocuiește
`icons/og-image.png` din tag-urile `og:image` / `twitter:image` cu
adresa completă (`https://utilizator.github.io/bingo-predicare/icons/og-image.png`),
altfel unele aplicații (WhatsApp, Facebook) nu vor afișa imaginea de
previzualizare la trimiterea link-ului.

## Instalare pe telefon

- **Android/Chrome:** apare automat un buton „Instalează aplicația" în Setări, când browserul permite. Altfel: meniul ⋮ → „Adaugă pe ecranul principal".
- **iPhone/iPad (Safari):** butonul de distribuire → „Adaugă pe ecranul principal" (Safari nu permite instalare automată).

Explicații complete pentru utilizatori sunt incluse direct în aplicație, în Setări → „Cum se folosește aplicația".

## Actualizarea cardului

Textele celor 24 de activități se află la începutul fișierului
`js/app.js`, în constanta `ACTIVITIES`. Pentru un congres viitor, e
suficient să înlocuiești textele din listă — restul aplicației
(amestecarea, detecția liniilor, salvarea) funcționează automat cu
orice 24 de activități.

## Confidențialitate

Aplicația nu are backend și nu trimite date nicăieri. Cardul, bifele
și experiențele scrise rămân salvate doar în browserul/telefonul
utilizatorului (`localStorage`). Ștergerea datelor din Setări este
ireversibilă.
