# 📁 Structure des images des composants

Ce dossier contient toutes les images des composants électroniques utilisés dans le site.

## 🗂️ Structure des dossiers

Chaque composant doit avoir cette structure :

```
images/composants/[CATEGORIE]/[COMPOSANT]/
├── symbole/
│   └── symbole.png              ← Symbole électronique du composant
├── brochage/
│   ├── 01-schema-complet.png    ← Schéma de brochage complet
│   ├── 02-schema-alternatif.png ← Schéma alternatif (optionnel)
│   └── 03-schema-simplifie.png  ← Schéma simplifié (optionnel)
└── empreinte/
    ├── 01-vue-dessus.png        ← Vue de dessus
    ├── 02-vue-cote.png          ← Vue de côté (optionnel)
    ├── 03-vue-face.png          ← Vue de face (optionnel)
    ├── 04-dimensions.png        ← Dimensions (optionnel)
    └── 05-vue-3d.png            ← Vue 3D (optionnel)
```

## 📝 Noms de fichiers OBLIGATOIRES

### 🔌 Symbole électronique
- **Dossier** : `symbole/`
- **Nom du fichier** : `symbole.png`
- **Description** : Symbole normalisé du composant (ex: symbole de résistance, LED, etc.)

### 📌 Brochage (Pinout)
- **Dossier** : `brochage/`
- **Noms des fichiers** :
  - `01-schema-complet.png` ← Minimum requis
  - `02-schema-alternatif.png` (optionnel)
  - `03-schema-simplifie.png` (optionnel)

### 📐 Empreinte (Footprint)
- **Dossier** : `empreinte/`
- **Noms des fichiers** :
  - `01-vue-dessus.png` ← Minimum requis
  - `02-vue-cote.png` (optionnel)
  - `03-vue-face.png` (optionnel)
  - `04-dimensions.png` (optionnel)
  - `05-vue-3d.png` (optionnel)

## 📦 Exemple concret : LED rouge

```
images/composants/led/led-red/
├── symbole/
│   └── symbole.png
├── brochage/
│   ├── 01-schema-complet.png
│   └── 02-schema-alternatif.png
└── empreinte/
    ├── 01-vue-dessus.png
    ├── 02-vue-cote.png
    └── 04-dimensions.png
```

## ⚠️ IMPORTANT

1. **Les noms doivent être EXACTEMENT comme indiqué** (avec les numéros et tirets)
2. **Format d'image** : `.png` (recommandé) ou `.jpg`
3. **Minuscules/Majuscules** : Utiliser des minuscules pour les noms de dossiers
4. **Si une image n'existe pas** : Le site affichera "Image non disponible"
5. **Seul le symbole est affiché au milieu** : Les autres images sont affichées en liste

## 🎨 Conseils pour les images

- **Symbole** : Fond transparent recommandé, symbole noir ou blanc
- **Brochage** : Schéma clair avec numéros de broches visibles
- **Empreinte** : Dimensions en mm, vue claire des pattes/trous

## 📋 Liste des catégories actuelles

- `led/` - LED et diodes électroluminescentes (rouge, verte, bleue, jaune, blanche, RGB)
- `Entrees/` - Boutons poussoirs, potentiomètres
- `Audio/` - Buzzers actifs et passifs
- `Resistances/` - Résistances
- `Capteurs/` - Capteurs (température, distance, lumière, etc.)
- `Actionneurs/` - Servomoteurs, relais, etc.
- `Circuits-Integres/` - Circuits intégrés (74HC595, etc.)
- `Condensateurs/` - Condensateurs

---

💡 **Astuce** : Si tu as des images avec d'autres noms (comme "Capture d'écran..."), renomme-les selon ce format !
