# 🛒 Caisse Stand — Guide utilisateur

> Petite appli qui remplace une vraie caisse enregistreuse pour un stand de marché. Elle marche directement sur le téléphone, même sans réseau.

---

## 📲 Pour la lancer

1. Ouvre le lien qui t'a été envoyé
   - iPhone → dans **Safari**
   - Android → dans **Chrome**
2. La première fois, tu recevras un code par email pour entrer (sécurité d'accès)

### Installer comme une vraie app (recommandé)

Une icône sur l'écran d'accueil, ça se lance plus vite et ça marche **sans internet**.

- **iPhone** : menu **Partager** ↑ (en bas) → **"Sur l'écran d'accueil"**
- **Android** : un bouton **"📲 Installer l'app"** apparaît dans l'onglet Sync

Une fois installée, le tel peut être en mode avion, l'app fonctionne quand même. Parfait pour un marché en zone blanche.

---

## 💰 Encaisser une vente (le plus important)

**3 taps, 2 secondes :**

1. Tape sur la **catégorie** (T-Shirt / Pull / Sweat)
2. Tape sur le **modèle** (Loup, Tiki, Lion…)
3. Tape sur la **taille** → l'article va dans le panier

Tu peux ajouter **plusieurs articles** avant de payer (tape plusieurs fois).

### Puis le paiement

- **💵 CASH** → une fenêtre demande le montant donné par le client. L'app calcule automatiquement le rendu (vert si tu dois rendre, rouge si le client n'a pas donné assez)
- **💳 CB** → direct, pas de rendu à calculer

### Si tu te trompes

Tape la **barre du panier** en bas de l'écran pour la déplier. Tu as :

- Un bouton **`−`** pour retirer **une unité** d'une ligne
- Un bouton **`🗑`** pour retirer **toute la ligne** d'un coup
- Un bouton **"Vider panier"** pour tout effacer

---

## 📦 L'onglet Stock

Pour voir et ajuster ton inventaire.

- **Liste complète** de ce qu'il te reste, groupée par catégorie
- Boutons **`+`** et **`−`** à droite pour ajuster rapidement (arrivage, cadeau, vol…)
- Tape **sur une ligne** pour éditer le produit en détail (prix, modèle, taille, supprimer)
- Bouton **"+ Ajouter un produit"** en haut pour créer un nouveau modèle

Le stock se décompte automatiquement à chaque vente — pas besoin d'y penser.

---

## 📊 L'onglet Bilan

Pour faire les comptes et suivre la journée.

- **CA du jour** et nombre de ventes en gros en haut
- **Top produits** vendus
- **Historique complet** de toutes les ventes (avec heure, mode de paiement, appareil)
- Bouton **"Annuler dernière vente"** si tu as tapé une vente par erreur (restaure le stock automatiquement)

### Actions importantes

- **🏦 Définir le fond de caisse** au début de la journée : le montant d'espèces que tu mets dans la caisse
- **🧮 Faire le comptage** à la fin : entre le montant réel compté → l'app te dit si ça tombe juste ou s'il y a un écart
- **📥 Export CSV** pour ouvrir dans Excel / LibreOffice (toutes les ventes détaillées)
- **🔄 Nouvelle session** pour repartir à zéro le prochain marché (une sauvegarde JSON est téléchargée automatiquement avant le reset, aucune perte)

---

## 🔄 L'onglet Sync (si plusieurs téléphones sur le même stand)

### Mode automatique (avec réseau)

Si les téléphones ont du réseau, **ils se synchronisent tout seuls** toutes les 30 secondes. Les ventes faites sur un téléphone apparaissent sur les autres automatiquement, le stock reste cohérent partout. Rien à faire.

*(Le petit indicateur "Sync auto cloud" dans l'onglet Sync te dit si c'est bien en cours : 🟢 = OK, 🔌 = hors ligne, 🔴 = problème)*

### Mode QR code (sans réseau — zone blanche)

Quand il n'y a pas de réseau sur le stand :

1. Sur le téléphone A : onglet **Sync** → **"📤 Afficher mon QR"**
2. Sur le téléphone B : onglet **Sync** → **"📥 Scanner un QR"** → la caméra s'ouvre
3. Pointe la caméra B sur l'écran A → sync instantanée ✓
4. Fais la même chose dans l'autre sens (B affiche, A scanne) pour que A reçoive aussi les ventes de B

À refaire de temps en temps pendant la journée (par exemple à chaque pause), ou juste avant de faire les comptes.

---

## ⚠️ À retenir

| Situation | Quoi faire |
|---|---|
| Pas de réseau sur le stand | Aucun souci, l'app marche en local. Sync par QR en fin de journée. |
| Erreur sur une vente | Onglet Bilan → "Annuler dernière vente" (restaure le stock) |
| Tel déchargé / perdu | Les données sont sur le tel, pas dans le cloud. **Exporter le JSON régulièrement** depuis Sync pour backup |
| Fin de journée | Faire le comptage → Export CSV → Nouvelle session |
| Ça bugge | Préviens le support (celui qui t'a envoyé le lien) |

---

## 🔒 Ce qui est privé

- **Toutes tes données** (stock, ventes, caisse) sont **sur ton téléphone**, pas partagées publiquement
- **L'accès à l'app** est restreint aux personnes autorisées (login par email)
- **La sync entre téléphones** passe soit par QR (local), soit par un serveur privé sécurisé

---

**Bon marché ! 🎪**
