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
