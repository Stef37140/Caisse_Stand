# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### À venir
- Images produits (remplacement des emojis) — V3.2
- Archivage des sessions clôturées — V3.3
- Rendu monnaie avancé avec coupures rapides — V3.4

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
