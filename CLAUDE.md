# CLAUDE.md — Caisse Stand PWA

> Ce fichier contient tout le contexte nécessaire pour que Claude Code reprenne le développement de ce projet sans perdre le fil. Lire en entier avant toute modification.

## 🎯 Objectif du projet

PWA (Progressive Web App) de **caisse enregistreuse locale et auto-hébergée** pour gérer les ventes sur un **stand de marché** (vêtements : T-Shirts, Pulls, Sweats avec différents modèles/dessins et tailles).

**Contexte métier** : Stéphane aide un ami sur un stand de marché et veut un outil de **transparence totale** pour suivre stock + caisse + ventes sans avoir recours à une solution commerciale type SumUp/Loyverse (Loyverse n'est pas disponible sur l'App Store FR à cause de l'absence de certification NF525).

L'app n'a **pas vocation à être un logiciel de caisse officiel NF525** — c'est un outil interne de suivi entre le vendeur et le propriétaire du stand, sans aucune obligation fiscale à respecter.

## 🔒 Contraintes non-négociables

Ces contraintes ont été validées au cours de l'itération V0 → V2.1 et ne doivent pas être remises en cause sans raison explicite :

1. **100 % local** — aucun serveur, aucun backend, aucun compte cloud. Tout tourne dans le navigateur.
2. **Zéro inscription** — pas de compte à créer, pas de login.
3. **Pas de certification NF525** — usage interne, pas de caisse fiscale officielle.
4. **Compatible iOS et Android** — doit fonctionner dans Safari iPhone et Chrome Android sans adaptation.
5. **Utilisable en mode offline complet** — sur un marché le réseau est aléatoire.
6. **Rapidité d'encaissement prioritaire** — chaque vente doit se faire en 2-3 taps maximum, rush du marché oblige.
7. **Transparence multi-appareils** — possibilité de faire tourner l'app sur 2-3 téléphones en parallèle et de consolider les ventes en fin de journée via fusion de fichiers JSON.
8. **Philosophie open source / self-hosted** — cohérent avec l'écosystème de Stéphane (Synology DS920+, Docker stack, Home Assistant, Claude Code, Ollama, etc.).

## 🏗️ Stack technique

Volontairement minimaliste :

- **HTML/JS vanilla** (pas de React, pas de build tool, pas de bundler)
- **Tailwind CSS via CDN** (`https://cdn.tailwindcss.com`) — pas de config PostCSS
- **localStorage** pour la persistance (pas encore IndexedDB, pourrait migrer en V3+ si quota 5 Mo insuffisant)
- **Un seul fichier `index.html`** auto-suffisant actuellement (à éventuellement refactorer en modules en V3+)
- **Event delegation** via `data-action` / `data-tab` attributs pour gérer les éléments générés dynamiquement

**Pourquoi ce choix** : simplicité de déploiement (un fichier à servir), pas de chaîne de build, modifiable directement dans n'importe quel éditeur, déployable sur n'importe quel hébergement statique (Synology, GitHub Pages, Vercel, ou même ouverture directe `file://`).

## 📁 Structure du repo

```
Caisse_Stand/
├── index.html              # PWA complète (V2.1 actuelle)
├── manifest.json           # [À CRÉER EN V3] PWA manifest pour installation
├── sw.js                   # [À CRÉER EN V3] Service worker minimal
├── icons/                  # [À CRÉER EN V3] Icônes PWA 192, 512, maskable
├── CLAUDE.md               # Ce fichier
├── README.md               # Doc publique du projet
├── CHANGELOG.md            # Historique versions
├── ROADMAP.md              # Prochaines étapes
├── docs/
│   ├── ARCHITECTURE.md     # Décisions techniques
│   ├── BUGS_RESOLUS.md     # Historique des bugs et leurs fixes
│   └── CHECKLIST_TESTS.md  # Tests manuels à passer avant release
├── REX/
│   └── PENDING_LEARNINGS.md  # Pattern cross-workstation (comme Trames_METCal)
└── .gitignore
```

## 📖 Historique du développement (V0 → V2.1)

Le projet a été itéré dans une conversation Claude.ai mobile avec Stéphane. Voici le récap des étapes :

### V0 — Premier jet
- Grille produits en 2 colonnes avec 9 produits hardcodés (T-Shirt/Pull/Sweat × M/L/XL)
- Panier en bas de l'écran, encaissement Cash/CB
- Onglets Caisse / Stock / Bilan
- Données en mémoire seule (perdues au rechargement)
- **Feedback utilisateur** : panier prend trop de place, boutons trop gros, besoin de navigation 2 niveaux pour gérer plusieurs modèles de dessins

### V1 — Navigation 2 niveaux + modale produit
- Passage à une navigation en 2 niveaux : Catégorie → Modèle → Taille
- Ajout de 7 modèles de dessins : **Loup, Tiki, Arbre de vie, Sound System, Fuck, Lion, Singes de la sagesse** (représentés par emojis, à remplacer par vraies images plus tard)
- Panier compact fixe en bas (barre + dépliable au tap)
- Modal HTML pour ajout/édition produit (avec select catégorie/modèle/taille)
- Édition produit au tap sur ligne stock
- Fond de caisse + comptage final avec calcul d'écart
- Persistance localStorage
- Export CSV
- **Feedback utilisateur** : plusieurs boutons Bilan ne fonctionnent pas, bouton "Ajouter un produit" dans Stock ne fonctionne pas

### V2 — Multi-appareils + timestamp + sync JSON
- **Timestamp ISO complet** (date + heure + ISO string) dans chaque vente
- **`deviceId` unique** généré au premier lancement + `deviceLabel` renommable
- **ID unique par vente** combinant `deviceId + timestamp + random` pour dédup fiable
- **Sauvegarde automatique JSON au reset** avant effacement
- **Onglet Sync dédié** avec :
  - Export JSON manuel
  - Import + fusion de plusieurs JSON (multi-select, déduplication par ID)
  - Restauration totale depuis backup
  - Ventilation CA par appareil
- **Toast non-intrusif** pour feedback actions (1,8 s, auto-disparition)
- **Feedback utilisateur critique** :
  - Stock pas décrémenté visuellement à l'ajout panier
  - Boutons "Définir fond", "Faire comptage", "Nouvelle session" ne fonctionnent pas
  - Export JSON/CSV douteux
  - Demande fonctionnalité rendu monnaie au paiement cash

### V2.1 — Corrective + rendu monnaie
**Diagnostic des bugs V2** :
1. Stock pas mis à jour visuellement : `renderCaisse()` pas rappelée après `ajouterAuPanier()`, et l'affichage montrait le stock réel au lieu du stock disponible (stock − qté dans panier)
2. Boutons Bilan inopérants : **`prompt()` et `confirm()` natifs sont bloqués silencieusement sur Safari iOS en mode PWA/standalone et dans certains contextes mobile**. Les clics ne produisaient aucun effet visible.
3. Export JSON/CSV non fiable : `URL.createObjectURL` + clic programmatique peut échouer sur certains navigateurs si le `<a>` n'est pas ajouté au DOM avant le clic.

**Fixes apportés** :
- Introduction d'une fonction `stockDispo(produitId)` qui calcule `stock − quantité dans panier` en temps réel
- Appel de `renderCaisse()` après chaque modification panier pour refléter le stock dispo
- **Création d'une modal HTML générique `genModal()`** qui remplace TOUS les `prompt` et `confirm`. Elle gère : titre, message, input optionnel (numérique), boutons OK/Annuler, et un mode spécial "rendu monnaie" pour le paiement cash
- Fonction `downloadBlob()` centralisée avec try/catch, ajout du `<a>` au DOM avant click, toast d'erreur si échec
- Passage de tous les `onclick` inline à `addEventListener` + **event delegation globale** via `data-action` / `data-tab`
- **Calcul rendu monnaie cash en temps réel** : quand l'utilisateur tape le montant donné par le client, le rendu se met à jour instantanément (vert si positif, rouge si insuffisant)
- Bouton "Renommer l'appareil" dans Sync (plus besoin de répondre au prompt initial)

## 🐛 Bugs résolus (leçons pour le futur)

### `prompt()` et `confirm()` bloqués sur mobile
**Symptôme** : les boutons déclenchant `prompt()` ou `confirm()` ne font rien visiblement sur Safari iOS/PWA.
**Cause** : Safari bloque ces APIs natives dans certains contextes (PWA standalone, iframe, `file://`) sans message d'erreur.
**Fix** : toujours utiliser des modals HTML custom. Ne **jamais** réintroduire `prompt`/`confirm` dans le code.

### Event handlers inline sur contenu dynamique
**Symptôme** : les boutons générés via `innerHTML` avec `onclick="fn()"` peuvent perdre leur handler ou ne pas être correctement liés.
**Fix** : event delegation globale via `document.addEventListener('click', ...)` qui inspecte les `data-action` attributes. Plus robuste et plus performant.

### Téléchargement de blobs
**Symptôme** : `URL.createObjectURL + a.click()` échoue silencieusement sur Firefox et certains Safari.
**Fix** : toujours `document.body.appendChild(a)` avant `a.click()`, puis `removeChild` après. Et `setTimeout(() => URL.revokeObjectURL(url), 1000)` pour libérer proprement.

### Stock panier vs stock réel
**Symptôme** : utilisateur ajoute au panier mais voit toujours le stock initial affiché.
**Fix** : séparer `p.stock` (stock réel, ne bouge qu'à l'encaissement) de `stockDispo(id)` (calculé dynamiquement = `stock − qté en panier`). Afficher `stockDispo` partout dans la grille caisse.

## 🗺️ Roadmap V3+

Les prochaines étapes, par ordre de priorité. **À discuter avec l'utilisateur avant d'attaquer** — ne pas tout faire d'un coup.

### V3.0 — PWA installable (priorité haute)
- Créer `manifest.json` avec nom, icônes, couleurs, display `standalone`, orientation `portrait`
- Créer `sw.js` service worker minimal (cache-first pour les ressources statiques)
- Générer icônes PWA : 192×192, 512×512, maskable 512×512 (utiliser `icons/` — peut être des emojis rendus en PNG via canvas, ou des icônes custom)
- Tester l'installation effective sur iPhone (Safari → Partager → Sur l'écran d'accueil) et Android (Chrome → Installer l'app)
- Vérifier que l'app fonctionne en mode avion une fois installée

### V3.1 — Hébergement Synology / GitHub Pages
- Documenter la procédure de déploiement sur Synology via Web Station ou container Docker (nginx)
- Alternative : GitHub Pages pour accès externe en HTTPS (nécessaire pour certaines API PWA)
- Tester depuis le réseau local Stéphane

### V3.2 — Images produits
- Remplacer les emojis modèles par vraies images
- Upload depuis galerie → redimensionnement canvas → conversion base64 → stockage dans l'objet produit
- Attention quota localStorage ~5 Mo : envisager migration IndexedDB si > 20 images
- Fallback emoji si pas d'image définie

### V3.3 — Archivage sessions
- Au lieu de juste reset, archiver chaque session clôturée dans un historique
- Nouvel onglet ou sous-vue "Historique sessions"
- Consultable, comparable, exportable en masse
- Stockage séparé (`caisse_sessions_archive`) pour ne pas alourdir la session courante

### V3.4 — Rendu monnaie avancé
- Boutons rapides coupures : 5 €, 10 €, 20 €, 50 €, 100 €
- Calcul détaillé du rendu par coupures disponibles
- Historique des derniers montants donnés

### V3.5 — Refactoring modulaire
- Séparer `index.html` en :
  - `index.html` (HTML + imports)
  - `css/styles.css` (custom CSS en plus de Tailwind)
  - `js/state.js` (état global, persistance)
  - `js/caisse.js` (logique caisse + panier)
  - `js/stock.js` (gestion stock + modals produit)
  - `js/bilan.js` (bilan + comptage + exports)
  - `js/sync.js` (import/export JSON, fusion multi-appareils)
  - `js/ui.js` (modals génériques, toasts, navigation)
- Attention : **sans build tool**, utiliser `<script type="module">` ou simple chargement séquentiel

### V3.6 — Tests et checklist
- Créer `docs/CHECKLIST_TESTS.md` avec les 15-20 scénarios à valider avant chaque release
- Idéalement, une page de tests automatisés accessible via `tests.html`

### Idées en vrac (non prioritaires)
- Mode sombre
- Multi-langues (FR/EN)
- Partage de session via QR code (contient un JSON compact)
- Impression ticket via imprimante Bluetooth thermique (gros projet)
- Gestion remises / promotions
- Catégories produits personnalisables (au-delà de T-Shirt/Pull/Sweat)
- Statistiques comparatives multi-marchés

## 🧪 Tests manuels à passer après chaque modification

Voir `docs/CHECKLIST_TESTS.md` pour la liste complète. Les critiques à tester systématiquement :

1. Ajout produit au panier → stock décrémenté visuellement
2. Encaissement cash avec rendu monnaie → montant affiché correctement
3. Encaissement CB → vente enregistrée sans modal de rendu
4. Bouton "Définir" fond de caisse → modal s'ouvre et enregistre
5. Bouton "Faire le comptage" → modal s'ouvre, calcul écart correct
6. Bouton "Nouvelle session" → téléchargement JSON automatique avant reset
7. Export CSV → fichier téléchargé avec encoding UTF-8 correct (accents OK dans Excel)
8. Export JSON → fichier téléchargé, réimportable
9. Import + fusion JSON → déduplication fonctionne, compteur ventes correct
10. Renommage appareil → persistant après rechargement

## 👤 Contexte utilisateur

Stéphane Lesigne (pseudo "Stéf") — Technicien Métrologue WIKA / CNPE Chinon. Maker actif : woodworking, 3D printing, laser engraving. Stack perso : Synology DS920+, Docker, Home Assistant, Ollama, Claude Code. Forte préférence pour open source et self-hosting.

**Communication préférée** : réponses détaillées techniques, numérotées quand pertinent, code blocks, tables, templates prêts à l'emploi, Markdown structuré, diagrammes Mermaid quand utile. Tone pragmatique et précis. Proactivité sur les optimisations et analyses critiques.

**Proficiences** : VBA, YAML, JSON, Markdown, Bash, HTML/CSS, Notepad++, Excel, Docker Compose, Grafana. Connait le pattern Claude Code (vient du repo `Trames_METCal`).

**Pattern REX cross-workstation** : Stéphane utilise un fichier `REX/PENDING_LEARNINGS.md` pour synchroniser les apprentissages entre ses sessions Claude Code sur différents postes. Ce repo devrait adopter le même pattern.

## 📝 Conventions de commit

Format recommandé (inspiré de conventional commits) :

```
<type>: <description courte>

[corps optionnel]
```

Types :
- `feat:` nouvelle fonctionnalité
- `fix:` correction bug
- `refactor:` refonte sans changement fonctionnel
- `docs:` documentation
- `style:` cosmétique (CSS, layout)
- `test:` tests
- `chore:` maintenance (gitignore, deps…)

Exemples :
```
feat: ajout calcul rendu monnaie paiement cash
fix: boutons Bilan inopérants (prompt bloqué mobile)
refactor: event delegation globale via data-action
docs: CLAUDE.md initial avec historique V0 → V2.1
```

## 🔄 Workflow de travail recommandé

1. Lire ce fichier en entier
2. Lire `index.html` pour comprendre l'état actuel du code
3. Lire `ROADMAP.md` pour voir les prochaines étapes validées
4. Lire `REX/PENDING_LEARNINGS.md` pour récupérer les apprentissages en cours
5. Demander confirmation à l'utilisateur avant d'attaquer une tâche majeure
6. Tester manuellement après chaque modification significative (voir checklist)
7. Commit atomiques avec messages clairs
8. Mettre à jour `CHANGELOG.md` avant de pousser une nouvelle version
9. Mettre à jour `REX/PENDING_LEARNINGS.md` avec les nouveaux apprentissages de la session

---

**Dernière mise à jour** : Lors de la bascule Claude.ai → Claude Code, après la livraison de la V2.1.
