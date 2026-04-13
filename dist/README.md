# 📦 Builds générés

Ce dossier contient les artefacts produits par les scripts de `../scripts/`. **Ne pas éditer à la main** — tout ce qui est ici est régénérable.

## Contenu

### `caisse-stand-portable.html` *(si généré)*

Version auto-suffisante de l'app en un **seul fichier** (~400 Ko avec Tailwind inliné). Destinée au partage direct (email, AirDrop, clé USB) avec un usage type « j'envoie ça à quelqu'un qui va juste double-cliquer ».

**Caractéristiques :**
- ✅ Fonctionne hors ligne dès le premier lancement
- ✅ Toutes les fonctionnalités de la V3.0 (caisse, stock, bilan, sync, CSV, JSON)
- ✅ Ouverture directe par double-clic (`file://`) ou via n'importe quel serveur HTTP
- ❌ Pas d'installation PWA (pas de service worker, pas de manifest fonctionnel)
- ❌ Pas d'icône automatique sur l'écran d'accueil
- ❌ Mises à jour manuelles (il faut renvoyer le fichier)

## Régénération

```bash
# Depuis la racine du repo
python3 scripts/build-portable.py
```

Voir `../scripts/build-portable.py --help` pour les options.

## Quelle version pour quel usage ?

| Cas d'usage | Version recommandée |
|---|---|
| Hébergement sur NAS / GitHub Pages / Cloudflare Pages | **PWA complète** (`../index.html` + `manifest.json` + `sw.js` + `icons/`) |
| Partage direct à un ami néophyte, sans serveur | **Portable** (`caisse-stand-portable.html`) |
| Démo offline en conférence / formation | **Portable** |
| Usage quotidien sur stand de marché | **PWA complète** (installable, icône, offline via SW) |
