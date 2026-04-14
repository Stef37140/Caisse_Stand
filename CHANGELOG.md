# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### À venir
- Images produits (remplacement des emojis) — V3.5
- Archivage des sessions clôturées — V3.6

---

## [3.4.2] — Champ cash démarre à 0

### Modifié
- Le champ d'encaissement cash s'ouvre désormais avec **0** au lieu d'être
  pré-rempli avec le total dû. Permet d'empiler directement les coupures
  reçues du client sans devoir taper `↺` à chaque vente.
- Message de la modal mis à jour : "Empile les coupures reçues du client
  (rendu en direct)".
- Note : le champ reste éditable au clavier pour les cas où on connaît
  d'avance le montant exact (`17,50` etc.).

### Technique
- CACHE_VERSION v3.4.1 → v3.4.2

---

## [3.4.1] — Coupures cash en mode additif

### Modifié
- **Boutons coupures cash deviennent additifs** au lieu de remplacer la
  valeur. Cas d'usage typique : le client donne 2×5 € + 10 € pour un
  achat de 20 € → on tape `+5` `+5` `+10` et l'app affiche le rendu en
  temps réel à chaque empilage. Avant : il fallait taper `5` qui mettait
  5, puis `10` qui mettait 10 (perte des 5 précédents).
- **Labels mis à jour** : `5 €` → `+5`, `10 €` → `+10`, etc. (signe
  explicite pour rappeler l'addition).
- **Nouveau bouton ↺** (rouge clair) à côté des coupures pour remettre
  le champ à 0. Utile pour repartir d'une feuille blanche quand on
  veut empiler les coupures (sans avoir à effacer manuellement le
  pré-remplissage du total dû).
- Helper `fmt(n)` : affiche les entiers proprement (`20` au lieu de
  `20.00`) tout en gardant 2 décimales pour les valeurs non entières
  (`19.50`). Arrondi à 2 décimales pour éviter les erreurs flottants.

### Technique
- CACHE_VERSION v3.4.0 → v3.4.1
- Version affichée bumpée

---

## [3.4.0] — Trio UX de confort (recherche stock, seuil alerte, coupures cash)

Trois petites features à grand impact pour le quotidien stand, sans ajouter
de complexité conceptuelle.

### Ajouté

- **🔍 Recherche dans Stock** : un champ de recherche en haut de l'onglet
  filtre en direct la liste. Insensible à la casse ET aux accents
  (normalisation NFD Unicode → "Médium" matche "medium"). Cherche dans
  catégorie + modèle + taille. Bouton × pour vider. Un indicateur
  "X / Y produits" montre le nb filtré. Utile dès qu'on dépasse 20-30 produits.
- **⚠️ Indicateur stock faible** : seuil configurable (3 par défaut,
  0 pour désactiver) via un champ inline à côté de la recherche.
  Produit à 0 → ligne rouge + chiffre rouge (déjà existant). Produit
  entre 1 et seuil → ligne ambre + chiffre ambre. Seuil persisté en
  localStorage `caisse_stock_faible`, **par appareil** (préférence
  d'affichage, pas synchronisée entre tels).
- **💵 Coupures rapides** au paiement cash : 5 boutons (5, 10, 20, 50,
  100 €) sous le champ de saisie dans la modal d'encaissement. Tap
  remplace la valeur (pas d'addition, pour rester prévisible) et
  recalcule le rendu instantanément. Accélère ~30-40 % des paiements
  où le client donne une coupure ronde.

### Modifié

- `renderStock` filtre désormais via `stockSearch` et applique les
  classes de seuil. Toujours performant (< 200 produits).
- `genModal` avec `showRendu: true` affiche les coupures. En mode
  autre (`showRendu: false`), les coupures sont cachées — pas de
  régression sur les modals fond de caisse / comptage / rendu produit.

### Technique

- CACHE_VERSION v3.3.0 → v3.4.0.
- Title et version affichée bumpés.

---

## [3.3.0] — Import / Export stock CSV

Pour préparer l'inventaire dans Excel / LibreOffice en amont d'un marché
et l'importer en un clic. Complète l'export CSV des ventes existant.

### Ajouté

- **Section "📊 Import / Export stock (CSV)"** dans l'onglet Stock avec
  3 boutons : 📄 Modèle / 📥 Importer / 📤 Exporter.
- **Bouton "📄 Modèle"** télécharge un `modele_stock.csv` prêt à remplir
  avec 5 exemples couvrant plusieurs types (T-Shirt, Pull, Tote bag, Body).
- **Bouton "📤 Exporter"** produit un `stock_YYYY-MM-DD.csv` du stock
  actif actuel (utile pour repartir avec le même catalogue au marché
  suivant, ou pour le modifier en masse dans Excel).
- **Bouton "📥 Importer"** avec modal de confirmation offrant 2 modes :
  - **Ajouter / Mettre à jour** (défaut) : merge par (categorie, modele,
    taille). Les produits existants sont mis à jour (prix + stock reset
    à la valeur CSV). Les nouveaux sont ajoutés.
  - **⚠️ Remplacer tout** : tombstone tous les produits actifs puis
    import depuis CSV. Les ventes passées sont conservées. Mis en
    évidence en rouge pour éviter le clic accidentel.
- **Parser CSV tolérant** (`parseCSV`) :
  - BOM UTF-8 auto-géré
  - Séparateur `;` ou `,` auto-détecté à partir de la 1re ligne
  - Guillemets d'échappement standards (`""` pour un guillemet dans la
    valeur, valeurs avec `;` supportées)
  - Normalisation des headers (accents, casse, ponctuation) :
    `Catégorie` → `categorie`, `Size` → `size`, etc.
  - Synonymes acceptés : `category`/`categorie`, `model`/`modele`,
    `size`/`taille`, `price`/`prix`, `quantity`/`qty`/`stock`
  - Prix français accepté (virgule en séparateur décimal : `19,50`)
- **Auto-création de la taxonomie** : si le CSV référence une catégorie /
  modèle / taille qui n'existe pas, elle est créée à la volée avec :
  - Catégorie : première couleur libre de la palette
  - Modèle : emoji 👕 par défaut (à personnaliser via ⚙ Référentiel)
  - Taille : ordre = max actuel + 1
- Rapport détaillé en toast après import : `X ajoutés · Y MAJ ·
  Z remplacés · créés : N cat. + M modèles + T tailles · ⚠ K invalides`
- `cloudClearPushFp()` invalidé après import pour propager au cloud.
- Cohérence : le CSV exporté a **exactement le même format** que celui
  attendu à l'import → round-trip possible.

### Modifié

- Le bouton "📥 Export CSV" de l'onglet Bilan (qui exporte les ventes)
  devient "📥 Export ventes CSV" pour éviter la confusion avec le nouveau
  bouton "📤 Exporter" du stock.
- Nom du fichier de l'export ventes : `caisse_YYYY-MM-DD.csv` →
  `ventes_YYYY-MM-DD.csv` (plus explicite).

### Technique

- CACHE_VERSION bumpé v3.2.1 → v3.3.0 (déclenche la bannière de MAJ).
- Title : `v3.2` → `v3.3`.

---

## [3.2.0] — Référentiel personnalisable (catégories, modèles, tailles)

L'utilisateur peut désormais créer ses propres catégories (Tote bag, Body,
T-Shirt enfant, Débardeur femme…), modèles (nouveaux dessins) et tailles
(XS, 36, 38, Unique…) sans toucher au code. Le référentiel est synchronisé
entre tous les téléphones via QR ou cloud.

### Ajouté

- **Référentiel persistant** `taxonomie = { categories, modeles, tailles }`
  stocké dans `localStorage.caisse_taxonomie`. Chaque item porte
  `lastModified` + `deletedAt?` pour la sync (last-write-wins par nom).
- **Migration douce** au premier load : les valeurs hardcodées V3.1
  (T-Shirt/Pull/Sweat, 7 modèles emoji, S/M/L/XL/XXL) sont reprises
  comme défauts pour ne pas casser l'existant.
- **Bouton ⚙ Référentiel** dans l'onglet Stock à côté du bouton d'ajout
  produit.
- **Modal "Gérer le référentiel"** avec 3 onglets :
  - **Catégories** : nom + couleur (palette de 12 couleurs Tailwind à
    sélectionner d'un tap)
  - **Modèles** : nom + emoji (clavier emoji mobile via 🌐)
  - **Tailles** : nom + ordre d'affichage (numérique)
- Tag "utilisé" sur chaque item référencé par au moins un produit actif.
  Suppression bloquée dans ce cas (sécurité contre les orphelins).
- Suppression via tombstone : `deletedAt` posé au lieu de retrait du
  tableau, pour propager aux autres téléphones lors de la sync.
- Modal "Ajouter / Éditer un produit" : les `<select>` catégorie /
  modèle / taille sont peuplés dynamiquement depuis la taxonomie. Si un
  produit existant référence un item inconnu (cas de désync), l'option
  est ajoutée en tête avec ⚠.

### Modifié

- `buildSyncPayload` bumpe à `v=2` et inclut la taxonomie filtrée par
  cutoff.
- `applySyncPayload` accepte v=1 ET v=2 (backward-compat) et merge la
  taxonomie en LWW. Compteurs `taxoAjoutes / taxoMaj / taxoSupprimes`
  ajoutés au rapport.
- Tous les rendus utilisent `categorieCouleur(nom)` et `modeleIcone(nom)`
  au lieu des constantes `COULEURS_CAT[nom]` / `ICONS_MODELE[nom]` (qui
  restent en fallback pour la rétro-compat des données pré-migration).
- Modifications du référentiel invalident `cloudClearPushFp()` pour
  propager immédiatement au cloud.

### Limitation connue

- **Pas de renommage direct** d'un item de référentiel : la clé est le
  nom. Pour renommer, créer le nouveau, déplacer les produits via leur
  édition, puis supprimer l'ancien. Compromis pragmatique pour éviter
  la cascade rename complexe en sync (qui demanderait des IDs internes).

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
