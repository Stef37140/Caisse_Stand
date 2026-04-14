/* Caisse Stand — Service Worker
 *
 * Stratégie : cache-first pour les ressources statiques (app-shell),
 * network-first avec fallback cache pour le CDN Tailwind (cross-origin).
 *
 * Versioning : bumper CACHE_VERSION à chaque release pour forcer la
 * régénération du cache et servir la nouvelle version de l'app.
 *
 * skipWaiting : NON automatique. La page envoie un postMessage
 * {type: 'SKIP_WAITING'} quand l'utilisateur valide la bannière
 * "Nouvelle version disponible", évitant de casser une session en cours.
 */

const CACHE_VERSION = 'caisse-v3.3.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/qrcode.min.js',
  './vendor/jsQR.min.js',
  './vendor/pako.min.js'
];
const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

// Install : pré-cache l'app-shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // addAll est atomique : si une ressource échoue, rien n'est caché.
      // On cache Tailwind séparément pour ne pas faire échouer l'install
      // si le CDN est injoignable au premier chargement.
      return cache.addAll(APP_SHELL).then(() => {
        return fetch(TAILWIND_CDN, { mode: 'no-cors' })
          .then((res) => cache.put(TAILWIND_CDN, res))
          .catch(() => { /* CDN offline à l'install : tant pis, on retentera */ });
      });
    })
  );
  // Pas de self.skipWaiting() ici — on attend le signal de la page.
});

// Activate : purge les anciens caches versionnés
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch : stratégie différenciée selon la ressource
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignore les requêtes non-GET (au cas où)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Tailwind CDN : network-first avec fallback cache
  if (url.href.startsWith(TAILWIND_CDN)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Met à jour le cache en arrière-plan
          const resClone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Ressources same-origin : cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // Ne cache que les 200 OK same-origin
          if (res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
          }
          return res;
        }).catch(() => {
          // Offline + non caché : fallback vers index.html si c'est une navigation
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Autres cross-origin : laisser passer au réseau sans cacher
});

// Message : permet à la page de déclencher skipWaiting volontairement
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
