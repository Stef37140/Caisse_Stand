# 🛒 Caisse Stand

PWA (Progressive Web App) de **caisse enregistreuse locale et auto-hébergée** pour gérer les ventes sur un stand de marché (vêtements : T-Shirts, Pulls, Sweats avec différents modèles/dessins et tailles).

> Outil interne de suivi, sans certification NF525. Pas destiné à un usage commercial réglementé.

## ✨ Fonctionnalités (V2.1)

- 🛒 **Encaissement rapide** en 2-3 taps — navigation 2 niveaux Catégorie → Modèle → Taille
- 💵 **Rendu monnaie cash** calculé en temps réel
- 💳 **Paiement CB** direct, sans friction
- 📦 **Gestion stock** (ajout, édition, suppression, +/−) avec helper `stockDispo` (stock − panier)
- 📊 **Bilan** : CA, top produits, historique, fond de caisse, comptage final avec calcul d'écart
- 🔄 **Multi-appareils** : export/import JSON, fusion avec déduplication, ventilation par appareil
- 📥 **Exports** : CSV (UTF-8 + BOM pour Excel) et JSON complet
- 💾 **100 % offline** — localStorage, aucun compte, aucun serveur
- 📱 **Compatible iOS Safari et Android Chrome** sans adaptation

## 🚀 Démarrage rapide

Deux variantes cohabitent selon l'usage :

### 🌐 Variante PWA installable (recommandée, usage quotidien)

Fichiers : `index.html` + `manifest.json` + `sw.js` + `icons/`. Nécessite un hébergement HTTPS.

- **Auto-hébergement Synology Web Station** (DDNS + Let's Encrypt, guide détaillé dans [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md))
- **GitHub Pages** (gratuit, HTTPS auto)
- **Cloudflare Pages / Netlify / Vercel** (gratuit, CDN mondial)

Une fois en ligne : l'utilisateur ouvre l'URL, installe via "Partager → Sur l'écran d'accueil" (iOS) ou bouton "Installer" (Android) → icône sur l'écran d'accueil → fonctionne offline complet grâce au service worker.

### 📦 Variante portable (fichier unique, partage direct)

Pour partager l'app à une personne qui va juste double-cliquer sur un fichier reçu par email / AirDrop / clé USB. Un seul `.html` auto-suffisant (~400 Ko, Tailwind inliné).

```bash
python3 scripts/build-portable.py
# → dist/caisse-stand-portable.html
```

Pas d'installation PWA, pas de mises à jour auto, mais rien à héberger. Voir [`dist/README.md`](dist/README.md) et [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) pour la comparaison détaillée.

### 💻 Dev local rapide

```bash
python3 -m http.server 8000
# → http://localhost:8000 (localhost autorise le service worker)
```

## 🏗️ Stack technique

Volontairement minimaliste :

- **HTML + JS vanilla** (pas de framework, pas de build tool)
- **Tailwind CSS via CDN**
- **localStorage** pour la persistance
- **Un seul fichier** `index.html`

Voir `docs/ARCHITECTURE.md` pour le détail du modèle de données, des patterns (stockDispo, event delegation, modal générique) et des décisions structurantes.

## 📁 Structure du repo

```
Caisse_Stand/
├── index.html              # PWA complète (V2.1)
├── manifest.json           # [V3.0 à venir]
├── sw.js                   # [V3.0 à venir]
├── icons/                  # [V3.0 à venir]
├── CLAUDE.md               # Contexte complet pour Claude Code
├── README.md               # Ce fichier
├── CHANGELOG.md            # Historique des versions
├── ROADMAP.md              # Prochaines étapes
├── docs/
│   ├── ARCHITECTURE.md     # Décisions techniques
│   ├── BUGS_RESOLUS.md     # Historique bugs + fixes
│   └── CHECKLIST_TESTS.md  # 25 scénarios de tests manuels
└── REX/
    └── PENDING_LEARNINGS.md  # Bridge cross-workstation Claude Code
```

## 🗺️ Roadmap

Voir `ROADMAP.md` pour la feuille de route priorisée.

Principales étapes à venir :

- **V3.0** — PWA installable (manifest + service worker + icônes)
- **V3.1** — Hébergement Synology / GitHub Pages documenté
- **V3.2** — Images produits à la place des emojis
- **V3.3** — Archivage des sessions clôturées

## 🧪 Tests

Voir `docs/CHECKLIST_TESTS.md` — 25 scénarios de tests manuels à passer avant chaque release, avec focus iPhone Safari (environnement le plus piégeux pour les PWA).

## 📜 Licence

Projet personnel, usage libre. Pas de support commercial.

## 👤 Auteurs

Projet personnel, développé en pair-programming avec Claude (Anthropic) :

- **V0 → V2.1** : itérations sur Claude.ai mobile
- **V3.0+** : reprise avec Claude Code, ajout PWA installable + variante portable + correctifs UX/sync

Les contributions extérieures sont les bienvenues via issues et pull requests.
