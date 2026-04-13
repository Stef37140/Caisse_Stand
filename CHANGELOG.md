# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### À venir
- Images produits (remplacement des emojis) — V3.2
- Archivage des sessions clôturées — V3.3
- Rendu monnaie avancé avec coupures rapides — V3.4

---

## [3.1.1] — Push conditionnel (scalabilité cloud 4+ téléphones)

### Corrigé
- **Quota Cloudflare KV respecté** même avec 4+ téléphones. Avant,
  chaque cycle de polling (30 s) poussait l'état complet au serveur,
  consommant ~1 write par phone par 30 s → 4 phones × 8 h = 3 840
  writes/jour → **dépassait** le quota free tier (1 000 writes/jour).
- Nouveau : `cloudPush()` calcule une empreinte structurelle du
  payload (nb produits + nb ventes + timestamps max + deviceLabel)
  et **skippe le push si l'empreinte est identique au précédent**.
  L'empreinte est persistée dans localStorage pour survivre aux
  rechargements.
- Invalidation automatique de l'empreinte après reset session,
  import/restore JSON, ou sync QR qui modifie l'état — pour que le
  prochain push aille bien jusqu'au cloud.
- Bouton "⟳ Sync maintenant" passe `{force:true}` pour bypasser le
  skip (utile pour retester après une erreur serveur).
- Simulation Node : sur 960 cycles de polling (8 h) avec 50 ventes
  réparties → **51 pushes** au lieu de 960 (réduction 19×). 4 phones
  = ~200 writes/jour, soit 20 % du quota free tier (vs 380 % avant).

---

## [3.1.0] — Sync stocks multi-téléphones (QR P2P + Cloud auto)

Synchronisation cohérente du stock + des ventes entre plusieurs téléphones
avec deux mécanismes complémentaires : QR code peer-to-peer (offline) et
Cloudflare KV via Pages Functions (auto en réseau).

### Refactoring fondateur

- **Modèle event-sourced du stock** : `produit.stock` devient une baseline
  manuelle horodatée par `stockSetAt`. Le stock affiché est calculé
  dynamiquement = baseline − ventes du produit après baseline − panier.
  Conséquence : importer les ventes d'un autre téléphone décrémente
  automatiquement le stock chez tous, sans muter aucune baseline → pas
  de conflit possible. `finaliserVente` et `annulerDerniere` ne mutent
  plus `p.stock` directement.
- **Tombstones** : la suppression d'un produit pose `deletedAt` au lieu
  de retirer du tableau, pour propager la suppression aux autres
  appareils via sync. Le rendu filtre via `produitsActifs()`.
- **Catalogue last-write-wins** : `produit.lastModified` mis à jour à
  chaque édition, sert de critère de résolution de conflit en sync.
- Migration douce dans `load()` pour les données legacy.

### Sync QR P2P (offline)

- Nouveau bloc Sync : "📷 Sync rapide entre téléphones (offline)"
- Boutons "📤 Afficher mon QR" et "📥 Scanner un QR"
- Pipeline : `buildSyncPayload(cutoff)` → JSON → pako.deflate → base64
  → chunking (1800 bytes/segment) → QR codes (qrcode.js)
- Ratio de compression mesuré : 80 ventes + 30 produits → 22 KB JSON
  → 2.2 KB compressé (10×) → tient dans 1 seul QR
- Multi-segments avec navigation ◀/▶ si payload > capacité QR
- Scan : caméra arrière (`facingMode: 'environment'`), API native
  `BarcodeDetector` quand dispo (iOS 17+, Chrome récent), fallback
  jsQR sinon
- Détection idempotente : le scanner accepte les segments dans n'importe
  quel ordre et finalise quand tous reçus
- Suivi par peer dans `localStorage.caisse_sync_state`
- Affichage "Dernières syncs" avec qui et quand

### Sync Cloud auto (Cloudflare Pages Functions + KV)

- Nouveau bloc Sync : "☁️ Sync auto cloud (en réseau)"
- Status indicator : ⚪ désactivée / 🟡 idle / 🔵 sync / 🟢 OK / 🔴
  erreur / 🔌 offline
- Modal de configuration avec URL + token + bouton "Tester" qui ping
  le endpoint avant enregistrement
- Polling automatique toutes les 30 s quand activé et `navigator.onLine`
- Re-sync immédiate sur événements `online` et `visibilitychange`
- Backend `functions/api/sync.js` (Cloudflare Pages Functions) :
  - GET /api/sync : liste tous les états enregistrés
  - POST /api/sync : upload de l'état d'un appareil
  - Auth Bearer token comparé en temps constant à env `SYNC_TOKEN`
  - Stockage KV : 1 clé `state:<deviceId>` par appareil
  - Pas de merge côté serveur (atomicité par clé KV, merge client)
  - CORS configuré (preflight OPTIONS)
- Quotas free tier largement suffisants (< 6 % consommé pour 3 phones)

### Vendor libs (pour la sync QR)

- `vendor/qrcode.min.js` (David Shim, MIT, 19 KB) — génération QR
- `vendor/jsQR.min.js` (Apache 2.0, 130 KB minifié localement via
  terser) — décodage QR (fallback si pas de BarcodeDetector)
- `vendor/pako.min.js` (MIT + Zlib, 47 KB) — compression deflate
- Pré-cachées par le service worker (CACHE_VERSION → caisse-v3.1.0)
- Inlinées dans la variante portable par `scripts/build-portable.py`

### Documentation

- `docs/DEPLOIEMENT.md` : nouvelle section "Cloudflare Pages Functions +
  KV" pas-à-pas (création KV namespace, binding, env var SYNC_TOKEN,
  premier déploiement)
- `vendor/README.md` : attribution des licences

---

## [3.0.1] — Trio de correctifs UX/Sync

### Ajouté
- **Suppression d'objets du panier avant paiement** : chaque ligne du panier déplié contient deux boutons `−` (retire une unité, supprime la ligne à qté 0) et `🗑` (supprime la ligne entière). Toast d'info au retrait.

### Corrigé
- **Renommage de l'appareil** acceptait seulement les chiffres (hack `genModalText` jamais appelé). Refonte de `genModal` avec un paramètre `inputType` propre ('text' ou 'number'). Validation : 2-30 caractères alphanumériques + espace/tiret/underscore, accents unicode acceptés, caractères spéciaux rejetés avec toast explicite.
- **Fusion multi-fichiers pouvait créer des faux doublons** : le `Set existingIds` n'était pas mis à jour dans la boucle d'import. Si un batch contenait deux fichiers avec la même vente, elle était ajoutée deux fois.
  - Nouvelle logique : `Map knownKeys` reconstruite par fichier et mise à jour après chaque ajout → dédup fiable intra-batch.
  - Nouvelle fonction `venteDedupeKey(v)` : utilise l'ID si présent, sinon clé synthétique à partir du contenu (deviceId + timestamp + total + items triés par ID). Idempotente même si l'ordre des items varie entre exports.
  - Nouvelle fonction `venteEstValide(v)` : rejette les ventes à structure cassée (items vide, total non numérique, aucune info temporelle).
  - Détection de conflits (même clé mais total/items divergents) loggée dans la console pour investigation.
  - Rapport détaillé : "X ajoutées · Y déjà là · Z invalides · ⚠ N conflits" au lieu de "ajoutées/doublons".
  - Tri chronologique décroissant des ventes après merge.

---

## [3.0.0] — PWA installable + variante portable

### Ajouté
- **Variante portable** générée par `scripts/build-portable.py` : un fichier `dist/caisse-stand-portable.html` auto-suffisant (~400 Ko, Tailwind inliné) pour les cas de partage direct à un utilisateur non technique. Pas d'installation PWA mais fonctionne en double-clic sans serveur. Marqueurs `PWA-CARDS-*` et `PWA-JS-*` dans `index.html` pour un stripping fiable
- **`manifest.json`** à la racine (name, short_name, display standalone, orientation portrait, theme_color `#1e3a8a`, background_color `#f1f5f9`)
- **Service worker `sw.js`** avec stratégie cache-first
  - Pré-cache de l'app-shell à l'install (index.html, manifest, icônes)
  - Network-first avec fallback cache pour le CDN Tailwind (cross-origin)
  - Fallback navigation vers `index.html` en offline
  - `CACHE_VERSION` pour versioner et invalider proprement
  - **`skipWaiting()` contrôlé** par postMessage depuis la page (bandeau "Nouvelle version dispo" — l'utilisateur décide quand recharger)
- **Icônes PWA** `icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
  - Design : shopping bag blanc + symbole € bleu sur fond `#1e3a8a`, coins arrondis pour les icônes "any", safe zone 70 % pour la maskable
  - Sources SVG conservées pour édition future
- **Card d'installation dans l'onglet Sync**
  - Android Chrome : capture de `beforeinstallprompt` + bouton "Installer maintenant"
  - iOS Safari : instructions manuelles "Partager → Sur l'écran d'accueil"
  - Se masque automatiquement après installation ou en mode standalone
- **Card "Nouvelle version disponible"** quand le SW détecte une mise à jour
- **Affichage "Mode : navigateur / app installée"** dans la section infos appareil
- **Documentation `docs/DEPLOIEMENT.md`** : procédures local (Python http.server), GitHub Pages, Synology Web Station, Docker nginx + checklist de validation PWA + troubleshooting

### Modifié
- Title de la page : `Caisse Stand v2.1` → `Caisse Stand v3.0`

### Corrigé
- **Nettoyage des noms de fichiers** du repo (contenus mélangés hérités de l'upload initial) :
  - L'app V2.1 était dans `caisse_stand_v2_1.html` → renommée `index.html`
  - `index.html` initial (contenu REX/PENDING_LEARNINGS) → restauré au bon endroit
  - `REX/PENDING_LEARNINGS.md` (duplicata de BUGS_RESOLUS) → écrasé par le vrai contenu
  - `README.md` (contenu CHANGELOG) → renommé `CHANGELOG.md`
  - Nouveau `README.md` public rédigé
  - `ROADMAP.md` (duplicata de CLAUDE.md) → réécrit comme vrai roadmap priorisé
  - `PROMPT_CLAUDE_CODE.md` (contenu gitignore) → renommé `.gitignore`
  - `download` (duplicata de `docs/ARCHITECTURE.md`) → supprimé

---

## [2.1.0] — Bascule Claude.ai → Claude Code

### Ajouté
- **Calcul rendu monnaie** en temps réel au paiement cash (modal dédiée)
- **Modal HTML générique** `genModal()` pour remplacer les `prompt`/`confirm` natifs
- **Fonction `stockDispo(id)`** qui calcule le stock disponible (stock réel − quantité panier)
- **Event delegation globale** via `data-action` et `data-tab`
- **Fonction `downloadBlob()`** centralisée pour les exports fiables
- **Bouton "Renommer l'appareil"** dans l'onglet Sync

### Corrigé
- **Stock pas décrémenté visuellement** à l'ajout au panier (cause : `renderCaisse()` pas rappelée)
- **Boutons "Définir fond", "Faire comptage", "Nouvelle session"** inopérants sur mobile (cause : `prompt()` et `confirm()` bloqués sur Safari iOS en contexte PWA)
- **Export JSON et CSV** potentiellement non fiables (cause : `<a>` non attaché au DOM avant click)
- Bouton "Supprimer produit" passe aussi par la modal générique

### Modifié
- Tous les `onclick` inline remplacés par `addEventListener` ou event delegation
- Affichage "X dispo" au lieu de "X stk" dans la grille caisse pour refléter le stock réellement disponible

---

## [2.0.0] — Multi-appareils + Sync

### Ajouté
- **Timestamp ISO complet** (`timestamp`, `date`, `heure`) dans chaque vente
- **`deviceId` unique** généré au premier lancement + **`deviceLabel`** renommable
- **ID vente unique** combinant `deviceId + timestamp + random` pour déduplication fiable
- **Sauvegarde automatique JSON au reset** avant effacement (zéro perte de données)
- **Onglet Sync dédié** :
  - Export JSON manuel
  - Import + fusion de plusieurs JSON avec déduplication par ID
  - Restauration totale depuis backup
  - Ventilation CA par appareil
- **Toast non-intrusif** pour feedback actions (1,8 s, auto-disparition)
- **Colonne Appareil** dans l'export CSV

### Modifié
- Historique des ventes trié par timestamp décroissant
- Affichage du label appareil à côté de chaque vente dans le bilan

---

## [1.0.0] — Navigation 2 niveaux + édition stock

### Ajouté
- **Navigation 2 niveaux** : Catégorie → Modèle → Taille
- **7 modèles de dessins** : Loup, Tiki, Arbre de vie, Sound System, Fuck, Lion, Singes de la sagesse
- **Modal HTML** pour ajout/édition produit (remplace les `prompt` basiques)
- **Édition produit au tap** sur la ligne dans l'onglet Stock
- **Fond de caisse** initial configurable
- **Comptage final** avec calcul d'écart (théorique vs compté)
- **Persistance localStorage** (les données survivent au rechargement)
- **Export CSV** avec colonnes détaillées
- **Annulation dernière vente** avec restauration du stock
- **Panier compact fixe** en bas de l'écran (dépliable au tap)
- **Fil d'Ariane** pour naviguer dans les niveaux

### Modifié
- Grille produits en 3 colonnes (au lieu de 2) pour afficher plus de produits
- Boutons légèrement plus petits pour gagner de la place

---

## [0.1.0] — Preview initiale

### Ajouté
- Grille produits avec 9 produits hardcodés (T-Shirt/Pull/Sweat × M/L/XL)
- Panier en bas de l'écran
- Encaissement Cash / CB
- Onglets Caisse / Stock / Bilan
- CA total et nombre de ventes dans le header
- Export CSV basique
- Top produits et historique des ventes

### Limites connues
- Données en mémoire seule (perdues au rechargement)
- Prompt JS natif pour ajout produit (non fiable sur mobile)
- Pas de navigation hiérarchique
