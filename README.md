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

### Option 1 — Ouverture directe (dev)

```bash
# Serveur local minimal pour tester
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000
```

> ⚠️ En `file://` direct les téléchargements peuvent échouer sur certains navigateurs. Préférer un serveur HTTP.

### Option 2 — Hébergement statique

L'app tient dans un seul fichier `index.html` (auto-suffisant, Tailwind via CDN). Elle peut être déployée sur :

- GitHub Pages (HTTPS gratuit — indispensable pour installer en PWA)
- Synology Web Station (voir `docs/DEPLOIEMENT.md` à venir en V3.1)
- Vercel, Netlify, Cloudflare Pages, etc.
- Container Docker nginx

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

## 👤 Auteur

Stéphane Lesigne — maker, technicien métrologue, adepte du self-hosting.

Développé en pair-programming avec Claude (Anthropic) — itérations V0 → V2.1 sur Claude.ai mobile, puis reprise Claude Code pour la V3+.
