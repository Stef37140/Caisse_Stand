# 🚀 Déploiement & test de la PWA

Procédures pour servir l'app, la tester localement et la déployer en production. Indispensable pour valider l'installation PWA (service worker + manifest) qui nécessite **HTTPS** (sauf `localhost`).

> 💡 **Besoin d'un fichier unique à partager ?** Voir la section « Variante portable » en bas de ce document. Un seul `.html` auto-suffisant, sans serveur requis, mais sans les bénéfices PWA (installation, offline via SW).

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

## Option B — GitHub Pages (gratuit, même pour repos privés)

HTTPS gratuit, activation en 2 clics, URL stable. **Gratuit sans limite pour les repos publics**, et inclus gratuitement dans les repos privés avec une limite très large (100 Go de bande passante/mois, bien au-delà des besoins d'une caisse de stand).

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

## Option C — Synology Web Station (self-hosted, recommandé pour le projet)

Option naturelle si tu as déjà un NAS Synology avec DSM 7+ et une stack Docker. **HTTPS obligatoire pour la PWA** — Synology offre tout ce qu'il faut gratuitement via DDNS + Let's Encrypt.

> Dans les exemples ci-dessous, remplace `<votre-ddns>.synology.me` par ton propre DDNS et `<votre-user>` par ton username GitHub.

### Prérequis

- Package **Web Station** installé (DSM 7+)
- **DDNS Synology** actif (`<votre-ddns>.synology.me`) : Panneau de config → Accès externe → DDNS → Ajouter → Synology
- **Certificat Let's Encrypt** auto-renouvelé : Panneau de config → Sécurité → Certificat → Ajouter → Get a certificate from Let's Encrypt
- Ports 80 (validation Let's Encrypt) et 443 (HTTPS) ouverts sur la box vers le NAS

### Étape 1 — Déployer les fichiers

Le plus simple : cloner le repo directement sur le NAS via SSH.

```bash
# Connexion SSH au NAS
ssh admin@<votre-ddns>.synology.me

# Cloner le repo dans un volume web
cd /volume1/web/
git clone https://github.com/<votre-user>/Caisse_Stand.git caisse

# Pour les mises à jour ultérieures
cd /volume1/web/caisse && git pull
```

Alternative sans SSH : File Station → téléverser le contenu du repo dans `/volume1/web/caisse/`.

### Étape 2 — Portail Web

Web Station → Web Service Portal → Créer :
- Service : `Static website`
- Nom : `Caisse Stand`
- Port : `8080` (ou autre libre)
- Document root : `/web/caisse`

Teste : `http://ip-nas:8080/` doit afficher l'app en HTTP.

### Étape 3 — Reverse proxy HTTPS

Panneau de config → Portail des applications → Reverse Proxy → Créer :
- **Source** :
  - Protocole : `HTTPS`
  - Nom d'hôte : `caisse.<votre-ddns>.synology.me` (ou `<votre-ddns>.synology.me` + un sous-path)
  - Port : `443`
- **Destination** :
  - Protocole : `HTTP`
  - Nom d'hôte : `localhost`
  - Port : `8080`
- Onglet **En-têtes personnalisés** : laisse par défaut (pas de config SW particulière nécessaire)

Puis l'URL finale est : **`https://caisse.<votre-ddns>.synology.me/`**

### Étape 4 — Partager

Envoyer simplement cette URL à la personne qui utilisera l'app. Sur iPhone/Android, elle pourra l'installer comme décrit plus bas.

### Alternative — Docker nginx

Si tu préfères isoler l'app dans un container (plus propre si tu as déjà une stack Docker) :

```yaml
# /volume1/docker/caisse/docker-compose.yml
services:
  caisse:
    image: nginx:alpine
    container_name: caisse_stand
    restart: unless-stopped
    volumes:
      - /volume1/web/caisse:/usr/share/nginx/html:ro
    ports:
      - "8080:80"
```

Lancer : `cd /volume1/docker/caisse && docker-compose up -d`. Puis reverse proxy comme en étape 3.

### Mises à jour

Quand tu push une nouvelle version :

```bash
ssh admin@<votre-ddns>.synology.me
cd /volume1/web/caisse && git pull
```

Les utilisateurs recevront la mise à jour à leur prochaine ouverture de l'app (le service worker détectera la nouvelle version et affichera la bannière "Nouvelle version disponible").

---

## ☁️ Sync auto cloud — Cloudflare Pages Functions + KV (gratuit)

Pour activer la synchronisation automatique entre plusieurs téléphones via le
cloud (en complément de la sync QR offline), il faut quelques étapes côté
Cloudflare. Tout reste **gratuit** et l'app continue de fonctionner sans cette
config (mode QR seul).

### 1. Créer un namespace KV

1. Dashboard Cloudflare → **Workers & Pages** → onglet **KV** (sidebar)
2. **Create namespace** → nom : `caisse-sync` (ou ce que tu veux)
3. Note le **namespace ID** (sera utile en cas de doute, mais pas obligatoire)

### 2. Binder le KV à ton projet Pages

1. **Workers & Pages** → ton projet `Caisse_Stand` → onglet **Settings**
2. Sidebar → **Functions** (sous Settings)
3. Section **KV namespace bindings** → **Add binding**
   - Variable name : `KV` ← *important, doit être exactement ce nom*
   - KV namespace : `caisse-sync` (celui créé à l'étape 1)
4. Save

### 3. Définir le token partagé `SYNC_TOKEN`

C'est le mot de passe que les téléphones utiliseront pour s'authentifier
auprès de l'endpoint `/api/sync`. Génère-en un long et aléatoire.

```bash
# Génère un token aléatoire de 48 chars
openssl rand -base64 36
# Exemple : 4vXz8Hk2pLn5qRtY7sUw1bN6mF3jK9aD0gHc8eIo
```

1. **Workers & Pages** → ton projet → **Settings** → **Environment variables**
2. **Production** → **Add variable**
   - Variable name : `SYNC_TOKEN` ← *exactement ce nom*
   - Value : le token généré ci-dessus
   - **Type : Secret** ← *coche la case "Encrypt"* pour que le token ne
     s'affiche jamais en clair dans le dashboard
3. Save

### 4. Déployer

Le code des Functions est déjà dans le repo (`functions/api/sync.js`). À
chaque `git push`, Cloudflare Pages le déploie automatiquement.

Si c'est ton premier push après l'ajout des Functions, attends 30-60 s puis
teste depuis n'importe où :

```bash
# Test sans auth → doit retourner 401
curl https://caisse-stand.pages.dev/api/sync

# Test avec auth → doit retourner {"states":[],"count":0}
curl -H "Authorization: Bearer <ton-SYNC_TOKEN>" \
     https://caisse-stand.pages.dev/api/sync
```

### 5. Activer côté téléphones

Sur chaque téléphone :

1. Ouvrir l'app → onglet **Sync** → carte "☁️ Sync auto cloud"
2. Tap **⚙ Configurer**
3. Renseigner :
   - URL : `https://caisse-stand.pages.dev/api/sync` (ton domaine)
   - Token : le `SYNC_TOKEN` (le même sur tous les téléphones)
4. Cocher **Activer la sync auto**
5. Tap **Tester** → doit afficher ✓ vert
6. Tap **Enregistrer**

L'indicateur passe à 🟢 À jour après le premier round-trip réussi. Les ventes
faites sur n'importe quel téléphone apparaissent automatiquement sur les
autres dans les 30 secondes (quand ils sont en ligne).

### 6. Combinaison avec Cloudflare Access (recommandé)

Si tu as activé Cloudflare Access pour restreindre l'accès à l'app à une
liste d'emails (cf. plus haut), **n'oublie pas d'ajouter une exception**
pour `/api/sync` — sinon les téléphones ne pourront pas atteindre
l'endpoint sans login interactif.

Dans Zero Trust → Access → Applications :
- Soit créer une **2e Application** pour le path `/api/*` avec une policy
  "Service Auth" et un token, plus complexe
- Soit (plus simple) utiliser un **path bypass** : Settings → exclure
  `/api/*` du périmètre protégé. La protection reste sur le SYNC_TOKEN.

---

## Option D — Cloudflare Pages (miroir gratuit, fallback)

Pour avoir une URL de secours si le NAS tombe. Gratuit, 500 builds/mois, HTTPS auto, CDN mondial.

1. Créer un compte sur [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect to Git → sélectionner le repo GitHub `Caisse_Stand`
3. Build settings : **aucun** (pas de framework, pas de build command)
4. Output directory : `/` (racine du repo)
5. Déployer — URL finale : `https://caisse-stand.pages.dev`

Chaque `git push` redéploie automatiquement. Tu peux pointer un sous-domaine custom (ex. `caisse.tondomaine.com`) sur cette URL.

---

## Option E — Netlify / Vercel / Render

Équivalents à Cloudflare Pages, même principe (git push → deploy auto → HTTPS). Tous gratuits pour usage personnel avec des limites très larges. Choisir selon préférence.

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

## 📦 Variante portable (fichier unique sans serveur)

Pour le cas « j'envoie l'app à quelqu'un qui va juste double-cliquer dessus, sans compte, sans hébergement, sans rien à installer », il existe une variante générée par script :

### Génération

```bash
# Depuis la racine du repo, avec internet
python3 scripts/build-portable.py

# Si le CDN Tailwind est injoignable, fournir un Tailwind local
python3 scripts/build-portable.py --tailwind-file /chemin/vers/tailwind.js
```

Produit `dist/caisse-stand-portable.html` (~400 Ko avec Tailwind inliné).

### Utilisation

- **Double-clic** : ouvre dans le navigateur par défaut, fonctionne immédiatement
- **Email / AirDrop / WhatsApp** : envoyer le fichier en pièce jointe
- **Clé USB** : copier le fichier, le destinataire ouvre depuis la clé

### Limitations vs PWA complète

| Critère | PWA complète (index.html + SW) | Portable (fichier unique) |
|---|---|---|
| Installation "comme une app" (icône écran d'accueil) | ✅ | ❌ (s'ouvre comme une page web) |
| Offline au tout premier lancement | ✅ via SW | ✅ tout est dans le fichier |
| Mises à jour automatiques | ✅ via SW + bannière | ❌ renvoyer un nouveau fichier |
| Multi-appareils avec même URL | ✅ | ❌ (chaque appareil a son fichier) |
| Taille | ~48 Ko (hors Tailwind cdn) | ~400 Ko (Tailwind inliné) |
| Nécessite un serveur HTTPS | Oui (sauf localhost) | Non |

### Quand utiliser laquelle ?

- **PWA complète** : usage quotidien, stand de marché, partage à plusieurs téléphones
- **Portable** : démo isolée, backup offline, dépannage quand le NAS est down, partage one-shot à un néophyte

Les deux variantes partagent le même code source (`index.html`). Le build portable fait juste un stripping + inlining automatique.

---

## 📚 Références

- [web.dev — Add a web app manifest](https://web.dev/articles/add-manifest)
- [web.dev — Service workers: an introduction](https://web.dev/articles/service-workers-cache-storage)
- [MDN — beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)
- [web.dev — Maskable icons](https://web.dev/articles/maskable-icon)
- [Synology — Let's Encrypt sur DSM](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/connection_certificate)
- [Cloudflare Pages — Quickstart](https://developers.cloudflare.com/pages/get-started/)
