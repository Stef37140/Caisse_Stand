# 🗺️ Roadmap

Feuille de route priorisée pour l'évolution de Caisse Stand après la V2.1. À discuter étape par étape — on ne lance pas tout en parallèle.

État de référence : **V2.1 livrée** (voir `CHANGELOG.md` pour le détail).

---

## V3.0 — PWA installable 🔥 (priorité haute, en cours)

Rendre l'app installable sur iPhone Safari et Android Chrome comme une vraie application native, avec fonctionnement hors ligne complet.

- [ ] `manifest.json` à la racine
  - `name`, `short_name`, `start_url: "./"`, `display: "standalone"`, `orientation: "portrait"`
  - `theme_color: "#1e3a8a"`, `background_color: "#f1f5f9"`
  - Tableau `icons` : 192×192, 512×512, 512×512 maskable
- [ ] `sw.js` service worker minimal
  - Stratégie cache-first pour les ressources statiques
  - Versioning du cache (`CACHE_VERSION`) pour gérer les mises à jour
  - `skipWaiting` contrôlé (pas automatique — bandeau "nouvelle version dispo")
  - Fallback cross-origin pour le CDN Tailwind
- [ ] Icônes dans `icons/`
  - Design simple (panier stylisé ou "C" sur fond bleu `#1e3a8a`)
  - Formats 192, 512, maskable 512
- [ ] Modifications `index.html`
  - `<link rel="manifest" href="./manifest.json">`
  - `<link rel="apple-touch-icon" href="./icons/icon-192.png">`
  - Enregistrement du service worker au load
  - Gestion de `beforeinstallprompt` (Android) avec bouton "Installer l'app"
- [ ] `docs/DEPLOIEMENT.md` avec les procédures de test (python http.server, GitHub Pages, Synology)
- [ ] Validation : installation effective sur iPhone Safari + Android Chrome + mode avion

## V3.1 — Hébergement Synology / GitHub Pages

- [ ] Procédure Synology Web Station (ou container Docker nginx)
- [ ] Alternative GitHub Pages (HTTPS indispensable pour le service worker et certaines API PWA)
- [ ] Tests depuis le réseau local + accès extérieur

## V3.2 — Images produits

- [ ] Upload depuis galerie → redimensionnement canvas → base64 → stockage dans l'objet produit
- [ ] Fallback emoji si pas d'image
- [ ] Surveiller quota localStorage (~5 Mo) — migration IndexedDB à prévoir au-delà de ~20 images

## V3.3 — Archivage sessions

- [ ] Archivage automatique de chaque session clôturée (au lieu de simple reset)
- [ ] Nouvel onglet ou sous-vue "Historique sessions" — consultable, comparable, exportable en masse
- [ ] Stockage séparé (`caisse_sessions_archive`) pour ne pas alourdir la session courante

## V3.4 — Rendu monnaie avancé

- [ ] Boutons rapides coupures : 5 €, 10 €, 20 €, 50 €, 100 €
- [ ] Calcul détaillé du rendu par coupures disponibles (optimisation combinatoire basique)
- [ ] Historique des derniers montants donnés

## V3.5 — Refactoring modulaire

Décomposer le monolithique `index.html` en modules logiques, sans introduire de build tool :

- `index.html` (HTML + imports)
- `css/styles.css` (custom CSS en plus de Tailwind)
- `js/state.js` (état global, persistance)
- `js/caisse.js` (logique caisse + panier)
- `js/stock.js` (gestion stock + modals produit)
- `js/bilan.js` (bilan + comptage + exports)
- `js/sync.js` (import/export JSON, fusion multi-appareils)
- `js/ui.js` (modals génériques, toasts, navigation)

Utiliser `<script type="module">` ou chargement séquentiel classique.

## V3.6 — Tests et checklist

- [ ] Enrichir `docs/CHECKLIST_TESTS.md` avec les nouveaux scénarios post-V3.0
- [ ] Idéalement : page `tests.html` de tests automatisés (DOM, assertions basiques)

---

## 💡 Idées en vrac (non priorisées)

Parking de features possibles, à piocher si besoin ou à challenger :

- Mode sombre
- Multi-langues FR / EN
- Partage de session via QR code (contient un JSON compact)
- Impression ticket via imprimante Bluetooth thermique (gros projet)
- Gestion remises / promotions
- Catégories produits personnalisables (au-delà de T-Shirt/Pull/Sweat)
- Statistiques comparatives multi-marchés
- Synchronisation entre onglets via l'event `storage` sur `window`

---

## 🚫 Non-objectifs explicites

À rappeler pour éviter les dérives d'architecture :

- **Pas de backend** — tout reste local, pas de compte, pas de serveur
- **Pas de certification NF525** — usage interne, pas de caisse fiscale officielle
- **Pas de framework** (React, Vue, Svelte, etc.) — vanilla JS + Tailwind CDN uniquement
- **Pas de build tool** (Vite, Webpack, esbuild…) jusqu'à la V3.5 si refactoring, et encore
- **Pas d'inscription utilisateur** — zéro friction, ouverture directe

---

## 📌 Légende

- 🔥 priorité immédiate
- ✅ livré (voir CHANGELOG.md)
- [ ] tâche à faire
- [x] tâche terminée (dans la version en cours)
