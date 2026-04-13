# ✅ Checklist de tests manuels

Scénarios à valider après chaque modification significative, avant de commiter / livrer une version.

**Environnements à tester en priorité** :
- 📱 iPhone Safari (le plus critique — nombreux pièges PWA)
- 📱 Android Chrome
- 💻 Desktop Chrome/Firefox (confort de dev)

---

## 🛒 Encaissement

### Test 1 : Ajout panier et décrément stock visuel
- [ ] Ouvrir l'app sur l'onglet Caisse
- [ ] Taper sur "T-Shirt" → la vue affiche les modèles
- [ ] Taper sur "Loup" → la vue affiche les tailles
- [ ] Noter le stock affiché pour "M" (ex: `dispo: 5`)
- [ ] Taper sur "M" une fois
- [ ] **Vérifier** : l'affichage passe à `dispo: 4`
- [ ] Taper 2 fois de plus sur "M"
- [ ] **Vérifier** : l'affichage passe à `dispo: 2`
- [ ] Dans la barre panier en bas, **vérifier** : `3 article(s)` et total cohérent

### Test 2 : Stock épuisé bloqué
- [ ] Ajouter au panier un produit jusqu'à épuisement (ex: `dispo: 0`)
- [ ] Taper à nouveau sur ce produit
- [ ] **Vérifier** : un toast "Stock épuisé" apparaît
- [ ] **Vérifier** : le produit n'est pas ajouté au panier une fois de plus
- [ ] **Vérifier** : le bouton apparaît grisé / semi-transparent

### Test 3 : Encaissement cash avec rendu monnaie
- [ ] Avoir un panier non vide (ex: 2 produits, total 40 €)
- [ ] Taper "💵 CASH"
- [ ] **Vérifier** : une modal s'ouvre avec titre "Encaissement cash : 40 €"
- [ ] **Vérifier** : le champ montant est pré-rempli avec 40
- [ ] Saisir 50
- [ ] **Vérifier** : "À rendre au client : 10,00 €" s'affiche en vert
- [ ] Saisir 30
- [ ] **Vérifier** : "Manque 10,00 €" s'affiche en rouge
- [ ] Remettre 50
- [ ] Taper "Valider"
- [ ] **Vérifier** : la modal se ferme
- [ ] **Vérifier** : un toast "✓ Encaissé 40 € (cash)" apparaît
- [ ] **Vérifier** : le stock est bien décrémenté dans l'onglet Stock
- [ ] **Vérifier** : la vente apparaît dans l'onglet Bilan

### Test 4 : Encaissement CB direct
- [ ] Avoir un panier non vide
- [ ] Taper "💳 CB"
- [ ] **Vérifier** : pas de modal (paiement CB = pas de rendu monnaie)
- [ ] **Vérifier** : toast "✓ Encaissé X € (CB)"
- [ ] **Vérifier** : dans Bilan, la vente apparaît avec le mode CB (couleur bleue)

### Test 5 : Annulation dernière vente
- [ ] Faire au moins une vente
- [ ] Déplier le panier (tap sur la barre en bas)
- [ ] Taper "Annuler dernière vente"
- [ ] **Vérifier** : modal de confirmation s'ouvre
- [ ] Confirmer
- [ ] **Vérifier** : la vente est retirée
- [ ] **Vérifier** : le stock est restauré
- [ ] **Vérifier** : le CA header diminue du bon montant

### Test 6 : Vider panier
- [ ] Ajouter plusieurs produits au panier
- [ ] Déplier le panier
- [ ] Taper "Vider panier"
- [ ] **Vérifier** : le panier est vide
- [ ] **Vérifier** : le stock disponible est restauré dans la grille

---

## 📦 Stock

### Test 7 : Modification stock via boutons +/−
- [ ] Onglet Stock
- [ ] Taper sur le bouton "+" d'un produit
- [ ] **Vérifier** : le stock augmente de 1 dans la liste Stock
- [ ] Taper sur "−"
- [ ] **Vérifier** : le stock diminue
- [ ] Revenir sur l'onglet Caisse
- [ ] **Vérifier** : le stock affiché est à jour

### Test 8 : Ajout produit
- [ ] Onglet Stock
- [ ] Taper "+ Ajouter un produit"
- [ ] **Vérifier** : modal s'ouvre
- [ ] Sélectionner catégorie = Sweat
- [ ] Sélectionner modèle = Arbre de vie
- [ ] Sélectionner taille = L
- [ ] Saisir prix = 50
- [ ] Saisir stock = 3
- [ ] Taper "Enregistrer"
- [ ] **Vérifier** : toast "Produit ajouté"
- [ ] **Vérifier** : le nouveau produit apparaît dans la liste stock
- [ ] Aller dans Caisse → Sweat → Arbre de vie
- [ ] **Vérifier** : "L" apparaît avec prix 50 et stock 3

### Test 9 : Édition produit
- [ ] Onglet Stock
- [ ] Taper sur une ligne produit (pas sur les boutons +/−)
- [ ] **Vérifier** : modal d'édition s'ouvre avec les valeurs actuelles
- [ ] Modifier le prix
- [ ] Taper "Enregistrer"
- [ ] **Vérifier** : toast "Produit modifié"
- [ ] **Vérifier** : le nouveau prix apparaît dans Stock et dans Caisse

### Test 10 : Suppression produit
- [ ] Éditer un produit
- [ ] Taper le bouton 🗑
- [ ] **Vérifier** : modal de confirmation
- [ ] Confirmer
- [ ] **Vérifier** : le produit disparaît de Stock
- [ ] **Vérifier** : il n'apparaît plus dans Caisse

---

## 📊 Bilan

### Test 11 : Définir fond de caisse
- [ ] Onglet Bilan
- [ ] Taper "Définir" à côté de "Fond de caisse initial"
- [ ] **Vérifier** : modal s'ouvre
- [ ] Saisir 50
- [ ] Taper "Enregistrer"
- [ ] **Vérifier** : toast "Fond de caisse : 50 €"
- [ ] **Vérifier** : le montant affiche 50 €
- [ ] **Vérifier** : la caisse théorique est mise à jour

### Test 12 : Comptage final
- [ ] Faire au moins une vente cash (ex: 20 €)
- [ ] Définir un fond de caisse (ex: 50 €)
- [ ] Taper "🧮 Faire le comptage"
- [ ] **Vérifier** : modal avec le total théorique annoncé (70 €)
- [ ] Saisir 70
- [ ] Taper "Comparer"
- [ ] **Vérifier** : bandeau vert "✓ Caisse juste (70 €)"
- [ ] Refaire le comptage avec 65
- [ ] **Vérifier** : bandeau rouge "−5 € d'écart"
- [ ] Refaire avec 75
- [ ] **Vérifier** : bandeau rouge "+5 € d'écart"

### Test 13 : Export CSV
- [ ] Faire plusieurs ventes avec différents modes
- [ ] Onglet Bilan → "📥 Export CSV"
- [ ] **Vérifier** : un fichier `caisse_YYYY-MM-DD.csv` est téléchargé
- [ ] Ouvrir le fichier dans Excel / LibreOffice
- [ ] **Vérifier** : les accents sont corrects (Loup, Arbre de vie…)
- [ ] **Vérifier** : colonnes : Date, Heure, Appareil, Catégorie, Modèle, Taille, Quantité, Prix unitaire, Total ligne, Mode, TimestampISO
- [ ] **Vérifier** : chaque ligne du panier est une ligne CSV (un panier de 2 articles = 2 lignes)

### Test 14 : Nouvelle session (reset)
- [ ] Avoir des ventes en cours
- [ ] Onglet Bilan → "🔄 Nouvelle session"
- [ ] **Vérifier** : modal de confirmation
- [ ] Confirmer
- [ ] **Vérifier** : un fichier JSON est téléchargé automatiquement (sauvegarde auto)
- [ ] **Vérifier** : les ventes sont effacées
- [ ] **Vérifier** : le fond de caisse est remis à 0
- [ ] **Vérifier** : le stock est conservé (produits toujours présents)

---

## 🔄 Sync

### Test 15 : Export JSON manuel
- [ ] Onglet Sync
- [ ] Taper "📤 Exporter sauvegarde JSON"
- [ ] **Vérifier** : un fichier `caisse_backup_<appareil>_<datetime>.json` est téléchargé
- [ ] Ouvrir le fichier dans un éditeur texte
- [ ] **Vérifier** : JSON valide avec champs `version`, `deviceId`, `deviceLabel`, `produits`, `ventes`, `fondCaisse`

### Test 16 : Fusion multi-appareils
- [ ] Créer 2 exports JSON depuis 2 "appareils" différents (simuler en changeant le deviceLabel entre deux sessions, ou tester sur 2 vrais téléphones)
- [ ] Sur un 3e téléphone (ou après reset) : Sync → "📥 Importer et fusionner"
- [ ] Sélectionner les 2 fichiers JSON (sélection multiple)
- [ ] **Vérifier** : toast "X ajoutées, Y doublons"
- [ ] **Vérifier** : dans Bilan, toutes les ventes des 2 appareils sont visibles avec leurs labels
- [ ] **Vérifier** : dans Sync, la "Ventilation par appareil" montre bien les 2 sources
- [ ] Réimporter les mêmes fichiers
- [ ] **Vérifier** : aucun doublon créé (tout en "doublons ignorés")

### Test 17 : Restauration
- [ ] Avoir des données actuelles
- [ ] Taper "♻️ Restaurer un backup"
- [ ] Confirmer
- [ ] Sélectionner un ancien fichier JSON
- [ ] **Vérifier** : les données actuelles sont totalement remplacées
- [ ] **Vérifier** : produits, ventes, fond de caisse correspondent au backup

### Test 18 : Renommage appareil
- [ ] Sync → "Renommer l'appareil"
- [ ] **Vérifier** : modal s'ouvre avec le label actuel
- [ ] Saisir un nouveau nom
- [ ] Valider
- [ ] **Vérifier** : le nom est mis à jour dans le header de l'app
- [ ] **Vérifier** : les futures ventes sont taguées avec le nouveau label
- [ ] Recharger la page
- [ ] **Vérifier** : le nouveau nom persiste

---

## 🔒 Persistance

### Test 19 : Survie des données au rechargement
- [ ] Faire des ventes
- [ ] Définir un fond de caisse
- [ ] Modifier un produit
- [ ] Fermer complètement l'onglet
- [ ] Rouvrir l'URL
- [ ] **Vérifier** : toutes les données sont conservées

### Test 20 : Mode hors-ligne
- [ ] Charger l'app une première fois avec réseau
- [ ] Activer le mode avion
- [ ] Recharger la page
- [ ] **Vérifier** : l'app fonctionne normalement (⚠️ nécessite service worker en V3+ pour être réellement offline avec cold start)
- [ ] Faire des ventes
- [ ] **Vérifier** : tout est enregistré localement

---

## 🎨 UI / UX

### Test 21 : Toast non-intrusif
- [ ] Faire une action déclenchant un toast
- [ ] **Vérifier** : apparaît en bas au-dessus de la barre panier
- [ ] **Vérifier** : disparaît automatiquement après ~2 s
- [ ] **Vérifier** : ne bloque pas les clics (on peut continuer à taper en dessous)

### Test 22 : Panier compact vs déplié
- [ ] Ajouter des articles au panier
- [ ] **Vérifier** : barre compacte visible en bas
- [ ] Taper sur la barre
- [ ] **Vérifier** : le détail du panier se déplie
- [ ] Retaper pour replier

### Test 23 : Navigation breadcrumb
- [ ] Naviguer jusqu'au niveau 2 (Catégorie → Modèle → Tailles)
- [ ] **Vérifier** : breadcrumb "Accueil › T-Shirt › Loup" visible
- [ ] Taper sur "Accueil"
- [ ] **Vérifier** : retour niveau 0
- [ ] Retaper sur Catégorie et Modèle
- [ ] Taper sur le nom de la catégorie dans le breadcrumb
- [ ] **Vérifier** : retour niveau 1 (liste des modèles de cette catégorie)

---

## 📱 Spécifique mobile

### Test 24 : iOS Safari
- [ ] Ouvrir l'app sur iPhone via Safari
- [ ] Passer tous les tests 1 à 23
- [ ] **Vérifier spécifiquement** : aucun `prompt()` / `confirm()` natif n'apparaît
- [ ] **Vérifier** : les modals HTML s'affichent correctement
- [ ] **Vérifier** : les téléchargements fonctionnent (CSV, JSON)

### Test 25 : Android Chrome
- [ ] Ouvrir l'app sur Android via Chrome
- [ ] Passer tous les tests 1 à 23
- [ ] **Vérifier** : performances similaires à iOS

---

## ✍️ Notes pour les futurs tests

- Toujours tester au moins sur **iPhone Safari** avant de merger une feature — c'est l'environnement le plus piégeux.
- En cas de doute sur un comportement bizarre : ouvrir la console (Safari sur iPhone connecté à Mac via USB pour le debug).
- Si un bouton ne fait rien : vérifier que la fonction ne contient pas un `prompt`/`confirm` oublié.
- Si un téléchargement ne marche pas : vérifier que l'app est servie en HTTP(S), pas en `file://`.
