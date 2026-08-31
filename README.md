# Cuvântare

Aplicație simplă, într-un singur fișier HTML, pentru exersat discursuri:

- Cronometru configurabil (3 / 5 / 7 / 10 minute), cu inel de progres care se colorează (auriu → galben → roșu) pe măsură ce timpul se scurge, și continuă în minus dacă depășești timpul alocat.
- Numărător de cuvinte și caractere, live, pe măsură ce scrii sau lipești textul.
- Estimare a duratei discursului la un ritm de 130 cuvinte/minut, cu indicație dacă textul e prea lung sau prea scurt pentru durata aleasă.

Nu are dependențe externe de build — folosește Google Fonts prin CDN.

Include și iconiță pentru mobil (favicon + apple-touch-icon) și `manifest.json`, așa că pagina poate fi adăugată pe ecranul principal ca o mini-aplicație, cu iconiță proprie.

## Fișiere din repo

- `index.html` — aplicația
- `manifest.json` — pentru „Add to Home Screen" pe mobil
- `icon-16.png`, `icon-32.png` — favicon
- `icon-180.png` — apple-touch-icon
- `icon-192.png`, `icon-512.png` — iconițe pentru manifest / Android

## Cum îl pui pe GitHub

1. Creează un repo nou pe GitHub (ex. `cuvantare`).
2. Adaugă `index.html` (și acest `README.md`) în repo și dă push.
3. Ca să-l poți deschide direct dintr-un link, activează **GitHub Pages**:
   Settings → Pages → Source: `main` branch, folder `/ (root)` → Save.
   Aplicația va fi disponibilă la `https://<user>.github.io/cuvantare/`.

## Local

Deschide direct `index.html` în browser — nu necesită server.
