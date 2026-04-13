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

### Exemple de format

```
- **[Date] Catégorie** : Description du pattern, bug, découverte, décision
  - Contexte :
  - Solution / ce qu'il faut retenir :
  - À intégrer dans : CLAUDE.md / docs/ARCHITECTURE.md / docs/BUGS_RESOLUS.md / ROADMAP.md
```

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
