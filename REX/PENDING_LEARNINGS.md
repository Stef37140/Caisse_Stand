# REX — Pending Learnings

> Fichier de synchronisation cross-workstation pour Claude Code.
> Pattern inspiré de `Trames_METCal/REX/PENDING_LEARNINGS.md`.

## Usage

Ce fichier sert de **bridge** entre les sessions Claude Code sur différents postes (PC maison, PC travail, laptop…). Il centralise les apprentissages, patterns, pièges et décisions qui émergent en cours de développement mais qui ne sont pas encore intégrés dans les fichiers de doc permanents (`CLAUDE.md`, `docs/`).

**Workflow** :
1. Au début d'une session, Claude Code lit ce fichier
2. Pendant la session, ajoute les nouveaux apprentissages sous la section "⏳ En attente de validation"
3. À la fin de la session (ou au commit), l'utilisateur valide les apprentissages pertinents → migration vers les docs permanentes → nettoyage du fichier
4. `git push` → les autres postes récupèrent le fichier mis à jour au prochain `git pull`

---

## ⏳ En attente de validation

*(Ajouter ici les apprentissages de la session en cours)*

### Session 2026-04-13 (3) — Sync stocks multi-téléphones v3.1.0

- **[2026-04-13] Stock event-sourced > stock muté** : pour permettre la sync multi-appareils, ne JAMAIS muter le stock directement à la vente. Modèle : `produit.stock` = baseline horodatée par `stockSetAt`, stock affiché = baseline − ventes du produit après baseline − panier. Conséquence magique : importer les ventes d'un autre téléphone décrémente automatiquement le stock chez tous, sans logique de merge complexe. Last-write-wins ne fonctionne que si on change cette structure.
  - À intégrer dans : `docs/ARCHITECTURE.md` (modèle de données V3.1+)

- **[2026-04-13] Tombstones pour la suppression** : si on supprime un produit en `produits.filter()`, et qu'un autre appareil n'a pas vu cette suppression, sa sync va re-créer le produit. Solution : marquer `deletedAt` au lieu de retirer, propager via sync, filtrer à l'affichage avec `produitsActifs()`. Pattern standard distributed systems.

- **[2026-04-13] Compression deflate + base64 = 10× sur du JSON répétitif** : les payloads de sync (produits + ventes) sont très répétitifs (mêmes structures, mêmes IDs). pako.deflate les compresse à ~10 % de leur taille. 80 ventes + 30 produits = 22 KB JSON → 2.2 KB compressé → 1 seul QR code de 280×280 pixels suffit.

- **[2026-04-13] BarcodeDetector vs jsQR** : la nouvelle API `BarcodeDetector` est dispo sur iOS 17+ Safari et Chrome récent → 0 KB lib supplémentaire et performances natives. Mais beaucoup de vieux appareils n'en bénéficient pas. Pattern : try BarcodeDetector first, fallback to jsQR (130 KB minifié). Le toujours-essayer-natif-d'abord est la bonne stratégie même si la lib JS est dispo.

- **[2026-04-13] Multi-segment QR avec batchId aléatoire** : pour qu'un payload trop gros tienne sur plusieurs QR codes scannables dans n'importe quel ordre : préfixer chaque chunk avec `<magic>|<batchId6chars>|<idx>/<total>|<chunk_b64>`. Le receveur stocke les segments dans une `Map` indexée par idx, finalise quand `Map.size === total`. Idempotent si un segment est rescanné par erreur.

- **[2026-04-13] Cloudflare Pages Functions + KV = backend sync gratuit** : pour ~3 phones qui synchent toutes les 30 s pendant 8 h, la conso est ~6 % du quota free tier (1k writes/jour, 100k reads/jour). Pattern simple et sans race condition : 1 clé KV par appareil (`state:<deviceId>`), pas de merge serveur, le client merge tous les états reçus. Atomicité par clé KV suffit.

- **[2026-04-13] Comparaison de tokens en temps constant** : pour éviter les timing attacks sur l'auth Bearer, comparer le token octet par octet avec un XOR cumulé au lieu de `===`. Pattern :
  ```js
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
  ```
  Pas critique pour un projet personnel mais coûte 0 et évite la mauvaise habitude.

- **[2026-04-13] CORS + Cloudflare Access** : si on protège l'app avec Cloudflare Access (login email), il faut une exception pour `/api/*` sinon le service worker / fetch ne peut pas atteindre l'endpoint sans login interactif. La sécurité reste assurée par le SYNC_TOKEN.

- **[2026-04-13] visibilitychange + online events** : pour qu'une app sync quand l'utilisateur revient dessus (lance après l'avoir fermée, ou bascule depuis une autre app), écouter `document.addEventListener('visibilitychange', ...)` et `window.addEventListener('online', ...)`. Polling pur de 30 s ne suffit pas — on rate les transitions de visibilité.

---

### Session 2026-04-13 (suite) — 3 correctifs UX/Sync (v3.0.1)

- **[2026-04-13] Piège "Set avant boucle mutante"** : dans `handleImport`, le `Set existingIds` était calculé avant la boucle de fusion et jamais mis à jour. Conséquence : doubles imports possibles si une vente commune existait dans 2 fichiers du même batch. Leçon générique : **re-synchroniser l'index utilisé pour les tests d'appartenance après chaque mutation de la collection**, ou utiliser une `Map` et la mettre à jour en place.
  - À intégrer dans : `docs/BUGS_RESOLUS.md` (Bug #6) — fait

- **[2026-04-13] Dédup robuste multi-sources** : pour fusionner des données provenant de plusieurs appareils, ne pas se contenter d'un ID texte — toujours prévoir un fallback content-hash (clé synthétique stable même si l'ordre interne varie). Pattern : `key = id || synthetic(deviceId + timestamp + total + items.sort())`.

- **[2026-04-13] Anti-pattern "patcher le DOM après ouverture"** : le hack `genModalText` patchait `input.type` après l'appel à `genModal`. Échouait silencieusement quand on appelait `genModal` directement sans passer par le wrapper. Leçon : passer la configuration explicitement en paramètre plutôt que de muter l'état après coup.
  - À intégrer dans : `docs/BUGS_RESOLUS.md` (Bug #7) — fait

- **[2026-04-13] Validation noms d'appareils unicode** : la regex `/^\w+$/` n'accepte pas les accents. Pour du français, utiliser `/^[\p{L}\p{N} _-]+$/u` avec le flag `u` (propriétés Unicode). Autorise des noms comme "Terminal Crêpière", "iPhone-Caisse", "Télé 2".

- **[2026-04-13] Event delegation et stopPropagation** : quand on ajoute des boutons dans une zone parent qui a aussi un handler de clic (ex : toggle panier), toujours prévoir `e.stopPropagation()` sur les actions enfants pour éviter que le clic ne bulle vers le parent. Même si la zone du bouton est techniquement hors du parent cliquable, le comportement est plus robuste.

---

### Session 2026-04-13 — Cleanup repo + V3.0 PWA installable

- **[2026-04-13] Repo hygiene** : le repo avait été uploadé avec une série de fichiers dont les **noms ne correspondaient pas aux contenus** (ex: `index.html` contenait le REX, `README.md` contenait le CHANGELOG, `ROADMAP.md` était un duplicata de `CLAUDE.md`, `PROMPT_CLAUDE_CODE.md` était le `.gitignore`). Nettoyé en plusieurs commits atomiques `chore:` et `docs:`.
  - **À retenir** : en début de session, toujours **vérifier le contenu réel** des fichiers évoqués dans `CLAUDE.md` avant de les modifier. Un `ls` + quelques `head` peuvent révéler ce type de mélange.
  - À intégrer dans : `CLAUDE.md` (workflow de démarrage : "vérifier que les fichiers listés contiennent bien ce que leur nom annonce")

- **[2026-04-13] PWA iOS vs Android — deux mondes séparés** :
  - Android Chromium expose `beforeinstallprompt` → on peut déclencher un bouton "Installer" custom après avoir `preventDefault()` + stocké le `event` pour appeler `.prompt()` plus tard sur clic utilisateur
  - iOS Safari **n'expose aucune API d'installation** → il faut détecter iOS via l'UA et afficher des **instructions manuelles** "Partager → Sur l'écran d'accueil"
  - Détecter le mode installé : `window.matchMedia('(display-mode: standalone)').matches` + legacy `window.navigator.standalone === true` (iOS only)
  - À intégrer dans : `docs/ARCHITECTURE.md` (section PWA)

- **[2026-04-13] Service worker skipWaiting contrôlé** : ne **jamais** faire `self.skipWaiting()` dans `install` sans précaution — ça remplace le SW actif au milieu d'une session et peut casser des requêtes en cours. Pattern propre :
  1. Le nouveau SW installe et attend en `waiting`
  2. La page détecte via `registration.addEventListener('updatefound')` puis `statechange === 'installed'`
  3. Affiche un bandeau "Nouvelle version dispo"
  4. Sur clic utilisateur, la page envoie `reg.waiting.postMessage({type:'SKIP_WAITING'})`
  5. Le SW reçoit → `self.skipWaiting()` → `controllerchange` sur la page → `window.location.reload()`
  - À intégrer dans : `docs/ARCHITECTURE.md` (section PWA)

- **[2026-04-13] Cache-first + CDN cross-origin** : le CDN Tailwind est cross-origin, les réponses peuvent être opaques. Stratégie choisie : network-first avec fallback cache, cache mis à jour en arrière-plan après chaque fetch réseau réussi. L'app est chargée une fois avec réseau, le SW met Tailwind en cache, puis ça marche offline.
  - À intégrer dans : `docs/ARCHITECTURE.md` (stratégies de cache)

- **[2026-04-13] Icônes maskable — safe zone 80 %** : pour que Android ne crop pas l'icône dans une pastille ronde, l'élément graphique doit tenir dans un cercle de diamètre ~80 % du canvas (ici icône scalée à 70 % par prudence), avec le fond occupant 100 %. Les icônes "any" peuvent avoir des coins arrondis propres (`rx 22 %` donne un rendu iOS-like).

- **[2026-04-13] Génération d'icônes sans outil dédié** : Python + `cairosvg` (`pip install cairosvg Pillow`) suffit. Sources SVG commitées dans `icons/icon.svg` et `icons/icon-maskable.svg` pour édition future — si besoin de regénérer, script dans le commit `feat(pwa): add installable icons`.

---

## ✅ Apprentissages validés (historique récent)

*(Déplacer ici avant archivage, puis nettoyer régulièrement)*

### Session initiale (bascule Claude.ai → Claude Code)

- **Pièges mobile PWA** : `prompt()` et `confirm()` natifs JavaScript sont bloqués silencieusement sur Safari iOS en mode PWA/standalone. **Ne jamais les utiliser.** Toujours passer par des modals HTML custom.
  - Déjà documenté dans : `docs/BUGS_RESOLUS.md` (Bug #2)
- **Téléchargement fichiers** : pour `a.click()` programmatique, le `<a>` doit être attaché au DOM avant le clic, sinon certains navigateurs l'ignorent.
  - Déjà documenté dans : `docs/BUGS_RESOLUS.md` (Bug #4)
- **Stock disponible vs stock réel** : dans une app de caisse avec panier, toujours séparer l'état "réservé en panier" de l'état "stock final". Exposer via helper `stockDispo(id)`.
  - Déjà documenté dans : `docs/ARCHITECTURE.md`
- **Event delegation > onclick inline** : pour le contenu généré dynamiquement, event delegation sur `document` est plus fiable et plus performant.
  - Déjà documenté dans : `docs/ARCHITECTURE.md`

---

## 📌 Décisions d'architecture à respecter

Principes structurants qui ne doivent pas être remis en cause sans discussion explicite :

1. **Single file `index.html`** pour V2.x — refactoring modulaire prévu en V3.5 seulement
2. **Pas de build tool, pas de framework** — vanilla JS + Tailwind CDN
3. **Pas de backend, pas de compte** — 100 % local
4. **localStorage** pour la persistance — migration IndexedDB seulement si besoin (images, très grand volume)
5. **Compatible iOS Safari en priorité** — c'est le navigateur qui casse le plus
6. **Event delegation + data-action** pour tous les handlers sur contenu dynamique
7. **Modals HTML > prompt/confirm natifs** — toujours
8. **Toast non-bloquant** pour les feedbacks d'action (pas d'alert)

---

## 🔄 Procédure de mise à jour

Quand tu termines une session de travail, avant le `git commit` :

1. Relire la section "⏳ En attente de validation"
2. Pour chaque entrée :
   - Si pertinente → la migrer vers le doc approprié
   - Si obsolète ou redondante → la supprimer
   - Si importante mais pas encore claire → la laisser en attente
3. Mettre à jour "✅ Apprentissages validés" si besoin
4. Commit avec message `docs: update REX/PENDING_LEARNINGS`

---

## 💡 Astuces pour Claude Code

Quand tu lis ce fichier au début d'une session :
- Prendre connaissance des apprentissages récents pour éviter de refaire les mêmes erreurs
- Si tu rencontres un bug ou découverte non documenté ici, l'y ajouter au fur et à mesure
- Ne pas hésiter à proposer à l'utilisateur de "valider" les apprentissages en fin de session pour les migrer vers les docs permanentes
