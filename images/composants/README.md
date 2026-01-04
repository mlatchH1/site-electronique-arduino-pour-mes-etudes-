# 📁 Organisation des images du site

Ce fichier explique toute l'organisation des images.

---

## Structure complète

```
images/
├── site/              → Images générales (logos, bannières, icônes)
└── composants/        → Images techniques des composants électroniques
    ├── led-rouge/
    │   ├── brochage/     → Schémas de connexion
    │   └── empatement/   → Dimensions physiques
    ├── led-rgb/
    │   ├── brochage/
    │   └── empatement/
    └── [autres-composants]/
```

---

## 📝 Convention de nommage ⚡

Utilisez des **préfixes numériques** standardisés pour une organisation cohérente :

### 🔌 Pour le brochage (brochage/)
- **01-schema-complet.png** → Schéma de brochage principal
- **02-schema-alternatif.png** → Vue alternative (optionnel)
- **03-details.png** → Zoom sur détails spécifiques (optionnel)

### 📐 Pour l'empatement (empatement/)
- **01-vue-dessus.png** → Vue de dessus (top view)
- **02-vue-cote.png** → Vue de côté (side view)
- **03-vue-face.png** → Vue de face (front view)
- **04-dimensions.png** → Dimensions détaillées avec cotes
- **05-vue-3d.png** → Rendu 3D (optionnel)

**Règles :**
- Toujours commencer par `01-`, `02-`, etc.
- Noms en **minuscules**
- Tirets `-` au lieu d'espaces
- Format : `XX-description-claire.png`

---

## ✅ Format recommandé

- **Format** : PNG (transparent si possible)
- **Taille** : Minimum 800px de large
- **Qualité** : Nette et lisible
- **Poids** : < 500 Ko par image (optimisez pour le web)

---

## 🆕 Ajouter un nouveau composant

1. Créez le dossier : `composants/nom-du-composant/`
2. Créez les sous-dossiers : `brochage/` et `empatement/`
3. Ajoutez vos images PNG avec préfixes : `01-xxx.png`, `02-xxx.png`
4. Mettez à jour `script.js` :

```javascript
{
    name: "Nom du composant",
    pinoutFolder: 'images/composants/nom-du-composant/brochage',
    footprintFolder: 'images/composants/nom-du-composant/empatement',
    // ...
}
```

---

## 📦 Composants actuels

- `led-rouge/` - LED Rouge 5mm
- `led-rgb/` - LED RGB commune cathode
