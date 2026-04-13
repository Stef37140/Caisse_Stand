# 🚀 Déploiement & test de la PWA

Procédures pour servir l'app, la tester localement et la déployer en production. Indispensable pour valider l'installation PWA (service worker + manifest) qui nécessite **HTTPS** (sauf `localhost`).

---

## ⚠️ Prérequis HTTPS

Les Service Workers ne fonctionnent **que** dans un de ces contextes :

- `http://localhost` ou `http://127.0.0.1` (exception dev)
- `https://…` (production)
- `file://` **ne marche pas** pour la PWA, il faut obligatoirement un serveur

Donc ouvrir `index.html` en double-clic **ne suffit pas** pour tester l'installation PWA ni l'offline via SW.

---

## Option A — Test local rapide (Python http.server)

Pour développer et tester les fonctionnalités hors PWA :

```bash
cd /chemin/vers/Caisse_Stand
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans Chrome ou Firefox.

✅ **Ça marche pour** : tester l'app, l'ajout panier, les exports, les modals.
✅ **Le SW s'enregistre** (localhost est une exception HTTPS).
❌ **Pas d'accès mobile** sauf si tu utilises l'IP LAN du PC et que tu ouvres le port — mais alors pas de HTTPS donc pas de SW sur mobile.

---

## Option B — GitHub Pages (recommandé pour validation mobile)

HTTPS gratuit, activation en 2 clics, URL stable.

### Activation

1. Push la branche principale sur GitHub
2. Settings → Pages → Source : `Deploy from a branch`
3. Branch : `main` (ou la branche de travail) · Folder : `/ (root)`
4. Save
5. Attendre 30-60 s, l'URL `https://<user>.github.io/<repo>/` sera affichée

### Test d'installation

- **Android Chrome** : ouvrir l'URL → menu ⋮ → "Installer l'app" **OU** attendre le bouton "Installer" dans l'onglet Sync (déclenché par `beforeinstallprompt`)
- **iPhone Safari** : ouvrir l'URL → menu Partager ↑ → "Sur l'écran d'accueil"

Après installation, activer le mode avion et relancer l'app — elle doit s'afficher et fonctionner.

### Limitation

GitHub Pages ne sert pas de header `Service-Worker-Allowed`, donc le scope du SW est limité au chemin du fichier (`./sw.js` → scope `./`). C'est déjà ce qu'on fait, donc pas de souci.

---

## Option C — Synology Web Station (self-hosted)

Pour un accès LAN-only ou via reverse proxy HTTPS Synology.

### Prérequis

- Package **Web Station** installé
- Certificat HTTPS configuré (Let's Encrypt via DDNS ou cert local via reverse proxy)

### Déploiement direct (Web Station)

1. Web Station → Portail Web → Créer
2. Type : `Nom du nom du domaine` ou `Port`
3. Dossier : `/web/caisse_stand/` (ou un sous-dossier si tu préfères)
4. Copier le contenu du repo (`index.html`, `manifest.json`, `sw.js`, `icons/`) dans ce dossier via File Station, SSH ou `rsync`
5. Accéder via `https://synology.local/caisse_stand/` (ou ton nom de domaine DDNS)

### Déploiement via Docker nginx (alternative)

Si tu préfères isoler l'app dans un container :

```yaml
# docker-compose.yml
services:
  caisse:
    image: nginx:alpine
    container_name: caisse_stand
    restart: unless-stopped
    volumes:
      - ./Caisse_Stand:/usr/share/nginx/html:ro
    ports:
      - "8080:80"
    # Reverse proxy Synology derrière pour le HTTPS
```

Puis Control Panel → Application Portal → Reverse Proxy → ajouter :
- Source : `https://caisse.synology.local` (port 443)
- Destination : `http://localhost:8080`

---

## 🧪 Checklist de validation PWA

Après déploiement, tester dans cet ordre :

### 1. Le manifest est servi

Ouvrir les DevTools → Application → Manifest :
- [ ] `name`, `short_name`, `theme_color`, `icons` présents
- [ ] Aucune erreur rouge (icônes 404, etc.)

### 2. Le service worker s'installe

DevTools → Application → Service Workers :
- [ ] `sw.js` en status `activated and is running`
- [ ] Cache Storage contient `caisse-v3.0.0` avec `index.html`, `manifest.json`, `icons/*`

### 3. Mode offline

- [ ] Cocher "Offline" dans DevTools Network, recharger → l'app s'affiche toujours
- [ ] Activer le mode avion sur mobile → idem

### 4. Installation

- **Android Chrome** : bouton "Installer" apparaît dans l'onglet Sync → clic → l'app s'installe
- **iPhone Safari** : menu Partager → "Sur l'écran d'accueil"
- [ ] Après installation, l'icône figure sur l'écran d'accueil
- [ ] Au lancement, pas de barre d'URL (display: standalone)
- [ ] L'onglet Sync affiche "Mode : app installée (standalone)"

### 5. Mise à jour

- [ ] Modifier un élément de l'app, bumper `CACHE_VERSION` dans `sw.js`, redéployer
- [ ] Recharger l'app installée
- [ ] La bannière "🔄 Nouvelle version disponible" apparaît dans Sync
- [ ] Clic → l'app recharge avec la nouvelle version

---

## 🐛 Troubleshooting

### "Le bouton Installer n'apparaît pas sur Android"

- Vérifier que le manifest est valide (DevTools → Application → Manifest)
- Vérifier que l'icône 192×192 se charge sans 404
- Vérifier que le site est en HTTPS
- Chrome nécessite que l'utilisateur ait "engagé" avec le site (quelques secondes de navigation)
- Certains navigateurs mettent `beforeinstallprompt` en quarantaine si l'app a déjà été installée puis désinstallée récemment

### "Le service worker ne se met pas à jour"

- Bumper `CACHE_VERSION` dans `sw.js`
- Forcer le reload : DevTools → Application → Service Workers → "Update on reload"
- En dernier recours : "Unregister" puis recharger

### "Offline ne marche pas sur iPhone"

- iOS n'autorise le SW qu'en HTTPS strict (pas de `localhost` distant)
- Le SW doit s'être enregistré au moins une fois avec réseau avant que l'offline marche
- Tester en fermant complètement Safari puis réouvrant en mode avion

### "Les accents se cassent dans le CSV"

Non lié à la PWA. L'app écrit déjà le BOM UTF-8. Si problème : vérifier que le fichier est ouvert dans Excel via "Données → À partir d'un fichier texte" en forçant UTF-8, et pas par double-clic.

---

## 📚 Références

- [web.dev — Add a web app manifest](https://web.dev/articles/add-manifest)
- [web.dev — Service workers: an introduction](https://web.dev/articles/service-workers-cache-storage)
- [MDN — beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)
- [web.dev — Maskable icons](https://web.dev/articles/maskable-icon)
