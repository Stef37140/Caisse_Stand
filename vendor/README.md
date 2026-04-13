# 📦 Vendored libraries

Bibliothèques tierces incluses dans le repo pour garantir le fonctionnement offline (le service worker met l'app en cache, ces libs avec).

Toutes sont sous **licences permissives compatibles** (MIT) et ont été récupérées depuis leurs dépôts officiels GitHub à des versions stables.

| Fichier | Version | Source | Licence | Usage |
|---|---|---|---|---|
| `qrcode.min.js` | davidshimjs/qrcodejs (master) | [github.com/davidshimjs/qrcodejs](https://github.com/davidshimjs/qrcodejs) | MIT | Génération de QR codes pour la sync P2P |
| `jsQR.min.js` | cozmo/jsQR (master, minifié localement via terser) | [github.com/cozmo/jsQR](https://github.com/cozmo/jsQR) | Apache 2.0 | Décodage de QR codes (fallback navigateurs sans BarcodeDetector API) |
| `pako.min.js` | nodeca/pako (master) | [github.com/nodeca/pako](https://github.com/nodeca/pako) | MIT + Zlib | Compression deflate/inflate des payloads sync (densifie les QR codes) |

## Pourquoi vendoriser plutôt que CDN ?

1. **Offline first** : l'app doit fonctionner en zone blanche réseau. Les CDN ne sont pas joignables sans internet, le SW pré-cache local oui.
2. **Stabilité** : les CDN peuvent être down, changer leur URL, supprimer une version. Vendoriser fige les versions.
3. **Confidentialité** : pas de fuite vers un CDN tiers à chaque chargement.
4. **Variante portable** : le script `scripts/build-portable.py` inline ces libs dans le fichier unique. Pas possible si elles sont en CDN.

## Mises à jour

Pour mettre à jour une lib :

1. Récupérer la nouvelle version depuis le dépôt source
2. Remplacer le fichier dans `vendor/`
3. Bumper `CACHE_VERSION` dans `sw.js` pour invalider le cache PWA
4. Tester la PWA (notamment la sync QR sur deux appareils)
5. Régénérer la portable : `python3 scripts/build-portable.py`
