# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Unreleased]

### À venir
- manifest.json et service worker pour installation PWA native (V3.0)
- Icônes PWA dédiées
- Images produits (remplacement des emojis)
- Archivage des sessions clôturées

---

## [2.1.0] — Bascule Claude.ai → Claude Code

### Ajouté
- **Calcul rendu monnaie** en temps réel au paiement cash (modal dédiée)
- **Modal HTML générique** `genModal()` pour remplacer les `prompt`/`confirm` natifs
- **Fonction `stockDispo(id)`** qui calcule le stock disponible (stock réel − quantité panier)
- **Event delegation globale** via `data-action` et `data-tab`
- **Fonction `downloadBlob()`** centralisée pour les exports fiables
- **Bouton "Renommer l'appareil"** dans l'onglet Sync

### Corrigé
- **Stock pas décrémenté visuellement** à l'ajout au panier (cause : `renderCaisse()` pas rappelée)
- **Boutons "Définir fond", "Faire comptage", "Nouvelle session"** inopérants sur mobile (cause : `prompt()` et `confirm()` bloqués sur Safari iOS en contexte PWA)
- **Export JSON et CSV** potentiellement non fiables (cause : `<a>` non attaché au DOM avant click)
- Bouton "Supprimer produit" passe aussi par la modal générique

### Modifié
- Tous les `onclick` inline remplacés par `addEventListener` ou event delegation
- Affichage "X dispo" au lieu de "X stk" dans la grille caisse pour refléter le stock réellement disponible

---

## [2.0.0] — Multi-appareils + Sync

### Ajouté
- **Timestamp ISO complet** (`timestamp`, `date`, `heure`) dans chaque vente
- **`deviceId` unique** généré au premier lancement + **`deviceLabel`** renommable
- **ID vente unique** combinant `deviceId + timestamp + random` pour déduplication fiable
- **Sauvegarde automatique JSON au reset** avant effacement (zéro perte de données)
- **Onglet Sync dédié** :
  - Export JSON manuel
  - Import + fusion de plusieurs JSON avec déduplication par ID
  - Restauration totale depuis backup
  - Ventilation CA par appareil
- **Toast non-intrusif** pour feedback actions (1,8 s, auto-disparition)
- **Colonne Appareil** dans l'export CSV

### Modifié
- Historique des ventes trié par timestamp décroissant
- Affichage du label appareil à côté de chaque vente dans le bilan

---

## [1.0.0] — Navigation 2 niveaux + édition stock

### Ajouté
- **Navigation 2 niveaux** : Catégorie → Modèle → Taille
- **7 modèles de dessins** : Loup, Tiki, Arbre de vie, Sound System, Fuck, Lion, Singes de la sagesse
- **Modal HTML** pour ajout/édition produit (remplace les `prompt` basiques)
- **Édition produit au tap** sur la ligne dans l'onglet Stock
- **Fond de caisse** initial configurable
- **Comptage final** avec calcul d'écart (théorique vs compté)
- **Persistance localStorage** (les données survivent au rechargement)
- **Export CSV** avec colonnes détaillées
- **Annulation dernière vente** avec restauration du stock
- **Panier compact fixe** en bas de l'écran (dépliable au tap)
- **Fil d'Ariane** pour naviguer dans les niveaux

### Modifié
- Grille produits en 3 colonnes (au lieu de 2) pour afficher plus de produits
- Boutons légèrement plus petits pour gagner de la place

---

## [0.1.0] — Preview initiale

### Ajouté
- Grille produits avec 9 produits hardcodés (T-Shirt/Pull/Sweat × M/L/XL)
- Panier en bas de l'écran
- Encaissement Cash / CB
- Onglets Caisse / Stock / Bilan
- CA total et nombre de ventes dans le header
- Export CSV basique
- Top produits et historique des ventes

### Limites connues
- Données en mémoire seule (perdues au rechargement)
- Prompt JS natif pour ajout produit (non fiable sur mobile)
- Pas de navigation hiérarchique
