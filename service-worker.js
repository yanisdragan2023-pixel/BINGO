'use strict';
/* Service worker — Bingo în predicare (Milwaukee 2026)
   Strategie: "cache first, cu actualizare pe fundal" pentru fișierele
   aplicației, astfel încât jocul să funcționeze complet offline pe teren. */

const CACHE_VERSION = 'bingo-predicare-v2';

// Căi RELATIVE, ca aplicația să funcționeze corect și când e găzduită
// într-un subfolder (ex: https://user.github.io/bingo-predicare/).
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/og-image.png',
  './fonts/work-sans-latin-400-normal.woff2',
  './fonts/work-sans-latin-ext-400-normal.woff2',
  './fonts/work-sans-latin-500-normal.woff2',
  './fonts/work-sans-latin-ext-500-normal.woff2',
  './fonts/work-sans-latin-600-normal.woff2',
  './fonts/work-sans-latin-ext-600-normal.woff2',
  './fonts/work-sans-latin-700-normal.woff2',
  './fonts/work-sans-latin-ext-700-normal.woff2',
  './fonts/fraunces-latin-500-normal.woff2',
  './fonts/fraunces-latin-ext-500-normal.woff2',
  './fonts/fraunces-latin-600-normal.woff2',
  './fonts/fraunces-latin-ext-600-normal.woff2',
  './fonts/fraunces-latin-700-normal.woff2',
  './fonts/fraunces-latin-ext-700-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Doar cereri GET, în același origine (fonturile Google rămân la rețea,
  // cu fallback grațios definit deja în CSS dacă nu sunt disponibile offline).
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
