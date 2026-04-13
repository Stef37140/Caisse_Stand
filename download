# 🏗️ Architecture

Document technique décrivant l'architecture actuelle de la PWA Caisse Stand et les décisions qui la structurent.

## Vue d'ensemble

Application **single-file** : tout tient dans `index.html` (HTML + CSS via Tailwind CDN + JS vanilla inline). Pas de build tool, pas de bundler, pas de framework.

```
┌─────────────────────────────────────────┐
│              index.html                  │
├─────────────────────────────────────────┤
│  HTML Structure                          │
│    ├─ Header (CA total, ventes)          │
│    ├─ Nav Tabs                           │
│    ├─ View Caisse                        │
│    ├─ View Stock                         │
│    ├─ View Bilan                         │
│    ├─ View Sync                          │
│    ├─ Modal Produit                      │
│    ├─ Modal Générique                    │
│    └─ Toast                              │
├─────────────────────────────────────────┤
│  JavaScript (inline)                     │
│    ├─ État global                        │
│    ├─ Persistance (localStorage)         │
│    ├─ Navigation & rendering             │
│    ├─ Logique caisse & panier            │
│    ├─ Logique stock                      │
│    ├─ Logique bilan & exports            │
│    ├─ Logique sync & import              │
│    └─ Event delegation                   │
└─────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ localStorage │
    └──────────────┘
```

## Modèle de données

### Produit

```javascript
{
  id: Number,           // Auto-incrémenté
  categorie: String,    // "T-Shirt" | "Pull" | "Sweat"
  modele: String,       // "Loup" | "Tiki" | ...
  taille: String,       // "S" | "M" | "L" | "XL" | "XXL"
  prix: Number,         // en euros
  stock: Number         // quantité disponible (décrémenté à l'encaissement)
}
```

### Vente

```javascript
{
  id: String,           // "dev_abc123_1234567890_xy45" (unique cross-device)
  timestamp: String,    // ISO 8601
  date: String,         // "12/04/2026" (format FR)
  heure: String,        // "14:35"
  deviceId: String,     // "dev_abc123"
  deviceLabel: String,  // "Tel Stéf"
  items: [
    {
      id: Number,       // produit.id
      label: String,    // "Loup M" (snapshot au moment de la vente)
      prix: Number,     // prix unitaire (snapshot)
      qte: Number
    }
  ],
  total: Number,        // somme items (prix × qte)
  mode: String          // "cash" | "cb"
}
```

### État global (en mémoire, synchronisé avec localStorage)

```javascript
produits = [Produit, ...]
ventes = [Vente, ...]
fondCaisse = Number
panier = [Item, ...]       // non persisté, éphémère
deviceId = String          // persistant dans localStorage séparé
deviceLabel = String       // persistant dans localStorage séparé
lastBackup = String (ISO)  // timestamp de la dernière sauvegarde JSON
```

## Persistance

Deux clés `localStorage` distinctes :

1. **`caisse_data`** : objet JSON contenant `{ produits, ventes, fondCaisse, sessionDate, lastBackup }`
2. **`caisse_device_id`** et **`caisse_device_label`** : identité de l'appareil, gardés séparément pour qu'un reset de session ne les efface pas

**Sauvegarde** : fonction `save()` appelée après chaque mutation importante (ajout vente, modif stock, reset…).

**Chargement** : `load()` appelée à l'init, avec fallback `initDemo()` si aucune donnée trouvée.

## Rendering

Pattern **full re-render** de chaque vue à chaque modification (simple et fiable pour la taille actuelle de l'app) :

- `renderCaisse()` : grille produits selon le niveau de navigation courant
- `renderPanier()` : barre panier compacte + détail déplié
- `renderStock()` : liste produits groupée par catégorie
- `renderHisto()` : totaux, top produits, historique
- `renderSync()` : ventilation par appareil, infos device

Pas de diff algorithm, pas de Virtual DOM. Si l'app grossit significativement (>200 produits, >1000 ventes), il faudra peut-être optimiser.

## Navigation 2 niveaux (onglet Caisse)

```
Niveau 0: Catégories        [T-Shirt] [Pull] [Sweat]
              ↓ (tap)
Niveau 1: Modèles           [🐺 Loup] [🗿 Tiki] [🌳 Arbre] ...
              ↓ (tap)
Niveau 2: Tailles           [M] [L] [XL]
              ↓ (tap)
          Ajout panier
```

Variables d'état : `currentLevel` (0/1/2), `selCat`, `selModele`.

Le fil d'Ariane permet de revenir en arrière à tout moment.

## Stock "disponible" vs stock réel

**Concept critique** introduit en V2.1 pour éviter les doubles ventes en cours de panier :

```javascript
function stockDispo(produitId) {
  const p = produits.find(x => x.id === produitId);
  const dansPanier = panier.filter(i => i.id === produitId).reduce((s,i) => s + i.qte, 0);
  return p.stock - dansPanier;
}
```

Partout où on affiche un stock dans la grille caisse, on affiche **`stockDispo`**, pas `p.stock`. Le stock réel n'est décrémenté qu'à la finalisation de la vente (`finaliserVente()`).

Conséquence : si on ajoute 3 produits au panier puis qu'on vide le panier, le stock visuel revient à l'état initial sans avoir touché à `p.stock`.

## Event delegation

Pour gérer efficacement les clics sur les éléments générés dynamiquement (grille produits, liste stock), on utilise **un seul listener global** qui inspecte les `data-action` :

```javascript
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action], [data-tab]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'addpanier') ajouterAuPanier(parseInt(target.dataset.id));
  else if (action === 'selcat') { /* ... */ }
  // ...
});
```

**Avantages** :
- Fonctionne sur les éléments générés après le binding du listener
- Un seul listener au lieu de dizaines
- Plus lisible que des `onclick="fn(arg)"` inline

**Inconvénient** : il faut penser à ajouter un `data-action` sur chaque élément cliquable dans le HTML généré.

## Modal générique `genModal`

**Pourquoi** : les fonctions natives `prompt()` et `confirm()` sont **bloquées silencieusement** sur Safari iOS en mode PWA/standalone. On ne peut pas leur faire confiance.

**Solution** : une seule modal HTML réutilisable qui supporte :
- Titre
- Message
- Input numérique optionnel
- Boutons OK/Annuler personnalisables
- **Mode "rendu monnaie"** avec calcul en temps réel (quand `showRendu: true`)
- Callback `onOk` à l'exécution du bouton OK

Usage :

```javascript
genModal({
  title: 'Fond de caisse',
  message: 'Montant initial en euros',
  input: true,
  inputValue: fondCaisse,
  okLabel: 'Enregistrer',
  onOk: () => {
    const n = parseFloat(document.getElementById('gen-input').value);
    if (isNaN(n)) return;
    fondCaisse = n;
    save();
    fermerGenModal();
  }
});
```

## Multi-appareils et fusion

Chaque appareil a un `deviceId` unique (8 caractères aléatoires) généré au premier lancement. Chaque vente contient ce `deviceId` et un ID unique qui combine `deviceId + timestamp + random`.

**Fusion** (import JSON) : on parcourt les ventes importées, et on ajoute uniquement celles dont l'ID n'existe pas déjà dans le tableau `ventes`. La déduplication est donc automatique et idempotente — on peut réimporter le même fichier plusieurs fois sans créer de doublons.

**Restauration** : remplace totalement `produits`, `ventes`, `fondCaisse` par le contenu du fichier. Usage : retour à un état précédent, reprise après crash.

## Toast

Petite pastille fixe en bas d'écran (`bottom-24`), animée via CSS keyframes (`toastIn`), disparaît automatiquement après 1,8 s.

Usage :

```javascript
showToast('Message');              // success (gris foncé)
showToast('Erreur', 'error');      // rouge
showToast('Info', 'info');         // bleu
```

Non cliquable (`pointer-events: none`), ne bloque jamais l'interface.

## Exports

### CSV

Encodage UTF-8 avec BOM (`'\ufeff'`) pour que les accents s'affichent correctement dans Excel.

Séparateur point-virgule `;` (convention FR).

Colonnes : Date, Heure, Appareil, Catégorie, Modèle, Taille, Quantité, Prix unitaire, Total ligne, Mode, TimestampISO.

### JSON

Format pivot complet avec metadata :

```json
{
  "version": 2,
  "exportedAt": "2026-04-12T14:30:00.000Z",
  "deviceId": "dev_abc123",
  "deviceLabel": "Tel Stéf",
  "produits": [...],
  "ventes": [...],
  "fondCaisse": 50
}
```

## Points d'attention pour l'évolution

### Quota localStorage

~5 Mo par origine. Largement suffisant pour des milliers de ventes texte. **Deviendra limitant** si on ajoute des images produits en base64 → migration vers IndexedDB à prévoir.

### Performance re-render

Tant qu'on est sous 200 produits et 1000 ventes, le full re-render est instantané. Au-delà, il faudra soit optimiser (diff, keyed rendering), soit virtualiser les listes longues.

### Concurrence multi-onglets

Si l'utilisateur ouvre l'app dans deux onglets, les modifications ne sont pas synchronisées (chaque onglet a son état en mémoire). Solution possible : écouter l'event `storage` sur `window` pour détecter les changements localStorage faits dans un autre onglet.

### Mises à jour de l'app (V3+)

Une fois la PWA installée avec service worker, il faut gérer proprement les mises à jour pour ne pas bloquer l'utilisateur sur une ancienne version. Prévoir un bandeau "Nouvelle version disponible, recharger" et un `skipWaiting()` contrôlé.
