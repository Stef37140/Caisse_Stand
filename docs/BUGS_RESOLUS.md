# 🐛 Bugs résolus

Historique des bugs rencontrés au cours du développement et des fixes appliqués. À consulter avant toute refonte pour ne pas réintroduire des problèmes connus.

---

## V3.0 → V3.0.1

### Bug #6 : Faux doublons à la fusion multi-fichiers

**Symptôme** : en important simultanément plusieurs fichiers JSON contenant une ou plusieurs ventes communes (typique quand on fusionne des backups croisés entre téléphones), les ventes partagées se retrouvaient en double dans la base locale.

**Cause racine** : la logique de dédup calculait `existingIds = new Set(ventes.map(v => v.id))` **une seule fois avant la boucle**, jamais mise à jour après chaque ajout. Donc si la vente X était absente de la base locale mais présente dans fichier1 **et** fichier2 du même batch :
- Itération fichier1 : X absente de `existingIds` → ajoutée
- Itération fichier2 : X **toujours absente de `existingIds`** (non mis à jour) → ajoutée une seconde fois

**Fix** :
- `Map knownKeys` au lieu de `Set existingIds`, reconstruite au début de chaque fichier ET mise à jour en place après chaque `ventes.push()`
- `venteDedupeKey(v)` : utilise `v.id` quand présent (format V2+), sinon génère une clé synthétique à partir du contenu (`deviceId|timestamp|total|items triés par ID`). Stable même si l'ordre des items diffère entre exports
- `venteEstValide(v)` : rejette les ventes à structure cassée (items vide, total non-number, aucune info temporelle) avec compteur dédié
- Détection de conflits (même clé mais total/items divergents) → loggée en console
- Rapport détaillé : `"X ajoutées · Y déjà là · Z invalides · ⚠ N conflits"`
- Tri chronologique décroissant du tableau `ventes` après merge

**Leçon** : quand on mute une collection dans une boucle, **toujours** re-synchroniser l'index utilisé pour les tests d'appartenance après chaque mutation. Le `Set` construit avant la boucle est un piège classique.

---

### Bug #7 : Renommage de l'appareil n'acceptait que des chiffres

**Symptôme** : impossible d'entrer des lettres dans le champ "Nom de l'appareil" de l'onglet Sync. Le clavier mobile proposait uniquement les chiffres.

**Cause** : la modal générique `genModal()` avait un `<input type="number">` en dur. Pour contourner, un wrapper `genModalText()` existait qui modifiait `input.type` à `'text'` après l'ouverture, puis revenait à `'number'` 5 secondes plus tard. Mais `renommerAppareil()` appelait `genModal()` **directement**, pas `genModalText()`. Le hack ne s'appliquait donc jamais.

**Fix** :
- Refonte de `genModal` avec un paramètre explicite `opts.inputType` ('number' | 'text', défaut 'number' pour rétro-compat avec les usages existants : fond de caisse, comptage, rendu monnaie, qté produit)
- `inputMode` et `maxLength` également paramétrables
- Suppression du wrapper `genModalText`
- `renommerAppareil()` passe `inputType: 'text'`, `maxLength: 30`, placeholder explicite
- Validation côté soumission : 2-30 caractères, regex `/^[\p{L}\p{N} _-]+$/u` (unicode letters + digits + espace/tiret/underscore). Les accents sont autorisés, les caractères spéciaux rejetés avec toast explicite

**Leçon** : éviter les hacks qui mutent l'état DOM après coup (`setTimeout(() => inp.type = ...)`). Passer la config explicitement à la fonction plutôt que de la patcher après l'ouverture.

---

## V2 → V2.1

### Bug #1 : Stock pas décrémenté visuellement à l'ajout au panier

**Symptôme** : l'utilisateur tape sur un produit pour l'ajouter au panier, mais l'affichage du stock à côté du bouton reste identique. Si on ajoute 5 fois le même produit avec un stock de 3, l'UI laisse faire sans bloquer.

**Cause** :
1. `renderCaisse()` n'était pas appelée après `ajouterAuPanier()`, donc la vue ne se mettait à jour qu'à l'encaissement effectif.
2. Même si elle avait été appelée, elle affichait `p.stock` (stock réel), qui ne bouge qu'à la finalisation de la vente.

**Fix** :
- Introduction de `stockDispo(produitId)` qui calcule `p.stock − quantité dans panier`
- Appel de `renderCaisse()` après chaque mutation du panier (`ajouterAuPanier`, `viderPanier`, `finaliserVente`)
- Affichage de `stockDispo(id)` partout dans la grille caisse
- Blocage de l'ajout si `stockDispo(id) <= 0` avec toast d'erreur

**Leçon** : quand on a un état "en cours" (panier) distinct de l'état "validé" (stock réel), il faut exposer les deux niveaux via des helpers dédiés.

---

### Bug #2 : Boutons Bilan inopérants sur mobile

**Symptôme** : les boutons "Définir fond de caisse", "Faire le comptage", "Nouvelle session" ne produisent aucun effet quand on tape dessus sur un iPhone. Aucune modal ne s'ouvre, aucun message d'erreur. Les mêmes boutons fonctionnent parfois sur desktop.

**Cause racine** : les fonctions natives JavaScript **`prompt()` et `confirm()`** sont **bloquées silencieusement par Safari iOS** dans plusieurs contextes :
- Mode PWA standalone (app installée sur l'écran d'accueil)
- Ouverture en `file://` direct
- Certaines iframes
- Parfois en navigation privée

Et sans lancer d'exception. Le clic est enregistré, la fonction est appelée, mais `prompt`/`confirm` retournent immédiatement `null` ou `false`, donc la logique qui suit ne s'exécute pas.

**Fix** :
- Création d'une modal HTML custom **`genModal()`** qui reproduit les fonctionnalités de `prompt` et `confirm` avec des éléments DOM
- **Suppression totale de tous les `prompt()` et `confirm()`** du code
- Pattern async via callback `onOk` :
  ```javascript
  genModal({
    title: '...',
    message: '...',
    input: true,
    onOk: () => { /* logique métier */ }
  });
  ```

**Leçon cruciale** : **ne jamais utiliser `prompt()`, `confirm()` ou `alert()` dans une PWA** destinée à être utilisée sur mobile. Toujours faire des modals HTML custom.

**À ne pas réintroduire** : si un nouveau développeur (ou une IA) écrit du code qui réintroduit `prompt()`, ça reviendra péter sur mobile. Ajouter éventuellement un lint rule ou un test.

---

### Bug #3 : Event handlers onclick inline sur contenu dynamique

**Symptôme** : dans la V2, certains boutons générés dans `renderCaisse()` via `innerHTML` avec des `onclick="fn('arg')"` ne déclenchaient pas toujours leur handler, surtout après plusieurs re-renders.

**Cause** : les `onclick` inline sur des éléments générés par `innerHTML` peuvent poser des problèmes de scoping (fonctions pas trouvées dans le scope global), d'échappement de caractères (apostrophes dans les noms comme "Singes de la sagesse"), et de performance (un handler par bouton).

**Fix** :
- Passage à **event delegation globale** sur `document` :
  ```javascript
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'addpanier') ajouterAuPanier(parseInt(target.dataset.id));
    // ...
  });
  ```
- Utilisation de `data-*` attributes pour passer les paramètres
- Encodage via `encodeURIComponent` pour les valeurs contenant des caractères spéciaux (noms de modèles)
- Un seul listener pour tous les clics, quelle que soit la profondeur ou le timing de génération

**Leçon** : pour tout contenu généré dynamiquement, event delegation > handlers inline.

---

### Bug #4 : Export JSON/CSV non fiable

**Symptôme** : parfois le téléchargement de fichier ne se déclenche pas, surtout sur Firefox ou certains Safari. Aucun message d'erreur.

**Cause** : le pattern `a.click()` sur un élément `<a>` créé dynamiquement **nécessite que l'élément soit attaché au DOM** avant l'appel à `click()` sur certains navigateurs. Sinon, le clic est ignoré silencieusement.

**Fix** : fonction `downloadBlob()` centralisée qui :
1. Crée le Blob
2. Crée l'URL via `URL.createObjectURL`
3. Crée le `<a>` avec `href`, `download`
4. **`document.body.appendChild(a)`** ← étape critique
5. `a.click()`
6. `document.body.removeChild(a)`
7. `setTimeout(() => URL.revokeObjectURL(url), 1000)` pour libérer la mémoire
8. Retour `true`/`false` pour que l'appelant sache si ça a marché
9. Try/catch englobant avec toast d'erreur

**Leçon** : ne jamais faire confiance aux raccourcis "qui marchent sur Chrome desktop". Toujours tester sur Safari iOS et Firefox avant de considérer un feature comme fini.

---

### Bug #5 : ID de vente collisionnable entre appareils

**Symptôme (potentiel, évité)** : si deux téléphones génèrent un ID basé uniquement sur `Date.now()`, il est théoriquement possible d'avoir deux ventes avec le même ID, ce qui fait échouer la déduplication lors de la fusion.

**Fix préventif** : ID vente = `${deviceId}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`. La combinaison des trois garantit l'unicité inter-appareils.

**Leçon** : pour tout identifiant destiné à être fusionné entre sources multiples, inclure un composant device + un composant random en plus du timestamp.

---

## Bugs V0/V1 résolus en V1

### Bouton "Ajouter un produit" dans Stock inopérant

**Cause** : utilisation de `prompt()` natifs en cascade (`prompt('nom?'); prompt('prix?'); prompt('stock?')`), qui sur mobile soit :
- S'enchaînent trop vite et se font annuler
- Sont bloqués (voir Bug #2)
- N'acceptent que du texte (pas idéal pour les nombres)

**Fix** : remplacement par une modal HTML `<div id="modal-produit">` avec `<select>` pour catégorie/modèle/taille et `<input type="number">` pour prix/stock.

---

## Bugs potentiels à surveiller (non encore survenus)

### Quota localStorage dépassé

**Symptôme attendu** : `save()` lance une exception `QuotaExceededError` quand on dépasse ~5 Mo.

**Protection en place** : try/catch dans `save()` avec toast d'erreur.

**Solution long terme** : migration IndexedDB, surtout si on ajoute des images base64.

### Timezone / changement d'heure

**Risque** : les timestamps ISO sont en UTC mais les dates affichées sont en timezone locale. Si un marché démarre à 23h30 et se termine à 01h, la "date" affichée change en cours de session.

**Statut** : non critique pour l'usage actuel, mais à surveiller si on fait des statistiques multi-jours.

### Concurrence multi-onglets

**Risque** : si l'utilisateur ouvre l'app dans deux onglets du même navigateur, les modifications ne sont pas synchronisées.

**Statut** : pas de fix actuellement. Solution future = écouter l'event `storage` sur `window`.
